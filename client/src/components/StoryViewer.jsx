
import { ChartPreview } from "./ChartPreview.jsx";
import { ScrollRevealViewer } from "./ScrollRevealPreview.jsx";

export function StoryViewer({ title, blocks, dataset, author }) {
  return (
    <main className="story-viewer">
      <header className="story-viewer-intro">
        <p className="story-kicker">DATA STORY</p>
        <h1>{title || "Untitled story"}</h1>

        {author?.username && (
          <p className="story-author">
            By{" "}
            <a href={`/profile/${author.id}`}>
              {author.username}
            </a>
          </p>
        )}
      </header>

      <div className="story-viewer-blocks">
        {blocks.map((block) => (
          <section className="story-viewer-block" key={block.id}>
            {block.type === "text" && (
              <>
                <h2>{block.title}</h2>
                <p>{block.body}</p>
              </>
            )}

            {block.type === "chart" && (
              <ChartPreview
                rows={dataset?.rows ?? []}
                xColumn={block.xColumn}
                yColumn={block.yColumn}
                chartType={block.chartType}
                title={block.title}
              />
            )}

            {block.type === "scrollytelling" && (
              <ScrollRevealViewer
                rows={dataset?.rows ?? []}
                block={block}
              />
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
