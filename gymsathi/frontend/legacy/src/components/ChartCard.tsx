import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  BarController,
  PieController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

Chart.register(
  LineController,
  BarController,
  PieController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { boxWidth: 12, padding: 16, font: { size: 12 } },
    },
    tooltip: { mode: "index", intersect: false },
  },
};

const LINE_OPTIONS = {
  ...BASE_OPTIONS,
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { grid: { color: "#f3f4f6" }, ticks: { font: { size: 11 } }, beginAtZero: true },
  },
};

const BAR_OPTIONS = {
  ...BASE_OPTIONS,
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { grid: { color: "#f3f4f6" }, ticks: { font: { size: 11 } }, beginAtZero: true },
  },
};

const PIE_OPTIONS = {
  ...BASE_OPTIONS,
  plugins: {
    ...BASE_OPTIONS.plugins,
    tooltip: { mode: "point" },
  },
};

function buildConfig(chartType, data) {
  if (chartType === "line") {
    return {
      type: "line",
      data: {
        labels: data.labels,
        datasets: data.datasets.map((ds) => ({
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 3,
          backgroundColor: `rgba(34,197,94,0.1)`,
          borderColor: "#22c55e",
          ...ds,
        })),
      },
      options: LINE_OPTIONS,
    };
  }

  if (chartType === "bar") {
    const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];
    return {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: data.datasets.map((ds, i) => ({
          borderRadius: 6,
          borderSkipped: false,
          backgroundColor: COLORS[i % COLORS.length],
          ...ds,
        })),
      },
      options: BAR_OPTIONS,
    };
  }

  if (chartType === "pie") {
    const COLORS = ["#22c55e", "#6366f1", "#f59e0b", "#ef4444", "#ec4899"];
    return {
      type: "pie",
      data: {
        labels: data.labels,
        datasets: data.datasets.map((ds) => ({
          backgroundColor: COLORS.slice(0, ds.data.length),
          borderWidth: 0,
          hoverOffset: 6,
          ...ds,
        })),
      },
      options: PIE_OPTIONS,
    };
  }
}

export default function ChartCard({ title, chartType, data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy previous instance
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const config = buildConfig(chartType, data);
    if (config) {
      chartRef.current = new Chart(canvasRef.current, config);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartType, data]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <div className="relative h-56">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
