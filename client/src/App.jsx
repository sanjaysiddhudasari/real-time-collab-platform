import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Room from "./pages/Room";
import ForgotPassword from "./pages/ForgotPassword";
import { Toaster } from "react-hot-toast";
import api from "./services/api";
import ProtectedRoute from "./components/common/ProtectedRoute";

function InviteRedirect() {
  const { code } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    api.get(`/rooms/invite/${code}`)
      .then((res) => navigate(`/room/${res.data.roomId}`))
      .catch(() => { navigate("/"); });
  }, []);
  return <div className="min-h-screen bg-[#0a0a0f]" />;
}

function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid #27272a",
            fontSize: "13px",
            borderRadius: "12px",
            padding: "10px 14px",
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/room" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/room/:roomId" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/invite/:code" element={<ProtectedRoute><InviteRedirect /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
