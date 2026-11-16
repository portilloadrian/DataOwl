const SEARCHES_KEY = "dataowls-recent-searches";
const CLEARED_KEY = "dataowls-recent-cleared";
const MAX = 5;

// Search history lives in this browser (localStorage) until it is saved per user in Supabase.
export function getRecentSearches() {
  try {
    const list = JSON.parse(localStorage.getItem(SEARCHES_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((q) => typeof q === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

// Newest first, no duplicates (ignoring case).
export function recordSearch(query) {
  const q = query.trim();
  if (!q) return;
  const next = [q, ...getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, MAX);
  try {
    localStorage.setItem(SEARCHES_KEY, JSON.stringify(next));
  } catch { /* storage blocked: history just won't be remembered */ }
}

// "Clear all": forget the history and hide the sample recent-people row.
export function clearRecent() {
  try {
    localStorage.removeItem(SEARCHES_KEY);
    localStorage.setItem(CLEARED_KEY, "1");
  } catch { /* ignore */ }
}

export function recentPeopleCleared() {
  try {
    return localStorage.getItem(CLEARED_KEY) === "1";
  } catch {
    return false;
  }
}
