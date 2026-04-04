# ReadEra Cites

> Browse, search, and export your book notes and highlights from ReadEra backup files.

![version](https://img.shields.io/github/v/release/croko22/readera-cites?label=version)
![license](https://img.shields.io/github/license/croko22/readera-cites)
![react](https://img.shields.io/github/package-json/dependency-version/croko22/readera-cites/react?label=react)
![vite](https://img.shields.io/github/package-json/dependency-version/croko22/readera-cites/dev/vite?label=vite)

![Screenshot](docs/screenshot.png)

## Features

- **Upload backup files** -- Import `.bak` (compressed) or `.json` ReadEra exports directly; compressed files are decompressed automatically
- **Browse your library** -- View all books with cover art, author, and citation counts at a glance
- **Search and filter** -- Find citations by text, filter by type (highlights, notes, bookmarks), and sort books by date or note count
- **Copy to clipboard** -- Export individual quotes or notes with one click, formatted and ready to paste
- **Dark mode** -- Full dark theme with an amber accent, toggled from the settings page
- **Responsive design** -- Works on desktop, tablet, and mobile with a layout that adapts to any screen
- **Offline support** -- Installed as a PWA with a service worker, so the app loads and works without a network connection
- **Client-side only** -- All data stays in your browser via IndexedDB with localStorage fallback; nothing is sent to a server

## Quick Start

```bash
git clone https://github.com/croko22/readera-cites.git
cd readera-cites
npm install && npm run dev
```

The dev server starts on `http://localhost:5173`.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| React Router 7 | Client-side routing |
| Vite 7 | Build tool and dev server |
| Tailwind CSS 4 | Utility-first styling |
| Shadcn/ui + Radix UI | Accessible component primitives |
| fflate | Decompression of `.bak` backup files |
| idb-keyval | IndexedDB storage wrapper |
| Lucide React | Icon set |
| vite-plugin-pwa | Service worker and offline caching |

## Architecture

Single-page application with no backend. React Router handles client-side navigation across four views. Uploaded files are parsed in the browser and persisted through a storage abstraction (`src/lib/booksStorage.js`) that prefers IndexedDB for large datasets and falls back to localStorage. The app is built as a PWA with a service worker for offline access.

| Route | Page | Description |
|-------|------|-------------|
| `/` | Library | Main view listing all books with citations |
| `/book/:id` | Book | Single book detail with all its citations |
| `/upload` | Upload | File upload and backup parsing |
| `/settings` | Settings | App preferences and dark mode toggle |

## License

MIT
