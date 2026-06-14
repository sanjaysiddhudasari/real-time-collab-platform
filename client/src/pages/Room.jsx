import { useState, useRef, useEffect,useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import MonacoEditor from "../components/room/MonacoEditor";
import api from "../services/api";
import toast from "react-hot-toast";
import RoomNav from "../components/room/RoomNav";
import OutputPanel from "../components/room/OutputPanel";
import ChatSideBar from "../components/room/ChatSideBar";
import FileTab from "../components/room/FileTab";

const CURSOR_COLORS = [
  { cursor: "#f87171", label: "#ef4444" }, // red
  { cursor: "#fb923c", label: "#f97316" }, // orange
  { cursor: "#a78bfa", label: "#8b5cf6" }, // violet
  { cursor: "#34d399", label: "#10b981" }, // green
  { cursor: "#60a5fa", label: "#3b82f6" }, // blue
  { cursor: "#f472b6", label: "#ec4899" }, // pink
  { cursor: "#facc15", label: "#eab308" }, // yellow
];

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [outputOpen, setOutputOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const chatEndRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const cursorDecorations = useRef({}); // { userId: [decorationIds] }

  const activeFile = files?.find(
    (file) => file?._id?.toString() === activeFileId?.toString(),
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //on intial load
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        const data = res.data.room;

        setFiles(data.files);
        setRoomName(data.roomname);
        const messages = data.messages.map((msg) => ({
          ...msg,
          sender: msg.sender?.username
            ? msg.sender
            : { _id: msg.sender, username: 'Unknown' },
          self: (msg.sender?._id?.toString() || msg.sender?.toString()) === user?.userId?.toString(),
        }));
        setMessages(messages);

        if (data.files && data.files.length > 0) {
          setActiveFileId(data.files[0]._id);
        }
      } catch (error) {
        toast.error("failed to load file", error);
      }
    };

    fetchRoomData();
  }, [roomId]);

  useEffect(() => {
    socket.emit("join-room", {
      roomId,
    });

    // load messages already included in room data

    socket.on("room-data", (data) => {
      const roomname = data.roomname;
      const participants = data.participants;
      const messages = data.messages.map((msg) => ({
        ...msg,
        sender: msg.sender?.username
          ? msg.sender
          : { _id: msg.sender, username: 'Unknown' },
        self: (msg.sender?._id?.toString() || msg.sender?.toString()) === user?.userId?.toString(),
      }));
      setMessages(messages);
      const files = data.files || [];
      setFiles(files);
      if (files.length > 0) {
        setActiveFileId(files[0]._id);
      }
      console.log(data);
      setUsers(participants);
      setRoomName(roomname);
    });

    socket.on("room-error", ({ message }) => {
      console.log(message);
    });

    socket.on("receive-code", ({ code, fileId }) => {
      setFiles((prev) =>
        prev.map((file) =>
          file?._id?.toString() === fileId?.toString()
            ? { ...file, code }
            : file,
        ),
      );
    });

    socket.on("run-start", () => {
      setIsRunning(true);
      setOutputOpen(true);
      setOutput("");
    });

    socket.on("run-output", ({ output, error }) => {
      setIsRunning(false);
      if (error) {
        setOutput(`❌ Error\n\n${error}`);
      } else {
        setOutput(`✅ Output\n\n${output}`);
      }
    });

    socket.on("user-joined", ({ username }) => {
      toast.custom(
        (t) => (
          <div
            className={`flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl transition-all ${t.visible ? "opacity-100" : "opacity-0"}`}
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-xs font-medium">
                {username} joined the room
              </p>
              <p className="text-zinc-500 text-[10px] mt-0.5">Just now</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 ml-1 shrink-0" />
          </div>
        ),
        { duration: 3000 },
      );
    });

    socket.on("user-left", ({ username, userId }) => {
      toast.custom(
        (t) => (
          <div
            className={`flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl transition-all ${t.visible ? "opacity-100" : "opacity-0"}`}
          >
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a1a1aa"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-300 text-xs font-medium">
                {username} left the room
              </p>
              <p className="text-zinc-500 text-[10px] mt-0.5">Just now</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1 shrink-0" />
          </div>
        ),
        { duration: 3000 },
      );

      const label = document.getElementById(`label-${userId}`);
      if (label) label.remove();

      const style = document.getElementById(`style-${userId}`);
      if (style) style.remove();

      if (cursorDecorations.current[userId] && editorRef.current) {
        cursorDecorations.current[userId] = editorRef.current.deltaDecorations(
          cursorDecorations.current[userId],
          [],
        );
        delete cursorDecorations.current[userId];
      }
    });

    socket.on("lang-change", ({ lang, fileId }) => {
      console.log({ lang, fileId });
      setFiles((prev) =>
        prev.map((file) =>
          file?._id?.toString() === fileId?.toString()
            ? { ...file, lang }
            : file,
        ),
      );
    });

    socket.on("new-message", (msg) => {
      const formattedMsg = {
        ...msg,
        sender: msg.sender?.username
          ? msg.sender
          : { _id: msg.sender, username: 'Unknown' },
        self: (msg.sender?._id?.toString() || msg.sender?.toString()) === user?.userId?.toString(),
      };
      setMessages((prev) => [...prev, formattedMsg]);
    });

    return () => {
      socket.emit("leave-room", {
        roomId,
      });
      socket.off("room-data");
      socket.off("receive-code");
      socket.off("room-error");
      socket.off("lang-change");
      socket.off("run-start");
      socket.off("run-output");
      socket.off("new-message");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("cursor-move");
      // Remove all floating cursor labels
      document.querySelectorAll('[id^="label-"]').forEach((el) => el.remove());
      // Clear all cursor decorations
      cursorDecorations.current = {};
    };
  }, [roomId]);


    useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.id = "dynamic-cursor-styles"; // Single ID for our combined styles
    styleTag.innerHTML = CURSOR_COLORS.map(
      (c, i) => `
        /* Monaco Editor Cursor for Color Index ${i} */
        .remote-cursor-line-${i} {
          border-left: 2px solid ${c.cursor};
          margin-left: -1px;
          position: relative;
        }
        .remote-cursor-line-highlight-${i} {
          background: ${c.cursor}10 !important;
        }
        /* Gutter Icon for Color Index ${i} */
        .remote-cursor-gutter-${i}::before {
          content: '';
          display: block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: ${c.cursor};
          margin: auto;
        }
        /* Floating Label for Color Index ${i} */
        .remote-cursor-label-${i} {
          position: absolute;
          background: ${c.label};
          color: white;
          padding: 2px 6px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          z-index: 1000;
          pointer-events: none;
          white-space: nowrap;
        }
      `,
    ).join("\n");

    document.head.appendChild(styleTag);

    return () => {
      document.getElementById("dynamic-cursor-styles")?.remove();
    };
  }, []); 

  const handleLangChange = (l) => {
    socket.emit("lang-change", { roomId, lang: l, fileId: activeFileId });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      roomId,
      content: input,
    };
    console.log(user);
    socket.emit("send-message", msg);
    setInput("");
  };

  const handleRun = () => {
    socket.emit("run-code", {
      roomId,
      fileId: activeFileId,
    });
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    socket.emit("leave-room", {
      roomId,
    });
    try {
      const response = await api.post(`/rooms/${roomId}/leave`);
      console.log(response);
    } catch (error) {
      console.log(`error in leaving room  ${error}`);
    }
    navigate("/");
  };
  console.log(files);
  return (
    <div className="h-screen bg-[#0d0d12] flex flex-col overflow-hidden font-mono">
      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}

      <RoomNav
        users={users}
        lang={activeFile?.lang}
        setChatOpen={setChatOpen}
        chatOpen={chatOpen}
        roomName={roomName}
        handleLangChange={handleLangChange}
        handleRun={handleRun}
        isRunning={isRunning}
        handleLeave={handleLeave}
        copied={copied}
        handleCopyInvite={handleCopyInvite}
      />

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Editor pane ─────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <FileTab
            files={files}
            activeFileId={activeFileId}
            setActiveFileId={setActiveFileId}
          />

          <MonacoEditor
            activeFileId={activeFileId}
            files={files}
            setFiles={setFiles}
            roomId={roomId}
            editorRef={editorRef}
            cursorDecorations={cursorDecorations}
            isRemoteChange={isRemoteChange}
          />

          {outputOpen && (
            <OutputPanel
              setOutputOpen={setOutputOpen}
              isRunning={isRunning}
              output={output}
            />
          )}
        </div>

        {chatOpen && (
          <ChatSideBar
            users={users}
            messages={messages}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            chatEndRef={chatEndRef}
          />
        )}
      </div>
    </div>
  );
}
