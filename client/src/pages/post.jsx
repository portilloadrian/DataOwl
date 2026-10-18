import { createRoot } from 'react-dom/client';
import LikeButton from '../app/LikeButton.jsx';

createRoot(document.getElementById('like-root')).render(<LikeButton initialLikes={32} />);
