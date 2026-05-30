# pi-app--lint-fixes

> Written by Factory orchestrator at 2026-05-25T11:27:32.842Z

# ADR: Lint & Build Fixes

Date: 2026-05-25

## Context
The project had 3 ESLint errors (synchronous setState in useEffect) and 67 warnings (unused variables/imports) that needed to be resolved for a clean build.

## Decision
1. **Synchronous setState in useEffect errors** — Fixed by:
   - `src/app/chat/page.tsx`: Removed redundant local state; use store's `selectedId` directly
   - `src/components/auth/LoginForm.tsx`: Moved error clearing into onChange handler
   - `src/components/layout/AppLayout.tsx`: Wrapped setState in `requestAnimationFrame()` to defer to next frame

2. **Unused variable warnings** — Fixed by:
   - Removing unused imports across 12+ files
   - Prefixing unused callback/store params with `_`
   - Removing unused destructured variables

## Consequences
- Project now passes `npx tsc --noEmit`, `npm run lint`, and `npm run build` with zero errors
- All 96 files in the project are clean
- Build produces 12 static/dynamic pages with proper code splitting

