import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { lazy, Suspense, type ReactNode } from "react";
import type { RootState } from "./store/store";

const AppShell = lazy(() => import("./components/AppShell"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Members = lazy(() => import("./pages/Members"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Classes = lazy(() => import("./pages/Classes"));
const Leads = lazy(() => import("./pages/Leads"));
const Renewals = lazy(() => import("./pages/Renewals"));
const Payments = lazy(() => import("./pages/Payments"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));

function RouteLoading() {
  return <div className="route-loading"><span className="loading-mark">✦</span><span>Getting your gym ready...</span></div>;
}

function Protected({ children }: { children: ReactNode }) {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const token = useSelector((state: RootState) => state.auth.token);
  return (
    <Suspense fallback={<RouteLoading />}><Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<Protected><AppShell /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="classes" element={<Classes />} />
        <Route path="leads" element={<Leads />} />
        <Route path="renewals" element={<Renewals />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes></Suspense>
  );
}
