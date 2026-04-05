/**
 * Export utilities for ReadEra Cites.
 * Provides formatting and download helpers for citations and libraries.
 */

/**
 * Format citations as plain text for clipboard (improved format).
 * @param {object} book - Book object with data and citations
 * @param {Array} citations - Filtered/sorted citations to include
 * @returns {string}
 */
export function formatCitationsAsText(book, citations) {
  const title = book.data.doc_title || book.data.doc_file_name_title;
  const authors = book.data.doc_authors;

  const header = authors
    ? `${title} \u2014 ${authors}`
    : title;

  const lines = citations.map((c, idx) => {
    const parts = [];
    parts.push(`${idx + 1}. "${c.note_body}"`);
    if (c.note_page !== undefined && c.note_page !== null) {
      parts[parts.length - 1] += ` (Page ${c.note_page})`;
    }
    if (c.note_extra) {
      parts.push(`   Note: ${c.note_extra}`);
    }
    return parts.join("\n");
  });

  return [header, "", ...lines].join("\n");
}

/**
 * Format citations as Markdown.
 * @param {object} book - Book object with data and citations
 * @param {Array} citations - Filtered/sorted citations to include
 * @returns {string}
 */
export function formatCitationsAsMarkdown(book, citations) {
  const title = book.data.doc_title || book.data.doc_file_name_title;
  const authors = book.data.doc_authors;

  const lines = [`# ${title}`];

  if (authors) {
    lines.push(`\n*${authors}*`);
  }

  lines.push("");

  citations.forEach((c) => {
    let quote = `> "${c.note_body}"`;
    if (c.note_page !== undefined && c.note_page !== null) {
      quote += ` (Page ${c.note_page})`;
    }
    lines.push(quote);
    if (c.note_extra) {
      lines.push(`>\n> **Note:** ${c.note_extra}`);
    }
    lines.push("\n---\n");
  });

  return lines.join("\n");
}

/**
 * Build a JSON export object for a single book.
 * @param {object} book - Book object with data and citations
 * @returns {object}
 */
export function buildBookJson(book) {
  const title = book.data.doc_title || book.data.doc_file_name_title;
  return {
    title,
    authors: book.data.doc_authors || null,
    format: book.data.doc_format || null,
    pageCount: book.data.doc_page_count || null,
    citations: book.citations.map((c) => ({
      text: c.note_body,
      note: c.note_extra || null,
      page: c.note_page ?? null,
      timestamp: c.note_timestamp || null,
      color: c.note_mark ?? null,
    })),
  };
}

/**
 * Build a JSON export object for the full library.
 * @param {Array} books - Array of book objects
 * @returns {object}
 */
export function buildLibraryJson(books) {
  return {
    exportedAt: new Date().toISOString(),
    totalBooks: books.length,
    books: books.map(buildBookJson),
  };
}

/**
 * Trigger a file download in the browser.
 * @param {string} content - File content as string
 * @param {string} filename - Desired file name
 * @param {string} mimeType - MIME type (e.g. 'text/markdown')
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
