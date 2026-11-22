import { useEffect, useRef, useState } from "react";
import { ChartPreview } from "./ChartPreview.jsx";

function rowsForStep(rows, step) {
  if (!step?.filter?.column || !step.filter.value) return rows;
  return rows.filter((row) => String(row[step.filter.column]) === String(step.filter.value));
}

export function ScrollRevealViewer({ rows, block }) {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef([]);
  const steps = block.steps?.length ? block.steps : [{ id: "empty-step", text: "Add a narrative step to begin.", filter: null }];

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveStep(Number(visible.target.dataset.step));
    }, { threshold: [0.35, 0.65], rootMargin: "-15% 0px -45%" });
    stepRefs.current.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, [steps.length]);

  const step = steps[activeStep] ?? steps[0];
  return <section className="scroll-reveal-preview" aria-label="Scroll reveal story">
    <div className="scroll-reveal-steps">{steps.map((item, index) => <article className={`scroll-reveal-step${index === activeStep ? " is-active" : ""}`} data-step={index} ref={(element) => { stepRefs.current[index] = element; }} key={item.id}>
      <span className="scroll-reveal-step-number">{String(index + 1).padStart(2, "0")}</span>
      <p>{item.text || "Write what the reader should notice in this step."}</p>
    </article>)}</div>
    <div className="scroll-reveal-visual"><div className="scroll-reveal-visual-inner"><ChartPreview rows={rowsForStep(rows, step)} xColumn={block.xColumn} yColumn={block.yColumn} chartType={block.chartType} title={step.title || block.title || "Scroll reveal chart"} highlightedValue={step.highlight?.value} /></div></div>
  </section>;
}

export const ScrollRevealPreview = ScrollRevealViewer;
