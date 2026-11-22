import { useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Check, CheckCircle2, ClipboardCheck, Clock3, LogIn, LogOut, Search, UsersRound } from "lucide-react";
import type { AppDispatch, RootState } from "../store/store";
import { checkOut, markAttendance } from "../store/gymSlice";
import type { AttendanceRecord, Member } from "../types";
import { dateKey, daysUntil } from "../lib/dates";

const today = dateKey();
const currentTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
const active = (member: Member) => daysUntil(member.endDate) >= 0;

export default function Attendance() {
  const gym = useSelector((state: RootState) => state.gym);
  const dispatch = useDispatch<AppDispatch>();
  const [memberId, setMemberId] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const todaysRecords = gym.attendance.filter((record) => record.date === today);
  const checkedInIds = useMemo(() => new Set(todaysRecords.map((record) => record.memberId)), [gym.attendance]);
  const checkedIn = todaysRecords.filter((record) => !record.checkOut);
  const complete = todaysRecords.filter((record) => record.checkOut);
  const matches = gym.members.filter((member) => active(member) && (!query || `${member.name} ${member.phone}`.toLowerCase().includes(query.toLowerCase()))).slice(0, 5);

  function handleCheckIn(event: FormEvent) {
    event.preventDefault();
    const member = gym.members.find((item) => item.id === memberId);
    if (!member) { setError("Choose a member to check in."); return; }
    if (checkedInIds.has(member.id)) { setError(`${member.name} already has an attendance record today.`); return; }
    const entry: AttendanceRecord = { id: `a-${Date.now()}`, memberId: member.id, memberName: member.name, date: today, checkIn: currentTime() };
    dispatch(markAttendance(entry));
    setMemberId(""); setQuery(""); setError("");
  }

  function checkout(record: AttendanceRecord) { dispatch(checkOut(record.id)); }

  return <div className="page-stack"><div className="page-heading"><div><span className="section-kicker">SHOWING UP IS THE WHOLE THING</span><h1>Attendance</h1><p>Keep a clear view of who’s training and when they arrived.</p></div><div className="date-chip"><CalendarIcon />{new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</div></div>
    <div className="attendance-metrics"><div className="attendance-metric"><span className="metric-icon tone-lime"><CheckCircle2 size={18} /></span><div><small>Checked in today</small><strong>{todaysRecords.length}</strong><span>{complete.length} sessions wrapped up</span></div></div><div className="attendance-metric"><span className="metric-icon tone-blue"><Clock3 size={18} /></span><div><small>Currently training</small><strong>{checkedIn.length}</strong><span>Members in the gym</span></div></div><div className="attendance-metric"><span className="metric-icon tone-violet"><UsersRound size={18} /></span><div><small>Active roster</small><strong>{gym.members.filter(active).length}</strong><span>Ready to check in</span></div></div></div>
    <section className="attendance-layout"><div className="panel checkin-panel"><div className="checkin-heading"><span className="checkin-icon"><ClipboardCheck size={19} /></span><div><span className="section-kicker">FRONT DESK</span><h2>Check in a member</h2><p>A little consistency goes a long way.</p></div></div><form onSubmit={handleCheckIn} className="checkin-form"><label className="field">Find a member<div className="member-picker"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setMemberId(""); setError(""); }} placeholder="Name or phone number" /></div></label>{query && <div className="member-suggestions">{matches.map((member) => <button type="button" key={member.id} onClick={() => { setMemberId(member.id); setQuery(member.name); }}><span className="member-avatar small-avatar">{member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><strong>{member.name}</strong><small>{member.phone}</small></span><ArrowRight size={15} /></button>)}{matches.length === 0 && <span className="no-match">No active member found.</span>}</div>}{memberId && <div className="selected-member"><Check size={15} />{gym.members.find((member) => member.id === memberId)?.name}<span>Active membership</span></div>}{error && <small className="field-error">{error}</small>}<button type="submit" className="button button-primary checkin-button"><LogIn size={16} /> Check in <ArrowRight size={15} /></button></form><div className="checkin-footnote"><span className="status-pulse" /> Check-ins are saved for {new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(new Date())}.</div></div>
      <div className="panel live-panel"><div className="panel-heading"><div><span className="section-kicker">HAPPENING RIGHT NOW</span><h2>In the gym <span className="live-badge"><i /> LIVE</span></h2></div><span className="table-date">{todaysRecords.length} visits today</span></div><div className="live-list">{checkedIn.map((record, index) => <div className="live-row" key={record.id}><span className={`member-avatar avatar-color-${index % 5}`}>{record.memberName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span className="activity-person"><strong>{record.memberName}</strong><small>Checked in at {record.checkIn}</small></span><span className="training-now"><i /> Training</span><button className="button button-quiet checkout-button" onClick={() => checkout(record)}><LogOut size={14} /> Check out</button></div>)}{checkedIn.length === 0 && <div className="table-empty compact-empty"><CheckCircle2 size={23} /><strong>Everyone’s accounted for</strong><span>New check-ins will appear here.</span></div>}</div></div></section>
    <section className="panel table-panel attendance-history"><div className="table-toolbar"><div><h2>Today’s activity <span className="count-pill">{todaysRecords.length}</span></h2><p>Every visit adds up to something good.</p></div><span className="table-date">{complete.length} completed · {checkedIn.length} in session</span></div><div className="table-scroll"><table className="data-table"><thead><tr><th>MEMBER</th><th>CHECKED IN</th><th>CHECKED OUT</th><th>SESSION</th><th>STATUS</th></tr></thead><tbody>{todaysRecords.map((record, index) => <tr key={record.id}><td><div className="table-member"><span className={`member-avatar avatar-color-${index % 5}`}>{record.memberName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><strong>{record.memberName}</strong><small>{gym.members.find((member) => member.id === record.memberId)?.phone ?? "Member"}</small></span></div></td><td><span className="table-date">{record.checkIn}</span></td><td><span className="table-date">{record.checkOut ?? "—"}</span></td><td><span className="table-date">{record.checkOut ? sessionLength(record.checkIn, record.checkOut) : "In progress"}</span></td><td><span className={`status-pill ${record.checkOut ? "status-active" : "status-expiring"}`}>{record.checkOut ? "Complete" : "In session"}</span></td></tr>)}</tbody></table>{todaysRecords.length === 0 && <div className="table-empty"><ClipboardCheck size={24} /><strong>No visits recorded today</strong><span>Check in the first member to get started.</span></div>}</div></section>
    <div className="page-footer"><span>Attendance is tracked by local gym date.</span><span>{todaysRecords.length} visits <span className="footer-heart">✦</span></span></div></div>;
}

function sessionLength(start: string, end: string) { const [sh, sm] = start.split(":").map(Number); const [eh, em] = end.split(":").map(Number); const minutes = Math.max(eh * 60 + em - sh * 60 - sm, 0); return `${Math.floor(minutes / 60)}h ${minutes % 60}m`; }
function CalendarIcon() { return <CalendarDaysIcon />; }
function CalendarDaysIcon() { return <span className="calendar-glyph">▦</span>; }
