import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/dashboard/Navbar";
import Stats from "../components/dashboard/Stats";
import Toolbar from "../components/dashboard/Toolbar";
import RoomCard from "../components/dashboard/RoomCard";
import CreateRoomModal from "../components/dashboard/CreateRoomModal";
import useSocketStatus from "../hooks/useSocketStatus";
import useRooms from "../hooks/useRooms";
import useUser from "../hooks/useUser";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("googleLogin") === "true") {
      const user = {
        userId: params.get("userId"),
        username: params.get("username"),
      };
      localStorage.setItem("user", JSON.stringify(user));
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomname: "",
    language: "javascript",
    visibility: "",
  });
  const [joining, setJoining] = useState(null);
  const [tab, setTab] = useState("all"); // all | mine

  const { user } = useUser();
  const [connected, socketId] = useSocketStatus();
  const [rooms, loading, userId, error, fetchRooms] = useRooms();

  const handleJoin = async (room) => {
    setJoining(room.roomId);
    try {
      await api.post(`/rooms/${room.roomId}/join`);
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => {
      navigate(`/room/${room.roomId}`);
    }, 600);
  };

  const handleCreate = async () => {
    if (!newRoom.roomname.trim()) return;
    const response = await api.post("/rooms", newRoom);
    await fetchRooms();
    setNewRoom({ roomname: "", language: "javascript", visibility: "" });
    setShowModal(false);
    setTimeout(() => navigate(`/room/${response.data.roomId}`), 100);
  };

  const handleDelete = async (roomId) => {
    await api.delete(`/rooms/${roomId}`);
    await fetchRooms();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-300 rounded-full animate-spin" />
        <p className="text-zinc-600 text-xs">Loading workspaces</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* single faint top glow + hairline, not floating blobs */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(600px 200px at 50% -60px, rgba(59,130,246,0.07), transparent)" }}
      />
      <Navbar connected={connected} user={user} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-6">
        <Stats rooms={rooms} socketId={socketId} connected={connected} userId={userId} />
        <Toolbar
          rooms={rooms}
          search={search}
          onSearchChange={setSearch}
          userId={userId}
          tab={tab}
          onTabChange={setTab}
          onCreate={setShowModal}
        />
        <RoomCard
          rooms={rooms}
          userId={userId}
          onJoin={handleJoin}
          joining={joining}
          onDelete={handleDelete}
          tab={tab}
          search={search}
        />
      </div>

      {showModal && (
        <CreateRoomModal
          newRoom={newRoom}
          setNewRoom={setNewRoom}
          handleCreate={handleCreate}
          setShowModal={setShowModal}
        />
      )}
    </div>
  );
}
