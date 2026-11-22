import { useMemo } from "react";
import { ArrowDownRight, ArrowRight, CalendarDays, Check, ChevronRight, CircleDollarSign, Clock3, Plus, Sparkles, UsersRound, ClipboardCheck, MessageSquareText, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { METHOD_LABELS, PLAN_LABELS } from "../types";
import { dateKey, daysUntil } from "../lib/dates";

const currency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
const dayKey = dateKey();
const paymentMonth = (value: string) => dateKey(new Date(value)).slice(0, 7);
const statusOf = (endDate: string) => {
  const days = daysUntil(endDate);
  return days < 0 ? "Expired" : days <= 7 ? "Expiring" : "Active";
};

function Metric({ label, value, note, icon: Icon, tone }: { label: string; value: string; note: string; icon: typeof UsersRound; tone: string }) {
  return <article className="metric-card"><div className="metric-top"><span className={`metric-icon ${tone}`}><Icon size={18} /></span></div><p className="metric-label">{label}</p><strong className="metric-value">{value}</strong><span className="metric-note">{note}</span></article>;
}

function RevenueChart({ values, labels }: { values: number[]; labels: string[] }) {
  const width = 690;
  const height = 214;
  const padX = 25;
  const padY = 22;
  const max = Math.max(...values, 1) * 1.18;
  const points = values.map((value, index) => `${padX + index * ((width - padX * 2) / Math.max(values.length - 1, 1))},${height - padY - (value / max) * (height - padY * 2)}`);
  const line = `M ${points.join(" L ")}`;
  const area = `${line} L ${width - padX},${height - padY} L ${padX},${height - padY} Z`;
  return <div className="revenue-plot"><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Revenue trend over the last six months"><defs><linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b5ef55" stopOpacity=".32" /><stop offset="100%" stopColor="#b5ef55" stopOpacity="0" /></linearGradient></defs>{[0, 1, 2, 3].map((lineIndex) => <line key={lineIndex} x1={padX} x2={width - padX} y1={padY + lineIndex * ((height - padY * 2) / 3)} y2={padY + lineIndex * ((height - padY * 2) / 3)} stroke="#edf0e9" strokeDasharray="4 5" />)}<path d={area} fill="url(#area-fill)" /><path d={line} fill="none" stroke="#649324" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{points.map((point, index) => { const [cx, cy] = point.split(","); return <circle key={index} cx={cx} cy={cy} r="4" fill="#fff" stroke="#649324" strokeWidth="2.5" />; })}</svg><div className="chart-labels">{labels.map((label) => <span key={label}>{label}</span>)}</div></div>;
}

export default function Dashboard() {
  const gym = useSelector((state: RootState) => state.gym);
  const user = useSelector((state: RootState) => state.auth.user);
  const todayAttendance = gym.attendance.filter((record) => record.date === dayKey);
  const activeMembers = gym.members.filter((member) => statusOf(member.endDate) !== "Expired");
  const expiringMembers = gym.members.filter((member) => statusOf(member.endDate) === "Expiring");
  const outstanding = gym.members.reduce((sum, member) => sum + Math.max(member.totalFees - member.paidAmount, 0), 0);
  const monthlyRevenue = gym.payments.filter((payment) => paymentMonth(payment.date) === dayKey.slice(0, 7)).reduce((sum, payment) => sum + payment.amount, 0);
  const months = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return { key: dateKey(date).slice(0, 7), label: date.toLocaleDateString("en-IN", { month: "short" }) };
  }), []);
  const monthlyValues = months.map(({ key }) => gym.payments.filter((payment) => paymentMonth(payment.date) === key).reduce((sum, payment) => sum + payment.amount, 0));
  const maxRevenue = Math.max(...monthlyValues, 1);
  const todayDate = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const recentPayments = gym.payments.slice(0, 4);
  const monthlyShare = gym.members.length ? gym.members.filter((member) => member.plan === "monthly").length / gym.members.length * 100 : 0;
  const quarterShare = gym.members.length ? gym.members.filter((member) => ["monthly", "quarterly"].includes(member.plan)).length / gym.members.length * 100 : 0;
  const yearShare = gym.members.length ? gym.members.filter((member) => ["monthly", "quarterly", "yearly"].includes(member.plan)).length / gym.members.length * 100 : 0;

  return (
    <div className="page-stack">
      <section className="welcome-banner">
        <div className="welcome-copy"><div className="eyebrow light-eyebrow"><Sparkles size={13} /> YOUR GYM, IN RHYTHM</div><h1>Good morning, {user?.name?.split(" ")[0] ?? "Alex"}<span className="wave">✦</span></h1><p>{todayDate} <span>·</span> Here’s the pulse of {gym.profile.name} today.</p></div>
        <Link to="/members" className="button button-lime"><Plus size={16} /> Add a member</Link>
        <div className="banner-orbit orbit-one" /><div className="banner-orbit orbit-two" />
      </section>

      <section className="metric-grid" aria-label="Key gym metrics">
        <Metric label="Active members" value={activeMembers.length.toLocaleString("en-IN")} note={`${gym.members.length - activeMembers.length} past members`} icon={UsersRound} tone="tone-lime" />
        <Metric label="Checked in today" value={todayAttendance.length.toString().padStart(2, "0")} note={`${todayAttendance.filter((item) => !item.checkOut).length} still training`} icon={Check} tone="tone-blue" />
        <Metric label="Revenue this month" value={currency(monthlyRevenue)} note="Collected payments" icon={CircleDollarSign} tone="tone-violet" />
        <Metric label="Outstanding balance" value={currency(outstanding)} note={`${gym.members.filter((member) => member.totalFees > member.paidAmount).length} members with balance`} icon={Clock3} tone="tone-peach" />
      </section>

      <section className="dashboard-grid">
        <article className="panel revenue-panel">
          <div className="panel-heading"><div><span className="section-kicker">MONEY IN MOTION</span><h2>Revenue overview</h2></div><button className="select-pill">Last 6 months <ChevronRight size={14} /></button></div>
          <div className="chart-summary"><strong>{currency(monthlyValues.reduce((sum, value) => sum + value, 0))}</strong><span className="chart-caption">Recorded across the last six months</span></div>
          <RevenueChart values={monthlyValues} labels={months.map((month) => month.label)} />
          <div className="bar-legend"><span><i className="legend-dot" />Membership revenue</span><span className="chart-caption">Updated just now</span></div>
        </article>

        <article className="panel attendance-panel">
          <div className="panel-heading"><div><span className="section-kicker">THE DAILY RITUAL</span><h2>Today’s attendance</h2></div><Link className="text-link" to="/attendance">View all <ArrowRight size={14} /></Link></div>
          <div className="attendance-total"><strong>{todayAttendance.length.toString().padStart(2, "0")}</strong><span>members checked in</span><div className="attendance-avatars">{todayAttendance.slice(0, 4).map((record, index) => <span key={record.id} className={`mini-avatar mini-${index}`}>{record.memberName.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span>)}<span className="mini-avatar mini-more">+{Math.max(todayAttendance.length - 4, 0)}</span></div></div>
          <div className="attendance-list">{todayAttendance.slice(0, 4).map((record) => <div className="attendance-row" key={record.id}><span className="member-avatar small-avatar">{record.memberName.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span><span className="activity-person"><strong>{record.memberName}</strong><small>{record.checkOut ? "Session complete" : "Training now"}</small></span><time>{record.checkIn}</time><span className={`check-dot${record.checkOut ? " checked-out" : ""}`} /></div>)}{todayAttendance.length === 0 && <p className="empty-inline">No check-ins yet today.</p>}</div>
        </article>

        <article className="panel renewal-panel">
          <div className="panel-heading"><div><span className="section-kicker">KEEP THE MOMENTUM</span><h2>Renewals to watch</h2></div><Link className="text-link" to="/renewals">See all <ArrowRight size={14} /></Link></div>
          <div className="renewal-summary"><span className="renewal-summary-icon"><CalendarDays size={18} /></span><strong>{expiringMembers.length}</strong><span>members expiring in 7 days</span></div>
          {expiringMembers.slice(0, 3).map((member, index) => <div className="renewal-row" key={member.id}><span className={`member-avatar small-avatar avatar-color-${index}`}>{member.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span><div className="activity-person"><strong>{member.name}</strong><small>{PLAN_LABELS[member.plan]} plan</small></div><span className="days-badge">{Math.max(Math.ceil((new Date(member.endDate).getTime() - Date.now()) / 86400000), 0)} days</span></div>)}
          {expiringMembers.length === 0 && <p className="empty-inline">All memberships are looking good.</p>}
          <div className="renewal-footnote"><span><ArrowDownRight size={14} /> Open balances: {currency(outstanding)}</span><Link to="/renewals">Manage renewals <ArrowRight size={13} /></Link></div>
        </article>

        <article className="panel plan-panel">
          <div className="panel-heading"><div><span className="section-kicker">WHAT MEMBERS CHOOSE</span><h2>Plan mix</h2></div><Link className="text-link" to="/reports">Reports <ArrowRight size={14} /></Link></div>
          <div className="plan-chart-wrap"><div className="donut-chart" style={{ background: `conic-gradient(#688e36 0 ${monthlyShare}%, #b5d683 ${monthlyShare}% ${quarterShare}%, #e9aa77 ${quarterShare}% ${yearShare}%, #e8ebe2 ${yearShare}% 100%)` }}><div><strong>{gym.members.length}</strong><span>members</span></div></div><div className="plan-legend">{(["monthly", "quarterly", "yearly", "custom"] as const).map((plan, index) => { const count = gym.members.filter((member) => member.plan === plan).length; return <div key={plan}><i className={`plan-dot plan-dot-${index}`} /><span>{PLAN_LABELS[plan]}</span><strong>{count}</strong><small>{gym.members.length ? Math.round(count / gym.members.length * 100) : 0}%</small></div>; })}</div></div>
        </article>

        <article className="panel payments-panel">
          <div className="panel-heading"><div><span className="section-kicker">FRESH OFF THE COUNTER</span><h2>Recent payments</h2></div><Link className="text-link" to="/payments">All payments <ArrowRight size={14} /></Link></div>
          <div className="recent-payments">{recentPayments.map((payment) => <div className="payment-row" key={payment.id}><div className="payment-icon"><CircleDollarSign size={17} /></div><div className="activity-person"><strong>{payment.memberName}</strong><small>{METHOD_LABELS[payment.method]}</small></div><strong className="payment-amount">{currency(payment.amount)}</strong></div>)}</div>
        </article>

        <article className="panel quick-panel"><span className="section-kicker">QUICK SHORTCUTS</span><h2>Make today count</h2><div className="quick-actions"><Link to="/attendance"><ClipboardCheck size={17} /><span>Mark attendance</span><ChevronRight size={15} /></Link><Link to="/classes"><CalendarDays size={17} /><span>Manage class bookings</span><ChevronRight size={15} /></Link><Link to="/leads"><MessageSquareText size={17} /><span>Add a prospect</span><ChevronRight size={15} /></Link><Link to="/payments"><CreditCard size={17} /><span>Payments & reminders</span><ChevronRight size={15} /></Link></div><div className="member-goal"><div className="goal-copy"><span>MEMBERSHIP GOAL</span><strong>{activeMembers.length} <small>/ 150 members</small></strong></div><div className="goal-track"><i style={{ width: `${Math.min(activeMembers.length / 150 * 100, 100)}%` }} /></div><span className="goal-caption">{Math.max(150 - activeMembers.length, 0)} more to your monthly goal <span>↗</span></span></div></article>
      </section>
      <footer className="page-footer"><span>GymSathi · {gym.profile.name}</span><span>Everything in one strong place <span className="footer-heart">✦</span></span></footer>
      <span className="sr-only">Highest monthly revenue in this view: {currency(maxRevenue)}</span>
    </div>
  );
}
