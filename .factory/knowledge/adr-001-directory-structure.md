# ADR-001: Next.js App Router & Modular Directory Structure

* **Status**: Implemented / Approved
* **Date**: 2026-05-23
* **Authors**: Antigravity, pi-app Core Engineering Team
* **Scope**: Codebase Layout, Separation of Concerns, Routing Architecture

---

## Context & Problem Statement

Historically, React applications suffered from bloated root folders where API logic, UI components, state management, and pages were tightly coupled. This led to high maintenance friction, duplicate rendering loops, and difficulty for collaborative or autonomous coding agents to navigate the codebase safely.

---

## Decision & Approach

We decided to adopt a strict **Modular Directory Structure** built on Next.js 15 App Router conventions, separating presentation layers, data access, and state management into distinct folders under `src/`:

### 1. Presentation vs. Routing
- **`src/app/`**: Used strictly for routing, page shell definitions, and layout configurations. Pages are kept lightweight and do not contain complex UI logic or state variables.
- **`src/components/`**: Organized by feature domain (e.g. `auth/`, `chat/`, `layout/`). Components are modular and representational, rendering UI elements based on state subscriptions.

### 2. State & Data Layers
- **`src/store/`**: Centralized Zustand stores that house global reactive states (such as active conversations and UI selections). This prevents prop drilling and eliminates component re-renders.
- **`src/lib/`**: Contains utility classes and API wrappers, specifically the custom WebSocket client (`ws-client.ts`), making networking pure and isolated from UI code.

### 3. Cross-cutting Concerns
- **`src/hooks/`**: Custom React hooks encapsulating specific UI event lifecycles.
- **`src/types/`**: Explicit TypeScript type definitions for protocol messages and models, ensuring compile-time safety across all modules.

---

## Consequences

* **Clean Boundaries**: Presentation components do not touch networking directly; they subscribe to Zustand stores, which in turn interface with the WebSocket client.
* **Agent Context-Awareness**: Autonomous coding tools can target exact modules (e.g. editing `src/store/` for state bugs or `src/lib/` for network bugs) with minimum overlap.
* **Optimal Code Splitting**: Lightweight page layouts ensure fast loading speeds and solid Web Vitals performance.
