import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import "./styles/theme.css";
import "./styles/landing.css";
import "./styles/search.css";
import "./styles/auth.css";
import "./styles/discover.css";
import "./styles/story-editor.css";
import "./styles/profile.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
