# ADR-002: Real-time Communication via WebSocket Client Abstraction

* **Status**: Implemented / Approved
* **Date**: 2026-05-23
* **Authors**: Antigravity, pi-app Core Engineering Team
* **Scope**: Network Layer, Real-time Protocols, Reconnection Resilience

---

## Context & Problem Statement

The `pi-app` is a real-time conversational workspace interface powered by a background `pi` subprocess. Dynamic interaction requires low-latency, bidirectional message passing (such as tool-use updates and streaming agent responses). Inline raw WebSocket hooks inside React pages lead to socket leaks, missing re-connections, and state sync bugs on routing.

---

## Decision & Approach

We decided to abstract all real-time network logic into a centralized, single-instance **WebSocket Client Class** in `src/lib/ws-client.ts`.

### 1. Centralized Socket Lifecycle
The WebSocket class is instantiated globally. It manages socket connection, error events, and clean close routines, entirely isolated from React component lifecycles.

### 2. Auto-Reconnection & Heartbeats
* **Resilient Retries**: Implements exponential retry backoffs to restore connections automatically when the bridge server restarts or network connectivity drops.
* **Keep-Alive Heartbeats**: Sends periodically structured ping messages to prevent intermediate load balancers or proxy servers from terminating idle sockets.

### 3. Strict Payload Framing
All transmissions use standard JSON payloads mapped to verified TypeScript interfaces. We enforce the target communication schema between the client dispatcher and the backend parser:
* **Output Payload format**: `{ type: 'prompt', conversationId, content, projectId }`
* **Input Payload format**: `{ type: 'message_update', payload: { ... } }` or `{ type: 'tool_use_start', ... }`

---

## Consequences

* **Encapsulated Network Logic**: UI views (`ChatView.tsx`) are completely decoupled from protocol parsing. They register event listeners on `wsClient` or trigger store updates.
* **Connection State Stability**: The active connection status pill displays accurate live states (e.g. `connected`, `connecting`, `offline`) directly in the header bar.
* **Zero Socket Leaks**: Navigating away from pages does not spawn duplicate sockets, reducing network overhead.
