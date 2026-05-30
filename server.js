/**
 * pi-app custom server
 * Runs Next.js + a WebSocket bridge that spawns `pi --mode rpc` per session.
 *
 * WebSocket protocol (browser → server):
 *   { type: "prompt", message: string, id?: string }
 *   { type: "abort", id?: string }
 *   { type: "new_session", id?: string }
 *   { type: "get_state", id?: string }
 *   { type: "get_available_models", id?: string }
 *   { type: "set_model", provider: string, modelId: string, id?: string }
 *
 * WebSocket protocol (server → browser):
 *   All JSON lines from pi stdout are forwarded as-is.
 *   Additional { type: "server_event", event: string, data: any } for lifecycle.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { parse } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import next from 'next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Pi binary — use nvm path if system PATH doesn't have it
const PI_BIN = process.env.PI_BIN || 'pi';
const PI_WORKING_DIR = process.env.PI_WORKING_DIR || process.env.HOME || '/home/bigmints';
const PI_SESSION_DIR = process.env.PI_SESSION_DIR || path.join(process.env.HOME || '/home/bigmints', '.pi', 'sessions');

// ── Next.js setup ─────────────────────────────────────────────────────────────
const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // ── WebSocket server ─────────────────────────────────────────────────────────
  const wss = new WebSocketServer({ noServer: true });

  // Route upgrades: /ws → our WSS, everything else → Next.js (HMR)
  httpServer.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url, true);
    if (pathname === '/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } else {
      // Let Next.js handle HMR and other upgrades
      app.getUpgradeHandler()(req, socket, head);
    }
  });

  wss.on('connection', (ws, req) => {
    console.log('[ws] Client connected from', req.socket.remoteAddress);

    let piProcess = null;
    let buffer = '';

    /** Spawn pi in RPC mode */
    function spawnPi() {
      console.log('[ws] Spawning pi --mode rpc');
      ws.send(JSON.stringify({ type: 'server_event', event: 'pi_starting' }));

      try {
        piProcess = spawn(PI_BIN, ['--mode', 'rpc'], {
          cwd: PI_WORKING_DIR,
          env: {
            ...process.env,
            // Ensure nvm node path is available
            PATH: `/home/bigmints/.nvm/versions/node/v22.22.2/bin:${process.env.PATH || '/usr/local/bin:/usr/bin:/bin'}`,
          },
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        piProcess.stdout.on('data', (data) => {
          buffer += data.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // keep incomplete line in buffer
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              // Validate it's JSON before forwarding
              JSON.parse(trimmed);
              if (ws.readyState === ws.OPEN) {
                ws.send(trimmed);
              }
            } catch {
              // Swallow non-JSON stdout (ANSI escape sequences etc.)
            }
          }
        });

        piProcess.stderr.on('data', (data) => {
          const msg = data.toString().trim();
          if (msg && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: 'server_event', event: 'stderr', message: msg }));
          }
        });

        piProcess.on('spawn', () => {
          console.log('[ws] pi spawned with PID', piProcess.pid);
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: 'server_event', event: 'pi_ready', pid: piProcess.pid }));
          }
        });

        piProcess.on('error', (err) => {
          console.error('[ws] pi spawn error:', err);
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'server_event',
              event: 'pi_error',
              message: `Failed to start pi: ${err.message}. Is pi installed? (npm install -g @earendil-works/pi-coding-agent)`,
            }));
          }
        });

        piProcess.on('exit', (code, signal) => {
          console.log('[ws] pi exited with code', code, 'signal', signal);
          piProcess = null;
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: 'server_event', event: 'pi_exit', code, signal }));
          }
        });

      } catch (err) {
        console.error('[ws] Failed to spawn pi:', err);
        ws.send(JSON.stringify({
          type: 'server_event',
          event: 'pi_error',
          message: `Cannot start pi: ${err.message}`,
        }));
      }
    }

    // Spawn pi immediately on connection
    spawnPi();

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        console.warn('[ws] Received non-JSON message, ignoring');
        return;
      }

      // Handle server-level commands
      if (msg.type === 'new_session' && piProcess) {
        // Kill current pi, spawn fresh
        piProcess.kill();
        piProcess = null;
        setTimeout(spawnPi, 500);
        return;
      }

      // Forward all other commands to pi's stdin
      if (piProcess && piProcess.stdin.writable) {
        piProcess.stdin.write(JSON.stringify(msg) + '\n');
      } else {
        ws.send(JSON.stringify({
          type: 'server_event',
          event: 'pi_not_ready',
          message: 'pi process is not running',
        }));
      }
    });

    ws.on('close', () => {
      console.log('[ws] Client disconnected');
      if (piProcess) {
        console.log('[ws] Killing pi process', piProcess.pid);
        piProcess.kill();
        piProcess = null;
      }
    });

    ws.on('error', (err) => {
      console.error('[ws] WebSocket error:', err);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`✓ pi-app server running at http://${hostname}:${port}`);
    console.log(`✓ WebSocket bridge at ws://${hostname}:${port}/ws`);
    console.log(`✓ Pi binary: ${PI_BIN}`);
    console.log(`✓ Pi working dir: ${PI_WORKING_DIR}`);
  });
});
