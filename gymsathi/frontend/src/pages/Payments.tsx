import { useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDownToLine, ArrowUpRight, Banknote, CalendarDays, CircleDollarSign, CreditCard, MessageCircle, MessageSquareText, Plus, Search, Wallet } from "lucide-react";
import type { AppDispatch, RootState } from "../store/store";
import { addPayment } from "../store/gymSlice";
import type { Payment, PaymentMethod } from "../types";
import { METHOD_LABELS } from "../types";
import { joiErrors, paymentSchema } from "../validation";
import Modal from "../components/Modal";
import { dateKey } from "../lib/dates";
import { paymentReminderLinks } from "../lib/paymentReminders";
import "./Payments.css";

const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
const thisMonth = dateKey().slice(0, 7);

function downloadReceipt(payment: Payment) {
  const receipt = [
    "GYMSATHI · PAYMENT RECEIPT",
    `Receipt: ${payment.id}`,
    `Paid on: ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(payment.date))}`,
    `Member: ${payment.memberName}`,
    `Amount: ${money(payment.amount)}`,
    `Method: ${METHOD_LABELS[payment.method]}`,
    `Note: ${payment.note || "Membership payment"}`,
  ].join("\n");
  const url = URL.createObjectURL(new Blob([receipt], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-${payment.id}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function PaymentEditor({ onClose }: { onClose: () => void }) {
  const members = useSelector((state: RootState) => state.gym.members);
  const dispatch = useDispatch<AppDispatch>();
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selected = members.find((member) => member.id === memberId);
  const balance = selected ? Math.max(selected.totalFees - selected.paidAmount, 0) : 0;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { memberId, amount: Number(amount), method, note };
    const { error } = paymentSchema.validate(payload, { abortEarly: false });
    const nextErrors = joiErrors(error);
    if (selected && Number(amount) > balance) nextErrors.amount = `This member’s outstanding balance is ${money(balance)}.`;
    setErrors(nextErrors);
    if (error || Object.keys(nextErrors).length) return;
    const payment: Payment = { id: `p-${Date.now()}`, memberId, memberName: selected?.name ?? "Member", amount: Number(amount), method, note: note.trim(), date: new Date().toISOString() };
    dispatch(addPayment(payment));
    onClose();
  }
  return <Modal title="Record a payment" description="Add a payment to a member’s account and keep the books tidy." onClose={onClose}>
    <form className="form-body" onSubmit={submit} noValidate><div className="form-grid"><label className="field full-field">Member<select autoFocus value={memberId} onChange={(event) => { setMemberId(event.target.value); setErrors({}); }}><option value="">Choose a member</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.phone}</option>)}</select>{errors.memberId && <small className="field-error">{errors.memberId}</small>}</label>{selected && <div className="balance-hint full-field"><span>Outstanding balance for {selected.name}</span><strong>{money(balance)}</strong></div>}<label className="field">Payment amount<input type="number" min="1" max={balance || undefined} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" />{errors.amount && <small className="field-error">{errors.amount}</small>}</label><label className="field">Payment method<select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>{Object.entries(METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="field full-field">Note <span className="optional">OPTIONAL</span><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Monthly membership renewal" /></label></div><div className="form-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Plus size={15} /> Save payment</button></div></form>
  </Modal>;
}

export default function Payments() {
  const gym = useSelector((state: RootState) => state.gym);
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const monthPayments = gym.payments.filter((payment) => dateKey(new Date(payment.date)).slice(0, 7) === thisMonth);
  const monthTotal = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const allTime = gym.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = gym.members.reduce((sum, member) => sum + Math.max(member.totalFees - member.paidAmount, 0), 0);
  const membersWithBalance = gym.members.filter((member) => member.totalFees > member.paidAmount).sort((a, b) => (b.totalFees - b.paidAmount) - (a.totalFees - a.paidAmount));
  const filtered = useMemo(() => gym.payments.filter((payment) => (!query || `${payment.memberName} ${payment.note}`.toLowerCase().includes(query.toLowerCase())) && (method === "all" || payment.method === method)).sort((a, b) => b.date.localeCompare(a.date)), [gym.payments, query, method]);
  function exportPayments() {
    const rows = [["Date", "Member", "Amount", "Method", "Note"], ...filtered.map((payment) => [new Date(payment.date).toLocaleDateString("en-IN"), payment.memberName, payment.amount, METHOD_LABELS[payment.method], payment.note])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "gymsathi-payments.csv"; anchor.click(); URL.revokeObjectURL(url);
  }
  return <div className="page-stack"><div className="page-heading"><div><span className="section-kicker">HEALTHY BOOKS, HEALTHY GYM</span><h1>Payments</h1><p>Keep an eye on collections, outstanding balances and every little win.</p></div><button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Record payment</button></div>
    <div className="finance-stats"><div className="finance-stat-card"><span className="finance-icon tone-lime"><CircleDollarSign size={18} /></span><div><small>Collected this month</small><strong>{money(monthTotal)}</strong><span><ArrowUpRight size={13} /> {monthPayments.length} payments recorded</span></div></div><div className="finance-stat-card"><span className="finance-icon tone-blue"><Wallet size={18} /></span><div><small>Outstanding balance</small><strong>{money(outstanding)}</strong><span>{gym.members.filter((member) => member.paidAmount < member.totalFees).length} member accounts</span></div></div><div className="finance-stat-card"><span className="finance-icon tone-violet"><Banknote size={18} /></span><div><small>Collected all time</small><strong>{money(allTime)}</strong><span>{gym.payments.length} payments across the gym</span></div></div></div>
    <section className="panel payment-reminder-panel"><div className="payment-reminder-heading"><div><span className="section-kicker">A FRIENDLY NUDGE</span><h2>Payment reminders <span className="count-pill">{membersWithBalance.length}</span></h2><p>Send a pre-filled balance reminder by WhatsApp or SMS.</p></div><span className="reminder-total"><small>Total outstanding</small><strong>{money(outstanding)}</strong></span></div>{membersWithBalance.length > 0 ? <div className="reminder-member-list">{membersWithBalance.map((member, index) => { const links = paymentReminderLinks(member, gym.profile); return <div className="reminder-member-row" key={member.id}><span className={`member-avatar avatar-color-${index % 5}`}>{member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div className="reminder-member-copy"><strong>{member.name}</strong><small>{member.phone}</small></div><strong className="due-amount reminder-balance">{money(member.totalFees - member.paidAmount)}</strong><div className="reminder-actions"><a className="button button-whatsapp" href={links.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a><a className="button button-outline" href={links.sms}><MessageSquareText size={14} /> SMS</a></div></div>; })}</div> : <div className="reminder-empty"><CircleDollarSign size={18} /><span>Everyone is up to date. There are no payment reminders to send.</span></div>}<div className="reminder-disclaimer">Messages open in your selected app with the member’s balance filled in. Review and send from WhatsApp or your SMS app.</div></section>
    <section className="panel table-panel"><div className="table-toolbar"><div><h2>Payment history <span className="count-pill">{filtered.length}</span></h2><p>A clear record of every payment received.</p></div><div className="table-tools"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search payments" /></label><select className="toolbar-select" value={method} onChange={(event) => setMethod(event.target.value)}><option value="all">All methods</option>{Object.entries(METHOD_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button className="button button-outline" onClick={exportPayments}><ArrowDownToLine size={15} /> Export</button></div></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>MEMBER</th><th>AMOUNT</th><th>METHOD</th><th>DATE & TIME</th><th>NOTE</th><th>RECEIPT</th></tr></thead><tbody>{filtered.map((payment, index) => <tr key={payment.id}><td><div className="table-member"><span className={`member-avatar avatar-color-${index % 5}`}>{payment.memberName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><strong>{payment.memberName}</strong><small>Member payment</small></span></div></td><td><strong className="payment-amount">{money(payment.amount)}</strong></td><td><span className="method-pill"><span className={`method-icon method-${payment.method}`}>{payment.method === "cash" ? <Banknote size={13} /> : <CreditCard size={13} />}</span>{METHOD_LABELS[payment.method]}</span></td><td><span className="table-date">{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(payment.date))}</span><small className="table-subtext">{new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(payment.date))}</small></td><td><span className="goal-text">{payment.note || "—"}</span></td><td><button className="receipt-button" onClick={() => downloadReceipt(payment)}><ArrowDownToLine size={14} /> Receipt</button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="table-empty"><CreditCard size={24} /><strong>No payments in this view</strong><span>Try another filter or record your first payment.</span></div>}</div><div className="table-footer"><span>Showing <strong>{filtered.length}</strong> payment records</span><span><CalendarDays size={13} /> Currency: INR <span className="footer-heart">✦</span></span></div></section>
    <div className="page-footer"><span>Payment totals update member balances automatically.</span><span>{gym.payments.length} records <span className="footer-heart">✦</span></span></div>{modalOpen && <PaymentEditor onClose={() => setModalOpen(false)} />}</div>;
}
