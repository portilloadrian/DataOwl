import { useEffect, useMemo, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { getRecentlyViewed, recordViewed } from "../lib/recentlyViewed.js";
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
import postsIcon from "../assets/posts.png";
import repostsIcon from "../assets/reposts.png";
import savedIcon from "../assets/saved.png";
import icon7392195 from "../assets/noun_Owl_7392195.svg";
import icon7417114 from "../assets/noun_Owl_7417114.svg";
import icon7562088 from "../assets/noun_Owl_7562088.svg";
import icon7834524 from "../assets/noun_Owl_7834524.svg";
import searchMarkup from "./content/search.html?raw";
import food1 from "../assets/food-1.jfif";
import food2 from "../assets/food-2.jfif";
import food3 from "../assets/food-3.jfif";
import food4 from "../assets/food-4.jfif";

const markupByPage = {
  home: homeMarkup,
  discover: discoverMarkup,
  login: loginMarkup,
  profile: profileMarkup,
  signup: signupMarkup,
  search: searchMarkup,
};

const recentSearchesKey = "dataowls-recent-searches";
const persistentSearchMarkup = `<div class="search-combobox" id="searchCombobox"><div class="search-input-wrapper"><svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input type="text" class="search-input" placeholder="Search datasets, people, or posts..." aria-label="Search" aria-expanded="false" aria-controls="searchDropdown" /></div><div class="search-dropdown" id="searchDropdown" role="listbox"><div class="dropdown-header"><span class="header-title">Recent</span><button type="button" class="clear-btn">Clear all</button></div><div class="recent-people-row"></div><ul class="query-list recent-queries"></ul><div class="dropdown-header section-divider"><span class="header-title">Try searching for</span></div><ul class="query-list suggested-queries"><li class="query-item"><span class="query-text">usa gdp 2024</span></li><li class="query-item"><span class="query-text">climate trends dataset</span></li><li class="query-item"><span class="query-text">college tuition over time</span></li><li class="query-item"><span class="query-text">favorite foods survey</span></li></ul></div></div>`;

function rewriteMarkup(markup, user) {
  const assignedIcon = { "noun_Owl_7392195.svg": icon7392195, "noun_Owl_7417114.svg": icon7417114, "noun_Owl_7562088.svg": icon7562088, "noun_Owl_7834524.svg": icon7834524 }[user?.user_metadata?.icon_key];
  let rewritten = markup
    .replaceAll('src="../assets/owl-d.png"', `src="${owlMark}"`)
    .replaceAll('src="assets/owl-d.png"', `src="${owlMark}"`)
    .replaceAll('src="owl.png"', `src="${assignedIcon ?? owlMark}"`)
    .replaceAll('src="assets/upload icon.png"', `src="${uploadIcon}"`)
    .replaceAll('src="assets/food-1.jfif"', `src="${food1}"`)
    .replaceAll('src="assets/food-2.jfif"', `src="${food2}"`)
    .replaceAll('src="assets/food-3.jfif"', `src="${food3}"`)
    .replaceAll('src="assets/food-4.jfif"', `src="${food4}"`)
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

  if (!rewritten.includes("search-combobox")) rewritten = rewritten.replace("</nav>", `${persistentSearchMarkup}</nav>`);

  if (user && rewritten.includes('class="auth-acts"')) {
    rewritten = rewritten.replace(/<a class="login-button"[\s\S]*?<\/a>\s*<a class="signup-button"[\s\S]*?<\/a>/, '<button class="signout-button" type="button">Sign out</button>');
    rewritten = rewritten.replace("</nav>", '<a class="create-story-link" href="/stories/new" aria-label="Create a story" title="Create a story">+</a></nav>');
  }
  return rewritten;
}

const CLEARED_KEY = "dataowls-recent-cleared";

// "Clear all": remove recent people + history, keep the suggestions.
function clearRecent(container) {
  container.querySelector(".recent-people-row")?.remove();
  container.querySelector(".recent-queries")?.remove();
  container.querySelector(".clear-btn")?.remove();
  if (!container.querySelector(".recent-empty")) {
    const msg = document.createElement("p");
    msg.className = "recent-empty";
    msg.textContent = "No recent searches";
    container.querySelector(".dropdown-header")?.after(msg);
  }
}

function readList(key) {
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
}

function applySearchHistory(container) {
  container.querySelector(".recent-people-row")?.replaceChildren();
  const list = container.querySelector(".recent-queries");
  if (!list) return;
  list.replaceChildren();
  readList(recentSearchesKey).slice(0, 5).forEach((query) => {
    const item = document.createElement("li");
    item.className = "query-item";
    const text = document.createElement("span");
    text.className = "query-text";
    text.textContent = query;
    item.append(text);
    list.append(item);
  });
}

function applyRecentlyViewed(container) {
  const list = container.querySelector(".history-list");
  if (!list) return;
  list.replaceChildren();
  const items = getRecentlyViewed();
  if (!items.length) {
    const empty = document.createElement("li");
    empty.className = "history-empty";
    empty.textContent = "Stories you open will appear here.";
    list.append(empty);
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("li");
    const link = document.createElement("a");
    // real stories have an id; sample cards just point back at the featured list
    link.href = item.id ? `/stories/${encodeURIComponent(item.id)}` : "/#featured-stories";
    const title = document.createElement("span");
    title.className = "history-post";
    title.textContent = item.title;
    link.append(title);
    if (item.user) {
      const user = document.createElement("span");
      user.className = "history-user";
      user.textContent = item.user;
      link.append(user);
    }
    row.append(link);
    list.append(row);
  });
}

// Published stories for Discover (rendered with textContent: titles are user input).
async function loadPublishedStories() {
  const { data, error } = await supabase.from("stories").select("id, title, description, story_topics(topics(name))").eq("status", "published").order("published_at", { ascending: false }).limit(12);
  return error ? [] : data ?? [];
}

function storyCard(story) {
  const names = (story.story_topics ?? []).map((row) => row.topics?.name).filter(Boolean);
  const link = document.createElement("a");
  link.href = `/stories/${story.id}`;
  link.className = "story-card story-card--link";
  link.dataset.topics = names.map((name) => name.toLowerCase()).join(",");
  const body = document.createElement("div");
  body.className = "story-card__body";
  const category = document.createElement("span");
  category.className = "story-category";
  category.textContent = (names[0] ?? "Story").toUpperCase();
  const title = document.createElement("h3");
  title.textContent = story.title;
  const summary = document.createElement("p");
  summary.className = "story-summary";
  summary.textContent = story.description ?? "";
  body.append(category, title, summary);
  link.append(body);
  return link;
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

    applyRecentlyViewed(container);
    applySearchHistory(container);

    if (search && input) {
      const goSearch = (query) => {
        const q = query.trim();
        if (q) {
          const next = [q, ...readList(recentSearchesKey).filter((item) => item !== q)].slice(0, 5);
          localStorage.setItem(recentSearchesKey, JSON.stringify(next));
          onNavigate(`/search?q=${encodeURIComponent(q)}`);
        }
      };
      const open = () => search.classList.add("open");
      const close = () => search.classList.remove("open");
      const choose = (event) => goSearch(event.currentTarget.querySelector(".query-text")?.textContent ?? "");
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
        clearRecent(container);
        input.focus();
        localStorage.setItem(CLEARED_KEY, "1");
      };
      const clearBtn = container.querySelector(".clear-btn");
      input.addEventListener("focus", open);
      input.addEventListener("keydown", submit);
      search.addEventListener("focusout", onFocusOut);
      dropdown?.addEventListener("mousedown", keepFocus);
      container.querySelectorAll(".query-item").forEach((item) => item.addEventListener("click", choose));
      clearBtn?.addEventListener("click", clear);
      if (localStorage.getItem(CLEARED_KEY)) clearRecent(container);
      cleanups.push(() => {
        input.removeEventListener("focus", open);
        input.removeEventListener("keydown", submit);
        search.removeEventListener("focusout", onFocusOut);
        dropdown?.removeEventListener("mousedown", keepFocus);
        container.querySelectorAll(".query-item").forEach((item) => item.removeEventListener("click", choose));
        clearBtn?.removeEventListener("click", clear);
      });
    }

    const recordClick = (event) => {
      const item = event.target.closest(".post, .story-card");
      // real story cards are recorded by the story viewer, which knows the id
      if (!item || item.matches(".story-card--link")) return;
      const title = item.querySelector(".post-title, .story-card__title, h3")?.textContent.trim();
      if (!title) return;
      const username = item.querySelector(".username, .creator")?.lastChild?.textContent.trim() || "DataOwls";
      recordViewed({ title, user: username });
      applyRecentlyViewed(container);
    };
    container.addEventListener("click", recordClick);
    cleanups.push(() => container.removeEventListener("click", recordClick));

    const signout = container.querySelector(".signout-button");
    const signOut = () => supabase.auth.signOut();
    signout?.addEventListener("click", signOut);
    cleanups.push(() => signout?.removeEventListener("click", signOut));

    const uploadContent = container.querySelector(".upload-content");
    const openStoryEditor = (event) => { event.preventDefault(); onNavigate("/stories/new"); };
    uploadContent?.addEventListener("click", openStoryEditor);
    cleanups.push(() => uploadContent?.removeEventListener("click", openStoryEditor));

    if (page === "discover") {
      const topics = [...container.querySelectorAll(".topic-list li")];
      // sample cards match on their text; real stories carry data-topics from story_topics
      const matches = (card, topic) => card.dataset.topics !== undefined ? card.dataset.topics.split(",").includes(topic) : card.textContent.toLowerCase().includes(topic);
      const filter = (event) => {
        const topic = event.currentTarget.textContent.trim().toLowerCase();
        topics.forEach((item) => item.classList.toggle("is-selected", item === event.currentTarget));
        container.querySelectorAll(".story-card").forEach((card) => { card.hidden = topic !== "all" && !matches(card, topic); });
      };
      topics.forEach((topic) => { topic.setAttribute("role", "button"); topic.tabIndex = 0; topic.addEventListener("click", filter); });
      cleanups.push(() => topics.forEach((topic) => topic.removeEventListener("click", filter)));

      let active = true;
      loadPublishedStories().then((stories) => {
        const grid = container.querySelector(".story-grid");
        if (active && grid) grid.prepend(...stories.map(storyCard));
      });
      cleanups.push(() => { active = false; });
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
