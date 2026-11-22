import { useState } from "react";

function shortLabel(value) { return String(value).length > 12 ? `${String(value).slice(0, 11)}…` : String(value); }

function compatiblePoints(rows, xColumn, yColumn) {
  return rows.map((row) => ({ label: row[xColumn], value: Number(row[yColumn]) })).filter((point) => point.label !== "" && Number.isFinite(point.value)).slice(0, 24);
}

function TableChart({ points }) {
  return <div className="chart-data-table"><table><thead><tr><th>Label</th><th>Value</th></tr></thead><tbody>{points.map((point, index) => <tr key={`${point.label}-${index}`}><td>{point.label}</td><td>{point.value}</td></tr>)}</tbody></table></div>;
}

function PieChart({ points }) {
  const positive = points.map((point) => ({ ...point, value: Math.max(point.value, 0) })).filter((point) => point.value > 0).slice(0, 8);
  const total = positive.reduce((sum, point) => sum + point.value, 0);
  let offset = 0;
  const colors = ["#E8755F", "#6F8FA3", "#D6A64F", "#8AB7A2", "#A985B8", "#D18C5E", "#5E9CA8", "#B7A15A"];
  if (!total) return <div className="chart-preview-empty">Pie charts need positive numeric values.</div>;
  const stops = positive.map((point, index) => { const start = offset; offset += (point.value / total) * 100; return `${colors[index % colors.length]} ${start}% ${offset}%`; }).join(", ");
  return <div className="pie-chart-layout"><div className="pie-chart" style={{ background: `conic-gradient(${stops})` }} aria-label="Pie chart" role="img"></div><ul className="pie-legend">{positive.map((point, index) => <li key={`${point.label}-${index}`}><i style={{ background: colors[index % colors.length] }}></i><span>{point.label}</span><strong>{point.value}</strong></li>)}</ul></div>;
}

export function ChartPreview({ rows, xColumn, yColumn, title, highlightedValue, chartType = "bar" }) {
  const [focusedLabel, setFocusedLabel] = useState(null);
  const points = compatiblePoints(rows, xColumn, yColumn);
  if (!points.length) return <div className="chart-preview-empty">Choose compatible columns to preview this visualization.</div>;
  if (chartType === "table") return <div className="chart-preview"><strong>{title || "Table preview"}</strong><TableChart points={points} /></div>;
  if (chartType === "pie") return <div className="chart-preview"><strong>{title || "Pie chart preview"}</strong><PieChart points={points} /></div>;
  const min = Math.min(...points.map((point) => point.value), 0);
  const max = Math.max(...points.map((point) => point.value), 0);
  const range = max - min || 1;
  const zeroY = 18 + ((max / range) * 120);
  const barWidth = 260 / points.length;
  const activeLabel = focusedLabel ?? highlightedValue;
  return <div className="chart-preview"><strong>{title || "Bar chart preview"}</strong><div className="chart-preview-canvas"><svg viewBox="0 0 320 180" role="img" aria-label={title || "Bar chart preview"}><line x1="30" y1={zeroY} x2="310" y2={zeroY} stroke="currentColor" opacity=".35" />{points.map((point, index) => { const height = Math.max((Math.abs(point.value) / range) * 120, 2); const x = 35 + index * barWidth; const y = point.value >= 0 ? zeroY - height : zeroY; const active = activeLabel === String(point.label); return <g key={`${point.label}-${index}`}><rect className={`chart-bar-rect${active ? " is-highlighted" : ""}`} tabIndex="0" role="img" aria-label={`${point.label}: ${point.value}`} onMouseEnter={() => setFocusedLabel(String(point.label))} onMouseLeave={() => setFocusedLabel(null)} onFocus={() => setFocusedLabel(String(point.label))} onBlur={() => setFocusedLabel(null)} x={x} y={y} width={Math.max(barWidth - 5, 4)} height={height} rx="2" fill="var(--primary-color)" /><text x={x + Math.max(barWidth - 5, 4) / 2} y="170" textAnchor="middle" fontSize="8" fill="currentColor">{shortLabel(point.label)}</text>{active && <text x={x + Math.max(barWidth - 5, 4) / 2} y={Math.max(y - 5, 10)} textAnchor="middle" fontSize="9" fill="currentColor">{point.value}</text>}</g>; })}</svg>{focusedLabel && <span className="chart-tooltip" role="status">{focusedLabel}: {points.find((point) => String(point.label) === focusedLabel)?.value}</span>}</div>{points.length >= 24 && <small className="chart-limit-note">Showing the first 24 compatible rows.</small>}</div>;
}
