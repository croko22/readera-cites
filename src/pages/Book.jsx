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

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [Book, setBook] = useState(location.state || null);
  const [allBooks, setAllBooks] = useState(null);

  // Load book data when navigating directly (no router state)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const books = await getBooks();
      if (cancelled) return;
      setAllBooks(books || []);
      if (Book) return;
      const found = books?.find((b) => b.data.doc_md5 === id) || null;
      if (!found) {
        navigate("/upload");
        return;
      }
      setBook(found);
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

  if (!Book) return null;

  const title = Book.data.doc_title || Book.data.doc_file_name_title;
  const isMobile = window.innerWidth < 768;

  const [Cites, setCites] = useState(Book.citations);
  const [searchText, setSearchText] = useState("");

  const filterColors = (n) => {
    n === 7
      ? setCites(Book.citations)
      : setCites(Book.citations.filter((cite) => cite.note_mark === n));
  };

  // ── Sorted & filtered citations ──
  const sortedCites = useMemo(() => {
    const filtered = Cites.filter((cite) =>
      cite.note_body.toLowerCase().includes(searchText.toLowerCase())
    );
    return sortCitations(filtered, sortKey);
  }, [Cites, searchText, sortKey]);

  // ── Book metadata ──
  const progress =
    Book.data.doc_position
      ? Math.round(JSON.parse(Book.data.doc_position).ratio * 100)
      : 0;
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
  const books = allBooks;
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
      backgroundColor: ok ? "gray" : "#cc0000",
    }).showToast();
  };

  // ── Download as Markdown ──
  const downloadMarkdown = () => {
    const md = formatCitationsAsMarkdown(Book, sortedCites);
    const safeName = (title || "citations").replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");
    downloadFile(md, `${safeName}.md`, "text/markdown;charset=utf-8");
    Toastify({
      text: "Downloaded Markdown file",
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      duration: 2500,
      backgroundColor: "gray",
    }).showToast();
  };

  // ── Download as JSON ──
  const downloadJson = () => {
    const data = buildBookJson(Book);
    const json = JSON.stringify(data, null, 2);
    const safeName = (title || "citations").replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");
    downloadFile(json, `${safeName}.json`, "application/json;charset=utf-8");
    Toastify({
      text: "Downloaded JSON file",
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      duration: 2500,
      backgroundColor: "gray",
    }).showToast();
  };

  return (
    <div className="container mx-auto px-4 mt-6 mb-8">
      {/* ── Back to library ── */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors duration-200 mb-4 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Library</span>
      </Link>

      {/* ── Book header ── */}
      <div className="rounded-xl p-5 mb-6 bg-[rgba(26,26,36,0.6)] backdrop-blur-lg border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-amber-500/20 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2 truncate">
              {isMobile && title.length > 30
                ? title.slice(0, 30) + "..."
                : title}
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
              <Badge className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                {Book.citations.length} citations
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  className="gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300"
                >
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
        <div className="mt-4 pt-3 border-t border-white/5">
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
        <div className="mt-4 flex justify-between items-center flex-wrap gap-3">
          {/* Color filter buttons */}
          <span className="flex gap-2 flex-wrap">
            <Button
              onClick={() => filterColors(7)}
              variant="secondary"
              size="default"
              className="bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 shadow-lg transition-all duration-300 font-semibold"
            >
              All {Book.citations.length}
            </Button>
            <Button
              onClick={() => filterColors(0)}
              variant="secondary"
              size="default"
              className="bg-slate-500/20 hover:bg-slate-500/30 border border-slate-500/30 text-slate-300 shadow-lg transition-all duration-300"
            >
              {Book.citations.filter((cite) => cite.note_mark === 0).length}
            </Button>
            <Button
              onClick={() => filterColors(1)}
              variant="secondary"
              size="default"
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 shadow-lg transition-all duration-300"
            >
              {Book.citations.filter((cite) => cite.note_mark === 1).length}
            </Button>
            <Button
              onClick={() => filterColors(2)}
              size="default"
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 shadow-lg transition-all duration-300"
            >
              {Book.citations.filter((cite) => cite.note_mark === 2).length}
            </Button>
            <Button
              onClick={() => filterColors(3)}
              size="default"
              className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 shadow-lg transition-all duration-300"
            >
              {Book.citations.filter((cite) => cite.note_mark === 3).length}
            </Button>
            <Button
              onClick={() => filterColors(4)}
              size="default"
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 shadow-lg transition-all duration-300"
            >
              {Book.citations.filter((cite) => cite.note_mark === 4).length}
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
                      className={
                        isActive
                          ? "bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          : "shadow-lg border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1A1A24] border-white/10 text-slate-200">
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
                  className="shadow-lg border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300"
                >
                  {view === "list" ? <FaList /> : <FaTh />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1A1A24] border-white/10 text-slate-200">
                <p>{`Change to ${view === "list" ? "grid" : "list"} view`}</p>
              </TooltipContent>
            </Tooltip>
          </span>
        </div>
      </TooltipProvider>

      {/* ── Citations list ── */}
      <CitesList cites={sortedCites} view={view} />

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
