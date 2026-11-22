import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../Mainlayout";
import Styleguide from "../pages/Styleguide";
import Home from "../pages/Home";
import Members from "../pages/Members";
import Renewals from "../pages/Renewals";
import Inquiries from "../pages/Inquiries";
import AuthLayout from "../Authlayout";
import Auth from "../pages/Auth";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Only accessible when NOT logged in */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<Auth />} />
        </Route>
      </Route>

      {/* Only accessible when logged in */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/styleguide" element={<Styleguide />} />
          <Route path="/members" element={<Members />} />
          <Route path="/renewals" element={<Renewals />} />
          <Route path="/inquiries" element={<Inquiries />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}
