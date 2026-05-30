# ADR: Factory Build Critique & Antigravity Story Backlog

Date: 2026-05-30

## Context

Factory completed 10 build sessions and ~70+ story/fix iterations. This document
critiques the quality of what was built and documents the new stories added by
the Antigravity TPM agent to address outstanding issues.

---

## Critique of Factory Output

### 🔴 Critical Failures (App-Breaking)

#### 1. ws-client.ts getWsUrl() returns empty string
**File:** `src/lib/ws-client.ts`
**Line:** ~line 10
**Bug:** The final `return ;` statement is empty — it returns `undefined`, not a URL.
When `NEXT_PUBLIC_PI_WS_URL` is not set in `.env.local`, the WebSocket never connects.
This means the entire chat feature is broken by default.
**Story:** `fix-ws-client-url.yaml`

#### 2. ChatView.tsx sends wrong message type to pi
**File:** `src/components/chat/ChatView.tsx`
**Bug:** `wsClient.send({ type: chat, conversationId, content, projectId })` — pi does
not understand `type: chat`. Pi expects `{ type: prompt, message: string }`.
This means the entire chat feature produces no response from pi.
**Story:** `fix-chat-rpc-protocol.yaml`

#### 3. Tool call events never wired to pi RPC protocol
**Issue:** Tool call handling in ChatView.tsx listens for `job_event` frames which
the current server.js bridge does not send. Pi sends `message_update` with
`assistantMessageEvent.type === tool_use_start`. Zero tool call cards ever appear.
**Story:** `fix-tool-call-rpc-mapping.yaml`

---

### 🟠 High Impact Issues (Features Unusable)

#### 4. History page is a placeholder
**File:** `src/app/history/page.tsx`
**Issue:** Shows "No conversations yet" hardcoded text. Never reads from the
conversations Zustand store. Story was marked "done" in factory but not implemented.
**Story:** `fix-history-page.yaml`

#### 5. Artifacts page is a placeholder
**File:** `src/app/artifacts/page.tsx`
**Issue:** Shows "No artifacts yet" hardcoded text. Artifacts are never displayed
even if they were generated. Story was marked "done" in factory.
**Story:** `fix-artifacts-page.yaml`

#### 6. Chat composer hidden behind bottom nav on mobile
**Issue:** On mobile viewports, the BottomNav (56px fixed at bottom) overlaps the
chat composer. The main element does not add bottom padding on mobile to account
for BottomNav height. Composer is unreachable on mobile.
**Story:** `fix-chat-mobile-layout.yaml`

#### 7. Messages lost on navigation
**Issue:** Messages store uses plain Zustand (no persist middleware). Every
navigation away from /chat clears all conversation history. Conversations appear
in history page but messages are gone when you click back.
**Story:** `fix-message-persistence.yaml`

---

### 🟡 Medium Impact Issues (Features Degraded)

#### 8. ConnectionStatus shows "Connected" even when pi is offline
**Issue:** WS connects to server.js bridge fine, but pi subprocess may fail to start
(wrong binary path, auth error). Status shows green "Connected" while pi is actually
offline. User has no indication why chat produces no response.
**Story:** `fix-connection-status-pi-aware.yaml`

#### 9. Code blocks have no syntax highlighting, no copy button
**Issue:** The message-bubbles-markdown story was marked done, but code blocks in
assistant messages are plain `<pre>` elements with no syntax highlighting, no
language badge, no copy button. This is table stakes for a coding assistant.
**Story:** `fix-code-block-syntax-highlight.yaml`

#### 10. Auto-scroll is jittery and cannot be disabled
**Issue:** `scrollIntoView()` is called on every token append — this jerks the view
even when user has scrolled up to read previous content. No scroll-to-bottom button.
**Story:** `fix-scroll-to-bottom.yaml`

#### 11. globals.css has duplicate main {} and possible duplicate data-theme blocks
**Issue:** CSS has two `main {}` rules added at different times that conflict.
This can cause subtle layout bugs depending on which rule wins.
**Story:** `fix-globals-css-duplicate-main.yaml`

#### 12. Settings page uses inline styles conflicting with Tailwind AppShell
**Issue:** `style={{ height: 100%, display: flex, flexDirection: column }}` 
conflicts with the Tailwind `h-[calc(100dvh-3.5rem)]` on the parent main element.
**Story:** `fix-settings-page-tailwind.yaml`

#### 13. Queue page CSS modules not compatible with dark theme
**Issue:** Queue components were built with CSS modules that may use hardcoded
light-mode colors. Not verified but likely broken.
**Story:** `fix-queue-page-tailwind.yaml`

---

### 🟢 Missing Features (Marked Done But Not Implemented)

#### 14. No slash command palette
**Story marked done:** `slash-command-palette.yaml`
**Reality:** Factory agent stalled; feature was never implemented.
**New story:** `feat-slash-command-palette.yaml`

#### 15. No message copy/retry actions
**Story marked done:** `retry-fork-edit-resend.yaml`
**Reality:** Actions may exist but are not wired to the correct pi RPC protocol.
**New story:** `feat-message-copy-retry.yaml`

#### 16. No new conversation button
**Issue:** There is no way to start a new pi session from the UI. Users are stuck
in the same session forever.
**Story:** `fix-new-session-button.yaml`

#### 17. TypeScript errors throughout
**Issue:** Factory sessions left accumulated TypeScript errors. The codebase likely
does not pass `npx tsc --noEmit`.
**Story:** `fix-typescript-errors.yaml`

---

## Summary of New Stories Added

| Story File | Priority | Phase | Category |
|-----------|---------|-------|----------|
| fix-ws-client-url.yaml | 99 | 1 | Critical Bug |
| fix-typescript-errors.yaml | 98 | 1 | Technical Debt |
| fix-globals-css-duplicate-main.yaml | 97 | 1 | CSS Bug |
| fix-chat-mobile-layout.yaml | 95 | 1 | Layout Bug |
| fix-chat-rpc-protocol.yaml | 100 | 1 | Critical Bug |
| fix-history-page.yaml | 90 | 1 | Missing Feature |
| fix-code-block-syntax-highlight.yaml | 88 | 2 | UX |
| fix-artifacts-page.yaml | 80 | 1 | Missing Feature |
| fix-scroll-to-bottom.yaml | 82 | 2 | UX |
| fix-tool-call-rpc-mapping.yaml | 85 | 2 | Integration Bug |
| fix-new-session-button.yaml | 78 | 2 | Missing Feature |
| fix-connection-status-pi-aware.yaml | 75 | 2 | UX |
| fix-message-persistence.yaml | 70 | 2 | Data |
| fix-settings-page-tailwind.yaml | 65 | 2 | UI Bug |
| fix-queue-page-tailwind.yaml | 63 | 2 | UI Bug |
| feat-message-copy-retry.yaml | 55 | 3 | Feature |
| feat-slash-command-palette.yaml | 60 | 3 | Feature |

## Recommended Execution Order

Phase 1 (run first, in priority order):
1. fix-ws-client-url — unblocks all chat functionality
2. fix-typescript-errors — unblocks builds
3. fix-globals-css-duplicate-main — CSS foundation
4. fix-chat-rpc-protocol — makes chat actually work with pi
5. fix-chat-mobile-layout — makes app usable on mobile
6. fix-history-page — fills empty placeholder
7. fix-artifacts-page — fills empty placeholder

Phase 2 (run after Phase 1):
8. fix-code-block-syntax-highlight — UX must-have for coding assistant
9. fix-tool-call-rpc-mapping — shows pi working
10. fix-scroll-to-bottom — chat quality of life
11. fix-new-session-button — basic session management
12. fix-connection-status-pi-aware — debugging visibility
13. fix-message-persistence — data durability
14. fix-settings-page-tailwind — settings usability
15. fix-queue-page-tailwind — queue usability

Phase 3 (polish):
16. feat-message-copy-retry — nice to have
17. feat-slash-command-palette — power user feature
