import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

function goToLogin() {
  window.history.pushState({}, "", "/login");
  window.dispatchEvent(new PopStateEvent("popstate"));
}

// One button for like / repost / save: each is a (story_id, user_id) row in `table`.
// `label(count, on)` is the button text; pass showCount={false} for private actions (save).
export function StoryToggle({ table, storyId, label, showCount = true }) {
  const [state, setState] = useState({ count: 0, on: false, userId: null });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;
      const [{ count }, mine] = await Promise.all([
        showCount ? supabase.from(table).select("*", { count: "exact", head: true }).eq("story_id", storyId) : Promise.resolve({ count: 0 }),
        userId ? supabase.from(table).select("story_id").eq("story_id", storyId).eq("user_id", userId).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      if (active) setState({ count: count ?? 0, on: Boolean(mine.data), userId });
    }
    load();
    return () => { active = false; };
  }, [table, storyId, showCount]);

  async function toggle() {
    if (!state.userId) return goToLogin();
    const prev = state;
    setError("");
    setState({ ...prev, count: prev.count + (prev.on ? -1 : 1), on: !prev.on }); // optimistic
    const query = supabase.from(table);
    const { error: failed } = prev.on
      ? await query.delete().eq("story_id", storyId).eq("user_id", prev.userId)
      : await query.insert({ story_id: storyId, user_id: prev.userId });
    if (failed) { setState(prev); setError("Could not save that."); }
  }

  return (
    <div className="like-row">
      <button type="button" className="like-button" aria-pressed={state.on} onClick={toggle}>{label(state.count, state.on)}</button>
      {error && <span className="like-error" role="status">{error}</span>}
    </div>
  );
}
