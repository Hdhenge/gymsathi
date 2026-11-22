import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Activity, BarChart3, Bell, CalendarDays, ChevronDown, ClipboardCheck, CreditCard, Dumbbell, LayoutDashboard, LogOut, Menu, MessageSquareText, Settings2, UsersRound, X, Clock3 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { logout } from "../store/authSlice";
import { replaceWorkspace, setSyncError } from "../store/gymSlice";
import { hydrateServerWorkspace } from "../lib/backendSync";
import { apiConfigured } from "../lib/apiClient";

const navigation = [
  { label: "Overview", to: "/", icon: LayoutDashboard },
  { label: "Members", to: "/members", icon: UsersRound, count: "members" },
  { label: "Attendance", to: "/attendance", icon: ClipboardCheck },
  { label: "Classes", to: "/classes", icon: CalendarDays },
  { label: "Prospects", to: "/leads", icon: MessageSquareText, count: "leads" },
  { label: "Renewals", to: "/renewals", icon: Clock3 },
  { label: "Payments", to: "/payments", icon: CreditCard },
  { label: "Reports", to: "/reports", icon: BarChart3 },
];

const titles: Record<string, string> = {
  "/": "Overview", "/members": "Members", "/attendance": "Attendance", "/classes": "Class schedule", "/leads": "Prospects",
  "/renewals": "Renewals", "/payments": "Payments", "/reports": "Reports", "/settings": "Settings",
};

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const gym = useSelector((state: RootState) => state.gym);
  const title = titles[location.pathname] ?? "Overview";

  useEffect(() => {
    if (!token || token === "demo-session" || !apiConfigured) {
      setWorkspaceLoading(false);
      return;
    }
    let active = true;
    setWorkspaceLoading(true);
    void hydrateServerWorkspace().then((workspace) => {
      if (active) dispatch(replaceWorkspace(workspace));
    }).catch(() => {
      if (active) dispatch(setSyncError("Could not load gym data from the server. Your browser workspace is still available."));
    }).finally(() => { if (active) setWorkspaceLoading(false); });
    return () => { active = false; };
  }, [dispatch, token]);

  if (workspaceLoading) return <div className="route-loading"><span className="loading-mark">✦</span><span>Loading your gym workspace...</span></div>;

  const nav = (
    <>
      <div className="brand-lockup">
        <div className="brand-mark"><Dumbbell size={19} strokeWidth={2.5} /></div>
        <div className="brand-name">gym<span>sathi</span><small>STUDIO MANAGER</small></div>
        <button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button>
      </div>
      <div className="workspace-switcher">
        <div className="workspace-avatar">SN</div>
        <div className="workspace-copy"><strong>{gym.profile.name}</strong><span>Owner workspace</span></div>
        <ChevronDown size={15} />
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="primary-nav" aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const count = item.count === "members" ? gym.members.length : item.count === "leads" ? gym.leads.filter((lead) => lead.status === "new").length : null;
          return (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
              <Icon size={18} strokeWidth={1.9} /><span>{item.label}</span>{count !== null && <span className="nav-count">{count}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="nav-bottom">
        <NavLink to="/renewals" className="upgrade-card">
          <div className="upgrade-icon"><Activity size={16} /></div>
          <strong>Keep the momentum</strong>
          <p>A thoughtful reminder can help a member stay on track.</p>
          <small className="upgrade-link">Review upcoming renewals →</small>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} onClick={() => setMobileOpen(false)}>
          <Settings2 size={18} strokeWidth={1.9} /><span>Settings</span>
        </NavLink>
      </div>
      <div className="sidebar-profile">
        <div className="avatar avatar-lime">{initials(user?.name ?? "Alex Morgan")}</div>
        <div className="profile-copy"><strong>{user?.name ?? "Alex Morgan"}</strong><span>Gym owner</span></div>
        <button className="icon-button profile-menu-button" aria-label="Open account menu" onClick={() => setProfileOpen((value) => !value)}><ChevronDown size={16} /></button>
        {profileOpen && <div className="profile-menu"><p>{user?.email}</p><button onClick={() => { dispatch(logout()); navigate("/login"); }}> <LogOut size={15} /> Sign out</button></div>}
      </div>
    </>
  );

  return (
    <div className="app-frame">
      <aside className="sidebar">{nav}</aside>
      {mobileOpen && <div className="mobile-scrim" onClick={() => setMobileOpen(false)}><aside className="sidebar mobile-sidebar" onClick={(event) => event.stopPropagation()}>{nav}</aside></div>}
      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Studio North</span><span className="crumb-slash">/</span><strong>{title}</strong></div>
          <div className="topbar-actions">
            <div className="today-date">{new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(new Date())}</div>
            <div className="notification-wrap">
              <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotificationsOpen((value) => !value)}><Bell size={18} /><i /></button>
              {notificationsOpen && <div className="notification-popover"><strong>Today at your gym</strong><p><span className="notification-dot lime-dot" />{gym.attendance.filter((record) => record.date === new Date().toISOString().slice(0, 10)).length} member check-ins recorded</p><p><span className="notification-dot amber-dot" />{gym.members.filter((member) => { const days = Math.ceil((new Date(member.endDate).getTime() - Date.now()) / 86400000); return days >= 0 && days <= 7; }).length} memberships expiring soon</p></div>}
            </div>
            <div className="avatar avatar-lime topbar-avatar">{initials(user?.name ?? "Alex Morgan")}</div>
          </div>
        </header>
        <div className="page-content">{gym.syncError && <div className="sync-notice" role="status"><span>{gym.syncError}</span><button onClick={() => dispatch(setSyncError(null))} aria-label="Dismiss">×</button></div>}<Outlet /></div>
      </main>
    </div>
  );
}
