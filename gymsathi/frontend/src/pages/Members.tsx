import { useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDown, ArrowUpDown, Clock3, Download, MoreHorizontal, Pencil, Plus, Search, Trash2, UsersRound, X } from "lucide-react";
import type { AppDispatch, RootState } from "../store/store";
import { addMember, addPayment, deleteMember, updateMember } from "../store/gymSlice";
import type { Member, MemberPlan, MemberStatus, Payment } from "../types";
import { PLAN_LABELS } from "../types";
import { joiErrors, memberSchema } from "../validation";
import Modal from "../components/Modal";
import { dateKey, shiftDate, daysUntil } from "../lib/dates";

const today = () => dateKey();
const dateOffset = (days: number) => shiftDate(today(), days);
function memberStatus(member: Member): MemberStatus {
  const daysLeft = daysUntil(member.endDate);
  return daysLeft < 0 ? "expired" : daysLeft <= 7 ? "expiring" : "active";
}
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

type MemberForm = Omit<Member, "id" | "joinedAt">;
const emptyForm: MemberForm = { name: "", email: "", phone: "", plan: "monthly", startDate: today(), endDate: dateOffset(30), totalFees: 2500, paidAmount: 0, trainer: "", goal: "" };

function MemberEditor({ member, onClose }: { member?: Member; onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState<MemberForm>(member ? { name: member.name, email: member.email, phone: member.phone, plan: member.plan, startDate: member.startDate, endDate: member.endDate, totalFees: member.totalFees, paidAmount: member.paidAmount, trainer: member.trainer, goal: member.goal } : emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const balance = Math.max(form.totalFees - form.paidAmount, 0);

  function change<K extends keyof MemberForm>(key: K, value: MemberForm[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "plan" || key === "startDate") {
        const days: Record<MemberPlan, number> = { monthly: 30, quarterly: 90, yearly: 365, custom: 0 };
        if (next.plan !== "custom") next.endDate = dateOffsetFrom(next.startDate, days[next.plan]);
      }
      return next;
    });
    setErrors((current) => ({ ...current, [key]: "", form: "" }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = memberSchema.validate(form, { abortEarly: false, convert: true });
    const nextErrors = joiErrors(error);
    setErrors(nextErrors);
    if (error) return;
    setSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    const record: Member = { ...form, id: member?.id ?? `m-${Date.now()}`, joinedAt: member?.joinedAt ?? today() };
    if (member) {
      dispatch(updateMember(record));
    } else {
      dispatch(addMember(record));
      if (record.paidAmount > 0) {
        const initialPayment: Payment = { id: `p-${Date.now()}`, memberId: record.id, memberName: record.name, amount: record.paidAmount, method: "cash", date: new Date().toISOString(), note: "Initial membership payment" };
        dispatch(addPayment(initialPayment));
      }
    }
    setSaving(false);
    onClose();
  }

  return <Modal title={member ? "Update member details" : "Add a new member"} description={member ? "Keep this member’s profile and plan up to date." : "Create a member profile and choose their first membership."} onClose={onClose}>
    <form className="form-body" onSubmit={submit} noValidate>
      <div className="form-grid"><label className="field full-field">Full name<input autoFocus value={form.name} onChange={(event) => change("name", event.target.value)} placeholder="e.g. Aisha Patel" />{errors.name && <small className="field-error">{errors.name}</small>}</label>
      <label className="field">Phone number<input value={form.phone} onChange={(event) => change("phone", event.target.value)} placeholder="+91 98765 43210" />{errors.phone && <small className="field-error">{errors.phone}</small>}</label>
      <label className="field">Email address <span className="optional">OPTIONAL</span><input type="email" value={form.email} onChange={(event) => change("email", event.target.value)} placeholder="name@email.com" />{errors.email && <small className="field-error">{errors.email}</small>}</label>
      <label className="field">Membership plan<select value={form.plan} onChange={(event) => change("plan", event.target.value as MemberPlan)}><option value="monthly">Monthly · 30 days</option><option value="quarterly">Quarterly · 90 days</option><option value="yearly">Annual · 365 days</option><option value="custom">Custom dates</option></select></label>
      <label className="field">Membership fee<input type="number" min="0" value={form.totalFees} onChange={(event) => change("totalFees", Number(event.target.value))} />{errors.totalFees && <small className="field-error">{errors.totalFees}</small>}</label>
      <label className="field">Amount paid<input type="number" min="0" value={form.paidAmount} onChange={(event) => change("paidAmount", Number(event.target.value))} />{errors.paidAmount && <small className="field-error">{errors.paidAmount}</small>}</label>
      <div className="balance-hint"><span>Balance due</span><strong>{money(balance)}</strong></div>
      <label className="field">Start date<input type="date" value={form.startDate} onChange={(event) => change("startDate", event.target.value)} /></label>
      <label className="field">End date<input type="date" value={form.endDate} readOnly={form.plan !== "custom"} onChange={(event) => change("endDate", event.target.value)} />{errors.endDate && <small className="field-error">{errors.endDate}</small>}</label>
      <label className="field">Assigned trainer<select value={form.trainer} onChange={(event) => change("trainer", event.target.value)}><option value="">Not assigned</option><option>Arjun Mehta</option><option>Priya Nair</option><option>Dev Malhotra</option></select></label>
      <label className="field">Fitness goal<input value={form.goal} onChange={(event) => change("goal", event.target.value)} placeholder="Strength, mobility..." /></label></div>
      {errors.form && <p className="form-error">{errors.form}</p>}
      <div className="form-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? "Saving..." : member ? "Save changes" : "Create member"}</button></div>
    </form>
  </Modal>;
}

function dateOffsetFrom(value: string, days: number) { return shiftDate(value, days); }

export default function Members() {
  const gym = useSelector((state: RootState) => state.gym);
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [plan, setPlan] = useState("all");
  const [sortNewest, setSortNewest] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Member | undefined>();
  const [menuId, setMenuId] = useState<string | null>(null);
  const counts = useMemo(() => ({ all: gym.members.length, active: gym.members.filter((member) => memberStatus(member) === "active").length, expiring: gym.members.filter((member) => memberStatus(member) === "expiring").length, expired: gym.members.filter((member) => memberStatus(member) === "expired").length }), [gym.members]);
  const filtered = useMemo(() => gym.members.filter((member) => {
    const needle = query.toLowerCase().trim();
    const matchesText = !needle || `${member.name} ${member.email} ${member.phone}`.toLowerCase().includes(needle);
    return matchesText && (status === "all" || memberStatus(member) === status) && (plan === "all" || member.plan === plan);
  }).sort((first, second) => sortNewest ? second.joinedAt.localeCompare(first.joinedAt) : first.name.localeCompare(second.name)), [gym.members, query, status, plan, sortNewest]);
  const closeEditor = () => { setEditorOpen(false); setEditing(undefined); };

  function exportMembers() {
    const rows = [["Name", "Phone", "Email", "Plan", "Status", "Start date", "End date", "Fee", "Paid", "Balance"], ...filtered.map((member) => [member.name, member.phone, member.email, PLAN_LABELS[member.plan], memberStatus(member), member.startDate, member.endDate, member.totalFees, member.paidAmount, member.totalFees - member.paidAmount])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "gymsathi-members.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  return <div className="page-stack">
    <div className="page-heading"><div><span className="section-kicker">YOUR COMMUNITY</span><h1>Members</h1><p>One place for every face, plan and next milestone.</p></div><button className="button button-primary" onClick={() => setEditorOpen(true)}><Plus size={16} /> Add member</button></div>
    <div className="member-summary-grid"><div className="member-summary primary-summary"><span><UsersRound size={18} /></span><div><small>All members</small><strong>{counts.all}</strong></div></div><div className="member-summary"><span className="summary-green"><i /></span><div><small>Active</small><strong>{counts.active}</strong></div></div><div className="member-summary"><span className="summary-amber"><i /></span><div><small>Expiring soon</small><strong>{counts.expiring}</strong></div></div><div className="member-summary"><span className="summary-gray"><i /></span><div><small>Expired</small><strong>{counts.expired}</strong></div></div></div>
    <section className="panel table-panel">
      <div className="table-toolbar"><div className="table-title"><div><h2>All members <span className="count-pill">{filtered.length}</span></h2><p>Manage memberships and keep everyone moving.</p></div></div><div className="table-tools"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members" /><kbd>⌘ K</kbd></label><select className="toolbar-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="expiring">Expiring soon</option><option value="expired">Expired</option></select><select className="toolbar-select" value={plan} onChange={(event) => setPlan(event.target.value)}><option value="all">All plans</option>{Object.entries(PLAN_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="button button-outline" onClick={exportMembers}><Download size={15} /> Export</button></div></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>MEMBER</th><th>MEMBERSHIP</th><th>STATUS</th><th><button className="th-sort" onClick={() => setSortNewest((value) => !value)}>JOINED <ArrowUpDown size={12} /></button></th><th>PAYMENT</th><th>NEXT BILLING</th><th aria-label="Actions" /></tr></thead><tbody>{filtered.map((member, index) => { const state = memberStatus(member); const percentage = member.totalFees ? Math.min(Math.round(member.paidAmount / member.totalFees * 100), 100) : 0; return <tr key={member.id}><td><div className="table-member"><span className={`member-avatar avatar-color-${index % 5}`}>{member.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span><span><strong>{member.name}</strong><small>{member.email || member.phone}</small></span></div></td><td><strong className="table-plan">{PLAN_LABELS[member.plan]}</strong><small className="table-subtext">{member.trainer || "No trainer"}</small></td><td><span className={`status-pill status-${state}`}>{state === "expiring" ? <Clock3 size={12} /> : state === "active" ? <i /> : null}{state === "expiring" ? `Ends in ${Math.max(Math.ceil((new Date(member.endDate).getTime() - Date.now()) / 86400000), 0)} days` : state}</span></td><td><span className="table-date">{formatDate(member.joinedAt)}</span></td><td><div className="payment-progress"><div className="progress-label"><strong>{money(member.paidAmount)}</strong><span>{money(Math.max(member.totalFees - member.paidAmount, 0))} due</span></div><div className="progress-track"><i style={{ width: `${percentage}%` }} /></div></div></td><td><span className="table-date">{formatDate(member.endDate)}</span></td><td className="action-cell"><div className="row-action-wrap"><button className="icon-button row-more" aria-label={`Actions for ${member.name}`} onClick={() => setMenuId(menuId === member.id ? null : member.id)}><MoreHorizontal size={18} /></button>{menuId === member.id && <div className="row-menu"><button onClick={() => { setEditing(member); setEditorOpen(true); setMenuId(null); }}><Pencil size={14} /> Edit details</button><button className="delete-action" onClick={() => { if (window.confirm(`Remove ${member.name} from members?`)) dispatch(deleteMember(member.id)); setMenuId(null); }}><Trash2 size={14} /> Remove member</button></div>}</div></td></tr>; })}</tbody></table>{filtered.length === 0 && <div className="table-empty"><UsersRound size={24} /><strong>No members found</strong><span>Try a different search or update your filters.</span><button className="button button-outline" onClick={() => { setQuery(""); setStatus("all"); setPlan("all"); }}><X size={14} /> Clear filters</button></div>}</div>
      <div className="table-footer"><span>Showing <strong>{filtered.length ? 1 : 0}–{filtered.length}</strong> of <strong>{gym.members.length}</strong> members</span><div className="pagination"><button disabled><ArrowDown size={13} /> Previous</button><button className="page-number">1</button><button disabled>Next <ArrowDown size={13} className="rotate-arrow" /></button></div></div>
    </section>
    <div className="page-footer"><span>Member records are saved in this workspace.</span><span>{gym.members.length} profiles <span className="footer-heart">✦</span></span></div>
    {editorOpen && <MemberEditor member={editing} onClose={closeEditor} />}
  </div>;
}
