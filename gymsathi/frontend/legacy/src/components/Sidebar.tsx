import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LayoutDashboard, Users, Clock3, MessageSquare, BookOpen, LogOut, ChevronUp } from "lucide-react";
import { logout } from "../store/authSlice";
import ToggleSidebarIcon from "./ToggleSidebarIcon";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Members", path: "/members", icon: Users },
  { name: "Renewals", path: "/renewals", icon: Clock3 },
  { name: "Inquiries", path: "/inquiries", icon: MessageSquare },
  { name: "Styleguide", path: "/styleguide", icon: BookOpen },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const popoverRef = useRef(null);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`${collapsed ? "w-20" : "w-64"} h-screen bg-white border-r border-gray-200 flex flex-col justify-between p-4 overflow-visible transition-all duration-300 relative`}>

      {/* Top Section */}
      <div>
        {/* Logo & Toggle */}
        <div className={`flex items-center mb-6 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shrink-0">
                G
              </div>
              <h1 className="text-lg font-semibold text-black truncate">GymFlow</h1>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="text-gray-500 hover:text-gray-700 transition shrink-0 focus:outline-none"
            title="Toggle Sidebar"
          >
            <ToggleSidebarIcon size={24} collapsed={collapsed} />
          </button>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                title={collapsed ? item.name : ""}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-4"} py-2 rounded-lg cursor-pointer transition ${
                    isActive
                      ? "bg-green-100 text-green-600"
                      : "text-gray-600 hover:bg-gray-200"
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom — Profile Card */}
      <div className="relative" ref={popoverRef}>

        {/* Popover */}
        {open && (
          <div className="absolute bottom-full mb-2 left-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
            {/* Avatar + name */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1 text-sm text-gray-600 border-t border-gray-100 pt-3 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Role</span>
                <span className="capitalize font-medium">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Joined</span>
                <span className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}

        {/* Trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center ${collapsed ? "justify-center px-0" : "gap-3 px-3"} py-2 rounded-lg hover:bg-gray-100 transition`}
          title={collapsed ? "Profile Options" : ""}
        >
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-gray-400 capitalize truncate">{user?.role || ""}</p>
              </div>
              <ChevronUp size={16} className={`text-gray-400 transition-transform shrink-0 ${open ? "" : "rotate-180"}`} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
