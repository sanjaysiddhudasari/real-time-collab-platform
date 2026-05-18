import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Room from "./pages/Room";
import ForgotPassword from "./pages/ForgotPassword";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#18181b", // zinc-900
            color: "#fff",
            border: "1px solid #27272a", // zinc-800
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
      </Routes>
    </>
  );
}

export default App;
