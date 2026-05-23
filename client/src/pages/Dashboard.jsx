import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/dashboard/Navbar";
import Stats from "../components/dashboard/Stats";
import Toolbar from "../components/dashboard/Toolbar";
import RoomCard from "../components/dashboard/RoomCard";
import CreateRoomModal from "../components/dashboard/CreateRoomModal";



export default function Dashboard() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState("");
  const [userId, setUserId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomname: "",
    language: "javascript",
    visibility: "",
  });
  const [joining, setJoining] = useState(null);
  const [tab, setTab] = useState("all"); // all | mine
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      setSocketId(socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  // fetch data from server

  const fetchRooms = async () => {
    setLoading(true);

    try {
      const response = await api.get("/rooms");

      setRooms(response.data.rooms);
      setUserId(response.data.userId);
      console.log(response);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
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
    await api.post("/rooms", newRoom);
    await fetchRooms();
    setNewRoom({ roomname: "", language: "javascript", visibility: "" });
    setShowModal(false);
    setTimeout(() => navigate(`/room/${roomId}`), 100);
  };

  const handleDelete = async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    await fetchRooms();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="w-11 h-11 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />

        <p className="text-zinc-500 text-sm animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-125 h-125 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-100 h-100 rounded-full bg-violet-500/8 blur-3xl" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <Navbar connected={connected} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <Stats
          rooms={rooms}
          socketId={socketId}
          connected={connected}
          userId={userId}
        />

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
