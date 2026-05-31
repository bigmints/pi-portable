# REPOSITORY ARCHITECTURAL CHRONICLE

## 1. Architectural Context & Key ADR Highlights
- **Stack & Routing:** Next.js 15 App Router, React 18+, TypeScript, Zustand, WebSocket-driven real-time chat. Strict modular separation: `src/app/` (routing/shells), `src/components/` (presentation), `src/lib/` (utilities/WS), `src/store/` (state), `src/types/` (interfaces).
- **State Architecture (ADR-003):** Centralized Zustand stores eliminate ghost render cascades, route-sync loss, and strict-mode violations. Local component state strictly avoided for shared/session data. Key stores: `useChatStore`, `useAttachmentsStore`, `useModelSettingsStore`, `useProjectStore`, `useQueueStore`, `useUIStore`. All synchronous mutations deferred via `requestAnimationFrame()` or routed exclusively through store actions. `persist` middleware used for `localStorage` hydration.
- **Network Layer (ADR-002):** `src/lib/ws-client.ts` abstracts WebSocket lifecycle, URL resolution, message serialization, and reconnection resilience. Isolated from UI rendering cycles. Payload schema strictly aligned with `pi` backend protocol.
- **Build & Quality Gates:** Zero-tolerance pipeline (`tsc --noEmit`, `npm run lint`, `npm run build`). Unused variables prefixed `_`, dead imports purged, strict type alignment mandatory. App Router conventions enforced (no `next/document` imports).
- **Operational & SSR Rules:**
  - Validate environment variables at module initialization; reject `undefined` endpoints.
  - Gate browser-specific APIs (`localStorage`, `clipboard`, `useSearchParams`) behind `useEffect` or `<Suspense>` boundaries to prevent prerendering crashes.
  - UI/Layout: Tailwind utilities exclusively; respect `dvh`/safe-area constraints; standardize on native `<dialog>` or Radix UI for modals/drawers.
  - File Attachments: Route via `/api/upload`; track `PendingFile` in `useAttachmentsStore`; inject resolved `uploadedId` into WS payloads.

## 2. Chronology of Major Milestones & What Worked
- **2026-05-23 | Core Architecture Ratification:** ADR-001/002/003 approved. Established modular directory structure, centralized WS client abstraction, and Zustand reactivity model. Baseline separation of concerns achieved.
- **2026-05-25 | Lint & Build Hardening:** Resolved 3 ESLint errors & 67 warnings. Achieved clean `tsc`/`lint`/`build` pipeline. Standardized unused variable prefixing (`_`), purged dead imports, eliminated redundant local state.
- **2026-05-30 | Factory Critique & Backlog Generation:** Post-build audit identified critical runtime gaps in WS initialization and chat protocol serialization. Generated targeted fix stories for default connectivity and payload mismatches.
- **2026-05-30 | File Attachment & Image Paste:** Validated `Composer` paste handling via `/api/upload`. Confirmed `useAttachmentsStore` tracks `PendingFile` objects and resolves `uploadedId`. Verified `ChatView` injection. Identified `BottomNav` mobile overlap risk.
- **2026-05-31 | Model Appearance Settings:** Delivered `useModelSettingsStore` with `localStorage` persistence. Implemented `ModelSelector`, `AppearanceSettings`, `ThemeToggle`, `ModelSettingsPanel`. Integrated into root layout & settings page. Passed all build gates.
- **2026-05-31 | Project Management & Routing:** Centralized `projects.ts` Zustand store with `localStorage` sync & `rAF` wrapping. Rebuilt `ProjectList`, `ProjectItem`, `NewProjectDialog` (native `<dialog>`), dynamic `[id]` route. Implemented touch-target optimization & CSS truncation.
- **2026-05-31 | Settings Drawer & UI State:** Added `settingsOpen` to `useUIStore`. Built `SettingsDrawer` using Radix UI with Tailwind dark-mode compatibility. Integrated into `AppShell`, `Sidebar`, `BottomNav`. Fixed invalid HTML hierarchy in `settings/page.tsx`.
- **2026-05-31 | Saved Queues System:** Implemented strict `queue.ts` types & `useQueueStore` with `persist` middleware. Created RESTful `/api/queues` routes. Built `QueueList`, `QueueItem`, `QueueForm`, updated `QueueControls`. Full CRUD persistence operational.
- **2026-05-31 | New Conversation Flow & Legacy Cleanup:** Integrated `NewChatButton` for mobile viewports. Standardized `EmptyState` component. Purged erroneous `next/document` `<Html>` imports incompatible with App Router.
- **2026-05-31 | iOS Viewport & Slash Commands:** Verified `Viewport` config for safe-area insets. Implemented fuzzy matching utility for slash command palette.
- **2026-05-31 | Tool Calls & Token Timing:** Extended `JobStep` types for token counter timing. Defined `ToolCallStatus` types. Enforced SSR-safe checks for `useSearchParams` within `<Suspense>` boundaries.
- **Ongoing | Zero-Error Baseline:** Strict type/lint compliance maintained as mandatory gate for all agent iterations and PR merges. Continuous integration enforces architectural integrity.

## 3. Failure Post-Mortems & Anti-Patterns
- **Empty WebSocket URL Resolution**
  - *Symptom:* `ws-client.ts` `getWsUrl()` returns `undefined`/empty string when `NEXT_PUBLIC_PI_WS_URL` is unset, silently breaking chat connectivity.
  - *Fix:* Implement explicit fallback URL or throw descriptive initialization error; validate env var at module load time.
- **Protocol Payload Mismatch**
  - *Symptom:* `ChatView.tsx` dispatches `{ type: 'chat' }`; `pi` backend expects `{ type: 'prompt' }`. Messages silently dropped or rejected.
  - *Fix:* Standardize payload schema to `{ type: 'prompt', conversationId, content, projectId }`. Enforce via shared TypeScript interfaces.
- **Synchronous State Updates in Effects**
  - *Symptom:* React strict mode warnings/errors from `setState` inside `useEffect` (`LoginForm.tsx`, `AppLayout.tsx`, `chat/page.tsx`).
  - *Fix:* Remove redundant local state (use store directly), move clearing logic to `onChange`, or wrap in `requestAnimationFrame()` for next-frame execution.
- **Unused Code Accumulation**
  - *Symptom:* 67 lint warnings from dead imports/variables across 12+ files degrading build signal-to-noise.
  - *Fix:* Automated cleanup; prefix unused params with `_`; enforce `no-unused-vars` as hard build gate.
- **Ghost Render Cascades & Route State Loss**
  - *Symptom:* Inline `useState`/`useEffect` combos caused jittery UI updates, strict mode violations, and data wipe on navigation.
  - *Fix:* Migrate to Zustand centralized store; persist critical session state; decouple UI rendering from network dispatch cycles.
- **App Router `<Html>` Import Conflict**
  - *Symptom:* Legacy Pages Router imports (`next/document`) causing build failures and type mismatches in App Router environment.
  - *Fix:* Purge all `next/document` references; rely exclusively on `src/app/layout.tsx` metadata and viewport configuration.
- **Gemini CLI Quota Exhaustion (429)**
  - *Symptom:* Repeated `You have exhausted your capacity on this model` errors during model settings implementation, blocking CLI execution.
  - *Fix:* Fallback to `agy` (Antigravity) agent; implement exponential backoff/retry logic in CLI delegation scripts; monitor rate limits.
- **Invalid HTML Hierarchy in Settings Page**
  - *Symptom:* Nested `<main>` elements causing accessibility warnings and layout overflow clipping.
  - *Fix:* Restructure to semantic `div` containers with Tailwind `h-full flex flex-col bg-background`; remove `min-h-screen` to respect parent layout constraints.
- **Mobile Layout Overlap (`BottomNav` vs `Composer`)**
  - *Symptom:* Fixed bottom navigation overlapping chat input on small viewports, reducing touch target usability.
  - *Fix:* Apply `h-[calc(100dvh-3.5rem)]` constraints, use `lg:hidden`/`md:py-2` responsive utilities, and defer to `requestAnimationFrame` for dynamic height calculations.
- **SSR/Prerendering Crashes**
  - *Symptom:* Build-time crashes due to browser-specific API access (e.g., `useSearchParams`, localStorage) outside of client-side hydration boundaries.
  - *Fix:* Wrap components using `useSearchParams` in `<Suspense>` boundaries; gate browser APIs inside `useEffect` or client-only hooks to ensure static generation safety.
- **Clipboard API Deduplication Overlap**
  - *Symptom:* `handlePaste` in `Composer` triggered duplicate image attachments when `clipboardData.files` and `clipboardData.items` returned overlapping references.
  - *Fix:* Implement `Set`-based deduplication on extracted file objects before dispatching to `useAttachmentsStore`; restrict to `image/png|jpeg|gif|webp`.
- **CLI Tool Timeout / Unbounded Search**
  - *Symptom:* Grep/ripgrep operations timed out during deep directory traversal, stalling agent execution.
  - *Fix:* Scope file searches to explicit paths/globs; avoid unbounded `src/` scans; leverage targeted `cat`/`head` commands for rapid context loading.
- **Outdated Component Type Collisions**
  - *Symptom:* Legacy `TaskQueueEditor.tsx` generated unresolved type errors during queue system implementation.
  - *Fix:* Purge obsolete components; enforce strict type alignment in `src/types/queue.ts` before UI integration.
