import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRedo,
  FaRegStar,
  FaStar,
  FaTimes,
} from "react-icons/fa";
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

const MIN_SKELETON_MS = 300;

const DATE_RANGES = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
];

const SORT_MODES = [
  { key: "quotes-desc", label: "By Quotes", iconDesc: ArrowDownNarrowWide, iconAsc: ArrowUpNarrowWide },
  { key: "alpha-desc", label: "A — Z", iconDesc: ArrowDownAZ, iconAsc: ArrowUpAZ },
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
      <mark key={i} className="bg-amber-500/30 text-amber-200 rounded-sm px-0.5">
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
  const [sortState, setSortState] = useState(null); // { key: "quotes"|"alpha", dir: "desc"|"asc" }
  const [searchText, setSearchText] = useState("");
  const [searchMode, setSearchMode] = useState("title");
  const [dateRange, setDateRange] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [authorSearch, setAuthorSearch] = useState("");
  const [minCitations, setMinCitations] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    const load = async () => {
      const stored = await getBooks();
      if (cancelled) return;
      if (!stored) { navigate("/upload"); return; }
      const elapsed = Date.now() - start;
      const remaining = MIN_SKELETON_MS - elapsed;
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      if (cancelled) return;
      setStoredData(stored);
      setBooks(stored);
      setLoading(false);
    };
    void load();
    return () => { cancelled = true; };
  }, [navigate]);

  const authors = useMemo(() => {
    if (!storedData) return [];
    const authorSet = new Set();
    storedData.forEach((book) => {
      const a = book.data.doc_authors;
      if (a && a.trim()) authorSet.add(a.trim());
    });
    return Array.from(authorSet).sort((a, b) => a.localeCompare(b));
  }, [storedData]);

  const filteredAuthors = useMemo(() => {
    if (!authorSearch.trim()) return authors;
    const q = authorSearch.toLowerCase();
    return authors.filter((a) => a.toLowerCase().includes(q));
  }, [authors, authorSearch]);

  const citationResults = useMemo(() => {
    if (searchMode !== "citations" || !searchText.trim() || !storedData) return null;
    const query = searchText.toLowerCase();
    const results = [];
    for (const book of storedData) {
      const matches = [];
      for (const cite of book.citations) {
        const body = (cite.note_body || "").toLowerCase();
        const extra = (cite.note_extra || "").toLowerCase();
        if (body.includes(query) || extra.includes(query)) matches.push(cite);
      }
      if (matches.length > 0) results.push({ book, matches });
    }
    return results;
  }, [searchMode, searchText, storedData]);

  const filteredBooks = useMemo(() => {
    if (!Books) return null;
    let result = [...Books];

    if (searchMode === "title" && searchText) {
      const query = searchText.toLowerCase();
      result = result.filter((book) =>
        book.data.doc_file_name_title.toLowerCase().includes(query)
      );
    }

    if (dateRange !== "all") {
      const threshold = getDateThreshold(dateRange);
      result = result.filter((book) => book.data.doc_last_read_time >= threshold);
    }

    if (authorFilter !== "all") {
      result = result.filter((book) => book.data.doc_authors === authorFilter);
    }

    if (minCitations && Number(minCitations) > 0) {
      const min = Number(minCitations);
      result = result.filter((book) => book.citations.length >= min);
    }

    if (Favorites) {
      result = result.filter((book) => book.data.doc_favorites_time != 0);
    }

    if (sortState) {
      if (sortState.key === "quotes") {
        result.sort((a, b) =>
          sortState.dir === "desc"
            ? b.citations.length - a.citations.length
            : a.citations.length - b.citations.length
        );
      } else {
        result.sort((a, b) =>
          sortState.dir === "desc"
            ? b.data.doc_file_name_title.localeCompare(a.data.doc_file_name_title)
            : a.data.doc_file_name_title.localeCompare(b.data.doc_file_name_title)
        );
      }
    }

    return result;
  }, [Books, searchText, searchMode, dateRange, authorFilter, minCitations, Favorites, sortState]);

  const hasActiveFilters =
    dateRange !== "all" ||
    authorFilter !== "all" ||
    (minCitations && Number(minCitations) > 0);

  const toggleSort = (key) => {
    setSortState((prev) => {
      if (prev && prev.key === key) {
        return prev.dir === "desc" ? { key, dir: "asc" } : null;
      }
      return { key, dir: "desc" };
    });
  };

  const toggleFavs = () => setFavorites((v) => !v);

  const restoreChanges = () => {
    setFavorites(false);
    setSortState(null);
    setSearchText("");
    setDateRange("all");
    setAuthorFilter("all");
    setAuthorSearch("");
    setMinCitations("");
  };

  const navigateToBook = useCallback(
    (md5) => navigate(`/book/${md5}`),
    [navigate]
  );

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

  const btnClass =
    "gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300";
  const btnActive =
    "gap-2 font-semibold bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/60 transition-all duration-300";
  const selectTriggerClass =
    "h-10 gap-2 font-semibold border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300 bg-transparent";

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
            <div className="mt-4 mb-3">
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
                      <p className="text-sm text-slate-400 mt-0.5">{book.data.doc_authors}</p>
                    )}
                  </div>
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

  return (
    <div className="container mx-auto px-4 mt-6 mb-8">
      <Search
        searchText={searchText}
        setSearchText={setSearchText}
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
      />

      <TooltipProvider>
        <div className="my-4 flex gap-3 flex-wrap items-center">
          <Button variant="outline" size="default" onClick={toggleFavs} className={Favorites ? btnActive : btnClass}>
            {Favorites ? <FaStar className="text-amber-500" /> : <FaRegStar />} Favorites
          </Button>

          {SORT_MODES.map((mode) => {
            const isActive = sortState && sortState.key === mode.key.split("-")[0];
            const isAsc = isActive && sortState.dir === "asc";
            const Icon = isAsc ? mode.iconAsc : mode.iconDesc;
            return (
              <Button
                key={mode.key}
                variant="outline"
                size="default"
                onClick={() => toggleSort(mode.key.split("-")[0])}
                className={isActive ? btnActive : btnClass}
              >
                <Icon className="h-4 w-4" /> {mode.label}
                {isActive && (
                  <span className="text-[10px] opacity-60">{isAsc ? "ASC" : "DESC"}</span>
                )}
              </Button>
            );
          })}

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className={selectTriggerClass + " w-36"}>
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {authors.length > 0 && (
            <div className="relative">
              <Select value={authorFilter} onValueChange={(v) => { setAuthorFilter(v); setAuthorSearch(""); }}>
                <SelectTrigger className={selectTriggerClass + " w-48"}>
                  <SelectValue placeholder="Author" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 pb-2 sticky top-0 bg-[#1A1A24] z-10">
                    <div className="relative">
                      <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        placeholder="Search authors..."
                        value={authorSearch}
                        onChange={(e) => setAuthorSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => { if (e.key === "Escape") setAuthorSearch(""); }}
                        className="w-full h-8 rounded-md border border-white/10 bg-white/5 pl-8 pr-2 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <SelectItem value="all">All authors</SelectItem>
                    {filteredAuthors.map((author) => (
                      <SelectItem key={author} value={author}>{author}</SelectItem>
                    ))}
                    {filteredAuthors.length === 0 && (
                      <p className="px-3 py-2 text-xs text-slate-500">No authors match</p>
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
              className="h-10 w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:bg-amber-500/5 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {Favorites || sortState || hasActiveFilters ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="default" onClick={restoreChanges} className="gap-2 font-semibold border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300">
                  <FaTimes /> Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1A1A24] border-white/10 text-slate-200">
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
                className={btnClass}
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
