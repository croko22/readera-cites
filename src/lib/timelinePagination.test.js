import { getTimelinePage, TIMELINE_PAGE_SIZE } from "./timelinePagination";

it("preserves groups, total counts, references, and input while paging across boundaries", () => {
  const groups = [30, 71, 1].map((count, groupIndex) => Object.freeze({
    key: groupIndex === 2 ? "undated" : `day:${groupIndex}`,
    count,
    items: Object.freeze(Array.from({ length: count }, (_, index) => ({ groupIndex, index }))),
  }));
  Object.freeze(groups);
  const pages = [0, 1, 2].map((page) => getTimelinePage(groups, page));
  expect(pages.map((page) => page.reduce((sum, group) => sum + group.items.length, 0)))
    .toEqual([TIMELINE_PAGE_SIZE, TIMELINE_PAGE_SIZE, 2]);
  expect(pages[0].map((group) => group.count)).toEqual([30, 71]);
  const allItems = pages.flatMap((page) => page.flatMap((group) => group.items));
  const originals = groups.flatMap((group) => group.items);
  expect(allItems).toEqual(originals);
  allItems.forEach((item, index) => expect(item).toBe(originals[index]));
  expect(pages[2].at(-1).key).toBe("undated");
  expect(getTimelinePage([], 0)).toEqual([]);
});
