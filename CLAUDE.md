# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReadEra Book Notes Viewer — a React PWA for viewing and analyzing book notes/citations from ReadEra backup files (`.bak` or `.json`). Users upload backup files, which are parsed and stored client-side for browsing, searching, filtering, and exporting quotes.

## Commands

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
```

No test runner or linter is configured.

## Architecture

**Single-page app** with React Router, no backend. All data lives in the browser.

### Routing (`src/App.jsx`)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Library | Main view listing books with citations |
| `/book/:id` | Book | Single book detail with all its citations |
| `/upload` | Upload | File upload and parsing |
| `*` | 404 | Catch-all |

### Data Flow

1. **Upload** (`src/pages/Upload.jsx`): User uploads `.bak` (compressed) or `.json` file → parsed with `fflate` if needed → filtered to books with citations → stored via `booksStorage`
2. **Library** (`src/pages/Library.jsx`): Reads stored books → displays with search/filter
3. **Book** (`src/pages/Book.jsx`): Shows single book details and all its citations

### Storage Layer (`src/lib/booksStorage.js`)

Custom persistence abstraction:
- Prefers **IndexedDB** (via `idb-keyval`) for datasets >5MB
- Falls back to **localStorage** if IndexedDB fails
- Handles transparent migration between backends
- All reads/writes go through this module — never access storage directly

### Key Libraries

- **React 19** + **React Router 7** — UI and routing
- **Tailwind CSS 4** — Styling (Vite plugin, not PostCSS)
- **Shadcn/ui** + **Radix UI** — Accessible component primitives (`src/components/ui/`)
- **fflate** — Decompression of `.bak` files
- **idb-keyval** — IndexedDB wrapper
- **Lucide React** — Icons
- **vite-plugin-pwa** — PWA with service worker and auto-update

### Data Model

Books have `data` (metadata: title, author, cover) and `citations` (array of quotes/notes with page numbers and timestamps).

## Path Alias

`@` maps to `./src` (configured in `vite.config.js` and `jsconfig.json`).

## Styling

- Tailwind CSS 4 with dark mode (`class` strategy)
- Design tokens in CSS variables (`src/index.css`)
- Amber accent color (#F59E0B) on slate dark theme
- Shadcn components configured in `components.json`
