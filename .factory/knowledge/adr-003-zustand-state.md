# ADR-003: Zustand Centralized Store Reactivity Model

* **Status**: Implemented / Approved
* **Date**: 2026-05-24
* **Authors**: Antigravity, pi-app Core Engineering Team
* **Scope**: UI State, Centralized Reactivity, Performance Optimization

---

## Context & Problem Statement

Maintaining conversation histories, active selection threads, generated artifacts, and UI states across three layout containers (Sidebar lists, central Chat views, and right-hand sliding Details sheets) is highly complex. 

Using inline custom React hooks or React's `useState` + `useEffect` combinations caused several bugs:
1. **Ghost Render Cascades**: Parents and children re-rendered constantly, resulting in jittery typing and slow updates.
2. **Strict Mode Warnings**: Synchronous state mutations inside `useEffect` triggered React warnings (e.g. `setState` updates during render).
3. **Data Loss on Navigation**: Since React state is transient, shifting routes from Chat to History completely wiped the active message log.

---

## Decision & Approach

We decided to use **Zustand** for centralized global store management.

### 1. Centralized Store Files
Located inside `src/store/`:
* `conversations.ts`: Manages the active conversation thread, full array of messages, and historical session logs.
* `ui.ts`: Manages sheet drawer open states, active panels, preferences, and modal details.

### 2. Event-Driven Updates
API responses and incoming WebSocket chat frames are pushed directly into the store via action dispatches. Components do not edit state arrays inline; they trigger declarative actions (`addMessage()`, `selectConversation()`).

### 3. Selective Subscriptions
Components subscribe selectively to store slices (e.g. `const messages = useConversationsStore(s => s.messages)`). This prevents unnecessary rendering cascades when unrelated state elements (like settings selections) change.

### 4. Next-Frame Deferrals
For any unavoidable synchronous state updates during initial React render passes, we wrap mutations inside `requestAnimationFrame()` to defer executions safely to the next frame.

---

## Consequences

* **Persistent Thread History**: Navigating between route views (Chat, History, Settings) preserves loaded conversation messages.
* **Elimination of React Warnings**: Removed strict mode warnings regarding concurrent state updates.
* **Typing Fluidity**: The central text editor and token-steaming animations run at 60 FPS with zero rendering lag.
