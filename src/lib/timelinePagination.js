export const TIMELINE_PAGE_SIZE = 50;

/** Select one page across date groups without copying or mutating all items. */
export function getTimelinePage(groups, page) {
  const start = page * TIMELINE_PAGE_SIZE;
  const end = start + TIMELINE_PAGE_SIZE;
  let offset = 0;
  const visible = [];

  for (const group of groups) {
    const groupEnd = offset + group.items.length;
    if (groupEnd > start && offset < end) {
      visible.push({
        ...group,
        items: group.items.slice(Math.max(0, start - offset), end - offset),
      });
    }
    offset = groupEnd;
    if (offset >= end) break;
  }

  return visible;
}
