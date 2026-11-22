import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";
import AddInquiryModal from "../components/AddInquiryModal";
import { fetchInquiries, updateInquiry } from "../store/inquiriesSlice";

const STATUS_STYLE = {
  new: "bg-blue-100 text-blue-700",
  follow_up: "bg-amber-100 text-amber-700",
  converted: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

const STATUS_LABEL = {
  new: "New",
  follow_up: "Follow Up",
  converted: "Converted",
  closed: "Closed",
};

const SOURCE_LABEL = {
  walk_in: "Walk-in",
  call: "Call",
  instagram: "Instagram",
  facebook: "Facebook",
  referral: "Referral",
  other: "Other",
};

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Inquiries() {
  const dispatch = useDispatch();
  const { list, loading, error, updatingId } = useSelector((state) => state.inquiries);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchInquiries());
  }, [dispatch]);

  const inquiries = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  const stats = useMemo(() => {
    return {
      total: inquiries.length,
      newCount: inquiries.filter((i) => i.status === "new").length,
      followUpCount: inquiries.filter((i) => i.status === "follow_up").length,
      convertedCount: inquiries.filter((i) => i.status === "converted").length,
    };
  }, [inquiries]);

  const filtered = useMemo(() => {
    let out = inquiries;

    if (statusFilter !== "all") {
      out = out.filter((i) => i.status === statusFilter);
    }

    if (sourceFilter !== "all") {
      out = out.filter((i) => i.source === sourceFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (i) => i.name?.toLowerCase().includes(q) || String(i.phone || "").toLowerCase().includes(q)
      );
    }

    return out;
  }, [inquiries, search, statusFilter, sourceFilter]);

  const handleStatusChange = (id, status) => {
    dispatch(updateInquiry({ id, data: { status } }));
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-sm text-gray-500">Track prospects and follow-ups in one place.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-600"
        >
          <Plus size={16} />
          Add Inquiry
        </button>
      </div>

      {showModal && <AddInquiryModal onClose={() => setShowModal(false)} />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs uppercase tracking-wide text-blue-600">New</p>
          <p className="mt-1 text-2xl font-bold text-blue-800">{stats.newCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-700">Follow Up</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{stats.followUpCount}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs uppercase tracking-wide text-green-700">Converted</p>
          <p className="mt-1 text-2xl font-bold text-green-800">{stats.convertedCount}</p>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="follow_up">Follow Up</option>
          <option value="converted">Converted</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Sources</option>
          <option value="walk_in">Walk-in</option>
          <option value="call">Call</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="referral">Referral</option>
          <option value="other">Other</option>
        </select>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          Loading inquiries...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-14 text-center text-sm text-gray-500">
          No inquiries found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-900">{item.name || "-"}</p>
                <p className="text-sm text-gray-500">{item.phone || "-"}</p>
                <p className="mt-1 text-sm text-gray-600">{item.goal || "No goal added yet"}</p>
                {item.notes && <p className="mt-1 text-xs text-gray-500">Note: {item.notes}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-gray-400">Source</p>
                  <p className="font-medium text-gray-700">{SOURCE_LABEL[item.source] || "Other"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Created</p>
                  <p className="font-medium text-gray-700">{formatDate(item.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Follow-up</p>
                  <p className="font-medium text-gray-700">{formatDate(item.followUpDate)}</p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    STATUS_STYLE[item.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {STATUS_LABEL[item.status] || "Unknown"}
                </span>
                <select
                  value={item.status || "new"}
                  onChange={(e) => handleStatusChange(item._id, e.target.value)}
                  disabled={updatingId === item._id}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                >
                  <option value="new">New</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
