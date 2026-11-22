import { useEffect, useState } from "react";
import { AuthPage } from "../pages/AuthPage.jsx";
import { CreateStoryPage } from "../pages/CreateStoryPage.jsx";
import { StaticPrototypePage } from "../pages/StaticPrototypePage.jsx";
import { StoryViewerPage } from "../pages/StoryViewerPage.jsx";
import { supabase } from "../lib/supabaseClient.js";

function getPath() {
  return (window.location.pathname.replace(/\/$/, "") || "/") + window.location.search;
}

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function App() {
  const [fullPath, setPath] = useState(getPath);
  const path = fullPath.split("?")[0];
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setUser(data.session?.user ?? null); setAuthLoading(false); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const handlePopState = () => setPath(getPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!authLoading && path === "/profile" && !user) navigate("/login");
  }, [authLoading, path, user]);

  function handleNavigate(nextPath) {
    if (nextPath !== fullPath) navigate(nextPath);
  }

  if (authLoading) return <div className="auth-loading">Loading DataOwls...</div>;

  let page;
  switch (path) {
    case "/":
      page = <StaticPrototypePage page="home" user={user} onNavigate={handleNavigate} />;
      break;
    case "/discover":
      page = <StaticPrototypePage page="discover" user={user} onNavigate={handleNavigate} />;
      break;
    case "/login":
      page = <AuthPage mode="login" onNavigate={handleNavigate} />;
      break;
    case "/signup":
      page = <AuthPage mode="signup" onNavigate={handleNavigate} />;
      break;
    case "/stories/new":
      page = <CreateStoryPage user={user} onNavigate={handleNavigate} />;
      break;
    case "/stories/new/preview":
      page = <CreateStoryPage preview onNavigate={handleNavigate} />;
      break;
    case "/profile":
      page = user
        ? <StaticPrototypePage page="profile" user={user} onNavigate={handleNavigate} />
        : <AuthPage mode="login" onNavigate={handleNavigate} />;
      break;
    case "/search":
      page = <StaticPrototypePage key={fullPath} page="search" user={user} onNavigate={handleNavigate} />;
      break;
    default:
      page = path.startsWith("/stories/")
        ? <StoryViewerPage storyId={path.split("/")[2]} />
        : <StaticPrototypePage page="home" user={user} onNavigate={handleNavigate} />;
  }

  return page;
}
