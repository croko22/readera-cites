import { unzipSync } from "fflate";

export function isSupportedFile(file) {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return name.endsWith(".bak") || name.endsWith(".json");
}

export async function extractBooks(file) {
  const lower = file.name.toLowerCase();
  const isBak = lower.endsWith(".bak");
  const isJson = lower.endsWith(".json");

  if (!isBak && !isJson) {
    throw new Error("Unsupported file type. Please upload a .json or .bak file.");
  }

  let content;
  if (isBak) {
    const buffer = await file.arrayBuffer();
    const unzipped = unzipSync(new Uint8Array(buffer));
    const entryKey = Object.keys(unzipped).find((key) =>
      key.toLowerCase().endsWith("library.json")
    );
    if (!entryKey) {
      throw new Error("library.json not found inside .bak");
    }
    content = new TextDecoder("utf-8").decode(unzipped[entryKey]);
  } else {
    content = await file.text();
  }

  const json = JSON.parse(content);
  const { valid, errors, books: validatedBooks } = validateLibraryShape(json);

  if (!valid) {
    throw new Error(errors.join("; "));
  }

  const warnings = [];
  const books = validatedBooks.filter((book) => {
    const title = book?.data?.doc_file_name_title || book?.data?.doc_title;
    return title != null && title !== "";
  });

  const skipped = validatedBooks.length - books.length;
  if (skipped > 0) {
    warnings.push(`${skipped} book(s) skipped: missing title`);
  }

  return { books, warnings };
}

export function validateLibraryShape(json) {
  const errors = [];

  if (!json || typeof json !== "object") {
    return { valid: false, errors: ["library.json must be an object"], books: null };
  }

  if (!Array.isArray(json.docs)) {
    return { valid: false, errors: ["library.json must contain a \"docs\" array"], books: null };
  }

  const books = [];
  for (let i = 0; i < json.docs.length; i++) {
    const doc = json.docs[i];
    if (!doc || typeof doc !== "object") {
      errors.push(`Document at index ${i} is not a valid object`);
    } else {
      books.push(doc);
    }
  }

  return { valid: errors.length === 0, errors, books };
}

export function filterBooksWithCitations(books, minCitations = 1) {
  if (!Array.isArray(books)) return [];
  return books.filter((book) => {
    const count = Array.isArray(book?.citations) ? book.citations.length : 0;
    return count >= minCitations;
  });
}

export function getBackupMetadata(json) {
  if (!json || typeof json !== "object") return null;
  const hasVersion = json.version != null;
  const hasCreated = json.created != null;
  if (!hasVersion && !hasCreated) return null;
  return {
    version: hasVersion ? json.version : null,
    created: hasCreated ? json.created : null,
  };
}
