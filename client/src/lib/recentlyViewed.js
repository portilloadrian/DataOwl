// "Recently viewed" sidebar history, kept in this browser (localStorage).
const KEY = "dataowls-recently-viewed";

export function getRecentlyViewed() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((item) => typeof item?.title === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

// Newest first. Real stories are matched by id, sample cards (no id) by title.
export function recordViewed(entry) {
  const same = (item) => (entry.id && item.id ? item.id === entry.id : item.title === entry.title);
  try {
    localStorage.setItem(KEY, JSON.stringify([entry, ...getRecentlyViewed().filter((item) => !same(item))].slice(0, 5)));
  } catch { /* storage blocked: history just won't be remembered */ }
}
