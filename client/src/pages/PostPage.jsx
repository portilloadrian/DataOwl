import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { StaticPrototypePage } from "./StaticPrototypePage.jsx";
import { LikeButton } from "../components/LikeButton.jsx";
import { getPost } from "../lib/samplePosts.js";

export function PostPage({ id, user, onNavigate }) {
  const post = getPost(id);
  const [likeRoot, setLikeRoot] = useState(null);

  // The page body is injected HTML (post.html), so fill in the text and find the
  // like-button slot after it mounts. Re-runs if the markup is rebuilt (user changes).
  useEffect(() => {
    const fill = (key, text) => {
      const el = document.querySelector(`[data-post="${key}"]`);
      if (el) el.textContent = text;
    };
    fill("title", post?.title ?? "Post not found");
    fill("author", post?.author ?? "");
    fill("views", post ? post.views.toLocaleString() : "");
    document.querySelector(".post-views")?.toggleAttribute("hidden", !post);
    setLikeRoot(post ? document.getElementById("like-root") : null);
  }, [post, user]);

  return (
    <>
      <StaticPrototypePage page="post" user={user} onNavigate={onNavigate} />
      {likeRoot && createPortal(<LikeButton key={id} postId={id} initialLikes={post.likes} />, likeRoot)}
    </>
  );
}
