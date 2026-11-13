import { buildCitationTimeline, getTimelinePeriodKey } from "./timelineModel";

const NOW = Date.UTC(2026, 10, 13, 15, 0, 0);

function book(title, citations) {
  return {
    data: { doc_file_name_title: title, doc_md5: title.toLowerCase() },
    citations,
  };
}

function labels(groups) {
  return groups.map((group) => group.label);
}

describe("buildCitationTimeline", () => {
  it("groups by local day and uses relative labels only for today and yesterday", () => {
    const groups = buildCitationTimeline(
      [
        book("Alpha", [
          { note_body: "today", note_timestamp: Date.UTC(2026, 10, 13, 8) },
          { note_body: "yesterday", note_timestamp: Date.UTC(2026, 10, 12, 20) },
          { note_body: "older", note_timestamp: Date.UTC(2026, 10, 10, 12) },
        ]),
      ],
      { now: NOW, timeZone: "UTC", granularity: "day" }
    );

    expect(labels(groups)).toEqual(["Today", "Yesterday", "Nov 10"]);
    expect(groups.map((group) => group.key)).toEqual([
      "day:2026-11-13",
      "day:2026-11-12",
      "day:2026-11-10",
    ]);
    expect(groups[0].items[0].citation.note_body).toBe("today");
    expect(groups[0].count).toBe(1);
  });

  it("adds the year to day labels when the year differs from now", () => {
    const groups = buildCitationTimeline(
      [book("Alpha", [{ note_body: "last year", note_timestamp: Date.UTC(2025, 11, 31, 12) }])],
      { now: NOW, timeZone: "UTC", granularity: "day" }
    );

    expect(groups[0].label).toBe("Dec 31, 2025");
  });

  it("starts weeks on Monday and keeps Sunday in the previous week", () => {
    const groups = buildCitationTimeline(
      [
        book("Alpha", [
          { note_body: "sunday", note_timestamp: Date.UTC(2026, 10, 8, 23) },
          { note_body: "monday", note_timestamp: Date.UTC(2026, 10, 9, 0, 30) },
        ]),
      ],
      { now: NOW, timeZone: "UTC", granularity: "week" }
    );

    expect(labels(groups)).toEqual(["Nov 9–15", "Nov 2–8"]);
    expect(groups[0].key).toBe("week:2026-11-09");
    expect(groups[1].key).toBe("week:2026-11-02");
    expect(groups[0].items[0].citation.note_body).toBe("monday");
    expect(groups[1].items[0].citation.note_body).toBe("sunday");
  });

  it("labels weeks that cross a year boundary with both years", () => {
    const groups = buildCitationTimeline(
      [book("Alpha", [{ note_body: "cross-year", note_timestamp: Date.UTC(2025, 11, 30, 12) }])],
      { now: NOW, timeZone: "UTC", granularity: "week" }
    );

    expect(groups[0].label).toBe("Dec 29, 2025–Jan 4, 2026");
  });

  it("groups by month with an explicit month and year", () => {
    const groups = buildCitationTimeline(
      [
        book("Alpha", [
          { note_body: "october", note_timestamp: Date.UTC(2026, 9, 31, 23) },
          { note_body: "november", note_timestamp: Date.UTC(2026, 10, 1, 1) },
        ]),
      ],
      { now: NOW, timeZone: "UTC", granularity: "month" }
    );

    expect(labels(groups)).toEqual(["November 2026", "October 2026"]);
    expect(groups.map((group) => group.key)).toEqual(["month:2026-11", "month:2026-10"]);
  });

  it("uses local calendar days across a DST boundary", () => {
    const groups = buildCitationTimeline(
      [
        book("Alpha", [
          { note_body: "before", note_timestamp: Date.UTC(2026, 2, 8, 4, 30) },
          { note_body: "after", note_timestamp: Date.UTC(2026, 2, 8, 7, 30) },
        ]),
      ],
      { now: Date.UTC(2026, 2, 9, 12), timeZone: "America/New_York", granularity: "day" }
    );

    expect(groups.map((group) => group.key)).toEqual(["day:2026-03-08", "day:2026-03-07"]);
  });

  it("keeps undated highlights in a final group in both directions", () => {
    const books = [
      book("Alpha", [
        { note_body: "dated", note_timestamp: Date.UTC(2026, 10, 13, 8) },
        { note_body: "missing", note_timestamp: null },
        { note_body: "zero", note_timestamp: 0 },
        { note_body: "invalid", note_timestamp: "not-a-date" },
      ]),
    ];

    const newest = buildCitationTimeline(books, { now: NOW, timeZone: "UTC", order: "newest" });
    const oldest = buildCitationTimeline(books, { now: NOW, timeZone: "UTC", order: "oldest" });

    expect(labels(newest)).toEqual(["Today", "Undated"]);
    expect(labels(oldest)).toEqual(["Today", "Undated"]);
    expect(newest.at(-1).items.map((item) => item.citation.note_body)).toEqual([
      "missing",
      "zero",
      "invalid",
    ]);
  });

  it("reverses groups and items for oldest-first while keeping undated last", () => {
    const books = [
      book("Alpha", [
        { note_body: "newest", note_timestamp: Date.UTC(2026, 10, 13, 8) },
        { note_body: "middle", note_timestamp: Date.UTC(2026, 10, 12, 8) },
        { note_body: "oldest", note_timestamp: Date.UTC(2026, 10, 10, 8) },
        { note_body: "undated", note_timestamp: undefined },
      ]),
    ];

    const groups = buildCitationTimeline(books, {
      now: NOW,
      timeZone: "UTC",
      order: "oldest",
    });

    expect(labels(groups)).toEqual(["Nov 10", "Yesterday", "Today", "Undated"]);
    expect(groups[0].items[0].citation.note_body).toBe("oldest");
    expect(groups[2].items[0].citation.note_body).toBe("newest");
  });

  it("breaks timestamp ties by book title, page, and original citation order", () => {
    const timestamp = Date.UTC(2026, 10, 13, 8);
    const groups = buildCitationTimeline(
      [
        book("Beta", [{ note_body: "beta", note_timestamp: timestamp, note_page: 1 }]),
        book("Alpha", [
          { note_body: "alpha-page-12", note_timestamp: timestamp, note_page: 12 },
          { note_body: "alpha-page-4", note_timestamp: timestamp, note_page: 4 },
        ]),
      ],
      { now: NOW, timeZone: "UTC" }
    );

    expect(groups[0].items.map((item) => item.citation.note_body)).toEqual([
      "alpha-page-4",
      "alpha-page-12",
      "beta",
    ]);
  });

  it("includes every citation, including page-only entries and numeric timestamps", () => {
    const timestamp = Date.UTC(2026, 10, 13, 8);
    const groups = buildCitationTimeline(
      [
        book("Alpha", [
          { note_page: 7, note_timestamp: timestamp },
          { note_extra: "note only", note_timestamp: String(timestamp) },
        ]),
      ],
      { now: NOW, timeZone: "UTC" }
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].count).toBe(2);
    expect(groups[0].items[0].citation.note_page).toBe(7);
    expect(groups[0].items[1].citation.note_extra).toBe("note only");
  });

  it("does not mutate the input books or citations", () => {
    const citations = [
      { note_body: "later", note_timestamp: Date.UTC(2026, 10, 13, 8) },
      { note_body: "earlier", note_timestamp: Date.UTC(2026, 10, 13, 7) },
    ];
    const books = [book("Alpha", citations)];

    buildCitationTimeline(books, { now: NOW, timeZone: "UTC" });

    expect(books[0].citations).toBe(citations);
    expect(books[0].citations.map((citation) => citation.note_body)).toEqual([
      "later",
      "earlier",
    ]);
  });

  it("returns no groups for empty or malformed input", () => {
    expect(buildCitationTimeline(null, { now: NOW })).toEqual([]);
    expect(buildCitationTimeline([{}, { citations: "invalid" }], { now: NOW })).toEqual([]);
  });

  it("exposes a single timestamp's period key for summaries", () => {
    expect(
      getTimelinePeriodKey(Date.UTC(2026, 10, 13, 12), {
        granularity: "week",
        timeZone: "UTC",
      })
    ).toBe("week:2026-11-09");
    expect(
      getTimelinePeriodKey(Date.UTC(2026, 10, 13, 12), {
        granularity: "month",
        timeZone: "UTC",
      })
    ).toBe("month:2026-11");
    expect(getTimelinePeriodKey(0, { granularity: "day" })).toBe("undated");
    expect(getTimelinePeriodKey("bad", { granularity: "day" })).toBe("undated");
  });

  it("rejects unknown grouping modes", () => {
    expect(() =>
      buildCitationTimeline([], { now: NOW, granularity: "year" })
    ).toThrow(/granularity/i);
    expect(() => buildCitationTimeline([], { now: NOW, order: "random" })).toThrow(/order/i);
  });
});
