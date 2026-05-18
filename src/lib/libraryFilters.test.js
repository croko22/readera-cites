import { describe, it, expect } from "vitest";
import {
  // accessors
  getBookTitle,
  getBookAuthor,
  getBookLastReadTime,
  getBookCitationsCount,
  isFavoriteBook,
  // filter computation
  applyLibraryFilters,
  getCitationSearchResults,
  // reducer
  filterReducer,
  FILTER_INITIAL_STATE,
  // utility
  deriveAuthors,
  filterAuthors,
} from "./libraryFilters";

// ── Fixtures ──
// Factory that separates data-level overrides from top-level overrides
// so callers can override citations, data.doc_title, etc. independently.

const makeBook = (overrides = {}) => {
  const { data: dataOverrides, ...topOverrides } = overrides;
  return {
    data: {
      doc_md5: "abc123",
      doc_file_name_title: "Test Book",
      doc_title: "Test Book",
      doc_authors: "Jane Doe",
      doc_last_read_time: Date.now(),
      doc_favorites_time: 0,
      doc_page_count: 300,
      ...dataOverrides,
    },
    citations: [
      { note_body: "First citation", note_page: 10 },
      { note_body: "Second citation", note_page: 25 },
    ],
    ...topOverrides,
  };
};

const makeBooks = () => [
  makeBook({
    data: {
      doc_file_name_title: "Alpha Book",
      doc_authors: "Alice",
      doc_last_read_time: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      doc_favorites_time: 0,
    },
  }),
  makeBook({
    data: {
      doc_file_name_title: "Beta Book",
      doc_authors: "Bob",
      doc_last_read_time: Date.now() - 40 * 24 * 60 * 60 * 1000, // 40 days ago
      doc_favorites_time: 1700000000000, // favorited
    },
    citations: [
      { note_body: "Beta citation one" },
      { note_body: "Beta citation two" },
      { note_body: "Beta citation three" },
    ],
  }),
  makeBook({
    data: {
      doc_file_name_title: "Gamma Book",
      doc_authors: "Alice",
      doc_last_read_time: Date.now() - 100 * 24 * 60 * 60 * 1000, // 100 days ago
      doc_favorites_time: 0,
    },
    citations: [],
  }),
];

// ── Accessor tests ──

describe("getBookTitle", () => {
  it("returns doc_file_name_title when available", () => {
    expect(getBookTitle(makeBook())).toBe("Test Book");
  });

  it("falls back to doc_title", () => {
    const b = makeBook({ data: { doc_file_name_title: undefined, doc_title: "Fallback" } });
    expect(getBookTitle(b)).toBe("Fallback");
  });

  it("falls back to Untitled book", () => {
    expect(getBookTitle({ data: {} })).toBe("Untitled book");
  });

  it("handles null book", () => {
    expect(getBookTitle(null)).toBe("Untitled book");
  });
});

describe("getBookAuthor", () => {
  it("returns author when available", () => {
    expect(getBookAuthor(makeBook())).toBe("Jane Doe");
  });

  it("trims whitespace", () => {
    const b = makeBook({ data: { doc_authors: "  Author Name  " } });
    expect(getBookAuthor(b)).toBe("Author Name");
  });

  it("falls back to Unknown author", () => {
    expect(getBookAuthor({ data: {} })).toBe("Unknown author");
  });
});

describe("getBookLastReadTime", () => {
  it("returns the read time as a number", () => {
    const t = 1700000000000;
    expect(getBookLastReadTime(makeBook({ data: { doc_last_read_time: t } }))).toBe(t);
  });

  it("returns 0 when missing", () => {
    expect(getBookLastReadTime({ data: {} })).toBe(0);
  });
});

describe("getBookCitationsCount", () => {
  it("returns citation array length", () => {
    expect(getBookCitationsCount(makeBook())).toBe(2);
  });

  it("returns 0 for missing citations", () => {
    expect(getBookCitationsCount({ data: {} })).toBe(0);
  });

  it("returns 0 for non-array citations", () => {
    expect(getBookCitationsCount({ data: {}, citations: "invalid" })).toBe(0);
  });
});

describe("isFavoriteBook", () => {
  it("returns true when favorites_time is non-zero", () => {
    expect(isFavoriteBook(makeBook({ data: { doc_favorites_time: 1700000000000 } }))).toBe(true);
  });

  it("returns false when favorites_time is 0", () => {
    expect(isFavoriteBook(makeBook({ data: { doc_favorites_time: 0 } }))).toBe(false);
  });

  it("returns false when favorites_time is missing", () => {
    expect(isFavoriteBook({ data: {} })).toBe(false);
  });
});

// ── Reducer tests ──

describe("filterReducer", () => {
  it("starts with initial state", () => {
    expect(FILTER_INITIAL_STATE).toEqual({
      searchText: "",
      searchMode: "title",
      dateRange: "all",
      authorFilter: "all",
      authorSearch: "",
      minCitations: "",
      favoritesOnly: false,
      sortState: null,
    });
  });

  it("SET_SEARCH_TEXT updates searchText", () => {
    const next = filterReducer(FILTER_INITIAL_STATE, {
      type: "SET_SEARCH_TEXT",
      payload: "query",
    });
    expect(next.searchText).toBe("query");
  });

  it("SET_SEARCH_MODE updates mode", () => {
    const next = filterReducer(FILTER_INITIAL_STATE, {
      type: "SET_SEARCH_MODE",
      payload: "insights",
    });
    expect(next.searchMode).toBe("insights");
  });

  it("SET_DATE_RANGE updates dateRange", () => {
    const next = filterReducer(FILTER_INITIAL_STATE, {
      type: "SET_DATE_RANGE",
      payload: "7d",
    });
    expect(next.dateRange).toBe("7d");
  });

  it("SET_AUTHOR_FILTER updates author and clears authorSearch", () => {
    const state = { ...FILTER_INITIAL_STATE, authorSearch: "ali" };
    const next = filterReducer(state, {
      type: "SET_AUTHOR_FILTER",
      payload: "Alice",
    });
    expect(next.authorFilter).toBe("Alice");
    expect(next.authorSearch).toBe("");
  });

  it("TOGGLE_FAVORITES flips favoritesOnly", () => {
    const next = filterReducer(FILTER_INITIAL_STATE, {
      type: "TOGGLE_FAVORITES",
    });
    expect(next.favoritesOnly).toBe(true);
    const next2 = filterReducer(next, { type: "TOGGLE_FAVORITES" });
    expect(next2.favoritesOnly).toBe(false);
  });

  it("TOGGLE_SORT sets desc on first press", () => {
    const next = filterReducer(FILTER_INITIAL_STATE, {
      type: "TOGGLE_SORT",
      payload: "quotes",
    });
    expect(next.sortState).toEqual({ key: "quotes", dir: "desc" });
  });

  it("TOGGLE_SORT same key toggles desc→asc", () => {
    const state = {
      ...FILTER_INITIAL_STATE,
      sortState: { key: "alpha", dir: "desc" },
    };
    const next = filterReducer(state, { type: "TOGGLE_SORT", payload: "alpha" });
    expect(next.sortState).toEqual({ key: "alpha", dir: "asc" });
  });

  it("TOGGLE_SORT same key asc→null (off)", () => {
    const state = {
      ...FILTER_INITIAL_STATE,
      sortState: { key: "alpha", dir: "asc" },
    };
    const next = filterReducer(state, { type: "TOGGLE_SORT", payload: "alpha" });
    expect(next.sortState).toBeNull();
  });

  it("TOGGLE_SORT switches to new key", () => {
    const state = {
      ...FILTER_INITIAL_STATE,
      sortState: { key: "alpha", dir: "asc" },
    };
    const next = filterReducer(state, { type: "TOGGLE_SORT", payload: "quotes" });
    expect(next.sortState).toEqual({ key: "quotes", dir: "desc" });
  });

  it("RESTORE_CHANGES resets everything except searchMode", () => {
    const state = {
      searchText: "hi",
      searchMode: "insights",
      dateRange: "7d",
      authorFilter: "Alice",
      authorSearch: "ali",
      minCitations: "5",
      favoritesOnly: true,
      sortState: { key: "quotes", dir: "desc" },
    };
    const next = filterReducer(state, { type: "RESTORE_CHANGES" });
    expect(next).toEqual({
      searchText: "",
      searchMode: "insights", // preserved
      dateRange: "all",
      authorFilter: "all",
      authorSearch: "",
      minCitations: "",
      favoritesOnly: false,
      sortState: null,
    });
  });

  it("returns unchanged state for unknown action", () => {
    const next = filterReducer(FILTER_INITIAL_STATE, { type: "UNKNOWN" });
    expect(next).toBe(FILTER_INITIAL_STATE);
  });
});

// ── applyLibraryFilters tests ──

describe("applyLibraryFilters", () => {
  it("returns empty array for non-array input", () => {
    expect(applyLibraryFilters(null, {})).toEqual([]);
    expect(applyLibraryFilters(undefined, {})).toEqual([]);
  });

  it("returns books unchanged with no filters", () => {
    const books = makeBooks();
    const result = applyLibraryFilters(books, {
      searchMode: "title",
      searchText: "",
      dateRange: "all",
      authorFilter: "all",
      minCitations: "",
      favoritesOnly: false,
      sortState: null,
    });
    expect(result.length).toBe(3);
  });

  it("filters by title search", () => {
    const books = makeBooks();
    const result = applyLibraryFilters(books, {
      searchMode: "title",
      searchText: "alpha",
      dateRange: "all",
      authorFilter: "all",
      minCitations: "",
      favoritesOnly: false,
      sortState: null,
    });
    expect(result.length).toBe(1);
    expect(getBookTitle(result[0])).toBe("Alpha Book");
  });

  it("case-insensitive title search", () => {
    const books = makeBooks();
    const result = applyLibraryFilters(books, {
      searchMode: "title",
      searchText: "ALPHA",
      dateRange: "all",
      authorFilter: "all",
      minCitations: "",
      favoritesOnly: false,
      sortState: null,
    });
    expect(result.length).toBe(1);
  });

  it("filters by date range (7d)", () => {
    const books = makeBooks();
    const result = applyLibraryFilters(books, {
      searchMode: "title",
      searchText: "",
      dateRange: "7d",
      authorFilter: "all",
      minCitations: "",
      favoritesOnly: false,
      sortState: null,
    });
    // Only Alpha Book (2 days ago) should be within 7 days
    expect(result.length).toBe(1);
    expect(getBookTitle(result[0])).toBe("Alpha Book");
  });

  it("filters by author", () => {
    const books = makeBooks();
    const result = applyLibraryFilters(books, {
      searchMode: "title",
      searchText: "",
      dateRange: "all",
      authorFilter: "Alice",
      minCitations: "",
      favoritesOnly: false,
      sortState: null,
    });
    expect(result.length).toBe(2);
    result.forEach((b) => {
      expect(getBookAuthor(b)).toBe("Alice");
    });
  });

  it("filters by min citations", () => {
    const books = makeBooks();
    const result = applyLibraryFilters(books, {
      searchMode: "title",
      searchText: "",
      dateRange: "all",
      authorFilter: "all",
      minCitations: "3",
      favoritesOnly: false,
      sortState: null,
    });
    expect(result.length).toBe(1);
    expect(getBookTitle(result[0])).toBe("Beta Book");
  });

  it("filters by favorites only", () => {
    const books = makeBooks();
    const result = applyLibraryFilters(books, {
      searchMode: "title",
      searchText: "",
      dateRange: "all",
      authorFilter: "all",
      minCitations: "",
      favoritesOnly: true,
      sortState: null,
    });
    expect(result.length).toBe(1);
    expect(getBookTitle(result[0])).toBe("Beta Book");
  });

  it("sorts by quotes desc", () => {
    const books = makeBooks();
    const result = applyLibraryFilters(books, {
      searchMode: "title",
      searchText: "",
      dateRange: "all",
      authorFilter: "all",
      minCitations: "",
      favoritesOnly: false,
      sortState: { key: "quotes", dir: "desc" },
    });
    expect(getBookCitationsCount(result[0])).toBeGreaterThanOrEqual(
      getBookCitationsCount(result[result.length - 1]),
    );
  });

  it("sorts by title alpha asc", () => {
    const books = makeBooks();
    const result = applyLibraryFilters(books, {
      searchMode: "title",
      searchText: "",
      dateRange: "all",
      authorFilter: "all",
      minCitations: "",
      favoritesOnly: false,
      sortState: { key: "alpha", dir: "asc" },
    });
    expect(getBookTitle(result[0])).toBe("Alpha Book");
    expect(getBookTitle(result[2])).toBe("Gamma Book");
  });

  it("combines multiple filters", () => {
    const books = makeBooks();
    const result = applyLibraryFilters(books, {
      searchMode: "title",
      searchText: "",
      dateRange: "all",
      authorFilter: "Alice",
      minCitations: "1",
      favoritesOnly: false,
      sortState: { key: "alpha", dir: "desc" },
    });
    // Alice has Alpha (2 citations) and Gamma (0 citations). Min=1 excludes Gamma.
    expect(result.length).toBe(1);
    expect(getBookTitle(result[0])).toBe("Alpha Book");
  });
});

// ── getCitationSearchResults tests ──

describe("getCitationSearchResults", () => {
  it("returns empty for non-array books", () => {
    expect(getCitationSearchResults(null, "test")).toEqual([]);
  });

  it("returns empty for empty query", () => {
    expect(getCitationSearchResults([], "")).toEqual([]);
  });

  it("finds matching citations across books", () => {
    const books = makeBooks();
    const results = getCitationSearchResults(books, "Beta citation");
    expect(results.length).toBe(1);
    expect(results[0].matches.length).toBe(3);
  });

  it("is case-insensitive", () => {
    const books = makeBooks();
    const results = getCitationSearchResults(books, "BETA CITATION");
    expect(results.length).toBe(1);
  });

  it("returns empty when no matches", () => {
    const books = makeBooks();
    const results = getCitationSearchResults(books, "nonexistent");
    expect(results.length).toBe(0);
  });
});

// ── deriveAuthors / filterAuthors tests ──

describe("deriveAuthors", () => {
  it("returns sorted unique authors", () => {
    const authors = deriveAuthors(makeBooks());
    expect(authors).toEqual(["Alice", "Bob"]);
  });

  it("returns empty for empty input", () => {
    expect(deriveAuthors([])).toEqual([]);
  });

  it("returns empty for null input", () => {
    expect(deriveAuthors(null)).toEqual([]);
  });

  it("skips empty author strings", () => {
    const books = [
      makeBook({ data: { doc_authors: "" } }),
      makeBook({ data: { doc_authors: "  " } }),
      makeBook({ data: { doc_authors: "Alice" } }),
    ];
    expect(deriveAuthors(books)).toEqual(["Alice"]);
  });
});

describe("filterAuthors", () => {
  const authors = ["Alice Johnson", "Bob Smith", "Charlie Alice"];

  it("returns all when no query", () => {
    expect(filterAuthors(authors, "")).toBe(authors);
  });

  it("filters by substring", () => {
    expect(filterAuthors(authors, "alice")).toEqual([
      "Alice Johnson",
      "Charlie Alice",
    ]);
  });

  it("case-insensitive", () => {
    expect(filterAuthors(authors, "ALICE")).toEqual([
      "Alice Johnson",
      "Charlie Alice",
    ]);
  });

  it("returns empty when no match", () => {
    expect(filterAuthors(authors, "zebra")).toEqual([]);
  });
});
