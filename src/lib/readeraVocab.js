export function getBookTitle(book) {
  return (
    book?.data?.doc_file_name_title ||
    book?.data?.doc_title ||
    "Untitled book"
  );
}

export function getBookAuthor(book) {
  const a = book?.data?.doc_authors;
  if (!a || !a.trim()) return "Unknown author";
  return a.trim();
}

export function getBookProgress(book) {
  if (!book?.data?.doc_position) return null;
  try {
    const parsed =
      typeof book.data.doc_position === "string"
        ? JSON.parse(book.data.doc_position)
        : book.data.doc_position;
    const ratio = parsed?.ratio ?? null;
    const percent =
      ratio != null && Number.isFinite(ratio)
        ? Math.max(0, Math.min(100, Math.round(ratio * 100)))
        : 0;
    return { ratio: ratio ?? 0, percent, position: parsed?.position ?? null };
  } catch {
    return null;
  }
}

export function getBookLastReadTime(book) {
  return Number(book?.data?.doc_last_read_time) || 0;
}

export function getBookFavoriteTime(book) {
  const v = book?.data?.doc_favorites_time;
  const n = Number(v);
  if (v == null || n === 0) return null;
  return n;
}

export function isFavoriteBook(book) {
  const t = book?.data?.doc_favorites_time;
  return t != null && Number(t) !== 0;
}

export function getBookCitationCount(book) {
  return Array.isArray(book?.citations) ? book.citations.length : 0;
}

export function getCitationTimestamp(cite) {
  if (cite == null) return null;
  return cite.note_timestamp ?? null;
}

export function getCitationColorKey(cite) {
  if (cite == null) return 0;
  return cite.note_mark ?? 0;
}

export function getCitationColorName(cite) {
  const names = ["yellow", "red", "blue", "green", "orange"];
  return names[getCitationColorKey(cite)] ?? "yellow";
}

export const CITATION_COLORS = [
  { bg: "bg-white/5 border-slate-600", border: "border-slate-500", text: "text-slate-300" },
  { bg: "bg-red-500/5 border-red-600", border: "border-red-500", text: "text-red-300" },
  { bg: "bg-amber-500/5 border-amber-600", border: "border-amber-400", text: "text-amber-300" },
  { bg: "bg-emerald-500/5 border-emerald-600", border: "border-emerald-500", text: "text-emerald-300" },
  { bg: "bg-blue-500/5 border-blue-600", border: "border-blue-500", text: "text-blue-300" },
];

export function formatRelativeTime(timestampMs) {
  if (!timestampMs) return "";
  const now = Date.now();
  const diff = now - timestampMs;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

export function formatDate(timestamp) {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
