import { useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "../lib/supabaseClient.js";
import StoryChart from "../components/StoryChart";
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
const recentlyViewedKey = "dataowls-recently-viewed";
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
  const items = readList(recentlyViewedKey);
  if (!items.length) {
    const empty = document.createElement("li");
    empty.className = "history-empty";
    empty.textContent = "Stories you open will appear here.";
    list.append(empty);
    return;
  }
  items.slice(0, 5).forEach((item) => {
    const row = document.createElement("li");
    const title = document.createElement("span");
    title.className = "history-post";
    title.textContent = item.title;
    const user = document.createElement("span");
    user.className = "history-user";
    user.textContent = item.user;
    row.append(title, user);
    list.append(row);
  });
}

export function StaticPrototypePage({ page, user, profileId, onNavigate }) {
  const markup = useMemo(() => rewriteMarkup(markupByPage[page], user), [page, user]);
  const containerRef = useRef(null);

    
useEffect(() => {
  if (page !== "home") return;

let chartRoot = null;
let featuredPost = null;
let openFeaturedStory = null;
let cancelled = false;

  async function loadFeaturedStory() {
    const { data: stories, error: storyError } = await supabase
      .from("stories")
      .select("id, title, status, author_id, view_count")
      .eq("status", "published")
      .eq("id", "27264d1f-56eb-45e8-b25a-99ca6540a54c")
      .limit(1);

    if (storyError) {
      console.error("Story lookup failed:", storyError.message);
      return;
    }

    if (!stories?.length || cancelled) return;

    const story = stories[0];

    const { count: likeCount, error: likesError } = await supabase
  .from("story_likes")
  .select("*", { count: "exact", head: true })
  .eq("story_id", story.id);

if (likesError) {
  console.error("Likes lookup failed:", likesError.message);
}

    const { data: blocks, error: blocksError } = await supabase
      .from("story_blocks")
      .select("id, story_id, position, block_type, content")
      .eq("story_id", story.id)
      .order("position");

    if (blocksError) {
      console.error("Story blocks lookup failed:", blocksError.message);
      return;
    }

    const chartBlock = blocks?.find(
      (block) => block.block_type === "chart"
    );

    if (!chartBlock) {
      console.error("No chart block found for this story.");
      return;
    }

    const { data: datasets, error: datasetsError } = await supabase
      .from("story_datasets")
      .select("id, story_id, source_filename, processed_data")
      .eq("story_id", story.id);

    if (datasetsError) {
      console.error("Dataset lookup failed:", datasetsError.message);
      return;
    }

    const rows = datasets?.[0]?.processed_data?.rows;

    if (!rows?.length || cancelled) {
      console.error("No dataset rows found.");
      return;
    }

    const firstPost = containerRef.current?.querySelector(
      "#featured-stories .post"
    );

    const viewCountElement = firstPost?.querySelector("#featured-view-count");
const likeCountElement = firstPost?.querySelector("#featured-like-count");

if (viewCountElement) {
  viewCountElement.textContent = (story.view_count ?? 0).toLocaleString();
}

if (likeCountElement) {
  likeCountElement.textContent = (likeCount ?? 0).toLocaleString();
}

    if (!firstPost) return;

    featuredPost = firstPost;
firstPost.style.cursor = "pointer";

openFeaturedStory = async (event) => {
  if (event.target.closest("button, a, .username")) return;

  const { error } = await supabase.rpc(
    "increment_story_view",
    { story_uuid: story.id }
  );

  if (error) {
    console.error("View count update failed:", error.message);
    return;
  }

  onNavigate(`/stories/${story.id}`);
};

firstPost.addEventListener("click", openFeaturedStory);

    const usernameElement = firstPost.querySelector(".username");
    const titleElement = firstPost.querySelector(".post-title");
    const chartElement = firstPost.querySelector("#car-price-chart");

    if (titleElement) {
      titleElement.textContent = story.title;
    }

   if (usernameElement) {
  const { data: author, error: authorError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", story.author_id)
    .single();

  if (!authorError && author) {
    const authorLink = document.createElement("a");
    authorLink.className = usernameElement.className;
    authorLink.href = `/profile/${story.author_id}`;
    authorLink.textContent = author.username;

    usernameElement.replaceWith(authorLink);
  }
}

    if (chartElement && !cancelled) {
      chartRoot = createRoot(chartElement);

      chartRoot.render(
        <StoryChart
          chartConfig={chartBlock.content}
          rows={rows}
        />
      );
    }

    console.log("Featured story chart loaded successfully!");
  }

  loadFeaturedStory();

return () => {
  cancelled = true;

  if (featuredPost && openFeaturedStory) {
    featuredPost.removeEventListener("click", openFeaturedStory);
  }

  chartRoot?.unmount();
};
}, [page]);

useEffect(() => {
  if (page !== "profile") return;

  let cancelled = false;

  async function loadProfile() {
    const targetProfileId = profileId ?? user?.id;

    if (!targetProfileId) return;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", targetProfileId)
      .single();

    if (cancelled) return;

    if (error) {
      console.error("Profile lookup failed:", error.message);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const usernameElement = container.querySelector(".profile-username");
    const editButton = container.querySelector(".profile-info button");

    if (usernameElement) {
      usernameElement.textContent = profile.username;
    }

    if (editButton) {
      editButton.hidden = !user || user.id !== targetProfileId;
    }
  }

  loadProfile();

  return () => {
    cancelled = true;
  };
}, [page, profileId, user]);

useEffect(() => {
  document.body.classList.toggle("profile-page", page === "profile");
  return () => document.body.classList.remove("profile-page");
}, [page]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return undefined;
    const cleanups = [];

    // Profile Picture Dropdown
    const owlSelection = container.querySelector("#owl-selection");
    const profilePic = container.querySelector("#profilePic");

    // Available owl images
    const owlImages = {
        owl1: icon7392195,
        owl2: icon7417114,
        owl3: icon7562088,
        owl4: icon7834524,
        owl5: owlMark
    };

    // Handle dropdown selection
    const handleOwlChange = (event) => {
        const selectedOwl = event.target.value;

        if (owlImages[selectedOwl] && profilePic) {
            profilePic.src = owlImages[selectedOwl];
        }
    };

    // Listen for dropdown changes
    owlSelection?.addEventListener("change", handleOwlChange);

    // Cleanup event listener
    cleanups.push(() => {
        owlSelection?.removeEventListener("change", handleOwlChange);
    });

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

    const recordViewed = (event) => {
      const item = event.target.closest(".post, .story-card");
      if (!item) return;
      const title = item.querySelector(".post-title, .story-card__title")?.textContent.trim();
      if (!title) return;
      const username = item.querySelector(".username, .creator")?.textContent.trim() ?? "DataOwls";
      const next = [{ title, user: username }, ...readList(recentlyViewedKey).filter((entry) => entry.title !== title)].slice(0, 5);
      localStorage.setItem(recentlyViewedKey, JSON.stringify(next));
      applyRecentlyViewed(container);
    };
    container.addEventListener("click", recordViewed);
    cleanups.push(() => container.removeEventListener("click", recordViewed));

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
