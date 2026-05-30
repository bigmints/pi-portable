# pi-app — Agent Instructions

## Role

You are a senior TypeScript / Next.js developer working on **pi-app** — a mobile-first PWA web client for the pi CLI.

Before starting any work:
1. Read `.factory/logs/state.yaml` — current project state
2. Read `.factory/scaffold.yaml` — what is planned and what is done
3. Read `.factory/factory.yaml` — stack, conventions, paths
4. Claim a task: `factory task start <id>`
5. Write a heartbeat: `factory pulse "starting <task>"`

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 App Router |
| Language | TypeScript 5 strict mode |
| Styling | Vanilla CSS (CSS custom properties) |
| State | Zustand (one slice per domain) |
| Server state | TanStack React Query |
| Realtime | WebSocket singleton (`src/lib/ws-client.ts`) |
| Icons | lucide-react (`strokeWidth={1.5}`) |
| Fonts | Inter (UI) + JetBrains Mono (code) via `next/font` |
| PWA | next-pwa |

## Conventions

- TypeScript strict mode throughout — no `any` types
- Components: `src/components/<category>/<ComponentName>.tsx`
- Styles: co-located `<ComponentName>.module.css` per component
- No Tailwind — CSS custom properties from `src/styles/tokens.css`
- API routes: `src/app/api/<resource>/route.ts`
- Types: `src/types/<domain>.ts`
- Zustand stores: `src/store/<slice>.ts`
- React Query hooks: `src/hooks/use<Resource>.ts`
- WebSocket: singleton only at `src/lib/ws-client.ts`
- Breakpoints: mobile <768px · tablet 768–1023px · desktop ≥1024px
- Dark mode: `data-theme="dark"` on `<html>` — never via class
- User content: `react-markdown` + `DOMPurify`
- z-index scale: base(0) overlay(10) dropdown(20) modal(30) toast(40)

## Quick Commands

```bash
# Heartbeat and task management
factory pulse "<msg>"                    # Write liveness heartbeat
factory task list                        # Show task queue
factory task start <id>                  # Claim a task
factory task complete --id <id> --summary "<what>"

# Validation (must pass before every commit)
npx tsc --noEmit
npx eslint . --max-warnings=0

# Development
npm run dev                              # Start Next.js dev server
npm run build                            # Production build

# Git
git add -A && git commit -m "feat(scope): what and why"
```

## Factory Files

| File | Purpose |
|------|---------|
| `.factory/scaffold.yaml` | Planning spec — features → stories (source of truth) |
| `.factory/factory.yaml` | Bridge config — stack, conventions, paths |
| `.factory/stories/features/*.yaml` | Individual story build specs |
| `.factory/knowledge/` | Agent-authored ADRs and key decisions |
| `.factory/logs/state.yaml` | Project state snapshot — read on session start |
| `.factory/logs/heartbeat.yaml` | Liveness signal — written each step |
| `.factory/logs/worklog.yaml` | Append-only session log |
| `.factory/logs/builds/` | Build receipts from Factory engine |
| `.factory/task-manager/todo.yaml` | Task queue |
| `.factory/task-manager/manage.sh` | Task lifecycle CLI |

## Workflow

1. **Start**: `factory task start <id>` → `factory pulse "starting <id>"`
2. **Work**: read `.factory/logs/state.yaml`, build, write heartbeat each step
3. **Validate**: `npx tsc --noEmit && npx eslint . --max-warnings=0` — must pass
4. **Commit**: `git add -A && git commit -m "feat(scope): what and why"`
5. **Done**: `factory task complete --id <id> --summary "what was done"`

## ADR Rule

Write an ADR to `.factory/knowledge/` **before implementing** when you:
- Add a new dependency to `package.json`
- Change the folder structure significantly
- Make an architectural decision affecting multiple files

ADR format: see `.factory/knowledge/README.md`
