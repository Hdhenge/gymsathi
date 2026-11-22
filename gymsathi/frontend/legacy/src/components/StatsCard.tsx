import { TrendingUp, TrendingDown } from "lucide-react";

const COLOR_MAP = {
  green:  { bg: "bg-green-50",  icon: "bg-green-100  text-green-600",  text: "text-green-600"  },
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-100   text-blue-600",   text: "text-blue-600"   },
  orange: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-600", text: "text-orange-600" },
  red:    { bg: "bg-red-50",    icon: "bg-red-100    text-red-600",    text: "text-red-600"    },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", text: "text-purple-600" },
  yellow: { bg: "bg-yellow-50", icon: "bg-yellow-100 text-yellow-600", text: "text-yellow-600" },
};

export default function StatsCard({ title, value, icon: Icon, color = "green", change, changeLabel }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.green;
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
          <Icon size={20} />
        </div>
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-gray-800 tracking-tight">{value}</p>

      {/* Change */}
      {change !== undefined && (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className={`flex items-center gap-0.5 ${isPositive ? "text-green-600" : "text-red-500"}`}>
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {isPositive ? "+" : ""}{change}%
          </span>
          {changeLabel && <span className="text-gray-400">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
