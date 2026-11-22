import {
  Users,
  UserCheck,
  UserX,
  Clock,
  IndianRupee,
  CalendarDays,
  TrendingUp,
  Wallet,
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import ChartCard from "../components/ChartCard";

// ── Dummy stats ────────────────────────────────────────────────────
const MEMBER_STATS = [
  { title: "Total Members",       value: "248",  icon: Users,       color: "blue",   change: 8.2,  changeLabel: "vs last month" },
  { title: "Active Members",      value: "194",  icon: UserCheck,   color: "green",  change: 5.1,  changeLabel: "vs last month" },
  { title: "Expired Members",     value: "38",   icon: UserX,       color: "red",    change: -2.4, changeLabel: "vs last month" },
  { title: "Expiring in 3 Days",  value: "16",   icon: Clock,       color: "orange", change: 3.0,  changeLabel: "vs last week"  },
];

const EARNING_STATS = [
  { title: "Today's Earnings",       value: "₹4,200",  icon: IndianRupee,  color: "green",  change: 12.5, changeLabel: "vs yesterday"   },
  { title: "Last Month Earnings",    value: "₹68,500", icon: CalendarDays, color: "blue",   change: 7.3,  changeLabel: "vs prev month"  },
  { title: "Last 3 Months Earnings", value: "₹1,94,000",icon: TrendingUp,  color: "purple", change: 15.8, changeLabel: "vs prev quarter"},
  { title: "Total Revenue",          value: "₹8,42,000",icon: Wallet,      color: "orange", change: 22.1, changeLabel: "all time"       },
];

// ── Dummy chart data ───────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const memberGrowthData = {
  labels: MONTHS,
  datasets: [
    {
      label: "Members",
      data: [80, 95, 110, 128, 140, 155, 162, 175, 190, 210, 228, 248],
    },
  ],
};

const revenueData = {
  labels: MONTHS,
  datasets: [
    {
      label: "Revenue (₹)",
      data: [42000, 48000, 53000, 61000, 58000, 67000, 72000, 69000, 74000, 80000, 76000, 84000],
    },
  ],
};

const planDistributionData = {
  labels: ["Monthly", "Quarterly", "Yearly", "Custom"],
  datasets: [
    {
      data: [112, 68, 48, 20],
    },
  ],
};

// ──────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Row 1 — Member Stats */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Member Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {MEMBER_STATS.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))}
        </div>
      </section>

      {/* Row 2 — Earnings Stats */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Earnings</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {EARNING_STATS.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))}
        </div>
      </section>

      {/* Row 3 — Charts */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Analytics</p>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <ChartCard title="Membership Growth"  chartType="line" data={memberGrowthData}    />
          <ChartCard title="Revenue Overview"   chartType="bar"  data={revenueData}          />
          <ChartCard title="Plan Distribution"  chartType="pie"  data={planDistributionData} />
        </div>
      </section>

    </div>
  );
}
