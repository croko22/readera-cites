import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaRedo, FaRegStar, FaStar, FaTimes } from "react-icons/fa";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  FileJson,
  Search as SearchIcon,
} from "lucide-react";
import { Search } from "../components/Search";
import { BookCard } from "../components/BookCard";
import { LibraryPulse } from "../components/LibraryPulse";
import { LibrarySkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { InsightsView } from "../components/insights/InsightsView";
import { Accordion } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { getBooks } from "../lib/booksStorage";
import { buildLibraryJson, downloadFile } from "../lib/exportUtils";
import { DATE_RANGES } from "../lib/libraryFilters";
import { getBookTitle, getBookAuthor, getBookLastReadTime } from "../lib/readeraVocab";
import { useLibraryFilters } from "../hooks/useLibraryFilters";
import { buildCitationTimeline, getTimelinePeriodKey } from "../lib/timelineModel";

const SORT_MODES = [
  {
    key: "quotes",
    label: "Quotes",
    iconDesc: ArrowDownNarrowWide,
    iconAsc: ArrowUpNarrowWide,
  },
  { key: "alpha", label: "Title A–Z", iconDesc: ArrowDownAZ, iconAsc: ArrowUpAZ },
];

const MIN_SKELETON_MS = 300;

const BTN_CLASS =
  "motion-lift gap-2 font-semibold border-border text-secondary-foreground hover:bg-secondary/80 hover:border-ring/50 transition-colors duration-200";
const BTN_ACTIVE_CLASS =
  "motion-lift gap-2 border-primary bg-primary/15 font-semibold text-primary hover:bg-primary/20 transition-colors duration-200";
const SELECT_TRIGGER_CLASS =
  "h-11 gap-2 bg-secondary font-semibold border-border text-secondary-foreground hover:bg-secondary/80 hover:border-ring/50 transition-colors duration-200";

function highlightText(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded-sm bg-primary/20 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export const Library = () => {
  const [Books, setBooks] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ── Data loading ──
  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    const load = async () => {
      const stored = await getBooks();
      if (cancelled) return;
      if (!stored) {
        navigate("/upload");
        return;
      }
      const elapsed = Date.now() - start;
      const remaining = MIN_SKELETON_MS - elapsed;
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      if (cancelled) return;
      setBooks(stored);
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ── Filter state + derivations (encapsulated in hook) ──
  const filters = useLibraryFilters(Books);
  const {
    searchText,
    searchMode,
    dateRange,
    authorFilter,
    authorSearch,
    minCitations,
    favoritesOnly,
    sortState,
    filteredBooks,
    citationResults,
    authors,
    filteredAuthors,
    hasActiveFilters,
    setSearchText,
    setSearchMode,
    setDateRange,
    setAuthorFilter,
    setAuthorSearch,
    setMinCitations,
    toggleFavs,
    toggleSort,
    restoreChanges,
  } = filters;

  const navigateToBook = useCallback(
    (md5) => navigate(`/book/${md5}`),
    [navigate],
  );

  const lastReadBook = useMemo(() => {
    if (!Array.isArray(Books) || Books.length === 0) return null;
    const latest = [...Books].sort(
      (a, b) => getBookLastReadTime(b) - getBookLastReadTime(a)
    )[0];
    return getBookLastReadTime(latest) > 0 ? latest : null;
  }, [Books]);

  const thisWeekCount = useMemo(() => {
    if (!Array.isArray(Books) || Books.length === 0) return 0;
    const currentWeekKey = getTimelinePeriodKey(Date.now(), {
      granularity: "week",
    });
    const group = buildCitationTimeline(Books, { granularity: "week" }).find(
      (item) => item.key === currentWeekKey
    );
    return group?.count ?? 0;
  }, [Books]);

  // ── Loading state ──
  if (loading || !Books) {
    return (
      <div className="container mx-auto mb-10 mt-7 px-4">
        <div className="panel mb-4 h-12 w-full animate-pulse rounded-xl" />
        <div className="my-5 flex flex-wrap gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="surface-muted h-10 w-28 animate-pulse rounded-md" />
          ))}
        </div>
        <LibrarySkeleton count={5} />
      </div>
    );
  }

  // ── Citation search mode ──
  if (searchMode === "citations" && searchText.trim() && citationResults) {
    return (
      <div className="container mx-auto mb-10 mt-7 px-4">
        <section className="panel mb-5 rounded-2xl border-border px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Citation search</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Search citations across your books</h1>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">Find words in your citations and notes, then open the book they came from.</p>
          </div>
        </section>
        <Search
          searchText={searchText}
          setSearchText={setSearchText}
          searchMode={searchMode}
          onSearchModeChange={setSearchMode}
        />
        {citationResults.length === 0 ? (
          <EmptyState
            icon="search"
            title="No citations match your search"
            description="Try different keywords or switch to title search mode."
            actionLabel="Clear search"
            onAction={() => setSearchText("")}
          />
        ) : (
          <>
            <div className="mb-4 mt-5">
              <p className="text-sm text-muted-foreground">
                Found matches in {citationResults.length} book{citationResults.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-4">
              {citationResults.map(({ book, matches }) => (
                <div
                  key={book.data.doc_md5}
                  className="panel motion-lift overflow-hidden rounded-xl border-border"
                >
                  <button
                    type="button"
                    className="w-full cursor-pointer border-b border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/40"
                    onClick={() => navigateToBook(book.data.doc_md5)}
                    aria-label={`Open ${getBookTitle(book)}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h5 className="mr-4 min-w-0 text-lg font-bold text-foreground transition-colors hover:text-primary [overflow-wrap:anywhere]">
                        {getBookTitle(book)}
                      </h5>
                      <span className="whitespace-nowrap rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {matches.length} match{matches.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                    {book.data.doc_authors && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{getBookAuthor(book)}</p>
                    )}
                  </button>
                  <div className="space-y-2 bg-secondary/30 px-4 py-2">
                    {matches.slice(0, 3).map((cite, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
                      >
                        <p className="line-clamp-2">
                          {highlightText(cite.note_body || "", searchText.trim())}
                        </p>
                        {cite.note_page != null && (
                          <span className="text-xs text-muted-foreground mt-1 inline-block">
                            Page {cite.note_page}
                          </span>
                        )}
                      </div>
                    ))}
                    {matches.length > 3 && (
                      <button
                        onClick={() => navigateToBook(book.data.doc_md5)}
                        className="text-xs text-primary hover:text-primary transition-colors cursor-pointer py-1"
                      >
                        View all {matches.length} matches...
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Insights mode ──
  if (searchMode === "insights") {
    return (
      <div className="container mx-auto mb-10 mt-7 px-4">
        <section className="panel mb-5 rounded-2xl border-border px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Library insights</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">See where ideas cluster across your books</h1>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Explore a query-to-book graph with a synchronized grouped list and side panel.
            </p>
          </div>
        </section>

        <Search
          searchText={searchText}
          setSearchText={setSearchText}
          searchMode={searchMode}
          onSearchModeChange={setSearchMode}
        />

        <TooltipProvider>
          <div className="my-5 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="default"
              onClick={toggleFavs}
              className={favoritesOnly ? BTN_ACTIVE_CLASS : BTN_CLASS}
            >
              {favoritesOnly ? <FaStar className="text-primary" /> : <FaRegStar />} Favorites
            </Button>

            {SORT_MODES.map((mode) => {
              const isActive = sortState && sortState.key === mode.key;
              const isAsc = isActive && sortState.dir === "asc";
              const Icon = isAsc ? mode.iconAsc : mode.iconDesc;
              return (
                <Button
                  key={mode.key}
                  variant="outline"
                  size="default"
                  onClick={() => toggleSort(mode.key)}
                  className={isActive ? BTN_ACTIVE_CLASS : BTN_CLASS}
                >
                  <Icon className="h-4 w-4" /> {mode.label}
                  {isActive && <span className="text-[10px] opacity-60">{isAsc ? "ASC" : "DESC"}</span>}
                </Button>
              );
            })}

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className={SELECT_TRIGGER_CLASS + " w-36"}>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {authors.length > 0 && (
              <div className="relative">
                <Select value={authorFilter} onValueChange={setAuthorFilter}>
                  <SelectTrigger className={SELECT_TRIGGER_CLASS + " w-48"}>
                    <SelectValue placeholder="Author" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="sticky top-0 z-10 bg-card px-2 pb-2">
                      <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                          placeholder="Search authors..."
                          value={authorSearch}
                          onChange={(e) => setAuthorSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setAuthorSearch("");
                          }}
                          aria-label="Filter authors"
                          className="h-9 w-full rounded-md border border-input bg-secondary pl-8 pr-2 text-xs text-secondary-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <SelectItem value="all">All authors</SelectItem>
                      {filteredAuthors.map((author) => (
                        <SelectItem key={author} value={author}>
                          {author}
                        </SelectItem>
                      ))}
                      {filteredAuthors.length === 0 && (
                        <p className="px-3 py-2 text-xs text-muted-foreground">No authors match</p>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="Min citations"
                value={minCitations}
                onChange={(e) => setMinCitations(e.target.value)}
                aria-label="Minimum citations"
                className="h-11 w-32 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground placeholder:text-muted-foreground transition-all duration-300 [appearance:textfield] focus:border-ring focus:bg-secondary focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            {favoritesOnly || sortState || hasActiveFilters ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={restoreChanges}
                    className="gap-2 border-red-500/30 font-semibold text-red-400 transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/10"
                  >
                    <FaTimes /> Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border-border bg-card text-foreground">
                  <p>
                    Reset filters <FaRedo className="inline" />
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </TooltipProvider>

        <InsightsView books={filteredBooks || []} query={searchText} onOpenBook={navigateToBook} />
      </div>
    );
  }

  // ── Default: title search / library view ──
  return (
    <div className="container mx-auto mb-10 mt-7 px-4">
      <section className="panel mb-5 rounded-2xl border-border px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Library</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Your highlighted books</h1>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Books</span>
            <span className="text-lg font-semibold text-primary">{Books.length}</span>
          </div>
        </div>
      </section>
      <LibraryPulse lastReadBook={lastReadBook} thisWeekCount={thisWeekCount} />
      <Search
        searchText={searchText}
        setSearchText={setSearchText}
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
      />

      <TooltipProvider>
        <div className="my-5 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="default" onClick={toggleFavs} className={favoritesOnly ? BTN_ACTIVE_CLASS : BTN_CLASS}>
            {favoritesOnly ? <FaStar className="text-primary" /> : <FaRegStar />} Favorites
          </Button>

          {SORT_MODES.map((mode) => {
            const isActive = sortState && sortState.key === mode.key;
            const isAsc = isActive && sortState.dir === "asc";
            const Icon = isAsc ? mode.iconAsc : mode.iconDesc;
            return (
              <Button
                key={mode.key}
                variant="outline"
                size="default"
                onClick={() => toggleSort(mode.key)}
                className={isActive ? BTN_ACTIVE_CLASS : BTN_CLASS}
              >
                <Icon className="h-4 w-4" /> {mode.label}
                {isActive && (
                  <span className="text-[10px] opacity-60">{isAsc ? "ASC" : "DESC"}</span>
                )}
              </Button>
            );
          })}

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS + " w-36"}>
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {authors.length > 0 && (
            <div className="relative">
              <Select value={authorFilter} onValueChange={setAuthorFilter}>
                <SelectTrigger className={SELECT_TRIGGER_CLASS + " w-48"}>
                  <SelectValue placeholder="Author" />
                </SelectTrigger>
                <SelectContent>
                  <div className="sticky top-0 z-10 bg-card px-2 pb-2">
                    <div className="relative">
                      <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        placeholder="Search authors..."
                        value={authorSearch}
                        onChange={(e) => setAuthorSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setAuthorSearch("");
                        }}
                        aria-label="Filter authors"
                        className="h-11 w-full rounded-md border border-border bg-secondary pl-8 pr-2 text-xs text-secondary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <SelectItem value="all">All authors</SelectItem>
                    {filteredAuthors.map((author) => (
                      <SelectItem key={author} value={author}>
                        {author}
                      </SelectItem>
                    ))}
                    {filteredAuthors.length === 0 && (
                      <p className="px-3 py-2 text-xs text-muted-foreground">No authors match</p>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="relative">
            <input
              type="number"
              min="0"
              placeholder="Min citations"
              value={minCitations}
              onChange={(e) => setMinCitations(e.target.value)}
              aria-label="Minimum citations"
              className="h-11 w-32 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:bg-secondary transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {favoritesOnly || sortState || hasActiveFilters ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="default" onClick={restoreChanges} className="gap-2 font-semibold border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300">
                  <FaTimes /> Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border-border bg-card text-foreground">
                <p>Reset filters <FaRedo className="inline" /></p>
              </TooltipContent>
            </Tooltip>
          ) : null}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  const json = JSON.stringify(buildLibraryJson(Books), null, 2);
                  downloadFile(json, "readera-library.json", "application/json");
                }}
                className={`${BTN_CLASS} h-auto min-h-11 max-w-full whitespace-normal py-2 text-left`}
              >
                <FileJson className="h-4 w-4" /> Download complete library JSON
              </Button>
            </TooltipTrigger>
            <TooltipContent className="border-border bg-card text-foreground">
              <p>Download all books and citations, including those hidden by filters.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {filteredBooks && filteredBooks.length === 0 ? (
        <EmptyState
          icon="search"
          title="No books match your filters"
          description="Try adjusting your search or filters to find what you're looking for."
          actionLabel="Reset filters"
          onAction={restoreChanges}
        />
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {filteredBooks?.map((libro, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
            >
              <BookCard libro={libro} bookKey={index} />
            </div>
          ))}
        </Accordion>
      )}
    </div>
  );
};
