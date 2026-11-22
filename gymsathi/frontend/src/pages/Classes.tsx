import { useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, CalendarDays, Check, Clock3, Dumbbell, Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import Modal from "../components/Modal";
import { addClass, bookClass, cancelClassBooking, deleteClass } from "../store/gymSlice";
import type { AppDispatch, RootState } from "../store/store";
import { CLASS_CATEGORY_LABELS, type ClassCategory, type GymClass } from "../types";
import { classSchema, joiErrors } from "../validation";
import { dateKey, shiftDate } from "../lib/dates";
import "./Classes.css";

type ClassForm = Omit<GymClass, "id" | "memberIds">;
const blankClass: ClassForm = { title: "", category: "strength", trainer: "", date: dateKey(), startTime: "18:00", durationMinutes: 45, capacity: 12 };
const classId = () => `class-${crypto.randomUUID()}`;

const formatDay = (day: string) => new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${day}T12:00:00`));
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
};

export default function Classes() {
  const gym = useSelector((state: RootState) => state.gym);
  const dispatch = useDispatch<AppDispatch>();
  const [selectedDay, setSelectedDay] = useState(dateKey());
  const [creating, setCreating] = useState(false);
  const [bookingClass, setBookingClass] = useState<GymClass | null>(null);
  const [managingBookings, setManagingBookings] = useState(false);
  const [form, setForm] = useState<ClassForm>(blankClass);
  const [selectedMember, setSelectedMember] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => shiftDate(dateKey(), index)), []);
  const sessions = gym.classes.filter((item) => item.date === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const activeBookingClass = bookingClass ? gym.classes.find((item) => item.id === bookingClass.id) ?? bookingClass : null;
  const weekSessions = gym.classes.filter((item) => days.includes(item.date));
  const bookedSpots = weekSessions.reduce((sum, item) => sum + item.memberIds.length, 0);
  const totalSpots = weekSessions.reduce((sum, item) => sum + item.capacity, 0);

  function openCreate() {
    setForm({ ...blankClass, date: selectedDay });
    setErrors({});
    setCreating(true);
  }

  function saveClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!days.includes(form.date)) {
      setErrors({ date: "Choose a date in the next 7 days." });
      return;
    }
    const { error } = classSchema.validate(form, { abortEarly: false });
    setErrors(joiErrors(error));
    if (error) return;
    dispatch(addClass({ ...form, id: classId(), memberIds: [] }));
    setSelectedDay(form.date);
    setCreating(false);
    setNotice("Class added to the schedule.");
  }

  function reserveSpot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookingClass || !selectedMember) return;
    const currentClass = gym.classes.find((item) => item.id === bookingClass.id);
    if (!currentClass || currentClass.memberIds.length >= currentClass.capacity || currentClass.memberIds.includes(selectedMember)) {
      setNotice("That class spot is no longer available. Refresh the schedule and try again.");
      setBookingClass(null);
      return;
    }
    const member = gym.members.find((item) => item.id === selectedMember);
    dispatch(bookClass({ classId: bookingClass.id, memberId: selectedMember }));
    setBookingClass(null);
    setSelectedMember("");
    setNotice(`${member?.name ?? "Member"} added to ${bookingClass.title}.`);
  }

  return <div className="page-stack class-page">
    <div className="page-heading"><div><span className="section-kicker">MAKE SPACE TO MOVE</span><h1>Class schedule</h1><p>Plan the week, fill the room and keep members coming back.</p></div><button className="button button-primary" onClick={openCreate}><Plus size={16} /> Add class</button></div>

    <section className="classes-hero" aria-label="Class schedule overview"><div className="classes-hero-copy"><span className="classes-hero-kicker"><Dumbbell size={14} /> GROUP TRAINING, IN RHYTHM</span><h2>Build momentum<br />together.</h2><p>Good sessions bring a community closer. Your next week starts here.</p><a href="#class-sessions" className="classes-hero-link">View this week <ArrowRight size={15} /></a></div><div className="classes-hero-stats"><div><span>Sessions this week</span><strong>{weekSessions.length.toString().padStart(2, "0")}</strong></div><div><span>Spots filled</span><strong>{bookedSpots}<small> / {totalSpots}</small></strong></div><div className="classes-hero-progress"><i style={{ width: `${totalSpots ? Math.round(bookedSpots / totalSpots * 100) : 0}%` }} /></div></div></section>

    {notice && <div className="class-notice" role="status"><Check size={15} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}

    <section className="class-schedule-panel panel" id="class-sessions">
      <div className="class-schedule-heading"><div><span className="section-kicker">YOUR WEEK, AT A GLANCE</span><h2>Upcoming sessions</h2></div><span className="class-week-label"><CalendarDays size={15} /> Next 7 days</span></div>
      <div className="class-day-strip" role="tablist" aria-label="Choose a day">{days.map((day, index) => { const count = gym.classes.filter((item) => item.date === day).length; const date = new Date(`${day}T12:00:00`); return <button key={day} role="tab" aria-selected={selectedDay === day} className={`class-day${selectedDay === day ? " selected" : ""}`} onClick={() => setSelectedDay(day)}><span>{index === 0 ? "TODAY" : date.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase()}</span><strong>{date.getDate()}</strong><small>{count ? `${count} ${count === 1 ? "class" : "classes"}` : "Rest day"}</small></button>; })}</div>
      <div className="class-session-list">{sessions.map((item) => {
        const bookedMembers = item.memberIds.map((id) => gym.members.find((member) => member.id === id)).filter((member) => member !== undefined);
        const full = item.memberIds.length >= item.capacity;
        const pct = Math.min(item.memberIds.length / item.capacity * 100, 100);
        return <article className={`class-session-card category-${item.category}`} key={item.id}>
          <div className="class-time"><strong>{formatTime(item.startTime)}</strong><span>{item.durationMinutes} min</span></div>
          <div className="class-session-main"><div className="class-title-row"><span className={`class-category category-pill-${item.category}`}>{CLASS_CATEGORY_LABELS[item.category]}</span><button className="class-delete" aria-label={`Remove ${item.title}`} onClick={() => dispatch(deleteClass(item.id))}><Trash2 size={14} /></button></div><h3>{item.title}</h3><div className="class-trainer"><span className="trainer-avatar">{item.trainer.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</span> Led by {item.trainer}</div>
            <div className="class-capacity"><div className="capacity-caption"><span><UsersRound size={14} /> {item.memberIds.length} of {item.capacity} spots booked</span><span>{full ? "Full" : `${item.capacity - item.memberIds.length} open`}</span></div><div className="capacity-track"><i style={{ width: `${pct}%` }} /></div></div>
            <div className="class-card-footer"><div className="class-attendees">{bookedMembers.slice(0, 4).map((member, index) => <span key={member.id} className={`mini-avatar mini-${index}`} title={member.name}>{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</span>)}<span className="attendee-names">{bookedMembers.length ? bookedMembers.slice(0, 2).map((member) => member.name.split(" ")[0]).join(", ") : "Be the first to book"}{bookedMembers.length > 2 ? ` +${bookedMembers.length - 2}` : ""}</span>{bookedMembers.length > 0 && <button className="booking-manage-link" onClick={() => { setBookingClass(item); setManagingBookings(true); }}>Manage</button>}</div><button className="button button-outline class-book-button" disabled={full} onClick={() => { setBookingClass(item); setSelectedMember(""); setManagingBookings(false); }}>{full ? "Class full" : "Book a member"}</button></div>
          </div>
        </article>;
      })}{sessions.length === 0 && <div className="classes-empty"><span className="classes-empty-icon"><CalendarDays size={21} /></span><strong>A little room in the schedule</strong><p>No classes are planned for {formatDay(selectedDay)} yet.</p><button className="text-link" onClick={openCreate}>Add a class <ArrowRight size={14} /></button></div>}</div>
    </section>

    <div className="page-footer"><span>Class capacity helps keep every session personal.</span><span><Clock3 size={13} /> Dates shown in your local time</span></div>

    {creating && <Modal title="Add a class" description="Create a group session on your studio schedule." onClose={() => setCreating(false)}><form className="form-body" onSubmit={saveClass} noValidate><div className="form-grid"><label className="field full-field">Class name<input autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Morning strength" />{errors.title && <small className="field-error">{errors.title}</small>}</label><label className="field">Style<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ClassCategory })}>{Object.entries(CLASS_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="field">Trainer<input value={form.trainer} onChange={(event) => setForm({ ...form, trainer: event.target.value })} placeholder="Trainer name" />{errors.trainer && <small className="field-error">{errors.trainer}</small>}</label><label className="field">Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />{errors.date && <small className="field-error">{errors.date}</small>}</label><label className="field">Start time<input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} /></label><label className="field">Duration<select value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })}><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={50}>50 minutes</option><option value={60}>60 minutes</option><option value={75}>75 minutes</option></select></label><label className="field">Spots available<input type="number" min="1" max="50" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })} />{errors.capacity && <small className="field-error">{errors.capacity}</small>}</label></div><div className="form-actions"><button type="button" className="button button-outline" onClick={() => setCreating(false)}>Cancel</button><button type="submit" className="button button-primary"><Plus size={15} /> Add to schedule</button></div></form></Modal>}

    {activeBookingClass && managingBookings && <Modal title="Manage class bookings" description={`${activeBookingClass.title} · ${formatDay(activeBookingClass.date)}`} onClose={() => { setBookingClass(null); setManagingBookings(false); }} size="small"><div className="form-body"><div className="booking-member-list">{activeBookingClass.memberIds.map((memberId) => { const member = gym.members.find((item) => item.id === memberId); if (!member) return null; return <div className="booking-member-row" key={memberId}><span className="trainer-avatar">{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</span><strong>{member.name}</strong><button className="booking-remove" onClick={() => { dispatch(cancelClassBooking({ classId: activeBookingClass.id, memberId })); setNotice(`${member.name} was removed from the booking.`); }} aria-label={`Remove ${member.name} from class`}><Trash2 size={14} /> Remove</button></div>; })}{activeBookingClass.memberIds.length === 0 && <p className="booking-note">No members are booked yet.</p>}</div><div className="form-actions"><button className="button button-outline" onClick={() => { setBookingClass(null); setManagingBookings(false); }}>Done</button><button className="button button-primary" disabled={activeBookingClass.memberIds.length >= activeBookingClass.capacity} onClick={() => { setManagingBookings(false); setSelectedMember(""); }}><Plus size={15} /> Add member</button></div></div></Modal>}

    {activeBookingClass && !managingBookings && <Modal title="Book a class spot" description={`${activeBookingClass.title} · ${formatDay(activeBookingClass.date)} at ${formatTime(activeBookingClass.startTime)}`} onClose={() => setBookingClass(null)} size="small"><form className="form-body" onSubmit={reserveSpot}><label className="field">Choose a member<select autoFocus required value={selectedMember} onChange={(event) => setSelectedMember(event.target.value)}><option value="">Select from your member list</option>{gym.members.filter((member) => !activeBookingClass.memberIds.includes(member.id) && new Date(`${member.endDate}T23:59:59`).getTime() >= Date.now()).map((member) => <option value={member.id} key={member.id}>{member.name} · {member.plan}</option>)}</select></label><p className="booking-note"><UserRound size={14} /> {activeBookingClass.capacity - activeBookingClass.memberIds.length} spots left in this session</p><div className="form-actions"><button type="button" className="button button-outline" onClick={() => setBookingClass(null)}>Cancel</button><button type="submit" className="button button-primary" disabled={!selectedMember}><Check size={15} /> Confirm spot</button></div></form></Modal>}
  </div>;
}
