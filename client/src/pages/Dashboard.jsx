import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatDistanceToNow } from "date-fns";

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {Array.isArray(d) ? (
      d.map((p, i) => <path key={i} d={p} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

const ICONS = {
  code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  plus: "M12 5v14M5 12h14",
  participants: [
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    "M23 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  clock: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 6v6l4 2",
  ],
  logout: [
    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
    "M16 17l5-5-5-5",
    "M21 12H9",
  ],
  copy: [
    "M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z",
  ],
  trash: ["M3 6h18", "M19 6l-1 14H6L5 6", "M8 6V4h8v2"],
  terminal: "M4 17l6-6-6-6M12 19h8",
  bolt: "M13 10V3L4 14h7v7l9-11h-7z",
  grid: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"],
  search: ["M21 21l-4.35-4.35", "M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"],
  signal: ["M22 12h-4l-3 9L9 3l-3 9H2"],
};

const LANGS = {
  javascript: {
    label: "JavaScript",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  },
  typescript: {
    label: "TypeScript",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  python: {
    label: "Python",
    color: "text-green-400 bg-green-400/10 border-green-400/20",
  },
  cpp: {
    label: "C++",
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  },
  java: {
    label: "Java",
    color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  },
  go: { label: "Go", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
};

// ── Mock data ────────────────────────────────────────────────────────────────
// need actual data from api here
const MOCK_ROOMS = [
  {
    roomId: "rm_1",
    roomname: "Auth Module",
    language: "ts",
    participants: ["AK", "JS", "MR"],
    updatedAt: "2m ago",
    owner: true,
  },
  {
    roomId: "rm_2",
    roomname: "API Gateway",
    language: "go",
    participants: ["PL"],
    updatedAt: "18m ago",
    owner: false,
  },
  {
    roomId: "rm_3",
    roomname: "ML Pipeline",
    language: "py",
    participants: ["AK", "TN", "SK", "OP"],
    updatedAt: "1h ago",
    owner: true,
  },
  {
    roomId: "rm_4",
    roomname: "UI Components",
    language: "js",
    participants: ["AK", "JS"],
    updatedAt: "3h ago",
    owner: false,
  },
];

const AVATARS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
];
const avatarColor = (str) => AVATARS[str.charCodeAt(0) % AVATARS.length];

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
      socket.disconnect();
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
  const handleJoin = (room) => {
    setJoining(room.roomId);
    socket.emit("join-room", room.roomId);
    setTimeout(() => {
      navigate(`/room/${room.roomId}`); 
    }, 600);
  };

  const handleCreate = async () => {
    if (!newRoom.roomname.trim()) return;
    await api.post("/rooms", newRoom);
    await fetchRooms();
    socket.emit("create-room", { roomname: newRoom.roomname });
    setNewRoom({ roomname: "", language: "javascript", visibility: "" });
    setShowModal(false);
    setTimeout(() => navigate(`/room/${id}`), 100);
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

  const filtered = rooms
    ?.filter((r) =>
      tab === "mine" ? r.owner.toString() === userId.toString() : true,
    )
    ?.filter((r) => r.roomname.toLowerCase().includes(search.toLowerCase()));

  const stats = [
    {
      label: "Active rooms",
      value: rooms.length,
      icon: ICONS.grid,
    },

    {
      label: "Collaborators",
      value: [...new Set(rooms.flatMap((r) => r.participants || []))].length,
      icon: ICONS.participants,
    },

    {
      label: "My rooms",
      value: rooms.filter((r) => r.owner?.toString() === userId?.toString())
        .length,
      icon: ICONS.code,
    },

    {
      label: "Socket status",
      value: connected ? "Live" : "Offline",
      icon: ICONS.signal,
      live: true,
    },
  ];

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

      {/* ── Navbar ── */}
      <nav className="relative z-10 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <Icon d={ICONS.bolt} size={14} />
            </div>
            <span className="font-bold text-sm tracking-tight">CodeSync</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all duration-500
              ${connected ? "bg-green-500/10 border-green-500/25 text-green-400" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-zinc-500"}`}
              />
              {connected ? "Connected" : "Connecting…"}
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xs font-semibold cursor-pointer">
              AK
            </div>

            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors px-2 py-1"
            >
              <Icon d={ICONS.logout} size={14} />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-zinc-950/60 backdrop-blur border border-zinc-800/60 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-500 text-xs">{s.label}</span>
                <Icon d={s.icon} size={14} className="text-zinc-600" />
              </div>
              <p
                className={`text-xl font-bold tracking-tight ${s.live ? (connected ? "text-green-400" : "text-zinc-500") : "text-white"}`}
              >
                {s.value}
              </p>
              {s.live && socketId && (
                <p className="text-zinc-600 text-[10px] mt-1 font-mono truncate">
                  {socketId}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Your rooms</h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              Join a session or create a new one
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Icon
                d={ICONS.search}
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search rooms…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-48 bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition"
              />
            </div>

            {/* Tabs */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
              {["all", "mine"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 capitalize
                    ${tab === t ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Create */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] active:translate-y-0 whitespace-nowrap"
            >
              <Icon d={ICONS.plus} size={13} />
              New room
            </button>
          </div>
        </div>

        {/* ── Room grid ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Icon d={ICONS.terminal} size={32} className="mb-3" />
            <p className="text-sm">No rooms found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((room) => {
              console.log(room);
              const lang = LANGS[room.language];
              const isJoining = joining === room.roomId;
              return (
                <div
                  key={room.roomId}
                  className="group bg-zinc-950/60 backdrop-blur border border-zinc-800/60 hover:border-zinc-700 rounded-2xl p-5 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col gap-4"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${lang.color}`}
                        >
                          {lang.label}
                        </span>
                        {room.owner.toString() === userId.toString() && (
                          <span className="text-[11px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-md">
                            Owner
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white truncate">
                        {room.roomname}
                      </h3>
                    </div>

                    {room.owner.toString() === userId.toString() && (
                      <button
                        onClick={() => handleDelete(room.roomId)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all duration-150 p-1 ml-2"
                      >
                        <Icon d={ICONS.trash} size={13} />
                      </button>
                    )}
                  </div>

                  {/* participants */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {room.participants.slice(0, 4).map((u, i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-full ${avatarColor(u.username)} flex items-center justify-center text-[9px] font-bold border-2 border-[#0a0a0f]`}
                          >
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                        ))}
                        {room.participants.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 border-2 border-[#0a0a0f]">
                            +{room.participants.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="ml-2 text-zinc-500 text-xs">
                        {room.participants.length} online
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-600 text-[11px]">
                      <Icon d={ICONS.clock} size={11} />
                      {formatDistanceToNow(new Date(room.updatedAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  {/* Join button */}
                  <button
                    onClick={() => handleJoin(room)}
                    disabled={isJoining}
                    className="w-full py-2.5 bg-zinc-800/80 hover:bg-blue-600 disabled:opacity-60 border border-zinc-700/50 hover:border-blue-500 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isJoining ? (
                      <>
                        <svg
                          className="animate-spin"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                            strokeLinecap="round"
                          />
                        </svg>
                        Joining…
                      </>
                    ) : (
                      <>
                        <Icon d={ICONS.terminal} size={13} />
                        Join session
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create room modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
        >
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
            <h3 className="text-base font-semibold text-white mb-1">
              Create new room
            </h3>
            <p className="text-zinc-500 text-xs mb-5">
              Start a new collaborative coding session
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Room name
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Auth Module"
                  value={newRoom.roomname}
                  onChange={(e) =>
                    setNewRoom((p) => ({ ...p, roomname: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(LANGS).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setNewRoom((p) => ({ ...p, language: key }))
                      }
                      className={`py-2 rounded-xl text-xs font-medium border transition-all duration-150
                        ${newRoom.language === key ? val.color + " border-current" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"}`}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Visibility
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    name="public"
                    onClick={(e) =>
                      setNewRoom((p) => ({
                        ...p,
                        visibility: e.target.name,
                      }))
                    }
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200
        ${
          newRoom.visibility === "public"
            ? "bg-blue-600 border-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)]"
            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
        }`}
                  >
                    🌍 Public
                  </button>

                  <button
                    type="button"
                    name="private"
                    onClick={(e) =>
                      setNewRoom((p) => ({
                        ...p,
                        visibility: e.target.name,
                      }))
                    }
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200
        ${
          newRoom.visibility === "private"
            ? "bg-violet-600 border-violet-500 text-white shadow-[0_4px_20px_rgba(139,92,246,0.35)]"
            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
        }`}
                  >
                    🔒 Private
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-sm rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newRoom.roomname.trim()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]"
              >
                Create →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
