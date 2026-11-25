import { useEffect, useState } from "react";
import owlMark from "../assets/owl-d.png";
import { BrandMark } from "../components/BrandMark.jsx";
import { ChartPreview } from "../components/ChartPreview.jsx";
import { ScrollRevealBlockEditor } from "../components/ScrollRevealBlockEditor.jsx";
import { StoryViewer } from "../components/StoryViewer.jsx";
import { parseCsv } from "../lib/csv.js";
import { supabase } from "../lib/supabaseClient.js";

const initialBlocks = [{ id: "local-1", type: "text", title: "", body: "" }];

function toEditorBlock(block) {
  return {
    id: block.id,
    type: block.block_type,
    title: block.content?.title ?? "",
    body: block.content?.body ?? "",
    chartType: block.content?.chartType ?? "bar",
    xColumn: block.content?.xColumn ?? "",
    yColumn: block.content?.yColumn ?? "",
    steps: block.content?.steps ?? [],
  };
}

export function CreateStoryPage({ user, onNavigate, preview = false }) {
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState(initialBlocks);
  const [storyId, setStoryId] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(!preview);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("edit");
  const [dirty, setDirty] = useState(false);
  const [allTopics, setAllTopics] = useState([]);
  const [topicIds, setTopicIds] = useState([]);

  useEffect(() => {
    supabase.from("topics").select("id, name").eq("kind", "topic").order("name").then(({ data }) => setAllTopics(data ?? []));
  }, []);

  useEffect(() => {
    if (preview || !user) { setLoading(false); return undefined; }
    let active = true;
    async function loadDraft() {
      const { data: stories, error } = await supabase.from("stories").select("id, title").eq("author_id", user.id).eq("status", "draft").order("updated_at", { ascending: false }).limit(1);
      if (!active) return;
      if (error) { setMessage(`Could not load your draft: ${error.message}`); setLoading(false); return; }
      const draft = stories?.[0];
      if (!draft) { setLoading(false); return; }
      const [{ data: savedBlocks, error: blocksError }, { data: savedDataset }] = await Promise.all([
        supabase.from("story_blocks").select("id, block_type, content, position").eq("story_id", draft.id).order("position", { ascending: true }),
        supabase.from("story_datasets").select("source_filename, columns, processed_data, row_count").eq("story_id", draft.id).maybeSingle(),
      ]);
      if (!active) return;
      setStoryId(draft.id);
      setTitle(draft.title);
      supabase.from("story_topics").select("topic_id").eq("story_id", draft.id).then(({ data }) => active && setTopicIds((data ?? []).map((row) => row.topic_id)));
      if (blocksError) setMessage(`Draft found, but its blocks could not load: ${blocksError.message}`);
      else if (savedBlocks?.length) setBlocks(savedBlocks.map(toEditorBlock));
      if (savedDataset) setDataset({ name: savedDataset.source_filename, rows: savedDataset.processed_data?.rows ?? [], columns: savedDataset.columns ?? [], rowCount: savedDataset.row_count ?? 0 });
      setLoading(false);
    }
    loadDraft();
    return () => { active = false; };
  }, [preview, user?.id]);

  if (!preview && !user) return <main className="story-auth-gate"><img src={owlMark} alt="DataOwls" /><h1>Log in to create a story</h1><p>Your story workspace is available after authentication.</p><button className="story-button" onClick={() => onNavigate("/login")}>Log in</button><button className="text-button" onClick={() => onNavigate("/stories/new/preview")}>View prototype instead</button></main>;

  function addBlock(type) {
    setDirty(true);
    setBlocks((current) => [...current, { id: `local-${Date.now()}`, type, title: "", body: "", chartType: "bar", xColumn: "", yColumn: "", steps: type === "scrollytelling" ? [{ id: `step-${Date.now()}`, text: "", filter: null, highlight: null }] : [] }]);
  }
  function updateBlock(id, field, value) { setDirty(true); setBlocks((current) => current.map((block) => block.id === id ? field === "__replace" ? value : { ...block, [field]: value } : block)); }
  function removeBlock(id) { setDirty(true); setBlocks((current) => current.filter((block) => block.id !== id)); }

  async function chooseDataset(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) { setMessage("Please choose a CSV file."); return; }
    if (file.size > 10 * 1024 * 1024) { setMessage("CSV files must be smaller than 10 MB."); return; }
    try {
      setMessage("Reading CSV...");
      const parsed = parseCsv(await file.text());
      setDirty(true);
      setDataset({ name: file.name, rows: parsed.rows, columns: parsed.columns, rowCount: parsed.rows.length });
      setBlocks((current) => current.map((block) => (block.type === "chart" || block.type === "scrollytelling") && !block.xColumn ? { ...block, xColumn: parsed.columns[0]?.name ?? "", yColumn: parsed.columns.find((column) => column.type === "number")?.name ?? "" } : block));
      setMessage(`${file.name} loaded: ${parsed.rows.length} rows and ${parsed.columns.length} columns.`);
    } catch (error) { setDataset(null); setMessage(error.message); }
  }

  function validateStory() {
    const errors = [];
    if (!title.trim()) errors.push("Add a story title.");
    if (!dataset) errors.push("Choose a dataset.");
    blocks.forEach((block, index) => {
      if ((block.type === "chart" || block.type === "scrollytelling") && (!block.xColumn || !block.yColumn)) errors.push(`Block ${index + 1} needs X and Y columns.`);
      if (block.type === "scrollytelling" && (!block.steps?.length || block.steps.some((step) => !step.text.trim()))) errors.push("Every scroll reveal step needs narrative text.");
    });
    return errors;
  }

  async function saveDraft(event) {
    event?.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) { setMessage("Add a title before saving the draft."); return; }
    if (!preview && !dataset) { setMessage("Choose and parse a CSV before saving this draft."); return; }
    setSaving(true);
    if (preview) { setMessage("Prototype mode: this draft is not being saved."); setSaving(false); return; }
    let savedStoryId = storyId;
    if (savedStoryId) {
      const { error } = await supabase.from("stories").update({ title: trimmedTitle }).eq("id", savedStoryId).eq("author_id", user.id);
      if (error) { setMessage(`Could not save the draft: ${error.message}`); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("stories").insert({ author_id: user.id, title: trimmedTitle, status: "draft" }).select("id").single();
      if (error) { setMessage(`Could not save the draft: ${error.message}`); setSaving(false); return; }
      savedStoryId = data.id;
      setStoryId(savedStoryId);
    }
    const { error: datasetError } = await supabase.from("story_datasets").upsert({ story_id: savedStoryId, source_filename: dataset.name, columns: dataset.columns, processed_data: { rows: dataset.rows }, row_count: dataset.rowCount }, { onConflict: "story_id" });
    if (datasetError) { setMessage(`Story saved, but dataset could not be saved: ${datasetError.message}`); setSaving(false); return; }
    const { error: deleteError } = await supabase.from("story_blocks").delete().eq("story_id", savedStoryId);
    if (deleteError) { setMessage(`Dataset saved, but blocks could not be updated: ${deleteError.message}`); setSaving(false); return; }
    const blockRows = blocks.map((block, position) => ({ story_id: savedStoryId, position, block_type: block.type, content: block.type === "scrollytelling" ? { template: "scroll-reveal-v1", title: block.title, chartType: block.chartType, xColumn: block.xColumn, yColumn: block.yColumn, steps: block.steps } : block.type === "chart" ? { title: block.title, chartType: block.chartType, xColumn: block.xColumn, yColumn: block.yColumn } : { title: block.title, body: block.body } }));
    const { error: blockError } = await supabase.from("story_blocks").insert(blockRows);
    await supabase.from("story_topics").delete().eq("story_id", savedStoryId);
    if (topicIds.length) await supabase.from("story_topics").insert(topicIds.map((topic_id) => ({ story_id: savedStoryId, topic_id })));
    setSaving(false);
    if (!blockError) setDirty(false);
    setMessage(blockError ? `Dataset saved, but blocks could not be updated: ${blockError.message}` : "Draft saved to Supabase.");
  }

  async function publishStory() {
    if (dirty && !preview) { setMessage("Save your latest changes before publishing."); return; }
    const errors = validateStory();
    if (errors.length) { setMessage(errors[0]); return; }
    if (!storyId) { setMessage("Save the draft before publishing it."); return; }
    setSaving(true);
    const { error } = await supabase.from("stories").update({ status: "published", published_at: new Date().toISOString() }).eq("id", storyId).eq("author_id", user.id);
    setSaving(false);
    setMessage(error ? `Could not publish the story: ${error.message}` : "Story published. You can now share its story URL.");
  }

  const numericColumns = dataset?.columns.filter((column) => column.type === "number") ?? [];
  const labelColumns = dataset?.columns.filter((column) => column.type !== "number") ?? [];
  function toggleMode() {
    if (mode === "edit" && dirty && !window.confirm("You have unsaved changes. Preview them without saving?")) return;
    setMode((current) => current === "edit" ? "preview" : "edit");
  }
  if (loading) return <div className="auth-loading">Loading your draft...</div>;
  return <><header className="site-header story-site-header"><div className="site-header__inner"><BrandMark onNavigate={onNavigate} /><nav className="navigation"><a href="/discover" onClick={(event) => { event.preventDefault(); onNavigate("/discover"); }}>Discover</a></nav><div className="auth-acts">{preview && <span className="preview-badge">Prototype preview</span>}{!preview && <button className="story-button" onClick={() => onNavigate("/profile")}>Profile</button>}</div></div></header><main className="story-editor"><header className="story-editor-header"><button className="text-button" onClick={() => onNavigate("/")}>← Back</button><span className="story-editor-label">Story editor</span><div className="story-editor-actions"><button type="button" className="story-mode-button" onClick={toggleMode}>{mode === "edit" ? "Preview" : "Edit"}</button><button className="story-button" onClick={saveDraft} disabled={saving}>{saving ? "Saving..." : preview ? "Test save" : "Save draft"}</button>{!preview && <button type="button" className="story-mode-button" onClick={publishStory} disabled={saving}>Publish</button>}</div></header><section className="story-editor-intro"><p className="story-kicker">{preview ? "PROTOTYPE PREVIEW" : "CREATE A STORY"}</p><h1>Give your data a point of view.</h1><p>Upload a dataset, arrange context and visuals, then publish when the story is ready.</p>{dirty && <p className="preview-badge">Unsaved changes</p>}</section>{mode === "preview" ? <StoryViewer title={title} blocks={blocks} dataset={dataset} /> : <form onSubmit={saveDraft}><label className="editor-field"><span>Story title</span><input value={title} onChange={(event) => { setTitle(event.target.value); setDirty(true); }} placeholder="A clear, memorable title" required /></label>{allTopics.length > 0 && <fieldset className="topic-picker"><legend>Topics</legend>{allTopics.map((topic) => <label key={topic.id}><input type="checkbox" checked={topicIds.includes(topic.id)} onChange={() => { setDirty(true); setTopicIds((current) => current.includes(topic.id) ? current.filter((id) => id !== topic.id) : [...current, topic.id]); }} /> {topic.name}</label>)}</fieldset>}<section className="dataset-panel"><div><p className="story-kicker">DATASET</p><h2>{dataset ? dataset.name : "Start with a CSV"}</h2><p>{dataset ? `${dataset.rowCount} rows · ${dataset.columns.length} columns` : "CSV files up to 10 MB are supported."}</p></div><label className="story-button secondary-button">Choose CSV<input type="file" accept=".csv,text/csv" onChange={chooseDataset} hidden /></label></section>{dataset && <section className="dataset-preview"><div className="block-editor-heading"><div><p className="story-kicker">DATA PREVIEW</p><h2>Detected columns</h2></div><span>{dataset.rowCount} rows</span></div><div className="column-chips">{dataset.columns.map((column) => <span key={column.name}>{column.name} · {column.type}</span>)}</div><div className="preview-table-wrap"><table><thead><tr>{dataset.columns.map((column) => <th key={column.name}>{column.name}</th>)}</tr></thead><tbody>{dataset.rows.slice(0, 6).map((row, index) => <tr key={index}>{dataset.columns.map((column) => <td key={column.name}>{row[column.name]}</td>)}</tr>)}</tbody></table></div></section>}<section className="block-editor"><div className="block-editor-heading"><div><p className="story-kicker">STORY BLOCKS</p><h2>Build the narrative</h2></div><div className="block-actions"><button type="button" onClick={() => addBlock("text")}>+ Text</button><button type="button" onClick={() => addBlock("chart")}>+ Chart</button><button type="button" onClick={() => addBlock("scrollytelling")}>+ Scroll reveal</button></div></div>{blocks.map((block, index) => block.type === "scrollytelling" ? <ScrollRevealBlockEditor key={block.id} block={block} rows={dataset?.rows ?? []} columns={dataset?.columns ?? []} onChange={(next) => updateBlock(block.id, "__replace", next)} onRemove={() => removeBlock(block.id)} canRemove={blocks.length > 1} /> : <article className="story-block" key={block.id}><div className="story-block-top"><span>{index + 1}. {block.type === "text" ? "Text" : "Chart"}</span>{blocks.length > 1 && <button type="button" className="remove-button" onClick={() => removeBlock(block.id)}>Remove</button>}</div>{block.type === "text" ? <><input value={block.title} onChange={(event) => updateBlock(block.id, "title", event.target.value)} placeholder="Section heading" /><textarea value={block.body} onChange={(event) => updateBlock(block.id, "body", event.target.value)} placeholder="Explain what the reader should notice..." rows="4" /></> : <><input value={block.title} onChange={(event) => updateBlock(block.id, "title", event.target.value)} placeholder="Chart title" /><div className="chart-controls"><label>X-axis<select value={block.xColumn} onChange={(event) => updateBlock(block.id, "xColumn", event.target.value)}><option value="">Choose a label column</option>{labelColumns.map((column) => <option key={column.name} value={column.name}>{column.name}</option>)}</select></label><label>Y-axis<select value={block.yColumn} onChange={(event) => updateBlock(block.id, "yColumn", event.target.value)}><option value="">Choose a numeric column</option>{numericColumns.map((column) => <option key={column.name} value={column.name}>{column.name}</option>)}</select></label></div><ChartPreview rows={dataset?.rows ?? []} xColumn={block.xColumn} yColumn={block.yColumn} title={block.title} /></>}</article>)}</section>{message && <p className="editor-message" role="status">{message}</p>}<button className="story-button publish-button" type="submit" disabled={saving}>{saving ? "Saving..." : preview ? "Test save" : "Save story draft"}</button></form>}</main></>;
}
