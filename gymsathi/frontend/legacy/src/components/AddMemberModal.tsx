import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { addMember, clearAddError } from "../store/membersSlice";

const today = new Date().toISOString().split("T")[0];

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const PLAN_DAYS = { monthly: 30, quarterly: 90, yearly: 365 };

const EMPTY = {
  name: "",
  phone: "",
  totalFees: "",
  paidFees: "0",
  plan: "monthly",
  startDate: today,
  endDate: addDays(today, 30),
};

export default function AddMemberModal({ onClose }) {
  const dispatch = useDispatch();
  const { adding, addError } = useSelector((state) => state.members);
  const [form, setForm] = useState(EMPTY);

  const balanceFees = Math.max(0, Number(form.totalFees || 0) - Number(form.paidFees || 0));

  // Clear any previous error when modal mounts
  useEffect(() => {
    dispatch(clearAddError());
  }, [dispatch]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate endDate when plan or startDate changes
      if (name === "plan" || name === "startDate") {
        const days = PLAN_DAYS[updated.plan];
        if (days && updated.startDate) {
          updated.endDate = addDays(updated.startDate, days);
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      addMember({
        ...form,
        totalFees: Number(form.totalFees),
        paidFees: Number(form.paidFees),
        balanceFees,
      })
    );
    if (addMember.fulfilled.match(result)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Add New Member</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Plan + Total Fees — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                name="plan"
                value={form.plan}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="monthly">Monthly (30 days)</option>
                <option value="quarterly">Quarterly (90 days)</option>
                <option value="yearly">Yearly (365 days)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees (₹)</label>
              <input
                type="number"
                name="totalFees"
                value={form.totalFees}
                onChange={handleChange}
                placeholder="e.g. 1200"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Paid Fees + Balance Fees — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Fees (₹)</label>
              <input
                type="number"
                name="paidFees"
                value={form.paidFees}
                onChange={handleChange}
                placeholder="e.g. 600"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Balance Fees (₹)</label>
              <input
                type="number"
                value={balanceFees}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Start Date + End Date — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date {PLAN_DAYS[form.plan] && <span className="text-gray-400 font-normal">(auto)</span>}
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                readOnly={!!PLAN_DAYS[form.plan]}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  PLAN_DAYS[form.plan]
                    ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    : "border-gray-300"
                }`}
              />
            </div>
          </div>

          {addError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {addError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adding}
              className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition disabled:opacity-60"
            >
              {adding ? "Adding..." : "Add Member"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
