import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar — fixed, never scrolls */}
      <div className="hidden lg:flex shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

    </div>
  );
}