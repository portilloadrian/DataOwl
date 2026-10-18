import { useState } from 'react';

export default function LikeButton({ initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  function toggle() {
    setLikes(liked ? likes - 1 : likes + 1);
    setLiked(!liked);
  }

  return (
    <button type="button" className="like-button" aria-pressed={liked} onClick={toggle}>
      {liked ? '♥' : '♡'} {likes} likes
    </button>
  );
}
