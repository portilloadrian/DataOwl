import { useState } from "react";

const storageKey = (postId) => `dataowls-liked-${postId}`;

function readLiked(postId) {
  try {
    return localStorage.getItem(storageKey(postId)) === "1";
  } catch {
    return false;
  }
}

// Like state lives in this browser (localStorage) until likes are saved to the
// story_likes table. The count is the post's base likes plus this user's own like.
export function LikeButton({ postId, initialLikes = 0 }) {
  const [liked, setLiked] = useState(() => readLiked(postId));
  const likes = initialLikes + (liked ? 1 : 0);

  function toggle() {
    const next = !liked;
    setLiked(next);
    try {
      if (next) localStorage.setItem(storageKey(postId), "1");
      else localStorage.removeItem(storageKey(postId));
    } catch { /* storage blocked: the like just won't survive a refresh */ }
  }

  return (
    <button type="button" className="like-button" aria-pressed={liked} onClick={toggle}>
      <span aria-hidden="true">{liked ? "♥" : "♡"}</span> {likes} {likes === 1 ? "like" : "likes"}
    </button>
  );
}
