# v2.0 Deep Polish Design Spec

**Date:** 2026-04-04
**Project:** readera-cites
**Version:** 2.0.0

## Goal

Improve the existing app across four areas: search & filtering, export formats, book detail page, and UX polish. No new features — just making what exists genuinely better.

## Deliverables

### 1. Search & Filtering Overhaul

**Global citation search:**
- New search accessible from Library page that searches across all citations in all books
- Results grouped by book, matching text highlighted
- Click a result navigates to that book with the citation scrolled into view

**Advanced library filters:**
- Date range filter (last read) — preset options: "Last 7 days", "Last 30 days", "Last 3 months", "All time"
- Citation count range — min/max sliders or input fields
- Author filter — dropdown populated from existing book data
- All filters stack (AND logic)

**Search history:**
- Persist last 10 search queries in booksStorage
- Show as suggestion chips below the search input when focused
- Clear history option in settings

**Implementation:**
- Extend Library.jsx with additional filter controls
- All filtering remains client-side (dataset is small enough)
- Search history stored under a new key in booksStorage

### 2. Export Formats

**Markdown export:**
- Per-book: "Export as Markdown" button on book detail page
- Format: `# Book Title\n\n> "Quote text" (p. 42)\n\n---\n\n> "Next quote" (p. 55)`
- Downloads as `<book-title>-notes.md`

**JSON re-export:**
- Per-library: "Export Library" option (backup/sharing)
- Exports the full stored library as a .json file
- Available from Library page header or Settings page

**Improved clipboard format:**
- Include book title and author as header when copying all citations
- Include page number with each citation
- Format: `Book Title — Author\n\n1. "Quote" (Page 42)\n2. "Quote" (Page 55)`

**Export dropdown:**
- New dropdown button on book detail page with options: Copy all, Download Markdown, Download JSON
- Same dropdown pattern on Library page for full library export
- Uses Shadcn DropdownMenu component

### 3. Book Detail Redesign

**Book header:**
- Display: title, author, format badge (EPUB/PDF/MOBI), language, total pages, reading progress bar, last read date (relative time), total citations count
- All data sourced from existing book data model fields
- Compact layout, visually distinct from the citation list below

**Citation sorting:**
- Sort options: Page number (asc/desc), Date added (newest/oldest), Highlight color
- Toggle buttons alongside existing list/grid view toggle
- Default sort: page number ascending

**Citation timestamps:**
- Show `note_timestamp` formatted as relative time ("3 days ago") on each citation card
- Placed below the page number badge

**Navigation:**
- Back to library button (browser back works, but explicit button is clearer)
- Previous/next book links at the bottom (navigate by library order)

### 4. UX Polish

**Loading skeletons:**
- Skeleton cards matching BookCard layout for library page
- Skeleton citation cards for book detail page
- Uses shimmer animation (Tailwind animate-pulse)
- Show for 300ms minimum to avoid flash

**Empty states:**
- Library: "No books found" with filter reset CTA when search/filters yield nothing
- Book detail: "No citations match your filter" when color filter excludes everything
- Clean illustration using existing Lucide icons

**Page transitions:**
- Subtle fade-in on route change
- Implemented via CSS on main wrapper, triggered by route changes
- No heavy animation library — just opacity transition

**Toast improvements:**
- Auto-dismiss with a shrinking progress bar at the bottom of each toast
- Stack multiple toasts vertically with offset
- Keep existing Toastify library, extend with progress bar CSS

## Files Changed (estimated)

| File | Change |
|------|--------|
| `src/pages/Library.jsx` | Advanced filters, global search, search history, library export |
| `src/pages/Book.jsx` | Book header, citation sorting, timestamps, navigation, export dropdown |
| `src/pages/Settings.jsx` | Clear search history option |
| `src/components/Cite.jsx` | Timestamp display |
| `src/components/BookCard.jsx` | Minor metadata additions |
| `src/components/Search.jsx` | Search history suggestions |
| `src/lib/booksStorage.js` | Search history helpers |
| `src/components/ui/dropdown-menu.jsx` | New Shadcn component for export menus |
| `src/components/Skeleton.jsx` | New skeleton components |
| `src/components/EmptyState.jsx` | New empty state component |
| `src/index.css` | Page transition, toast progress bar animations |

## Out of Scope

- Tags or collections system
- Reading statistics dashboard
- AI-powered features
- Cloud sync
- PDF generation
- Light theme
- User accounts
- Backend/server
