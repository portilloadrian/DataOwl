import { useEffect, useState } from "react";
import { StoryViewer } from "../components/StoryViewer.jsx";
import { BrandMark } from "../components/BrandMark.jsx";
import { PersistentSiteNav } from "../components/PersistentSiteNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

function mapBlock(block) { return { id: block.id, type: block.block_type, title: block.content?.title ?? "", body: block.content?.body ?? "", chartType: block.content?.chartType ?? "bar", xColumn: block.content?.xColumn ?? "", yColumn: block.content?.yColumn ?? "", steps: block.content?.steps ?? [] }; }

export function StoryViewerPage({ storyId }) {
  const [state, setState] = useState({ loading: true, error: "", story: null, author: null, blocks: [], dataset: null });
  useEffect(() => {
    let active = true;
    async function load() {
      const { data: story, error: storyError } = await supabase
  .from("stories")
  .select("id, title, description, published_at, author_id")
  .eq("id", storyId)
  .eq("status", "published")
  .maybeSingle();
      if (!active) return;
      if (storyError || !story) { setState({ loading: false, error: storyError?.message ?? "This story is not available.", story: null, blocks: [], dataset: null }); return; }
      const { data: author, error: authorError } = await supabase
  .from("profiles")
  .select("username")
  .eq("id", story.author_id)
  .maybeSingle();

if (authorError) {
  console.error("Author lookup failed:", authorError.message);
}
      const [{ data: blocks, error: blocksError }, { data: dataset, error: datasetError }] = await Promise.all([
        supabase.from("story_blocks").select("id, block_type, content, position").eq("story_id", storyId).order("position", { ascending: true }),
        supabase.from("story_datasets").select("source_filename, columns, processed_data, row_count").eq("story_id", storyId).maybeSingle(),
      ]);
      if (!active) return;
      if (blocksError || datasetError) { setState({ loading: false, error: blocksError?.message ?? datasetError?.message ?? "Could not load this story.", story: null, blocks: [], dataset: null }); return; }
      setState({
  loading: false,
  error: "",
  story,
  author,
  blocks: (blocks ?? []).map(mapBlock),
  dataset: dataset ? {
    name: dataset.source_filename,
    columns: dataset.columns ?? [],
    rows: dataset.processed_data?.rows ?? [],
    rowCount: dataset.row_count ?? 0
  } : null
});
    }
    load();
    return () => { active = false; };
  }, [storyId]);
  if (state.loading) return <div className="auth-loading">Loading story...</div>;
  if (state.error) return <main className="story-auth-gate"><h1>Story unavailable</h1><p>{state.error}</p></main>;
  return <><header className="story-reader-header"><BrandMark /><PersistentSiteNav onNavigate={(path) => { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); }} /></header><StoryViewer
  title={state.story.title}
  blocks={state.blocks}
  dataset={state.dataset}
  author={state.author ? { ...state.author, id: state.story.author_id } : null}
/></>;
}
