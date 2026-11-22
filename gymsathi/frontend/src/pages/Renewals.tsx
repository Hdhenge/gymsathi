import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, CalendarClock, Check, Clock3, RotateCcw, Search, Wallet } from "lucide-react";
import type { AppDispatch, RootState } from "../store/store";
import { updateMember } from "../store/gymSlice";
import type { Member, MemberPlan } from "../types";
import { PLAN_LABELS } from "../types";
import { daysUntil, dateKey } from "../lib/dates";

const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
function daysLeft(member: Member) { return daysUntil(member.endDate); }
function dateLabel(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }

export default function Renewals() {
  const gym = useSelector((state: RootState) => state.gym);
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const renewals = useMemo(() => gym.members.filter((member) => { const left = daysLeft(member); const matchesWindow = filter === "expired" ? left < 0 : filter === "all" ? left <= 30 : left >= 0 && left <= 30; return matchesWindow && (!query || `${member.name} ${member.phone}`.toLowerCase().includes(query.toLowerCase())); }).sort((first, second) => daysLeft(first) - daysLeft(second)), [gym.members, filter, query]);
  const expired = gym.members.filter((member) => daysLeft(member) < 0).length;
  const upcoming = gym.members.filter((member) => daysLeft(member) >= 0 && daysLeft(member) <= 30).length;
  const due = gym.members.filter((member) => daysLeft(member) <= 30).reduce((sum, member) => sum + Math.max(member.totalFees - member.paidAmount, 0), 0);

  function renew(member: Member) {
    const days: Record<MemberPlan, number> = { monthly: 30, quarterly: 90, yearly: 365, custom: 30 };
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + days[member.plan]);
    dispatch(updateMember({ ...member, startDate: dateKey(start), endDate: dateKey(end), paidAmount: 0 }));
  }

  return <div className="page-stack"><div className="page-heading"><div><span className="section-kicker">KEEP GOOD THINGS GOING</span><h1>Renewals</h1><p>Reach out at the right moment and keep a member’s progress moving.</p></div><button className="button button-outline" onClick={() => setFilter("all")}><CalendarClock size={16} /> Next 30 days</button></div>
    <div className="renewal-stats"><div className="renewal-stat-card"><span className="renewal-stat-icon tone-amber"><Clock3 size={18} /></span><div><small>Expiring in 30 days</small><strong>{upcoming}</strong><span>Time for a friendly check-in</span></div></div><div className="renewal-stat-card"><span className="renewal-stat-icon tone-rose"><CalendarClock size={18} /></span><div><small>Membership expired</small><strong>{expired}</strong><span>A warm welcome back goes a long way</span></div></div><div className="renewal-stat-card"><span className="renewal-stat-icon tone-lime"><Wallet size={18} /></span><div><small>Payments outstanding</small><strong>{money(due)}</strong><span>Across expiring memberships</span></div></div></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><h2>Renewal list <span className="count-pill">{renewals.length}</span></h2><p>Upcoming and past-due memberships in one calm view.</p></div><div className="table-tools"><label className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a member" /></label><select className="toolbar-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="upcoming">Upcoming</option><option value="expired">Expired</option><option value="all">All due</option></select></div></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>MEMBER</th><th>PLAN</th><th>ENDS ON</th><th>TIME LEFT</th><th>BALANCE</th><th>STARTED</th><th>ACTION</th></tr></thead><tbody>{renewals.map((member, index) => { const left = daysLeft(member); return <tr key={member.id}><td><div className="table-member"><span className={`member-avatar avatar-color-${index % 5}`}>{member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><strong>{member.name}</strong><small>{member.phone}</small></span></div></td><td><strong className="table-plan">{PLAN_LABELS[member.plan]}</strong><small className="table-subtext">{member.trainer || "No trainer"}</small></td><td><span className="table-date">{dateLabel(member.endDate)}</span></td><td><span className={`renewal-days ${left < 0 ? "days-expired" : left <= 7 ? "days-urgent" : ""}`}>{left < 0 ? `${Math.abs(left)} days overdue` : left === 0 ? "Ends today" : `${left} days left`}</span></td><td><strong className={member.totalFees > member.paidAmount ? "due-amount" : "paid-amount"}>{member.totalFees > member.paidAmount ? money(member.totalFees - member.paidAmount) : "Paid in full"}</strong></td><td><span className="table-date">{dateLabel(member.startDate)}</span></td><td><button className={`button ${left < 0 ? "button-primary" : "button-outline"} renew-button`} onClick={() => renew(member)}><RotateCcw size={14} /> Renew</button></td></tr>; })}</tbody></table>{renewals.length === 0 && <div className="table-empty"><Check size={24} /><strong>No renewals to follow up</strong><span>The next 30 days look clear. Nice work.</span></div>}</div><div className="table-footer"><span>Showing <strong>{renewals.length}</strong> renewals</span><span>Every renewal is another chapter <span className="footer-heart">✦</span></span></div></section>
    <div className="renewal-tip"><span className="renewal-tip-icon">✦</span><div><strong>A thoughtful reminder goes a long way</strong><p>Members who hear from you before expiry are more likely to keep their routine.</p></div><button className="text-link" onClick={() => setFilter("upcoming")}>Focus on upcoming <ArrowRight size={14} /></button></div>
    <div className="page-footer"><span>Renewing a plan starts its new cycle today and resets its payment balance.</span><span>{upcoming} upcoming <span className="footer-heart">✦</span></span></div></div>;
}
