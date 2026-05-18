import { useReducer, useMemo, useCallback } from "react";
import {
  filterReducer,
  FILTER_INITIAL_STATE,
  applyLibraryFilters,
  getCitationSearchResults,
  deriveAuthors,
  filterAuthors,
} from "../lib/libraryFilters";

/**
 * useLibraryFilters(books)
 *
 * Thin hook over the pure filterReducer. Manages filter state + derives
 * all filtered/computed values from the raw book list.
 *
 * Returns:
 *   state — raw reducer state (setters below for direct mutation)
 *   filteredBooks — books after all active filters + sort
 *   citationResults — citation search results (null when not in citation mode)
 *   authors — unique sorted author list (from all books)
 *   filteredAuthors — authors filtered by authorSearch
 *   hasActiveFilters — true when non-default filters are active
 *   insightsBooks — filteredBooks when in insights mode, else []
 *
 *   Setters (memoized dispatch wrappers):
 *   setSearchText, setSearchMode, setDateRange, setAuthorFilter,
 *   setAuthorSearch, setMinCitations, toggleFavs, toggleSort, restoreChanges
 */
export function useLibraryFilters(books) {
  const [state, dispatch] = useReducer(filterReducer, FILTER_INITIAL_STATE);

  const {
    searchText,
    searchMode,
    dateRange,
    authorFilter,
    authorSearch,
    minCitations,
    favoritesOnly,
    sortState,
  } = state;

  // ── Derived values ──

  const authors = useMemo(() => deriveAuthors(books), [books]);

  const filteredAuthors = useMemo(
    () => filterAuthors(authors, authorSearch),
    [authors, authorSearch],
  );

  const citationResults = useMemo(() => {
    if (searchMode !== "citations" || !searchText.trim() || !books)
      return null;
    return getCitationSearchResults(books, searchText);
  }, [searchMode, searchText, books]);

  const filteredBooks = useMemo(() => {
    if (!books) return null;
    return applyLibraryFilters(books, {
      searchMode,
      searchText,
      dateRange,
      authorFilter,
      minCitations,
      favoritesOnly,
      sortState,
    });
  }, [books, searchText, searchMode, dateRange, authorFilter, minCitations, favoritesOnly, sortState]);

  const insightsBooks = useMemo(() => {
    if (searchMode !== "insights") return [];
    return filteredBooks || [];
  }, [searchMode, filteredBooks]);

  const hasActiveFilters =
    dateRange !== "all" ||
    authorFilter !== "all" ||
    (minCitations && Number(minCitations) > 0);

  // ── Memoized dispatchers ──

  const setSearchText = useCallback(
    (v) => dispatch({ type: "SET_SEARCH_TEXT", payload: v }),
    [],
  );
  const setSearchMode = useCallback(
    (v) => dispatch({ type: "SET_SEARCH_MODE", payload: v }),
    [],
  );
  const setDateRange = useCallback(
    (v) => dispatch({ type: "SET_DATE_RANGE", payload: v }),
    [],
  );
  const setAuthorFilter = useCallback(
    (v) => dispatch({ type: "SET_AUTHOR_FILTER", payload: v }),
    [],
  );
  const setAuthorSearch = useCallback(
    (v) => dispatch({ type: "SET_AUTHOR_SEARCH", payload: v }),
    [],
  );
  const setMinCitations = useCallback(
    (v) => dispatch({ type: "SET_MIN_CITATIONS", payload: v }),
    [],
  );
  const toggleFavs = useCallback(
    () => dispatch({ type: "TOGGLE_FAVORITES" }),
    [],
  );
  const toggleSort = useCallback(
    (key) => dispatch({ type: "TOGGLE_SORT", payload: key }),
    [],
  );
  const restoreChanges = useCallback(
    () => dispatch({ type: "RESTORE_CHANGES" }),
    [],
  );

  return {
    // state (raw, for read access)
    searchText,
    searchMode,
    dateRange,
    authorFilter,
    authorSearch,
    minCitations,
    favoritesOnly,
    sortState,
    // derived
    filteredBooks,
    citationResults,
    authors,
    filteredAuthors,
    hasActiveFilters,
    insightsBooks,
    // setters
    setSearchText,
    setSearchMode,
    setDateRange,
    setAuthorFilter,
    setAuthorSearch,
    setMinCitations,
    toggleFavs,
    toggleSort,
    restoreChanges,
  };
}
