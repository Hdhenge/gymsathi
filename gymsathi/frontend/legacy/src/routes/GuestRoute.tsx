import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute() {
  const token = useSelector((state) => state.auth.token);
  return token ? <Navigate to="/styleguide" replace /> : <Outlet />;
}
