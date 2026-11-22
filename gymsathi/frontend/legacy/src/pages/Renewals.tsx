import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, RefreshCw, CircleDollarSign } from "lucide-react";
import { fetchMembers } from "../store/membersSlice";
import { getDerivedStatus } from "../components/MemberCard";

const STATUS_STYLES = {
  expiring: "bg-amber-100 text-amber-700",
  expired: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  expiring: "Expiring Soon",
  expired: "Expired",
};

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRemainingAmount(member) {
  const totalFees = Number(member?.totalFees || 0);
  const paidFees = Number(member?.paidAmount ?? member?.paidFees ?? 0);
  const explicitRemaining = Number(member?.remainingAmount ?? member?.balanceFees);

  if (Number.isFinite(explicitRemaining)) return Math.max(0, explicitRemaining);
  return Math.max(0, totalFees - paidFees);
}

function getDaysLabel(daysLeft) {
  if (daysLeft >= 0) {
    return `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;
  }
  const abs = Math.abs(daysLeft);
  return `${abs} day${abs !== 1 ? "s" : ""} overdue`;
}

export default function Renewals() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.members);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  const members = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  const renewalMembers = useMemo(
    () =>
      members
        .filter(Boolean)
        .map((m) => {
          const derived = getDerivedStatus(m);
          return {
            ...m,
            name: typeof m.name === "string" ? m.name : "Unknown Member",
            phone: m.phone == null ? "-" : String(m.phone),
            plan: typeof m.plan === "string" ? m.plan : "custom",
            _derived: derived,
            _remainingAmount: getRemainingAmount(m),
          };
        })
        .filter((m) => m._derived.status === "expiring" || m._derived.status === "expired"),
    [members]
  );

  const stats = useMemo(() => {
    const expiring = renewalMembers.filter((m) => m._derived.status === "expiring").length;
    const expired = renewalMembers.filter((m) => m._derived.status === "expired").length;
    const dueAmount = renewalMembers.reduce((sum, m) => sum + m._remainingAmount, 0);
    return { expiring, expired, dueAmount };
  }, [renewalMembers]);

  const filtered = useMemo(() => {
    let out = renewalMembers;

    if (statusFilter !== "all") {
      out = out.filter((m) => m._derived.status === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (m) => m.name.toLowerCase().includes(q) || m.phone.toLowerCase().includes(q)
      );
    }

    return [...out].sort((a, b) => a._derived.daysLeft - b._derived.daysLeft);
  }, [renewalMembers, search, statusFilter]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Renewals</h1>
          <p className="text-sm text-gray-500">
            Track expiring and expired memberships with pending collections.
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchMembers())}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Expiring Soon</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{stats.expiring}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Expired</p>
          <p className="mt-1 text-2xl font-bold text-red-800">{stats.expired}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CircleDollarSign size={14} />
            <p className="text-xs font-semibold uppercase tracking-wide">Pending Collection</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-emerald-800">Rs {stats.dueAmount}</p>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: `All (${renewalMembers.length})` },
          { key: "expiring", label: `Expiring (${stats.expiring})` },
          { key: "expired", label: `Expired (${stats.expired})` },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              statusFilter === item.key
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}

        <div className="relative ml-auto w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-green-300 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          Loading renewals...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-sm text-gray-500">
          No renewals match your filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((member) => (
            <div
              key={member._id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:w-auto md:grid-cols-4">
                <div>
                  <p className="text-xs uppercase text-gray-400">Plan</p>
                  <p className="capitalize font-medium text-gray-800">{member.plan}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">End Date</p>
                  <p className="font-medium text-gray-800">{formatDate(member.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Pending</p>
                  <p className="font-medium text-emerald-700">Rs {member._remainingAmount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Timeline</p>
                  <p className="font-medium text-gray-800">{getDaysLabel(member._derived.daysLeft)}</p>
                </div>
              </div>

              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[member._derived.status]}`}
              >
                {STATUS_LABELS[member._derived.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
