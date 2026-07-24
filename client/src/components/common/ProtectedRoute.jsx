import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  if (!user?.userId)
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
