# Knowledge

This directory contains agent-authored Architecture Decision Records (ADRs)
and key technical decisions for pi-app.

The Factory build engine injects all files in this directory into every LLM
prompt — so future builds are context-aware of decisions already made.

---

## Format

Each file: `.factory/knowledge/<slug>.md`

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

## Decisions so far

_(none yet — write your first ADR when you make your first architectural decision)_
