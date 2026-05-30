---
title: Agent Process
authority: CANONICAL — overrides all other files
---

# Agent Process

> Single source of truth for HOW to work in pi-app.

---

## 1. Four Rules — No Exceptions

| Rule | Command |
|------|---------|
| **Heartbeat** — before every task and after every commit | `factory pulse "<task>"` |
| **Token budget** — keep every prompt under 64k tokens | Stay under 50k working input; split large tasks |
| **Validate before commit** — zero broken code committed | `npx tsc --noEmit && npx eslint . --max-warnings=0` |
| **State reflects reality** — update after structural changes | Update `logs/state.yaml` + write ADR to `knowledge/` |

---

## 2. Session Lifecycle

```
START → bootstrap.md → [WORK LOOP] → SESSION END → END
```

**Work loop:**
1. Write code / produce output
2. Self-review diff (no debug logs, no hardcoded paths, no placeholders)
3. `npx tsc --noEmit` → must pass
4. `git add -A && git commit -m "type(scope): what and why"`
5. `factory pulse "Committed: <msg>"`
6. If structural change → update `logs/state.yaml` and write ADR

---

## 3. Decision Tree

| Situation | Action |
|-----------|--------|
| Starting a session | → `bootstrap.md` (always) |
| About to `git commit` | → `commit.md` validation gate |
| Made a structural change | → update `logs/state.yaml` + write ADR |
| Ending a session | → session end checklist (§6) |
| Something went wrong | → error recovery (§4) |
| Adding a new component | → `src/components/<category>/<Name>.tsx` + `<Name>.module.css` |
| Adding a new API route | → `src/app/api/<resource>/route.ts` |
| Adding a new Zustand slice | → `src/store/<slice>.ts` |
| Adding a new React Query hook | → `src/hooks/use<Resource>.ts` |

---

## 4. Error Recovery

| Symptom | Fix |
|---------|-----|
| `tsc --noEmit` fails 3+ times | STOP → escalate |
| Context size >50k tokens | Split task, trim context, retry |
| `state.yaml` out of date | Update it manually |
| Task not in `todo.yaml` | `cat .factory/task-manager/todo.yaml` → find or add it |
| Heartbeat stale (>30 min) | `factory pulse "resuming"` → continue |

**Escalation format:**
```
BLOCKED: <one-line summary>
Context: <what you were doing>
Error:   <exact error>
Attempts: <what you tried>
Suggest: <your proposed next step>
```

---

## 5. State Updates (after structural changes)

A **structural change** = new dependency, new folder, new API route, architectural decision.

Bug fixes and styling → **not structural**.

**Steps:**
1. Update `.factory/logs/state.yaml` — relevant fields only
2. Write ADR to `.factory/knowledge/<slug>.md` if it's a decision
3. Update `todo.yaml` to complete or add tasks
4. `git add .factory/ && git commit -m "chore(state): <what changed>"`

---

## 6. Session End Checklist

```bash
# 1. Heartbeat
factory pulse "session end: <task-id>"

# 2. Complete task
factory task complete --id <id> --summary "<what was done>"

# 3. Update state if anything structural changed
# edit .factory/logs/state.yaml

# 4. Commit
git add .factory/ && git commit -m "chore(state): session end — <task-id>"
```

---

## 7. ADR Rules

Write an ADR **before implementing** when you:
- Add a new `package.json` dependency
- Change folder structure significantly
- Switch an architectural pattern
- Make a hard-to-reverse decision affecting multiple files

**Format:** `.factory/knowledge/<slug>.md`
```markdown
# ADR: <title>

Date: YYYY-MM-DD

## Context
<Why this decision was needed>

## Decision
<What was decided>

## Consequences
<Tradeoffs, implications, things to watch>
```

---

## 8. File Roles

| File | Purpose |
|------|---------|
| `AGENTS.md` | Entry point — role, stack, quick commands |
| `.factory/scaffold.yaml` | Planning spec — features and stories |
| `.factory/factory.yaml` | Bridge config — stack, conventions, paths |
| `.factory/stories/features/*.yaml` | Individual story build specs |
| `.factory/knowledge/` | ADRs and key decisions (agent-authored) |
| `.factory/logs/state.yaml` | Live project state — single source of truth |
| `.factory/logs/heartbeat.yaml` | Liveness timestamp |
| `.factory/logs/worklog.yaml` | Append-only session log |
| `.factory/logs/builds/` | Build receipts from Factory engine |
| `.factory/task-manager/todo.yaml` | Task queue |
| `.factory/task-manager/manage.sh` | Task lifecycle CLI |
| `.factory/workflows/process.md` | All rules (this file) |
| `.factory/workflows/bootstrap.md` | Session start checklist |
| `.factory/workflows/commit.md` | Pre-commit validation gate |
