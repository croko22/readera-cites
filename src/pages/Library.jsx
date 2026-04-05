import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRedo,
  FaRegStar,
  FaStar,
  FaSortAmountDown,
  FaTimes,
} from "react-icons/fa";
import { Search } from "../components/Search";
import { BookCard } from "../components/BookCard";
import { LibrarySkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
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
import { FileJson } from "lucide-react";

const MIN_SKELETON_MS = 300;

const DATE_RANGES = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
];

function getDateThreshold(range) {
  if (range === "all") return 0;
  const now = Date.now();
  const days = { "7d": 7, "30d": 30, "3m": 90 };
  return now - (days[range] || 0) * 24 * 60 * 60 * 1000;
}

function highlightText(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="bg-amber-500/30 text-amber-200 rounded-sm px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const Library = () => {
  const [storedData, setStoredData] = useState(null);
  const [Books, setBooks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [Favorites, setFavorites] = useState(false);
  const [isSorting, setIsorting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchMode, setSearchMode] = useState("title");
  const [dateRange, setDateRange] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [minCitations, setMinCitations] = useState("");

  const navigate = useNavigate();

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
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }
      if (cancelled) return;
      setStoredData(stored);
      setBooks(stored);
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Extract unique authors from stored data
  const authors = useMemo(() => {
    if (!storedData) return [];
    const authorSet = new Set();
    storedData.forEach((book) => {
      const a = book.data.doc_authors;
      if (a && a.trim()) authorSet.add(a.trim());
    });
    return Array.from(authorSet).sort((a, b) => a.localeCompare(b));
  }, [storedData]);

  // Citation search results (when in citation mode)
  const citationResults = useMemo(() => {
    if (searchMode !== "citations" || !searchText.trim() || !storedData)
      return null;

    const query = searchText.toLowerCase();
    const results = [];

    for (const book of storedData) {
      const matches = [];
      for (const cite of book.citations) {
        const body = (cite.note_body || "").toLowerCase();
        const extra = (cite.note_extra || "").toLowerCase();
        if (body.includes(query) || extra.includes(query)) {
          matches.push(cite);
        }
      }
      if (matches.length > 0) {
        results.push({ book, matches });
      }
    }
    return results;
  }, [searchMode, searchText, storedData]);

  // Apply all filters to the book list (title search mode)
  const filteredBooks = useMemo(() => {
    if (!Books) return null;

    let result = Books;

    // Text search (title mode only)
    if (searchMode === "title" && searchText) {
      const query = searchText.toLowerCase();
      result = result.filter((book) =>
        book.data.doc_file_name_title.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (dateRange !== "all") {
      const threshold = getDateThreshold(dateRange);
      result = result.filter(
        (book) => book.data.doc_last_read_time >= threshold
      );
    }

    // Author filter
    if (authorFilter !== "all") {
      result = result.filter(
        (book) => book.data.doc_authors === authorFilter
      );
    }

    // Min citations filter
    if (minCitations && Number(minCitations) > 0) {
      const min = Number(minCitations);
      result = result.filter((book) => book.citations.length >= min);
    }

    return result;
  }, [Books, searchText, searchMode, dateRange, authorFilter, minCitations]);

  const hasActiveFilters =
    dateRange !== "all" ||
    authorFilter !== "all" ||
    (minCitations && Number(minCitations) > 0);

  const toggleFavs = () => {
    setFavorites((Favorites) => !Favorites);
    if (!Favorites)
      setBooks(Books.filter((book) => book.data.doc_favorites_time != 0));
    else restoreChanges();
  };

  const sortByNofQuotes = () => {
    setIsorting((isSorting) => !isSorting);
    if (!isSorting)
      setBooks(Books.sort((a, b) => b.citations.length - a.citations.length));
    else restoreChanges();
  };

  const sortAlphabetically = () => {
    setIsorting((isSorting) => !isSorting);
    if (!isSorting)
      setBooks(
        [...Books].sort((a, b) =>
          a.data.doc_file_name_title.localeCompare(b.data.doc_file_name_title)
        )
      );
    else restoreChanges();
  };

  const restoreChanges = () => {
    setBooks(storedData);
    setFavorites(false);
    setIsorting(false);
    setSearchText("");
    setDateRange("all");
    setAuthorFilter("all");
    setMinCitations("");
  };

  const navigateToBook = useCallback(
    (md5) => {
      navigate(`/book/${md5}`);
    },
    [navigate]
  );

  // Loading skeleton
  if (loading || !Books) {
    return (
      <div className="container mx-auto px-4 mt-6 mb-8">
        <div className="animate-pulse h-12 w-full rounded-lg bg-white/5 mb-4" />
        <div className="my-4 flex gap-3 flex-wrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse h-10 w-28 rounded-md bg-white/5" />
          ))}
        </div>
        <LibrarySkeleton count={5} />
      </div>
    );
  }

  // Citation search mode rendering
  if (searchMode === "citations" && searchText.trim() && citationResults) {
    return (
      <div className="container mx-auto px-4 mt-6 mb-8">
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
            <div className="mt-4 mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Found matches in {citationResults.length} book{citationResults.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-4">
              {citationResults.map(({ book, matches }) => (
                <div
                  key={book.data.doc_md5}
                  className="rounded-xl overflow-hidden border border-white/10 bg-[rgba(26,26,36,0.6)] backdrop-blur-lg shadow-2xl hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300"
                >
                  {/* Book header */}
                  <div
                    className="px-4 py-3 bg-[rgba(18,18,26,0.8)] border-l-4 border-amber-500 cursor-pointer hover:bg-[rgba(18,18,26,0.9)]"
                    onClick={() => navigateToBook(book.data.doc_md5)}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-lg font-bold text-slate-100 hover:text-amber-400 transition-colors truncate mr-4">
                        {book.data.doc_file_name_title}
                      </h5>
                      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap">
                        {matches.length} match{matches.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                    {book.data.doc_authors && (
                      <p className="text-sm text-slate-400 mt-0.5">
                        {book.data.doc_authors}
                      </p>
                    )}
                  </div>

                  {/* Citation previews */}
                  <div className="px-4 py-2 space-y-2 bg-[rgba(26,26,36,0.4)]">
                    {matches.slice(0, 3).map((cite, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-slate-300 py-1.5 px-3 rounded-lg bg-white/[0.02] border-l-2 border-amber-500/30"
                      >
                        <p className="line-clamp-2">
                          {highlightText(cite.note_body || "", searchText.trim())}
                        </p>
                        {cite.note_page != null && (
                          <span className="text-xs text-slate-500 mt-1 inline-block">
                            Page {cite.note_page}
                          </span>
                        )}
                      </div>
                    ))}
                    {matches.length > 3 && (
                      <button
                        onClick={() => navigateToBook(book.data.doc_md5)}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer py-1"
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

  // Normal library view (title search + filters)
  return (
    <div className="container mx-auto px-4 mt-6 mb-8">
      <Search
        searchText={searchText}
        setSearchText={setSearchText}
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
      />

      <TooltipProvider>
        <div className="my-4 flex gap-3 flex-wrap">
          <Button
            variant="outline"
            size="default"
            onClick={toggleFavs}
            className="gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
          >
            {Favorites ? (
              <FaStar className="text-amber-500" />
            ) : (
              <FaRegStar />
            )}{" "}
            Favorites
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={sortByNofQuotes}
            className="gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
          >
            <FaSortAmountDown /> By Quotes
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={sortAlphabetically}
            className="gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
          >
            <FaSortAmountDown /> Alphabetically
          </Button>

          {/* Date range filter */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36 h-10 gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300 bg-transparent">
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

          {/* Author filter */}
          {authors.length > 0 && (
            <Select value={authorFilter} onValueChange={setAuthorFilter}>
              <SelectTrigger className="w-44 h-10 gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300 bg-transparent">
                <SelectValue placeholder="Author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All authors</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Min citations input */}
          <div className="relative">
            <input
              type="number"
              min="0"
              placeholder="Min citations"
              value={minCitations}
              onChange={(e) => setMinCitations(e.target.value)}
              className="h-10 w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {Favorites || isSorting || hasActiveFilters ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  onClick={restoreChanges}
                  className="gap-2 font-semibold border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300"
                >
                  <FaTimes /> Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1A1A24] border-white/10 text-slate-200">
                <p>
                  Reset filters <FaRedo className="inline" />
                </p>
              </TooltipContent>
            </Tooltip>
          ) : null}

          {/* Export library */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  const json = JSON.stringify(buildLibraryJson(Books), null, 2);
                  downloadFile(json, "readera-library.json", "application/json");
                }}
                className="gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
              >
                <FileJson className="h-4 w-4" /> Export
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1A1A24] border-white/10 text-slate-200">
              <p>Download library as JSON</p>
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
            <BookCard libro={libro} bookKey={index} key={index} />
          ))}
        </Accordion>
      )}
    </div>
  );
};
