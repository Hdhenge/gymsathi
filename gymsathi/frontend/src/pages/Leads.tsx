import { useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, CalendarDays, Check, MessageSquareText, MoreHorizontal, Plus, Search, Trash2, UserRoundPlus } from "lucide-react";
import type { AppDispatch, RootState } from "../store/store";
import { addLead, deleteLead, updateLead } from "../store/gymSlice";
import type { Lead, LeadSource, LeadStatus } from "../types";
import { SOURCE_LABELS } from "../types";
import { joiErrors, leadSchema } from "../validation";
import Modal from "../components/Modal";
import { dateKey } from "../lib/dates";

const today = dateKey();
const emptyLead = { name: "", phone: "", email: "", goal: "", source: "walk_in" as LeadSource, followUpDate: today, notes: "" };
const statusLabel: Record<LeadStatus, string> = { new: "New", follow_up: "Follow-up", converted: "Converted", closed: "Closed" };

function LeadEditor({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState(emptyLead);
  const [errors, setErrors] = useState<Record<string, string>>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = leadSchema.validate(form, { abortEarly: false });
    setErrors(joiErrors(error));
    if (error) return;
    const lead: Lead = { ...form, id: `l-${Date.now()}`, status: "new", createdAt: today };
    dispatch(addLead(lead));
    onClose();
  }
  return <Modal title="Add a prospect" description="Capture the conversation so your next follow-up feels personal." onClose={onClose}>
    <form className="form-body" onSubmit={submit} noValidate><div className="form-grid"><label className="field full-field">Full name<input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nisha Gupta" />{errors.name && <small className="field-error">{errors.name}</small>}</label><label className="field">Phone number<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />{errors.phone && <small className="field-error">{errors.phone}</small>}</label><label className="field">Email <span className="optional">OPTIONAL</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" />{errors.email && <small className="field-error">{errors.email}</small>}</label><label className="field">How did they find you?<select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })}>{Object.entries(SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="field">Follow-up date<input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} /></label><label className="field full-field">What are they looking for?<input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Their goals, needs or questions" /></label><label className="field full-field">Conversation notes<textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Add a useful detail for the next conversation" /></label></div><div className="form-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Save prospect</button></div></form>
  </Modal>;
}

export default function Leads() {
  const gym = useSelector((state: RootState) => state.gym);
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const counts = useMemo(() => ({ all: gym.leads.length, new: gym.leads.filter((lead) => lead.status === "new").length, follow_up: gym.leads.filter((lead) => lead.status === "follow_up").length, converted: gym.leads.filter((lead) => lead.status === "converted").length }), [gym.leads]);
  const leads = gym.leads.filter((lead) => (!query || `${lead.name} ${lead.phone} ${lead.email}`.toLowerCase().includes(query.toLowerCase())) && (filter === "all" || lead.status === filter));
  return <div className="page-stack"><div className="page-heading"><div><span className="section-kicker">GROW YOUR COMMUNITY</span><h1>Prospects</h1><p>Turn first conversations into long-term training partners.</p></div><button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Add prospect</button></div>
    <div className="lead-stats"><div className="lead-stat"><span className="stat-soft-icon"><UserRoundPlus size={18} /></span><small>All prospects</small><strong>{counts.all}</strong><span className="stat-detail">Across every channel</span></div><div className="lead-stat"><span className="stat-soft-icon sky-icon"><SparkleIcon /></span><small>New leads</small><strong>{counts.new}</strong><span className="stat-detail">Ready for first contact</span></div><div className="lead-stat"><span className="stat-soft-icon amber-icon"><CalendarDays size={17} /></span><small>Follow-ups due</small><strong>{gym.leads.filter((lead) => lead.status === "follow_up" && lead.followUpDate <= today).length}</strong><span className="stat-detail">Keep the conversation going</span></div><div className="lead-stat"><span className="stat-soft-icon mint-icon"><Check size={17} /></span><small>Converted</small><strong>{counts.converted}</strong><span className="stat-detail">Prospects ready to join</span></div></div>
    <section className="panel table-panel lead-table-panel"><div className="table-toolbar"><div><h2>Prospect pipeline <span className="count-pill">{leads.length}</span></h2><p>Every follow-up is a chance to make someone stronger.</p></div><div className="table-tools"><label className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search prospects" /></label><select className="toolbar-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All stages</option>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>PROSPECT</th><th>THEIR GOAL</th><th>SOURCE</th><th>STAGE</th><th>FOLLOW-UP</th><th>ADDED</th><th /></tr></thead><tbody>{leads.map((lead, index) => <tr key={lead.id}><td><div className="table-member"><span className={`member-avatar avatar-color-${index % 5}`}>{lead.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><strong>{lead.name}</strong><small>{lead.phone}</small></span></div></td><td><span className="goal-text">{lead.goal || "Goal not added"}</span>{lead.notes && <small className="table-subtext">{lead.notes}</small>}</td><td><span className="source-pill">{SOURCE_LABELS[lead.source]}</span></td><td><select aria-label={`Update ${lead.name} stage`} className={`status-select status-${lead.status}`} value={lead.status} onChange={(e) => dispatch(updateLead({ ...lead, status: e.target.value as LeadStatus }))}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td><span className="table-date">{lead.followUpDate ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${lead.followUpDate}T12:00:00`)) : "—"}</span></td><td><span className="table-date">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${lead.createdAt}T12:00:00`))}</span></td><td><LeadActions lead={lead} onDelete={() => dispatch(deleteLead(lead.id))} /></td></tr>)}</tbody></table>{leads.length === 0 && <div className="table-empty"><MessageSquareText size={24} /><strong>No prospects in this view</strong><span>Add someone new or choose a different stage.</span></div>}</div><div className="table-footer"><span>Showing <strong>{leads.length}</strong> of <strong>{gym.leads.length}</strong> prospects</span><span>Keep the follow-up human <span className="footer-heart">✦</span></span></div></section>
    <div className="followup-note"><span className="followup-note-icon"><CalendarDays size={17} /></span><div><strong>Little reminder, big difference</strong><p>Prospects with a follow-up within 24 hours are much more likely to book a trial.</p></div><button className="text-link" onClick={() => setFilter("follow_up")}>See follow-ups <ArrowRight size={14} /></button></div>
    {modalOpen && <LeadEditor onClose={() => setModalOpen(false)} />}</div>;
}

function SparkleIcon() { return <span className="sparkle-glyph">✦</span>; }
function LeadActions({ lead, onDelete }: { lead: Lead; onDelete: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  return <div className="row-action-wrap"><button className="icon-button row-more" aria-label={`More actions for ${lead.name}`} onClick={() => setOpen(!open)}><MoreHorizontal size={18} /></button>{open && <div className="row-menu"><button onClick={() => { dispatch(updateLead({ ...lead, status: "follow_up", followUpDate: today })); setOpen(false); }}><CalendarDays size={14} /> Follow up today</button><button onClick={() => { if (window.confirm(`Remove ${lead.name} from prospects?`)) onDelete(); setOpen(false); }} className="delete-action"><Trash2 size={14} /> Remove prospect</button></div>}</div>;
}
