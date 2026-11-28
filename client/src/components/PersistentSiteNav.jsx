export function PersistentSiteNav({ onNavigate }) {
  function submit(event) {
    if (event.key === "Enter" && event.currentTarget.value.trim()) onNavigate(`/search?q=${encodeURIComponent(event.currentTarget.value.trim())}`);
  }
  return <nav className="persistent-site-nav" aria-label="Site navigation"><a className="tooltip" href="/discover" onClick={(event) => { event.preventDefault(); onNavigate("/discover"); }}>Discover<span className="tooltip-text">Discover Stories</span></a><label className="persistent-search"><span aria-hidden="true">⌕</span><input placeholder="Search datasets, people, or posts..." aria-label="Search" onKeyDown={submit} /></label></nav>;
}
