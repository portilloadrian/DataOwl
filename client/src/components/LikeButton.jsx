import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

function goToLogin() {
  window.history.pushState({}, "", "/login");
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function LikeButton({ storyId }) {
  const [state, setState] = useState({ count: 0, liked: false, userId: null });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;
      const [{ count }, mine] = await Promise.all([
        supabase.from("story_likes").select("*", { count: "exact", head: true }).eq("story_id", storyId),
        userId ? supabase.from("story_likes").select("story_id").eq("story_id", storyId).eq("user_id", userId).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      if (active) setState({ count: count ?? 0, liked: Boolean(mine.data), userId });
    }
    load();
    return () => { active = false; };
  }, [storyId]);

  async function toggle() {
    if (!state.userId) return goToLogin();
    const { count, liked, userId } = state;
    setError("");
    setState({ count: count + (liked ? -1 : 1), liked: !liked, userId }); // optimistic
    const query = supabase.from("story_likes");
    const { error: failed } = liked
      ? await query.delete().eq("story_id", storyId).eq("user_id", userId)
      : await query.insert({ story_id: storyId, user_id: userId });
    if (failed) { setState({ count, liked, userId }); setError("Could not save your like."); }
  }

  return (
    <div className="like-row">
      <button type="button" className="like-button" aria-pressed={state.liked} onClick={toggle}>
        <span aria-hidden="true">{state.liked ? "♥" : "♡"}</span> {state.count} {state.count === 1 ? "like" : "likes"}
      </button>
      {error && <span className="like-error" role="status">{error}</span>}
    </div>
  );
}
