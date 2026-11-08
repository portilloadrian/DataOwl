import { useEffect, useMemo, useRef } from "react";
import homeMarkup from "./content/home.html?raw";
import discoverMarkup from "./content/discover.html?raw";
import loginMarkup from "./content/login.html?raw";
import profileMarkup from "./content/profile.html?raw";
import signupMarkup from "./content/signup.html?raw";
import owlMark from "../assets/owl-d.png";
import uploadIcon from "../assets/upload icon.png";
import logoImage from "../assets/dataowls-logo.jpg";
import pinnedIcon from "../assets/pinned.png";
import collaboratedIcon from "../assets/collaborated.png";
import soloIcon from "../assets/solo.png";
import icon7392195 from "../assets/noun_Owl_7392195.svg";
import icon7417114 from "../assets/noun_Owl_7417114.svg";
import icon7562088 from "../assets/noun_Owl_7562088.svg";
import icon7834524 from "../assets/noun_Owl_7834524.svg";

const markupByPage = {
  home: homeMarkup,
  discover: discoverMarkup,
  login: loginMarkup,
  profile: profileMarkup,
  signup: signupMarkup,
};

function rewriteMarkup(markup, user) {
  const assignedIcon = { "noun_Owl_7392195.svg": icon7392195, "noun_Owl_7417114.svg": icon7417114, "noun_Owl_7562088.svg": icon7562088, "noun_Owl_7834524.svg": icon7834524 }[user?.user_metadata?.icon_key];
  const rewritten = markup
    .replaceAll('src="../assets/owl-d.png"', `src="${owlMark}"`)
    .replaceAll('src="assets/owl-d.png"', `src="${owlMark}"`)
    .replaceAll('src="assets/upload icon.png"', `src="${uploadIcon}"`)
    .replaceAll('src="../assets/dataowls-logo.jpg"', `src="${assignedIcon ?? logoImage}"`)
    .replaceAll('src="assets/dataowls-logo.jpg"', `src="${logoImage}"`)
    .replaceAll('src="../assets/pinned.png"', `src="${pinnedIcon}"`)
    .replaceAll('src="../assets/collaborated.png"', `src="${collaboratedIcon}"`)
    .replaceAll('src="../assets/solo.png"', `src="${soloIcon}"`)
    .replaceAll("../index.html#featured-stories", "/#featured-stories")
    .replaceAll("../index.html", "/")
    .replaceAll("pages/discover.html", "/discover")
    .replaceAll("pages/login.html", "/login")
    .replaceAll("pages/signup.html", "/signup")
    .replaceAll("pages/profile.html", "/profile")
    .replaceAll("discover.html", "/discover")
    .replaceAll("login.html", "/login")
    .replaceAll("signup.html", "/signup")
    .replaceAll("profile.html", "/profile");

  if (user && rewritten.includes('class="auth-acts"')) {
    return rewritten.replace(
      '<div class="auth-acts" aria-label="Account actions">',
      '<div class="auth-acts" aria-label="Account actions"><a class="create-story-link" href="/stories/new">Create a story</a>',
    );
  }
  return rewritten;
}

export function StaticPrototypePage({ page, user, onNavigate }) {
  const markup = useMemo(() => rewriteMarkup(markupByPage[page], user), [page, user]);
  const containerRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("profile-page", page === "profile");
    return () => document.body.classList.remove("profile-page");
  }, [page]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const cleanups = [];
    const search = container.querySelector(".search-combobox");
    const input = container.querySelector(".search-input");
    if (search && input) {
      const open = () => search.classList.add("open");
      const choose = (event) => { input.value = event.currentTarget.querySelector(".query-text")?.textContent ?? ""; search.classList.add("open"); };
      const clear = () => { input.value = ""; input.focus(); };
      input.addEventListener("focus", open);
      container.querySelectorAll(".query-item").forEach((item) => item.addEventListener("click", choose));
      container.querySelector(".clear-btn")?.addEventListener("click", clear);
      cleanups.push(() => { input.removeEventListener("focus", open); container.querySelectorAll(".query-item").forEach((item) => item.removeEventListener("click", choose)); container.querySelector(".clear-btn")?.removeEventListener("click", clear); });
    }
    if (page === "discover") {
      const topics = [...container.querySelectorAll(".topic-list li")];
      const cards = [...container.querySelectorAll(".story-card")];
      const filter = (event) => {
        const topic = event.currentTarget.textContent.trim().toLowerCase();
        topics.forEach((item) => item.classList.toggle("is-selected", item === event.currentTarget));
        cards.forEach((card) => { card.hidden = topic !== "all" && !card.textContent.toLowerCase().includes(topic); });
      };
      topics.forEach((topic) => { topic.setAttribute("role", "button"); topic.tabIndex = 0; topic.addEventListener("click", filter); });
      cleanups.push(() => topics.forEach((topic) => topic.removeEventListener("click", filter)));
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [page, markup]);

  function handleClick(event) {
    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || !href.startsWith("/")) return;

    event.preventDefault();
    onNavigate(href);
  }

  return <div ref={containerRef} onClick={handleClick} dangerouslySetInnerHTML={{ __html: markup }} />;
}
