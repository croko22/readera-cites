import { describe, it, expect } from "vitest";
import { File } from "node:buffer";
import {
  isSupportedFile,
  extractBooks,
  validateLibraryShape,
  filterBooksWithCitations,
  getBackupMetadata,
} from "./readEraIntake";

// Pre-generated .bak files using Node's fflate (avoids fflate roundtrip bug in jsdom)
const BAK_WITH_LIBRARY =
  "UEsDBBQAAAAIAFRX2lwJnm1VcwAAAOAAAAAMAAAAbGlicmFyeS5qc29ujY0xCsMwEAS/ErZWY5fq4m8EIw7pAkcsXYiONEZ/j+KQxrhwtTAsMyve/KqiBX50SBor/G1FIiP4vhrDXRYOhTIHE1sYHpPq43LF9j+GkjoZ0ByiGFn3/7xF7avJXI3yE35oc3OnctNR7g+33LjPzV3+AVBLAQIUABQAAAAIAFRX2lwJnm1VcwAAAOAAAAAMAAAAAAAAAAAAAAAAAAAAAABsaWJyYXJ5Lmpzb25QSwUGAAAAAAEAAQA6AAAAnQAAAAAA";
const BAK_WITH_OTHER =
  "UEsDBBQAAAAIAFRX2lwzmjBxDwAAAA0AAAAKAAAAb3RoZXIuanNvbqtWKkstKs7Mz1OyMqwFAFBLAQIUABQAAAAIAFRX2lwzmjBxDwAAAA0AAAAKAAAAAAAAAAAAAAAAAAAAAABvdGhlci5qc29uUEsFBgAAAAABAAEAOAAAADcAAAAAAA==";

function bakBytes(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

const makeBook = (id, title, citationCount = 0) => ({
  data: { doc_file_name_title: title, doc_title: title, doc_id: id },
  citations: Array.from({ length: citationCount }, (_, i) => ({
    note_timestamp: Date.now() + i,
    note_mark: i % 5,
  })),
});

describe("isSupportedFile", () => {
  it("returns true for .bak files", () => {
    expect(isSupportedFile(new File(["x"], "backup.bak"))).toBe(true);
  });

  it("returns true for .json files", () => {
    expect(isSupportedFile(new File(["x"], "library.json"))).toBe(true);
  });

  it("returns true for uppercase extensions", () => {
    expect(isSupportedFile(new File(["x"], "BACKUP.BAK"))).toBe(true);
    expect(isSupportedFile(new File(["x"], "LIBRARY.JSON"))).toBe(true);
  });

  it("returns false for .txt files", () => {
    expect(isSupportedFile(new File(["x"], "file.txt"))).toBe(false);
  });

  it("returns false for null or undefined", () => {
    expect(isSupportedFile(null)).toBe(false);
    expect(isSupportedFile(undefined)).toBe(false);
  });
});

describe("validateLibraryShape", () => {
  it("returns valid for a proper library.json", () => {
    const result = validateLibraryShape({
      version: 1,
      docs: [makeBook("1", "Book 1"), makeBook("2", "Book 2")],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.books).toHaveLength(2);
  });

  it("returns invalid for null input", () => {
    const result = validateLibraryShape(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.books).toBeNull();
  });

  it("returns invalid for non-object input", () => {
    const result = validateLibraryShape("string");
    expect(result.valid).toBe(false);
    expect(result.books).toBeNull();
  });

  it("returns invalid when docs is missing", () => {
    const result = validateLibraryShape({ version: 1 });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.books).toBeNull();
  });

  it("returns invalid when docs is not an array", () => {
    const result = validateLibraryShape({ docs: "not-array" });
    expect(result.valid).toBe(false);
    expect(result.books).toBeNull();
  });

  it("flags invalid entries but still returns valid docs", () => {
    const result = validateLibraryShape({
      docs: [makeBook("1", "Book 1"), null, "string", 42, makeBook("2", "Book 2")],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
    expect(result.books).toHaveLength(2);
  });

  it("returns valid when all docs are objects", () => {
    const result = validateLibraryShape({
      docs: [makeBook("1", "A"), makeBook("2", "B")],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.books).toHaveLength(2);
  });
});

describe("filterBooksWithCitations", () => {
  const books = [
    makeBook("1", "Zero", 0),
    makeBook("2", "One", 1),
    makeBook("3", "Five", 5),
    makeBook("4", "Ten", 10),
  ];

  it("returns books with at least 1 citation by default", () => {
    const result = filterBooksWithCitations(books);
    expect(result).toHaveLength(3);
    expect(result.map((b) => b.data.doc_id)).toEqual(["2", "3", "4"]);
  });

  it("filters by a custom minimum threshold", () => {
    const result = filterBooksWithCitations(books, 5);
    expect(result).toHaveLength(2);
    expect(result.map((b) => b.data.doc_id)).toEqual(["3", "4"]);
  });

  it("returns empty array for empty input", () => {
    expect(filterBooksWithCitations([])).toEqual([]);
  });

  it("returns empty array for non-array input", () => {
    expect(filterBooksWithCitations(null)).toEqual([]);
    expect(filterBooksWithCitations(undefined)).toEqual([]);
    expect(filterBooksWithCitations("not-array")).toEqual([]);
  });

  it("handles books with no citations field", () => {
    const booksNoCite = [
      { data: { doc_id: "1" } },
      { data: { doc_id: "2" }, citations: null },
      { data: { doc_id: "3" }, citations: [{}] },
    ];
    const result = filterBooksWithCitations(booksNoCite);
    expect(result).toHaveLength(1);
    expect(result[0].data.doc_id).toBe("3");
  });
});

describe("getBackupMetadata", () => {
  it("returns version and created when both present", () => {
    const result = getBackupMetadata({ version: 2, created: "2024-06-01" });
    expect(result).toEqual({ version: 2, created: "2024-06-01" });
  });

  it("returns version as null when only created is present", () => {
    const result = getBackupMetadata({ created: "2024-06-01" });
    expect(result).toEqual({ version: null, created: "2024-06-01" });
  });

  it("returns created as null when only version is present", () => {
    const result = getBackupMetadata({ version: 1 });
    expect(result).toEqual({ version: 1, created: null });
  });

  it("returns null when neither field exists", () => {
    expect(getBackupMetadata({})).toBeNull();
  });

  it("returns null for null or non-object input", () => {
    expect(getBackupMetadata(null)).toBeNull();
    expect(getBackupMetadata("string")).toBeNull();
  });
});

describe("extractBooks", () => {
  it("parses a .json file and returns books", async () => {
    const json = {
      version: 1,
      docs: [makeBook("1", "Book One", 3), makeBook("2", "Book Two", 0)],
    };
    const file = new File([JSON.stringify(json)], "library.json");
    const result = await extractBooks(file);
    expect(result.books).toHaveLength(2);
    expect(result.warnings).toEqual([]);
  });

  it("parses a .bak file and returns books", async () => {
    const file = new File([bakBytes(BAK_WITH_LIBRARY)], "backup.bak");
    const result = await extractBooks(file);
    expect(result.books).toHaveLength(2);
    expect(result.warnings).toEqual([]);
  });

  it("rejects unsupported file types", async () => {
    const file = new File(["x"], "data.txt");
    await expect(extractBooks(file)).rejects.toThrow("Unsupported file type");
  });

  it("throws on invalid JSON content", async () => {
    const file = new File(["not-json"], "library.json");
    await expect(extractBooks(file)).rejects.toThrow();
  });

  it("throws when .bak lacks library.json", async () => {
    const file = new File([bakBytes(BAK_WITH_OTHER)], "backup.bak");
    await expect(extractBooks(file)).rejects.toThrow("library.json not found");
  });

  it("throws when library.json has no docs array", async () => {
    const file = new File([JSON.stringify({})], "library.json");
    await expect(extractBooks(file)).rejects.toThrow("docs");
  });

  it("filters out books without a title and reports warning", async () => {
    const good = makeBook("1", "Good Book", 2);
    const noTitle = { data: {}, citations: [{ note_timestamp: 1 }] };
    const json = { version: 1, docs: [good, noTitle] };
    const file = new File([JSON.stringify(json)], "library.json");
    const result = await extractBooks(file);
    expect(result.books).toHaveLength(1);
    expect(result.books[0].data.doc_id).toBe("1");
    expect(result.warnings).toEqual(["1 book(s) skipped: missing title"]);
  });
});
