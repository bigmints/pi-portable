# REPOSITORY ARCHITECTURAL CHRONICLE

## 1. Architectural Context & Key ADR Highlights
- **Project:** `pi-app` (Next.js 15 App Router, React, TypeScript, Zustand, WebSocket-driven real-time chat)
- **State Architecture:** Centralized Zustand store pattern eliminates redundant re-renders, ghost render cascades, and route-sync pitfalls. Local component state strictly avoided for shared/session data.
  - **Stores:** `useChatStore` (session/conversation), `useAttachmentsStore` (pending file tracking, preview URLs, server `uploadedId` mapping), `useModelSettingsStore` (UI/theme/model config), `useProjectStore` (project CRUD, routing sync), `useQueueStore` (job queue persistence), `useUIStore` (global UI state, drawer toggles).
- **Network Layer:** Dedicated `src/lib/ws-client.ts` abstracts WebSocket lifecycle, URL resolution, message serialization, and reconnection resilience. Isolated from UI rendering cycles.
- **Directory Structure:** Strict modular separation (`src/app/` routing/shells, `src/components/` presentation, `src/lib/` utilities, `src/store/` state, `src/types/` strict interfaces). Prevents coupling and optimizes agent navigation.
- **Build/Quality Gates:** Zero-tolerance pipeline (`tsc --noEmit`, `npm run lint`, `npm run build`). Enforced across 100+ files. Unused variables prefixed `_`, dead imports purged, strict type alignment mandatory. App Router conventions strictly enforced (no `next/document` imports).
- **Key Operational Rules:**
  - Defer synchronous state mutations to next frame (`requestAnimationFrame`) or route exclusively through store actions.
  - Validate environment variables at module initialization; never permit `undefined` network endpoints.
  - Enforce strict payload schema alignment between frontend dispatchers and `pi` backend protocol.
  - **File Attachments:** Route image/file uploads via `/api/upload`; track `PendingFile` state in `useAttachmentsStore`; inject resolved `uploadedId` into WS payloads.
  - **UI/Layout:** Use Tailwind utility classes exclusively; avoid inline styles; respect `dvh`/safe-area constraints for mobile; standardize on native `<dialog>` or Radix UI for modals/drawers.
  - **SSR Safety:** Gate browser-specific APIs (localStorage, clipboard, searchParams) behind `useEffect` or `<Suspense>` boundaries to prevent prerendering crashes.

## 2. Chronology of Major Milestones & What Worked
- **2026-05-23 | Core Architecture Ratification:** ADR-001/002/003 approved. Established modular directory structure, centralized WS client abstraction, and Zustand reactivity model. Baseline separation of concerns achieved.
- **2026-05-25 | Lint & Build Hardening:** Resolved 3 ESLint errors & 67 warnings. Achieved clean `tsc`/`lint`/`build` pipeline. Standardized unused variable prefixing (`_`), purged dead imports, and eliminated redundant local state in favor of store-driven reactivity.
- **2026-05-30 | Factory Critique & Antigravity Backlog:** Post-build audit after ~70 iterations. Identified critical runtime gaps in WebSocket initialization and chat protocol serialization. Generated targeted fix stories to patch default connectivity and payload mismatches.
- **2026-05-30 | File Attachment & Image Paste Integration:** CLI analysis validated `Composer` component handling text/image paste via `/api/upload`. Confirmed `useAttachmentsStore` correctly tracks `PendingFile` objects and resolves `uploadedId`. Verified `ChatView` injects attachment IDs into WS dispatch. Identified `BottomNav` mobile overlap risk requiring layout adjustment.
- **2026-05-31 | Model Appearance Settings:** Delivered `useModelSettingsStore` with `localStorage` persistence. Implemented `ModelSelector`, `AppearanceSettings`, `ThemeToggle`, and consolidated `ModelSettingsPanel`. Integrated into root layout & settings page. Passed all build gates.
- **2026-05-31 | Project Management & Routing:** Centralized `projects.ts` Zustand store with `localStorage` sync & `requestAnimationFrame` wrapping. Rebuilt `ProjectList`, `ProjectItem`, `NewProjectDialog` (native `<dialog>`), and dynamic `ProjectDetailPage` route. Implemented touch-target optimization and CSS truncation.
- **2026-05-31 | Settings Drawer & UI State:** Added `settingsOpen` to `useUIStore`. Built `SettingsDrawer` using Radix UI `@radix-ui/react-dialog` with Tailwind dark-mode compatibility. Integrated into `AppShell`, `Sidebar`, and `BottomNav`. Fixed invalid HTML hierarchy in `settings/page.tsx`.
- **2026-05-31 | Saved Queues System:** Implemented strict `queue.ts` types and `useQueueStore` with `persist` middleware. Created RESTful `/api/queues` routes. Built `QueueList`, `QueueItem`, `QueueForm`, and updated `QueueControls`. Full CRUD persistence operational.
- **2026-05-31 | New Conversation Flow & Legacy Cleanup:** Integrated `NewChatButton` for mobile viewports. Standardized `EmptyState` component. Purged erroneous `next/document` `<Html>` imports incompatible with App Router.
- **2026-05-31 | iOS Viewport & Slash Commands:** Verified `Viewport` config for safe-area insets. Implemented fuzzy matching utility for slash command palette.
- **2026-05-31 | Tool Calls & Token Timing:** Extended `JobStep` types for token counter timing. Defined `ToolCallStatus` types. Enforced SSR-safe checks for `useSearchParams` within `<Suspense>` boundaries to prevent prerendering crashes.
- **Ongoing | Zero-Error Baseline:** Strict type/lint compliance maintained as mandatory gate for all subsequent agent iterations and PR merges. Continuous integration enforces architectural integrity.

## 3. Failure Post-Mortems & Anti-Patterns ("What Didn't Work" and how it was resolved)
- **Empty WebSocket URL Resolution**
  - *Symptom:* `ws-client.ts` `getWsUrl()` returns `undefined`/empty string when `NEXT_PUBLIC_PI_WS_URL` is unset, silently breaking chat connectivity.
  - *Fix:* Implement explicit fallback URL or throw descriptive initialization error; validate env var at module load time.
- **Protocol Payload Mismatch**
  - *Symptom:* `ChatView.tsx` dispatches `{ type: 'chat' }`; `pi` backend expects `{ type: 'prompt' }`. Messages silently dropped or rejected by server.
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
  - *Symptom:* Grep/ripgrep operations timed out during deep directory traversal (`fix-tool-call-annotation` attempt 1), stalling agent execution.
  - *Fix:* Scope file searches to explicit paths/globs; avoid unbounded `src/` scans; leverage targeted `cat`/`head` commands for rapid context loading.
