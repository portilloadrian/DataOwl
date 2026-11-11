import { useEffect, useState } from "react";
import { AuthPage } from "../pages/AuthPage.jsx";
import { CreateStoryPage } from "../pages/CreateStoryPage.jsx";
import { PostPage } from "../pages/PostPage.jsx";
import { StaticPrototypePage } from "../pages/StaticPrototypePage.jsx";
import { supabase } from "../lib/supabaseClient.js";

function getPath() {
  return window.location.pathname.replace(/\/$/, "") || "/";
}

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function App() {
  const [path, setPath] = useState(getPath);
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

  function handleNavigate(nextPath) {
    if (nextPath !== path) navigate(nextPath);
  }

  if (authLoading) return <div className="auth-loading">Loading DataOwls...</div>;

  const postMatch = path.match(/^\/post\/([\w-]+)$/);
  let page;
  switch (postMatch ? "/post" : path) {
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
    case "/post":
      page = <PostPage id={postMatch[1]} user={user} onNavigate={handleNavigate} />;
      break;
    case "/profile":
      page = <StaticPrototypePage page="profile" user={user} onNavigate={handleNavigate} />;
      break;
    default:
      page = <StaticPrototypePage page="home" user={user} onNavigate={handleNavigate} />;
  }

  return page;
}
