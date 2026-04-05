import { del, get, set } from "idb-keyval";

const BOOKS_KEY = "Books";
const SETTINGS_KEY = "Settings";
const SEARCH_HISTORY_KEY = "SearchHistory";
const MAX_SEARCH_HISTORY = 10;

const DEFAULT_SETTINGS = { defaultFilter: 0, theme: "dark" };

export async function getBooks() {
  // 1) Prefer IndexedDB
  try {
    const fromIdb = await get(BOOKS_KEY);
    if (fromIdb) return fromIdb;
  } catch {
    // fall through to localStorage
  }

  // 2) Fallback to localStorage (and opportunistically migrate)
  try {
    const raw = localStorage.getItem(BOOKS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    try {
      await set(BOOKS_KEY, parsed);
      localStorage.removeItem(BOOKS_KEY);
    } catch {
      // ignore migration failures
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function setBooks(books) {
  // Prefer IndexedDB (works better for >5MB)
  try {
    await set(BOOKS_KEY, books);
    try {
      localStorage.removeItem(BOOKS_KEY);
    } catch {
      // ignore
    }
    return;
  } catch (error) {
    // Fallback to localStorage (may throw QuotaExceededError)
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    return;
  }
}

export async function clearBooks() {
  try {
    await del(BOOKS_KEY);
  } catch {
    // ignore
  }

  try {
    localStorage.removeItem(BOOKS_KEY);
  } catch {
    // ignore
  }
}

export async function getSettings() {
  // 1) Prefer IndexedDB
  try {
    const fromIdb = await get(SETTINGS_KEY);
    if (fromIdb) return { ...DEFAULT_SETTINGS, ...fromIdb };
  } catch {
    // fall through to localStorage
  }

  // 2) Fallback to localStorage
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function setSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };

  // Prefer IndexedDB
  try {
    await set(SETTINGS_KEY, merged);
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch {
      // ignore
    }
    return;
  } catch {
    // Fallback to localStorage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return;
  }
}

function byteSize(data) {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export async function getStorageInfo() {
  let backend = "none";
  let booksSize = 0;
  let settingsSize = 0;
  let totalBooks = 0;
  let totalCitations = 0;

  // Check books
  try {
    const fromIdb = await get(BOOKS_KEY);
    if (fromIdb) {
      backend = "IndexedDB";
      booksSize = byteSize(fromIdb);
      totalBooks = fromIdb.length;
      totalCitations = fromIdb.reduce((sum, b) => sum + (b.citations?.length || 0), 0);
    }
  } catch {
    // check localStorage
  }

  if (backend === "none") {
    try {
      const raw = localStorage.getItem(BOOKS_KEY);
      if (raw) {
        backend = "localStorage";
        booksSize = new Blob([raw]).size;
        const parsed = JSON.parse(raw);
        totalBooks = parsed.length;
        totalCitations = parsed.reduce((sum, b) => sum + (b.citations?.length || 0), 0);
      }
    } catch {
      // no books
    }
  }

  // Check settings size
  try {
    const fromIdb = await get(SETTINGS_KEY);
    if (fromIdb) settingsSize = byteSize(fromIdb);
  } catch {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) settingsSize = new Blob([raw]).size;
    } catch {
      // no settings
    }
  }

  const totalSize = booksSize + settingsSize;

  // Estimate quota (localStorage ~5MB, IndexedDB much larger)
  const estimatedQuota = backend === "localStorage" ? 5 * 1024 * 1024 : 50 * 1024 * 1024;

  return {
    backend,
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    booksSize,
    booksSizeFormatted: formatBytes(booksSize),
    settingsSize,
    settingsSizeFormatted: formatBytes(settingsSize),
    totalBooks,
    totalCitations,
    usagePercent: estimatedQuota > 0 ? Math.min((totalSize / estimatedQuota) * 100, 100) : 0,
  };
}

export async function clearAllData() {
  await clearBooks();
  try {
    await del(SETTINGS_KEY);
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    // ignore
  }
  await clearSearchHistory();
}

export async function getSearchHistory() {
  try {
    const fromIdb = await get(SEARCH_HISTORY_KEY);
    if (fromIdb) return fromIdb;
  } catch {
    // fall through
  }

  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addSearchHistory(query) {
  if (!query || !query.trim()) return;
  const trimmed = query.trim();
  let history = await getSearchHistory();
  // Dedupe: remove existing entry if present
  history = history.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
  // Add to front
  history.unshift(trimmed);
  // Keep only last N entries
  history = history.slice(0, MAX_SEARCH_HISTORY);

  try {
    await set(SEARCH_HISTORY_KEY, history);
  } catch {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }
}

export async function clearSearchHistory() {
  try {
    await del(SEARCH_HISTORY_KEY);
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // ignore
  }
}
