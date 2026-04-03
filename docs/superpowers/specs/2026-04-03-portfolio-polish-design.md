# Portfolio Polish Design Spec

**Date:** 2026-04-03
**Project:** readera-cites
**Version:** 1.5.0

## Goal

Polish the repo for portfolio presentation: improve GitHub presence, add a settings page that demonstrates product thinking, and set up automated releases.

## Deliverables

### 1. Settings Page

**Route:** `/settings` (new route in `src/App.jsx`)

**Page:** `src/pages/Settings.jsx` using Shadcn components.

**Settings:**

| Setting | Component | Default | Behavior |
|---------|-----------|---------|----------|
| Default citation filter | Select (0/10/50/100/200) | 0 | Used as the initial filter value when uploading a new library |
| Theme | Toggle (light/dark) | dark | Adds/removes `dark` class on `<html>` element, persisted |
| Clear all data | Button + confirmation dialog | — | Deletes all stored books and resets settings to defaults |

**Persistence:**

- Extend `src/lib/booksStorage.js` with `getSettings()` and `setSettings(settings)` helpers
- Settings stored in the same backend as books (IndexedDB preferred, localStorage fallback)
- Settings object shape: `{ defaultFilter: number, theme: 'light' | 'dark' }`

**Theme toggle behavior:**

- On load, check persisted theme and apply class to `<html>`
- Toggle updates the class immediately and persists the choice
- Uses existing Tailwind `class` strategy — no CSS changes needed

**Clear data behavior:**

- Shadcn AlertDialog confirmation before deleting
- Clears books storage + resets settings to defaults
- Navigates back to `/` after clearing

**Navigation:**

- Add Settings link to `src/components/Header.jsx` (gear icon from Lucide)
- Mobile-friendly placement in existing header layout

### 2. README Rewrite

**Structure:**

```
# ReadEra Cites
> One-liner description

[badges: version, license, React]

![Screenshot](screenshot-placeholder.png)

## Features
- Bullet list of key features (6-8 items)

## Quick Start
```bash
git clone ...
npm install
npm run dev
```

## Tech Stack
| Tech | Purpose |
|------|---------|
| React 19 | UI |
| ... | ... |

## Architecture
1 paragraph + routing table
```

**What to remove from current README:** Version roadmap (outdated), generic descriptions.

**What to add:** Badges, screenshot placeholder, tech stack table, architecture section.

**Screenshot:** Placeholder image path `docs/screenshot.png` — user provides the actual image.

### 3. GitHub Releases

**v1.5.0 Release:**

- Created via `gh release create v1.5.0`
- Changelog curated from recent commits, grouped by type (feat, fix, chore)
- No binary attachments (SPA deployed elsewhere)

**GitHub Action:** `.github/workflows/release.yml`

- Triggers on tag push matching `v*`
- Creates a GitHub release with auto-generated notes from commits since last tag
- Uses `softprops/action-gh-release` action
- No build step — the repo doesn't produce release artifacts

## Implementation Order

1. Settings page (code changes)
2. README rewrite
3. GitHub Action for releases
4. Create v1.5.0 release

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Settings.jsx` | New — settings page component |
| `src/lib/booksStorage.js` | Add `getSettings`/`setSettings` helpers |
| `src/App.jsx` | Add `/settings` route |
| `src/components/Header.jsx` | Add settings nav link |
| `src/pages/Upload.jsx` | Use `defaultFilter` from settings |
| `src/main.jsx` or `App.jsx` | Apply persisted theme on load |
| `README.md` | Rewrite |
| `docs/screenshot.png` | Placeholder (user provides) |
| `.github/workflows/release.yml` | New — auto-release on tag push |

## Out of Scope

- CI/CD for builds or deployments
- Internationalization
- Notification settings
- Export format configuration
- Contributing guide or code of conduct
