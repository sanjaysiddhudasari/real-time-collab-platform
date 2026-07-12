import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Room from "./pages/Room";
import ForgotPassword from "./pages/ForgotPassword";
import { Toaster } from "react-hot-toast";
import api from "./services/api";

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
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/room" element={<Room />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/invite/:code" element={<InviteRedirect />} />
      </Routes>
    </>
  );
}

export default App;
