import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../../services/api";

// ponytail: session verified against the server, never trusts cached localStorage identity
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");
  const location = useLocation();

  useEffect(() => {
    api.get("/auth/me").then(() => setStatus("ok")).catch(() => setStatus("unauth"));
  }, []);

  if (status === "checking") return <div className="min-h-screen bg-[#0a0a0f]" />;
  if (status === "unauth")
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
