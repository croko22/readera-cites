// ────────────────────────────────────────────────────────────
// timelineModel.js — Pure recent-highlights grouping
//
// Settled decisions (2026-11-13):
// - Local browser timezone, Monday week start, calendar boundaries.
// - Day / week / month modes, newest-first by default.
// - Missing, zero, negative, or invalid timestamps are Undated and
//   always appear last. Future timestamps stay in normal order.
// - Labels are English (en-US); relative labels only for Today/Yesterday.
// - Timestamps are milliseconds. No seconds heuristic.
// ────────────────────────────────────────────────────────────

import { getBookTitle } from "./readeraVocab";

export const TIMELINE_GRANULARITIES = ["day", "week", "month"];
export const TIMELINE_ORDERS = ["newest", "oldest"];

const DAY_MS = 24 * 60 * 60 * 1000;
const LOCALE = "en-US";

function pad(value) {
  return String(value).padStart(2, "0");
}

function parseTimestamp(value) {
  let raw = value;
  if (typeof raw === "string" && raw.trim() !== "") {
    raw = Number(raw);
  }
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
    return null;
  }
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : null;
}

function getPage(citation) {
  const raw = citation?.note_page;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

function createLocalDateFormatter(timeZone) {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getLocalDateParts(timestamp, formatter) {
  const parts = formatter.formatToParts(new Date(timestamp));
  const find = (type) => Number(parts.find((part) => part.type === type)?.value);
  return {
    year: find("year"),
    month: find("month"),
    day: find("day"),
  };
}

function toCalendarDay(parts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function toIsoDate(calendarDay) {
  const date = new Date(calendarDay);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function getPeriod(calendarDay, granularity, weekStartsOn) {
  if (granularity === "day") {
    return {
      key: `day:${toIsoDate(calendarDay)}`,
      start: calendarDay,
      end: calendarDay,
    };
  }

  if (granularity === "month") {
    const date = new Date(calendarDay);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    return {
      key: `month:${year}-${pad(month + 1)}`,
      start: Date.UTC(year, month, 1),
      end: Date.UTC(year, month + 1, 0),
    };
  }

  const weekday = new Date(calendarDay).getUTCDay();
  const offset = (weekday - weekStartsOn + 7) % 7;
  const start = calendarDay - offset * DAY_MS;
  return {
    key: `week:${toIsoDate(start)}`,
    start,
    end: start + 6 * DAY_MS,
  };
}

function formatDay(calendarDay, currentYear, dayFormatter, dayYearFormatter) {
  const year = new Date(calendarDay).getUTCFullYear();
  return year === currentYear
    ? dayFormatter.format(new Date(calendarDay))
    : dayYearFormatter.format(new Date(calendarDay));
}

function formatWeek(
  period,
  currentYear,
  monthDayFormatter,
  dayOnlyFormatter,
  dayYearFormatter
) {
  const start = new Date(period.start);
  const end = new Date(period.end);
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  if (startYear !== endYear) {
    return `${dayYearFormatter.format(start)}–${dayYearFormatter.format(end)}`;
  }

  const yearSuffix = startYear === currentYear ? "" : `, ${startYear}`;
  if (start.getUTCMonth() !== end.getUTCMonth()) {
    return `${monthDayFormatter.format(start)}–${monthDayFormatter.format(end)}${yearSuffix}`;
  }

  return `${monthDayFormatter.format(start)}–${dayOnlyFormatter.format(end)}${yearSuffix}`;
}

function compareText(a, b) {
  return String(a).localeCompare(String(b), LOCALE);
}

function compareEntries(a, b, order) {
  if (a.timestamp !== b.timestamp) {
    if (a.timestamp === null) return 1;
    if (b.timestamp === null) return -1;
    return order === "newest"
      ? b.timestamp - a.timestamp
      : a.timestamp - b.timestamp;
  }

  const titleOrder = compareText(a.bookTitle, b.bookTitle);
  if (titleOrder !== 0) return titleOrder;

  const aPage = a.page ?? Number.POSITIVE_INFINITY;
  const bPage = b.page ?? Number.POSITIVE_INFINITY;
  if (aPage !== bPage) return aPage - bPage;

  return a.originalIndex - b.originalIndex;
}

/**
 * Group every citation in the supplied books into day, week, or month
 * periods. The input is never mutated.
 *
 * @param {Array} books
 * @param {object} [options]
 * @param {"day"|"week"|"month"} [options.granularity="day"]
 * @param {"newest"|"oldest"} [options.order="newest"]
 * @param {number} [options.now=Date.now()]
 * @param {string} [options.timeZone] IANA timezone; defaults to the browser's
 * @param {number} [options.weekStartsOn=1] 0=Sunday ... 6=Saturday
 * @returns {Array<{
 *   key: string,
 *   granularity: string,
 *   label: string,
 *   startDate: string|null,
 *   endDate: string|null,
 *   count: number,
 *   items: Array<{
 *     book: object,
 *     citation: object,
 *     timestamp: number|null,
 *     bookTitle: string,
 *     page: number|null,
 *     originalIndex: number
 *   }>
 * }>}
 */
export function buildCitationTimeline(books, options = {}) {
  const granularity = options.granularity ?? "day";
  const order = options.order ?? "newest";
  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const timeZone =
    options.timeZone ??
    Intl.DateTimeFormat().resolvedOptions().timeZone ??
    "UTC";
  const weekStartsOn = Number.isInteger(options.weekStartsOn)
    ? options.weekStartsOn
    : 1;

  if (!TIMELINE_GRANULARITIES.includes(granularity)) {
    throw new TypeError(`Unknown timeline granularity: ${granularity}`);
  }
  if (!TIMELINE_ORDERS.includes(order)) {
    throw new TypeError(`Unknown timeline order: ${order}`);
  }
  if (weekStartsOn < 0 || weekStartsOn > 6) {
    throw new RangeError(`weekStartsOn must be between 0 and 6`);
  }
  if (!Array.isArray(books)) return [];

  const localDateFormatter = createLocalDateFormatter(timeZone);
  const dayFormatter = new Intl.DateTimeFormat(LOCALE, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
  const dayYearFormatter = new Intl.DateTimeFormat(LOCALE, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const dayOnlyFormatter = new Intl.DateTimeFormat(LOCALE, {
    timeZone: "UTC",
    day: "numeric",
  });
  const monthFormatter = new Intl.DateTimeFormat(LOCALE, {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });

  const nowParts = getLocalDateParts(now, localDateFormatter);
  const today = toCalendarDay(nowParts);
  const yesterday = today - DAY_MS;
  const currentYear = nowParts.year;

  const entries = [];
  let originalIndex = 0;

  for (const book of books) {
    const citations = Array.isArray(book?.citations) ? book.citations : [];
    for (const citation of citations) {
      entries.push({
        book,
        citation,
        timestamp: parseTimestamp(citation?.note_timestamp),
        bookTitle: getBookTitle(book) || "Untitled book",
        page: getPage(citation),
        originalIndex,
      });
      originalIndex += 1;
    }
  }

  const groups = new Map();
  const undated = [];

  for (const entry of entries) {
    if (entry.timestamp === null) {
      undated.push(entry);
      continue;
    }

    const localParts = getLocalDateParts(entry.timestamp, localDateFormatter);
    const calendarDay = toCalendarDay(localParts);
    const period = getPeriod(calendarDay, granularity, weekStartsOn);
    let group = groups.get(period.key);

    if (!group) {
      group = {
        key: period.key,
        granularity,
        startDate: toIsoDate(period.start),
        endDate: toIsoDate(period.end),
        items: [],
        periodStart: period.start,
        periodEnd: period.end,
      };
      groups.set(period.key, group);
    }

    group.items.push(entry);
  }

  const result = Array.from(groups.values())
    .sort((a, b) =>
      order === "newest"
        ? b.periodStart - a.periodStart
        : a.periodStart - b.periodStart
    )
    .map((group) => {
      let label;
      if (granularity === "day") {
        if (group.periodStart === today) {
          label = "Today";
        } else if (group.periodStart === yesterday) {
          label = "Yesterday";
        } else {
          label = formatDay(
            group.periodStart,
            currentYear,
            dayFormatter,
            dayYearFormatter
          );
        }
      } else if (granularity === "week") {
        label = formatWeek(
          { start: group.periodStart, end: group.periodEnd },
          currentYear,
          dayFormatter,
          dayOnlyFormatter,
          dayYearFormatter
        );
      } else {
        label = monthFormatter.format(new Date(group.periodStart));
      }

      return {
        key: group.key,
        granularity,
        label,
        startDate: group.startDate,
        endDate: group.endDate,
        items: group.items.sort((a, b) => compareEntries(a, b, order)),
        count: group.items.length,
      };
    });

  if (undated.length > 0) {
    undated.sort((a, b) => compareEntries(a, b, order));
    result.push({
      key: "undated",
      granularity,
      label: "Undated",
      startDate: null,
      endDate: null,
      items: undated,
      count: undated.length,
    });
  }

  return result;
}
