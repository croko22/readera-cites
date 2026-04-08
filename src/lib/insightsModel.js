export const MAX_BOOK_NODES = 120;
export const BOOK_NODE_INCREMENT = 40;
export const INITIAL_PANEL_MATCHES = 5;
export const PANEL_MATCHES_INCREMENT = 5;
export const SNIPPET_RADIUS = 90;

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function normalizeQuery(query) {
  return normalizeText(query);
}

export function createSnippet(text, query) {
  const source = String(text || "").replace(/\s+/g, " ").trim();
  if (!source) return "";
  if (!query) return source.slice(0, SNIPPET_RADIUS * 2);

  const lower = source.toLowerCase();
  const index = lower.indexOf(query);
  if (index < 0) return source.slice(0, SNIPPET_RADIUS * 2);

  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = Math.min(source.length, index + query.length + SNIPPET_RADIUS);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < source.length ? "..." : "";
  return `${prefix}${source.slice(start, end)}${suffix}`;
}

function getBookTitle(book) {
  return (
    book?.data?.doc_file_name_title ||
    book?.data?.doc_title ||
    "Untitled book"
  );
}

function getBookAuthor(book) {
  return book?.data?.doc_authors?.trim() || "Unknown author";
}

function citationHasMatch(citation, query) {
  const body = normalizeText(citation?.note_body);
  const extra = normalizeText(citation?.note_extra);
  return body.includes(query) || extra.includes(query);
}

function citationPreview(citation, query) {
  const body = String(citation?.note_body || "").trim();
  const extra = String(citation?.note_extra || "").trim();
  const source = body || extra;
  return {
    note_body: body,
    note_extra: extra,
    note_page: citation?.note_page,
    note_timestamp: citation?.note_timestamp,
    note_mark: citation?.note_mark,
    snippet: createSnippet(source, query),
  };
}

export function buildInsightsModel(books, query, options = {}) {
  const normalizedQuery = normalizeQuery(query);
  const maxNodes = Number(options.maxNodes) > 0 ? Number(options.maxNodes) : MAX_BOOK_NODES;

  const baseModel = {
    query: normalizedQuery,
    queryNode: normalizedQuery
      ? { id: "query", type: "query", label: normalizedQuery, weight: 1 }
      : null,
    books: [],
    nodes: [],
    edges: [],
    totalMatches: 0,
    totalMatchedBooks: 0,
    hiddenBooksCount: 0,
    truncated: false,
  };

  if (!Array.isArray(books) || !normalizedQuery) {
    return baseModel;
  }

  const matchedBooks = [];

  for (const book of books) {
    const citations = Array.isArray(book?.citations) ? book.citations : [];
    const matchedCitations = citations
      .filter((citation) => citationHasMatch(citation, normalizedQuery))
      .map((citation) => citationPreview(citation, normalizedQuery));

    if (matchedCitations.length === 0) continue;

    matchedBooks.push({
      bookId: book.data.doc_md5,
      title: getBookTitle(book),
      author: getBookAuthor(book),
      totalCitations: citations.length,
      matchedCitations,
      matchCount: matchedCitations.length,
    });
  }

  matchedBooks.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return a.title.localeCompare(b.title);
  });

  const visibleBooks = matchedBooks.slice(0, maxNodes);
  const nodes = [];
  const edges = [];

  if (visibleBooks.length > 0) {
    nodes.push({
      id: "query",
      type: "query",
      label: normalizedQuery,
      weight: Math.max(1, visibleBooks.length),
    });
  }

  for (const book of visibleBooks) {
    nodes.push({
      id: `book:${book.bookId}`,
      type: "book",
      label: book.title,
      weight: book.matchCount,
      bookId: book.bookId,
    });

    edges.push({
      id: `edge:query:${book.bookId}`,
      source: "query",
      target: `book:${book.bookId}`,
      weight: book.matchCount,
      bookId: book.bookId,
    });
  }

  const totalMatches = matchedBooks.reduce((acc, current) => acc + current.matchCount, 0);
  const hiddenBooksCount = Math.max(matchedBooks.length - visibleBooks.length, 0);

  return {
    query: normalizedQuery,
    queryNode: visibleBooks.length
      ? { id: "query", type: "query", label: normalizedQuery, weight: Math.max(1, visibleBooks.length) }
      : null,
    books: visibleBooks,
    nodes,
    edges,
    totalMatches,
    totalMatchedBooks: matchedBooks.length,
    hiddenBooksCount,
    truncated: hiddenBooksCount > 0,
  };
}
