import {
  MAX_BOOK_NODES,
  buildInsightsModel,
  createSnippet,
  normalizeQuery,
} from "./insightsModel";

function makeBook({ id, title, author, citations }) {
  return {
    data: {
      doc_md5: id,
      doc_file_name_title: title,
      doc_authors: author,
    },
    citations,
  };
}

describe("insightsModel", () => {
  it("normalizes query text", () => {
    expect(normalizeQuery("  Deep   Work\n")) .toBe("deep work");
  });

  it("extracts snippets around match", () => {
    const snippet = createSnippet(
      "This sentence references deep work habits repeatedly for concentration.",
      "deep work"
    );
    expect(snippet.toLowerCase()).toContain("deep work");
  });

  it("builds sorted model by match count", () => {
    const books = [
      makeBook({
        id: "b1",
        title: "Book A",
        author: "A",
        citations: [
          { note_body: "deep work one" },
          { note_body: "deep work two" },
        ],
      }),
      makeBook({
        id: "b2",
        title: "Book B",
        author: "B",
        citations: [{ note_body: "deep work once" }],
      }),
    ];

    const model = buildInsightsModel(books, "deep work");
    expect(model.books).toHaveLength(2);
    expect(model.books[0].bookId).toBe("b1");
    expect(model.books[0].matchCount).toBe(2);
    expect(model.totalMatches).toBe(3);
    expect(model.nodes.find((n) => n.id === "query")).toBeTruthy();
    expect(model.edges).toHaveLength(2);
  });

  it("handles missing metadata safely", () => {
    const books = [
      makeBook({
        id: "b1",
        title: "Book A",
        author: "",
        citations: [{ note_body: "deep work", note_page: null }],
      }),
    ];
    const model = buildInsightsModel(books, "deep");
    expect(model.books[0].author).toBe("Unknown author");
    expect(model.books[0].matchedCitations[0].note_page).toBeNull();
  });

  it("caps graph nodes and marks truncation", () => {
    const books = Array.from({ length: MAX_BOOK_NODES + 5 }).map((_, i) =>
      makeBook({
        id: `book-${i}`,
        title: `Book ${i}`,
        author: "Author",
        citations: [{ note_body: "pattern" }],
      })
    );

    const model = buildInsightsModel(books, "pattern");
    expect(model.books).toHaveLength(MAX_BOOK_NODES);
    expect(model.truncated).toBe(true);
    expect(model.hiddenBooksCount).toBe(5);
  });
});
