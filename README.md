# ReadEra Cites

> Browse, search, and export your book notes and highlights from ReadEra backup files.

![version](https://img.shields.io/github/v/release/croko22/readera-cites?label=version)
![license](https://img.shields.io/github/license/croko22/readera-cites)
![react](https://img.shields.io/github/package-json/dependency-version/croko22/readera-cites/react?label=react)
![vite](https://img.shields.io/github/package-json/dependency-version/croko22/readera-cites/dev/vite?label=vite)

![ReadEra Cites Promo](docs/readera-cites-promo.gif)

## v2.1.2

- Share citation clipboard delivery between single and bulk copy flows, including reliable fallback cleanup.
- Extract the optional Insights graph lifecycle into `useInsightsGraph`, clearing import timeouts and ignoring late resolutions.
- Preserve graph retry and list fallback behavior with added regression coverage.

## v2.1.1

- Replace the Insights renderer with `react-force-graph-2d`, reduce the graph vendor bundle, and keep it out of the initial JavaScript import chain.
- Preserve graph positions when selecting books, bound layout simulation, and pause idle redraws.
- Fix Insights remaining on "Loading graph..." during React StrictMode effect replay.
- Use Bun with the committed `bun.lock` for reproducible dependency installs.

## Features

- **Upload backup files** -- Import `.bak` (compressed) or `.json` ReadEra exports directly; compressed files are decompressed automatically
- **Browse your library** -- View all books with cover art, author, and citation counts at a glance
- **Recent highlights** -- Browse saved passages by day, week, or month; filter to one book and reverse the chronology. Previous/Next controls show 50 highlights per page to keep large libraries responsive; changing scope, grouping, or order returns to the first page.
- **Continue reading** -- Return to the most recently read book and see how many highlights you saved this week
- **Search and filter** -- Find citations by text, filter by type (highlights, notes, bookmarks), and sort books by date or note count
- **Copy to clipboard** -- Export individual quotes or notes with one click, formatted and ready to paste
- **Dark mode** -- Full dark theme with an amber accent, toggled from the settings page
- **Responsive design** -- Works on desktop, tablet, and mobile with a layout that adapts to any screen
- **Offline support** -- Installed as a PWA with a service worker, so the app loads and works without a network connection
- **Client-side only** -- All data stays in your browser via IndexedDB with localStorage fallback; nothing is sent to a server

### Import and result feedback

- Import shows reading and saving status. Wait for the current operation to finish before choosing another file or loading the library again.
- Import errors and backup warnings remain visible on the upload page. After a save error, the parsed backup remains available for retrying.
- Insights shows how many matching books are visible and offers **Show more** until all results are available.
- Insights uses a lazy-loaded `react-force-graph-2d` canvas. Select a book node to inspect citations, drag nodes, or pan and zoom. The layout stops after at most 100 ticks or 2.5 seconds and redraws pause when settled; changing selection preserves the layout. The list remains available if the graph cannot load.
- Changing citation search, color filters, or sorting returns pagination to the first page.

### Search and export scope

- **Titles** searches book titles; **Citations** searches citation text and notes across the library; **Insights** explores citation matches across books. Search on a book page stays within that book's citation text.
- Color filters display their names and counts, with a check mark on the active filter. Pagination names each action and identifies the current page.
- **Copy filtered citations** and **Download filtered Markdown** include all citations matching the book page's search and color filter, not just the current page.
- **Download complete book JSON** includes every citation in that book. **Download complete library JSON** includes every book and citation in the library, regardless of active filters.

### Small-screen and touch layouts

- Search modes move below the input on narrow screens; all modes remain available.
- Search controls, citation copy/share actions, pagination, and book filters have larger touch targets. Library book titles open the book; the separate arrow button expands its details.
- Long book titles, author names, citations, and notes wrap instead of widening the page. Citation grid columns stay within the available width, and book toolbar controls wrap onto additional rows when needed.

### Interface styling

- Tailwind v4 semantic themes are defined with `@theme inline` in `src/index.css`. Prefer `bg-card`, `bg-popover`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, and `text-primary` over fixed slate, amber, or white utility values.
- Surfaces stay quiet and mostly opaque. Reserve the amber primary color for primary actions, selected states, focus rings, and meaningful highlights; use secondary surfaces for hover and inactive controls.
- Dark mode is the only supported theme.

## Quick Start

```bash
git clone https://github.com/croko22/readera-cites.git
cd readera-cites
bun install && bun run dev
```

The dev server starts on `http://localhost:5173`.

Use Bun and the committed `bun.lock` for dependencies. Run `bun run test` for the Vitest suite and `bun run build` for the production/PWA build.

For the timeline's rendering limits, performance measurements, and regression checks, see [Timeline performance](docs/timeline-performance.md).

## Tech Stack

| Technology           | Purpose                              |
| -------------------- | ------------------------------------ |
| React 19             | UI library                           |
| React Router 7       | Client-side routing                  |
| Vite 7               | Build tool and dev server            |
| Tailwind CSS 4       | Utility-first styling                |
| Shadcn/ui + Radix UI | Accessible component primitives      |
| fflate               | Decompression of `.bak` backup files |
| idb-keyval           | IndexedDB storage wrapper            |
| Lucide React         | Icon set                             |
| vite-plugin-pwa      | Service worker and offline caching   |

## Architecture

Single-page application with no backend. React Router handles client-side navigation across four views. Uploaded files are parsed in the browser and persisted through a storage abstraction (`src/lib/booksStorage.js`) that prefers IndexedDB for large datasets and falls back to localStorage. The app is built as a PWA with a service worker for offline access.

| Route       | Page     | Description                                |
| ----------- | -------- | ------------------------------------------ |
| `/`         | Library  | Main view listing all books with citations |
| `/book/:id` | Book     | Single book detail with all its citations  |
| `/timeline` | Timeline | Recent highlights grouped by day/week/month |
| `/upload`   | Upload   | File upload and backup parsing             |
| `/settings` | Settings | App preferences and dark mode toggle       |

## License

MIT
