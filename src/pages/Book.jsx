import { useEffect, useMemo, useState } from "react";
import Toastify from "toastify-js";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FaCopy, FaList, FaTh } from "react-icons/fa";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Clock,
  FileJson,
  FileText,
  Palette,
} from "lucide-react";
import { CitesList } from "../components/CitesList";
import { Search } from "../components/Search";
import { BookSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { getBooks } from "../lib/booksStorage";
import {
  formatCitationsAsText,
  formatCitationsAsMarkdown,
  buildBookJson,
  downloadFile,
} from "../lib/exportUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

const MIN_SKELETON_MS = 300;

// ── Relative time formatter ──────────────────────────────────────────
function formatRelativeTime(timestampMs) {
  if (!timestampMs) return null;
  const now = Date.now();
  const diff = now - timestampMs;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const rtf = new Intl.RelativeTimeFormat(navigator.language || "en", {
    numeric: "auto",
  });

  if (years > 0) return rtf.format(-years, "year");
  if (months > 0) return rtf.format(-months, "month");
  if (weeks > 0) return rtf.format(-weeks, "week");
  if (days > 0) return rtf.format(-days, "day");
  if (hours > 0) return rtf.format(-hours, "hour");
  if (minutes > 0) return rtf.format(-minutes, "minute");
  return rtf.format(-seconds, "second");
}

// ── Sort options ─────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { key: "page-asc", label: "Page", icon: ArrowUp },
  { key: "page-desc", label: "Page", icon: ArrowDown },
  { key: "date-new", label: "Newest", icon: Clock },
  { key: "date-old", label: "Oldest", icon: Clock },
  { key: "color", label: "Color", icon: Palette },
];

const ALL_COLORS_FILTER = 7;

function safeParseProgress(value) {
  if (!value) return 0;
  try {
    const parsed = JSON.parse(value);
    const ratio = Number(parsed?.ratio);
    if (!Number.isFinite(ratio)) return 0;
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  } catch {
    return 0;
  }
}

function toSafeFilename(value, fallback = "citations") {
  const base = String(value || fallback)
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  return base || fallback;
}

function filterCitationsByColor(citations, color) {
  if (!Array.isArray(citations)) return [];
  if (color === ALL_COLORS_FILTER) return citations;
  return citations.filter((cite) => cite?.note_mark === color);
}

function getCitationColorCounts(citations) {
  const source = Array.isArray(citations) ? citations : [];
  return {
    all: source.length,
    0: source.filter((cite) => cite?.note_mark === 0).length,
    1: source.filter((cite) => cite?.note_mark === 1).length,
    2: source.filter((cite) => cite?.note_mark === 2).length,
    3: source.filter((cite) => cite?.note_mark === 3).length,
    4: source.filter((cite) => cite?.note_mark === 4).length,
  };
}

function sortCitations(citations, sortKey) {
  const sorted = [...citations];
  switch (sortKey) {
    case "page-asc":
      return sorted.sort((a, b) => (a.note_page ?? 0) - (b.note_page ?? 0));
    case "page-desc":
      return sorted.sort((a, b) => (b.note_page ?? 0) - (a.note_page ?? 0));
    case "date-new":
      return sorted.sort(
        (a, b) => (b.note_timestamp ?? 0) - (a.note_timestamp ?? 0)
      );
    case "date-old":
      return sorted.sort(
        (a, b) => (a.note_timestamp ?? 0) - (b.note_timestamp ?? 0)
      );
    case "color":
      return sorted.sort((a, b) => (a.note_mark ?? 0) - (b.note_mark ?? 0));
    default:
      return sorted;
  }
}

// ── Component ────────────────────────────────────────────────────────
export const Book = () => {
  const [view, setView] = useState("list");
  const [sortKey, setSortKey] = useState("page-asc");
  const [loading, setLoading] = useState(true);
  const [Cites, setCites] = useState([]);
  const [searchText, setSearchText] = useState("");

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [Book, setBook] = useState(location.state || null);
  const [allBooks, setAllBooks] = useState(null);

  // Load book data when navigating directly (no router state)
  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    const load = async () => {
      const books = await getBooks();
      if (cancelled) return;
      setAllBooks(books || []);
      if (Book) {
        setLoading(false);
        return;
      }
      const found = books?.find((b) => b.data.doc_md5 === id) || null;
      if (!found) {
        navigate("/upload");
        return;
      }
      const elapsed = Date.now() - start;
      const remaining = MIN_SKELETON_MS - elapsed;
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }
      if (cancelled) return;
      setBook(found);
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [Book, id, navigate]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync citations when Book loads
  useEffect(() => {
    if (Book) setCites(Book.citations);
  }, [Book]);

  // ── Sorted & filtered citations ──
  const sortedCites = useMemo(() => {
    const filtered = Cites.filter((cite) =>
      String(cite?.note_body || "").toLowerCase().includes(searchText.toLowerCase())
    );
    return sortCitations(filtered, sortKey);
  }, [Cites, searchText, sortKey]);

  const citationCounts = useMemo(() => getCitationColorCounts(Book?.citations), [Book]);

  if (loading || !Book) {
    return (
      <div className="container mx-auto mb-10 mt-7 px-4">
        <BookSkeleton count={4} />
      </div>
    );
  }

  const title = Book.data.doc_title || Book.data.doc_file_name_title;

  const filterColors = (n) => {
    setCites(filterCitationsByColor(Book?.citations, n));
  };

  // ── Book metadata ──
  const progress = safeParseProgress(Book.data.doc_position);
  const lastRead = formatRelativeTime(Book.data.doc_last_read_time);
  const formatBadge = Book.data.doc_format
    ? Book.data.doc_format.toUpperCase()
    : null;
  const langBadge = Book.data.doc_lang
    ? Book.data.doc_lang.toUpperCase()
    : null;
  const totalPages = Book.data.doc_page_count;
  const authors = Book.data.doc_authors;

  // ── Prev / Next navigation ──
  const books = allBooks || [];
  const currentIndex = books
    ? books.findIndex((b) => b.data.doc_md5 === Book.data.doc_md5)
    : -1;
  const prevBook = currentIndex > 0 ? books[currentIndex - 1] : null;
  const nextBook =
    books && currentIndex >= 0 && currentIndex < books.length - 1
      ? books[currentIndex + 1]
      : null;

  // ── Clipboard helper ──
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch {
        return false;
      }
    }
  };

  // ── Copy all visible citations ──
  const copyCites = async () => {
    const visible = sortedCites;
    if (!visible.length) {
      Toastify({
        text: "No quotes to copy",
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        duration: 2500,
        style: { "--toast-duration": "2.5s" },
        backgroundColor: "gray",
      }).showToast();
      return;
    }
    const text = formatCitationsAsText(Book, visible);
    const ok = await copyToClipboard(text);
    Toastify({
      text: ok
        ? `Copied ${visible.length} quote${visible.length > 1 ? "s" : ""} to clipboard`
        : "Failed to copy to clipboard",
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      duration: 3000,
      style: { "--toast-duration": "3s" },
      backgroundColor: ok ? "gray" : "#cc0000",
    }).showToast();
  };

  // ── Download as Markdown ──
  const downloadMarkdown = () => {
    const md = formatCitationsAsMarkdown(Book, sortedCites);
    const safeName = toSafeFilename(title, "citations");
    downloadFile(md, `${safeName}.md`, "text/markdown;charset=utf-8");
    Toastify({
      text: "Downloaded Markdown file",
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      duration: 2500,
      style: { "--toast-duration": "2.5s" },
      backgroundColor: "gray",
    }).showToast();
  };

  // ── Download as JSON ──
  const downloadJson = () => {
    const data = buildBookJson(Book);
    const json = JSON.stringify(data, null, 2);
    const safeName = toSafeFilename(title, "citations");
    downloadFile(json, `${safeName}.json`, "application/json;charset=utf-8");
    Toastify({
      text: "Downloaded JSON file",
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      duration: 2500,
      style: { "--toast-duration": "2.5s" },
      backgroundColor: "gray",
    }).showToast();
  };

  return (
    <div className="container mx-auto mb-10 mt-7 px-4">
      {/* ── Back to library ── */}
      <Link
        to="/"
        className="group mb-4 inline-flex items-center gap-2 text-slate-400 transition-colors duration-200 hover:text-amber-400"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Library</span>
      </Link>

      {/* ── Book header ── */}
      <div className="panel mb-6 rounded-2xl border-white/15 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300/80">Book Detail</p>
              <h1 className="mb-2 line-clamp-2 text-2xl font-semibold tracking-tight text-slate-100 md:line-clamp-1 md:text-3xl">
               {title}
              </h1>
            {authors && (
              <p className="text-slate-400 text-sm mb-3">
                by <span className="text-slate-200 font-medium">{authors}</span>
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {formatBadge && (
                <Badge className="bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-xs">
                  {formatBadge}
                </Badge>
              )}
              {langBadge && (
                <Badge className="bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-xs">
                  {langBadge}
                </Badge>
              )}
              {totalPages > 0 && (
                <Badge className="bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-xs">
                  {totalPages} pages
                </Badge>
              )}
                <Badge className="bg-amber-400/14 border border-amber-300/35 text-amber-300 text-xs font-semibold">
                  {Book.citations.length} citations
                </Badge>
              </div>
            </div>
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="motion-lift gap-2 border border-amber-300/35 bg-[linear-gradient(130deg,rgba(245,158,11,0.95),rgba(249,115,22,0.9))] text-slate-900 hover:brightness-105">
                  Export <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={copyCites}>
                  <FaCopy />
                  <span>Copy All</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadMarkdown}>
                  <FileText />
                  <span>Download Markdown</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadJson}>
                  <FileJson />
                  <span>Download JSON</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress & last read */}
        <div className="mt-5 border-t border-white/10 pt-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 max-w-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500">Reading progress</span>
                <span className="text-xs font-semibold text-amber-400">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            {lastRead && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last read {lastRead}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <Search searchText={searchText} setSearchText={setSearchText} />

      {/* ── Filter + sort + view toggle toolbar ── */}
      <TooltipProvider>
        <div className="panel mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border-white/15 p-3">
          {/* Color filter buttons */}
          <span className="flex gap-2 flex-wrap">
            <Button
              onClick={() => filterColors(7)}
              variant="secondary"
              size="default"
                className="motion-lift border border-white/12 bg-white/[0.08] font-semibold text-slate-200 transition-all duration-300 hover:bg-white/[0.16]"
              >
              All {citationCounts.all}
            </Button>
            <Button
              onClick={() => filterColors(0)}
              variant="secondary"
              size="default"
                className="motion-lift border border-slate-500/35 bg-slate-500/24 text-slate-300 transition-all duration-300 hover:bg-slate-500/34"
             >
              {citationCounts[0]}
            </Button>
            <Button
              onClick={() => filterColors(1)}
              variant="secondary"
              size="default"
                className="motion-lift border border-red-500/35 bg-red-500/22 text-red-300 transition-all duration-300 hover:bg-red-500/34"
             >
              {citationCounts[1]}
            </Button>
            <Button
              onClick={() => filterColors(2)}
              size="default"
                className="motion-lift border border-amber-400/40 bg-amber-400/24 text-amber-200 transition-all duration-300 hover:bg-amber-400/34"
             >
              {citationCounts[2]}
            </Button>
            <Button
              onClick={() => filterColors(3)}
              size="default"
                className="motion-lift border border-emerald-500/35 bg-emerald-500/22 text-emerald-300 transition-all duration-300 hover:bg-emerald-500/34"
             >
              {citationCounts[3]}
            </Button>
            <Button
              onClick={() => filterColors(4)}
              size="default"
                className="motion-lift border border-blue-500/35 bg-blue-500/22 text-blue-300 transition-all duration-300 hover:bg-blue-500/34"
             >
              {citationCounts[4]}
            </Button>
          </span>

          {/* Sort toggles + view toggle */}
          <span className="flex gap-1.5 items-center">
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = sortKey === opt.key;
              return (
                <Tooltip key={opt.key}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setSortKey(opt.key)}
                      variant={isActive ? "default" : "outline"}
                      size="icon"
                      aria-label={`Sort citations by ${opt.label}`}
                      className={
                        isActive
                          ? "border border-amber-300/40 bg-[linear-gradient(130deg,rgba(245,158,11,0.95),rgba(249,115,22,0.9))] text-slate-900 hover:brightness-105"
                          : "motion-lift border-white/12 bg-white/[0.03] text-slate-300 transition-all duration-300 hover:border-amber-400/50 hover:bg-amber-400/12 hover:text-amber-300"
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="border-white/10 bg-card text-slate-200">
                    <p>Sort by {opt.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            <span className="w-px h-6 bg-white/10 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() =>
                    view === "list" ? setView("grid") : setView("list")
                  }
                  variant="outline"
                  size="icon"
                  aria-label={`Change to ${view === "list" ? "grid" : "list"} view`}
                  className="motion-lift border-white/12 bg-white/[0.03] text-slate-300 transition-all duration-300 hover:border-amber-400/50 hover:bg-amber-400/12 hover:text-amber-300"
                >
                  {view === "list" ? <FaList /> : <FaTh />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border-white/10 bg-card text-slate-200">
                <p>{`Change to ${view === "list" ? "grid" : "list"} view`}</p>
              </TooltipContent>
            </Tooltip>
          </span>
        </div>
      </TooltipProvider>

      {/* ── Citations list ── */}
      {sortedCites.length === 0 ? (
        <EmptyState
          icon="palette"
          title="No citations match"
          description={
            searchText
              ? "Try adjusting your search or color filter."
              : "No citations with this color. Try selecting a different filter or 'All'."
          }
           actionLabel="Show all"
           onAction={() => { filterColors(ALL_COLORS_FILTER); setSearchText(""); }}
         />
      ) : (
        <CitesList cites={sortedCites} view={view} />
      )}

      {/* ── Prev / Next book navigation ── */}
      {(prevBook || nextBook) && (
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
          {prevBook ? (
            <Link
              to={`/book/${prevBook.data.doc_md5}`}
              state={prevBook}
              onClick={() => window.scrollTo(0, 0)}
              className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors duration-200 group max-w-[45%]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm truncate">
                {prevBook.data.doc_title || prevBook.data.doc_file_name_title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextBook ? (
            <Link
              to={`/book/${nextBook.data.doc_md5}`}
              state={nextBook}
              onClick={() => window.scrollTo(0, 0)}
              className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors duration-200 group max-w-[45%] justify-end text-right"
            >
              <span className="text-sm truncate">
                {nextBook.data.doc_title || nextBook.data.doc_file_name_title}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
};
