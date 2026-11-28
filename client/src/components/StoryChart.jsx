
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StoryChart({ chartConfig, rows, preview = false }) {
  if (!chartConfig || !rows || rows.length === 0) {
    return <p>No chart data available.</p>;
  }

  const { title, xColumn, yColumn, chartType } = chartConfig;

  const chartData = rows.map((row) => ({
    name: row[xColumn],
    value: Number(row[yColumn]),
  }));

  return (
    <div style={{ width: "100%" }}>
      <h3>{title}</h3>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              {!preview && <Tooltip />}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              {!preview && <Tooltip />}
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
