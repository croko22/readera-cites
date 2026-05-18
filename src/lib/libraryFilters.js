// ────────────────────────────────────────────────────────────
// libraryFilters.js — Pure filter logic + shared accessors
// Deep module: concentrates all filter/sort computation and
// book data access behind a small interface. No React deps.
// ────────────────────────────────────────────────────────────

// ── Shared accessors (consolidated from Library.jsx + insightsModel.js) ──

export function getBookTitle(book) {
  return (
    book?.data?.doc_file_name_title ||
    book?.data?.doc_title ||
    "Untitled book"
  );
}

export function getBookAuthor(book) {
  return book?.data?.doc_authors?.trim() || "Unknown author";
}

export function getBookLastReadTime(book) {
  return Number(book?.data?.doc_last_read_time) || 0;
}

export function getBookCitationsCount(book) {
  return Array.isArray(book?.citations) ? book.citations.length : 0;
}

export function isFavoriteBook(book) {
  const t = book?.data?.doc_favorites_time;
  return t != null && Number(t) !== 0;
}

// ── Constants ──

export const DATE_RANGES = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
];



// ── Pure helpers ──

function getDateThreshold(range) {
  if (range === "all") return 0;
  const now = Date.now();
  const days = { "7d": 7, "30d": 30, "3m": 90 };
  return now - (days[range] || 0) * 24 * 60 * 60 * 1000;
}

/**
 * Filter and sort a book list by all criteria.
 * Pure function — books are not mutated (copy is made internally).
 */
export function applyLibraryFilters(books, options) {
  if (!Array.isArray(books)) return [];

  const {
    searchMode,
    searchText,
    dateRange,
    authorFilter,
    minCitations,
    favoritesOnly,
    sortState,
  } = options;

  let result = [...books];

  if (searchMode === "title" && searchText) {
    const query = String(searchText).toLowerCase();
    result = result.filter((book) =>
      getBookTitle(book).toLowerCase().includes(query),
    );
  }

  if (dateRange !== "all") {
    const threshold = getDateThreshold(dateRange);
    result = result.filter((book) => getBookLastReadTime(book) >= threshold);
  }

  if (authorFilter !== "all") {
    result = result.filter((book) => getBookAuthor(book) === authorFilter);
  }

  const min = Number(minCitations);
  if (min > 0) {
    result = result.filter((book) => getBookCitationsCount(book) >= min);
  }

  if (favoritesOnly) {
    result = result.filter((book) => isFavoriteBook(book));
  }

  if (sortState?.key === "quotes") {
    result.sort((a, b) =>
      sortState.dir === "desc"
        ? getBookCitationsCount(b) - getBookCitationsCount(a)
        : getBookCitationsCount(a) - getBookCitationsCount(b),
    );
  }

  if (sortState?.key === "alpha") {
    result.sort((a, b) => {
      const titleA = getBookTitle(a);
      const titleB = getBookTitle(b);
      return sortState.dir === "desc"
        ? titleB.localeCompare(titleA)
        : titleA.localeCompare(titleB);
    });
  }

  return result;
}

/**
 * Search all citations across books for a query string.
 * Returns [{ book, matches: [...] }].
 */
export function getCitationSearchResults(books, rawQuery) {
  if (!Array.isArray(books)) return [];
  const query = String(rawQuery || "").toLowerCase().trim();
  if (!query) return [];

  const results = [];
  for (const book of books) {
    const citations = Array.isArray(book?.citations) ? book.citations : [];
    const matches = [];
    for (const cite of citations) {
      const body = String(cite?.note_body || "").toLowerCase();
      const extra = String(cite?.note_extra || "").toLowerCase();
      if (body.includes(query) || extra.includes(query)) {
        matches.push(cite);
      }
    }
    if (matches.length > 0) {
      results.push({ book, matches });
    }
  }

  return results;
}

/**
 * Split text on a query string and wrap matches in <mark>.
 * Returns an array of strings and React elements.
 */
export function highlightText(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? { __html: true, content: part, key: i } // marker for consumer
      : part,
  );
}

// ── Reducer (state machine for all filter controls) ──

export const FILTER_INITIAL_STATE = {
  searchText: "",
  searchMode: "title",
  dateRange: "all",
  authorFilter: "all",
  authorSearch: "",
  minCitations: "",
  favoritesOnly: false,
  sortState: null,
};

/**
 * Action types:
 *   { type: "SET_SEARCH_TEXT", payload: string }
 *   { type: "SET_SEARCH_MODE", payload: "title" | "citations" | "insights" }
 *   { type: "SET_DATE_RANGE", payload: string }
 *   { type: "SET_AUTHOR_FILTER", payload: string }
 *   { type: "SET_AUTHOR_SEARCH", payload: string }
 *   { type: "SET_MIN_CITATIONS", payload: string }
 *   { type: "TOGGLE_FAVORITES" }
 *   { type: "TOGGLE_SORT", payload: "quotes" | "alpha" }
 *   { type: "RESTORE_CHANGES" }
 */
export function filterReducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH_TEXT":
      return { ...state, searchText: action.payload };

    case "SET_SEARCH_MODE":
      return { ...state, searchMode: action.payload };

    case "SET_DATE_RANGE":
      return { ...state, dateRange: action.payload };

    case "SET_AUTHOR_FILTER":
      return { ...state, authorFilter: action.payload, authorSearch: "" };

    case "SET_AUTHOR_SEARCH":
      return { ...state, authorSearch: action.payload };

    case "SET_MIN_CITATIONS":
      return { ...state, minCitations: action.payload };

    case "TOGGLE_FAVORITES":
      return { ...state, favoritesOnly: !state.favoritesOnly };

    case "TOGGLE_SORT": {
      const key = action.payload;
      const prev = state.sortState;
      if (prev && prev.key === key) {
        return {
          ...state,
          sortState: prev.dir === "desc" ? { key, dir: "asc" } : null,
        };
      }
      return { ...state, sortState: { key, dir: "desc" } };
    }

    case "RESTORE_CHANGES":
      return { ...FILTER_INITIAL_STATE, searchMode: state.searchMode };

    default:
      return state;
  }
}

/**
 * Derive the unique, sorted author list from a book collection.
 */
export function deriveAuthors(books) {
  if (!Array.isArray(books)) return [];
  const authorSet = new Set();
  books.forEach((book) => {
    const a = book?.data?.doc_authors;
    if (a && a.trim()) authorSet.add(a.trim());
  });
  return Array.from(authorSet).sort((a, b) => a.localeCompare(b));
}

/**
 * Derive filtered authors from a search query.
 */
export function filterAuthors(authors, query) {
  if (!query?.trim()) return authors;
  const q = query.toLowerCase();
  return authors.filter((a) => a.toLowerCase().includes(q));
}
