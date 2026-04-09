# AGENTS.md

## What This Repo Is
- React 19 + Vite 7 single-page PWA (no backend); all user data stays in-browser.
- ReadEra backup viewer: upload `.bak`/`.json`, parse citations, browse/search/filter/export.

## Commands (Verified)
- `npm run dev` - start local dev server (Vite, default `http://localhost:5173`).
- `npm run test` - run full Vitest suite once.
- `npm run test -- src/lib/insightsModel.test.js` - run one test file.
- `npm run build` - production build (also generates service worker + manifest assets).
- `npm run preview` - serve built app.

## Practical Command Order
- Typical check before handing off: `npm run test` -> `npm run build`.
- Release workflow is tag-driven (`v*` tags) and does not run CI tests/build for you.

## Real Entrypoints and Boundaries
- App entry: `src/main.jsx` (Router + global CSS).
- Route wiring: `src/App.jsx` (`/`, `/book/:id`, `/upload`, `/settings`).
- Main stateful screen: `src/pages/Library.jsx` (title/citation/insights modes, filters, export).
- Upload pipeline: `src/pages/Upload.jsx` (`.bak` unzip via `fflate`, validates `library.json` shape).
- Persistence boundary: `src/lib/booksStorage.js` (prefer IndexedDB via `idb-keyval`, fallback/migration to localStorage).
- Insights boundary: `src/components/insights/InsightsView.jsx` + `src/lib/insightsModel.js` (graph/list model, lazy graph load).

## Toolchain Quirks
- Vitest config lives in `vite.config.js` (`jsdom`, globals, setup file `src/test/setup.js`); there is no separate `vitest.config.*`.
- Tailwind is wired through `@tailwindcss/vite` plugin in `vite.config.js` (not PostCSS pipeline usage in scripts).
- Vite build uses manual chunk splitting (`graph-vendor`, `react-router-vendor`, `ui-vendor`, `misc-vendor`) to keep graph deps isolated.
- `@` path alias is defined in both `vite.config.js` and `jsconfig.json`.

## Testing Notes
- Current tests are component/model-focused around search + insights:
  - `src/lib/insightsModel.test.js`
  - `src/components/Search.test.jsx`
  - `src/components/insights/InsightsView.test.jsx`
- Insights view is intentionally resilient: graph import failure must fall back to list/side-panel behavior.

## Repo-Specific Guardrails
- Prefer executable truth over docs: `package.json` scripts + `vite.config.js` are source of truth.
- Do not bypass `booksStorage` for app data persistence (no direct storage calls in feature code).
- Keep this app client-only; avoid introducing server dependencies for core flows.
