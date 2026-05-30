---
title: Session Bootstrap
authority: Run at the start of every session — no exceptions
---

# Session Bootstrap

Follow every step in order before writing any code.

---

## 1 — Read project state

```bash
cat .factory/logs/state.yaml
```

Understand: current status, what is built, what is next.

---

## 2 — Read the scaffold

```bash
cat .factory/scaffold.yaml
```

Identify which features/stories are `draft` vs `done` vs `in-progress`.

---

## 3 — Check the task queue

```bash
factory task list
```

Or: `cat .factory/task-manager/todo.yaml`

Pick the highest-priority (`priority: 1`) unclaimed task.

---

## 4 — Read knowledge

```bash
ls .factory/knowledge/
```

Read any ADRs relevant to what you are about to build.

---

## 5 — Claim your task

```bash
factory task start <task-id>
```

Rules: lowest `priority` number = highest urgency · never claim `in_progress` · never re-claim `completed`

---

## 6 — Write heartbeat

```bash
factory pulse "starting <task-id>: <task title>"
```

---

Bootstrap complete → follow `.factory/workflows/process.md`

---

## Recovery

| Problem | Fix |
|---------|-----|
| `state.yaml` stale | Update manually — edit `.factory/logs/state.yaml` |
| No tasks in queue | `cat .factory/scaffold.yaml` → pick next draft story |
| Knowledge dir empty | Fine for new project — write ADRs as you decide things |
| Heartbeat stale (>30 min) | `factory pulse "resuming"` → continue |
