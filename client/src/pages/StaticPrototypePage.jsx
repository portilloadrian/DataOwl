import { useEffect, useMemo, useRef } from "react";
import homeMarkup from "./content/home.html?raw";
import { clearRecent, getRecentSearches, recentPeopleCleared, recordSearch } from "../lib/recentSearches.js";
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
import postsIcon from "../assets/posts.png";
import repostsIcon from "../assets/reposts.png";
import savedIcon from "../assets/saved.png";
import icon7392195 from "../assets/noun_Owl_7392195.svg";
import icon7417114 from "../assets/noun_Owl_7417114.svg";
import icon7562088 from "../assets/noun_Owl_7562088.svg";
import icon7834524 from "../assets/noun_Owl_7834524.svg";
import searchMarkup from "./content/search.html?raw";

const markupByPage = {
  home: homeMarkup,
  discover: discoverMarkup,
  login: loginMarkup,
  profile: profileMarkup,
  signup: signupMarkup,
  search: searchMarkup,
};

// The search box lives in home.html; discover/profile reuse it instead of copying it.
const searchBox = homeMarkup.match(/<!-- Search \(moved into the nav\) -->[\s\S]*?(?=\s*<\/nav>)/)[0];

function withSearchBox(markup) {
  return markup
    .replace(/\s*<a href="[^"]*#featured-stories">Explore Stories<\/a>/, "")
    .replace("</nav>", `${searchBox}</nav>`);
}

function rewriteMarkup(rawMarkup, user, page) {
  const markup = page === "discover" || page === "profile" ? withSearchBox(rawMarkup) : rawMarkup;
  const assignedIcon = { "noun_Owl_7392195.svg": icon7392195, "noun_Owl_7417114.svg": icon7417114, "noun_Owl_7562088.svg": icon7562088, "noun_Owl_7834524.svg": icon7834524 }[user?.user_metadata?.icon_key];
  const rewritten = markup
    .replaceAll('src="../assets/owl-d.png"', `src="${owlMark}"`)
    .replaceAll('src="assets/owl-d.png"', `src="${owlMark}"`)
    .replaceAll('src="owl.png"', `src="${assignedIcon ?? owlMark}"`)
    .replaceAll('src="assets/upload icon.png"', `src="${uploadIcon}"`)
    .replaceAll('src="../assets/dataowls-logo.jpg"', `src="${assignedIcon ?? logoImage}"`)
    .replaceAll('src="assets/dataowls-logo.jpg"', `src="${logoImage}"`)
    .replaceAll('src="../assets/pinned.png"', `src="${pinnedIcon}"`)
    .replaceAll('src="pinned.png"', `src="${pinnedIcon}"`)
    .replaceAll('src="../assets/collaborated.png"', `src="${collaboratedIcon}"`)
    .replaceAll('src="collaborated.png"', `src="${collaboratedIcon}"`)
    .replaceAll('src="../assets/solo.png"', `src="${soloIcon}"`)
    .replaceAll('src="solo.png"', `src="${soloIcon}"`)
    .replaceAll('src="../assets/posts.png"', `src="${postsIcon}"`)
    .replaceAll('src="posts.png"', `src="${postsIcon}"`)
    .replaceAll('src="../assets/reposts.png"', `src="${repostsIcon}"`)
    .replaceAll('src="reposts.png"', `src="${repostsIcon}"`)
    .replaceAll('src="../assets/saved.png"', `src="${savedIcon}"`)
    .replaceAll('src="saved.png"', `src="${savedIcon}"`)
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

// Same clock icon the markup used for the old hardcoded history rows.
function clockIcon() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  const attrs = { class: "query-icon clock-icon", viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", "stroke-width": "2" };
  Object.entries(attrs).forEach(([name, value]) => svg.setAttribute(name, value));
  const circle = document.createElementNS(ns, "circle");
  circle.setAttribute("cx", "12");
  circle.setAttribute("cy", "12");
  circle.setAttribute("r", "10");
  const hands = document.createElementNS(ns, "polyline");
  hands.setAttribute("points", "12 6 12 12 16 14");
  svg.append(circle, hands);
  return svg;
}

// Rebuild the "Recent" part of the search dropdown from what is stored:
// the search history list, the sample people row (until cleared), and the
// empty message / Clear all button.
function renderRecent(container) {
  if (recentPeopleCleared()) container.querySelector(".recent-people-row")?.remove();

  const list = container.querySelector(".recent-queries");
  const searches = getRecentSearches();
  list?.replaceChildren(...searches.map((query) => {
    const item = document.createElement("li");
    item.className = "query-item";
    const text = document.createElement("span");
    text.className = "query-text";
    text.textContent = query; // textContent: the query is user input
    item.append(clockIcon(), text);
    return item;
  }));

  const hasRecent = searches.length > 0 || Boolean(container.querySelector(".recent-people-row"));
  container.querySelector(".clear-btn")?.toggleAttribute("hidden", !hasRecent);
  const empty = container.querySelector(".recent-empty");
  if (hasRecent) {
    empty?.remove();
  } else if (!empty) {
    const msg = document.createElement("p");
    msg.className = "recent-empty";
    msg.textContent = "No recent searches";
    container.querySelector(".dropdown-header")?.after(msg);
  }
}

export function StaticPrototypePage({ page, user, onNavigate }) {
  const markup = useMemo(() => rewriteMarkup(markupByPage[page], user, page), [page, user]);
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
      const goSearch = (query) => {
        const q = query.trim();
        if (!q) return;
        recordSearch(q);
        onNavigate(`/search?q=${encodeURIComponent(q)}`);
      };
      const open = () => search.classList.add("open");
      const close = () => search.classList.remove("open");
      // one listener for every row, since the history rows are built at runtime
      const choose = (event) => {
        const item = event.target.closest(".query-item");
        if (item) goSearch(item.querySelector(".query-text")?.textContent ?? "");
      };
      const submit = (event) => {
        if (event.key === "Enter") goSearch(input.value);
        if (event.key === "Escape") { close(); input.blur(); }
      };
      // close when focus leaves the whole search box (click elsewhere, Tab away)
      const onFocusOut = (event) => { if (!search.contains(event.relatedTarget)) close(); };
      // clicking dropdown text/padding shouldn't steal focus, or the dropdown
      // would close before the click on a suggestion lands
      const keepFocus = (event) => { if (!event.target.closest("a, button")) event.preventDefault(); };
      const dropdown = search.querySelector(".search-dropdown");
      const clear = () => {
        clearRecent();
        renderRecent(container);
        input.focus(); // keep the dropdown open
      };
      const clearBtn = container.querySelector(".clear-btn");
      input.addEventListener("focus", open);
      input.addEventListener("keydown", submit);
      search.addEventListener("focusout", onFocusOut);
      dropdown?.addEventListener("mousedown", keepFocus);
      dropdown?.addEventListener("click", choose);
      clearBtn?.addEventListener("click", clear);
      renderRecent(container);
      cleanups.push(() => {
        input.removeEventListener("focus", open);
        input.removeEventListener("keydown", submit);
        search.removeEventListener("focusout", onFocusOut);
        dropdown?.removeEventListener("mousedown", keepFocus);
        dropdown?.removeEventListener("click", choose);
        clearBtn?.removeEventListener("click", clear);
      });
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

    if (page === "search") {
      const q = new URLSearchParams(window.location.search).get("q") ?? "";
      if (input) input.value = q;
      container.querySelectorAll("[data-query]").forEach((el) => { el.textContent = q || "everything"; });
      const tabs = [...container.querySelectorAll(".results-tab")];
      const cards = [...container.querySelectorAll(".result-card")];
      const pick = (event) => {
        const type = event.currentTarget.dataset.type;
        tabs.forEach((tab) => tab.setAttribute("aria-selected", tab === event.currentTarget));
        cards.forEach((card) => { card.hidden = type !== "all" && card.dataset.type !== type; });
      };
      tabs.forEach((tab) => tab.addEventListener("click", pick));
      cleanups.push(() => tabs.forEach((tab) => tab.removeEventListener("click", pick)));
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
