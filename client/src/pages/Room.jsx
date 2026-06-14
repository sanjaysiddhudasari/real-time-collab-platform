import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import api from "../services/api";
import toast from "react-hot-toast";

import MonacoEditor from "../components/room/MonacoEditor";
import RoomNav from "../components/room/RoomNav";
import OutputPanel from "../components/room/OutputPanel";
import ChatSideBar from "../components/room/ChatSideBar";
import FileTab from "../components/room/FileTab";
import { CURSOR_COLORS } from "../utils/cursorColors";
import { useRoomSocket } from "../hooks/useRoomSocket";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  // ── State ────────────────────────────────────────────────────────────
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
  const cursorDecorations = useRef({});

  const activeFile = files?.find(
    (file) => file?._id?.toString() === activeFileId?.toString()
  );

  // ── Socket event handlers ────────────────────────────────────────────
  useRoomSocket({
    roomId,
    user,
    setFiles,
    setMessages,
    setUsers,
    setRoomName,
    setIsRunning,
    setOutputOpen,
    setOutput,
    setActiveFileId,
    cursorDecorations,
    editorRef,
  });

  // ── Initial room data fetch ──────────────────────────────────────────
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
            : { _id: msg.sender, username: "Unknown" },
          self:
            (msg.sender?._id?.toString() || msg.sender?.toString()) ===
            user?.userId?.toString(),
        }));
        setMessages(messages);
        if (data.files?.length > 0) setActiveFileId(data.files[0]._id);
      } catch (error) {
        toast.error("Failed to load room");
      }
    };
    fetchRoomData();
  }, [roomId]);

  // ── Inject cursor CSS styles ─────────────────────────────────────────
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.id = "dynamic-cursor-styles";
    styleTag.innerHTML = CURSOR_COLORS.map(
      (c, i) => `
        .remote-cursor-line-${i} {
          border-left: 2px solid ${c.cursor};
          margin-left: -1px;
          position: relative;
        }
        .remote-cursor-line-highlight-${i} {
          background: ${c.cursor}10 !important;
        }
        .remote-cursor-gutter-${i}::before {
          content: '';
          display: block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: ${c.cursor};
          margin: auto;
        }
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
      `
    ).join("\n");
    document.head.appendChild(styleTag);
    return () => document.getElementById("dynamic-cursor-styles")?.remove();
  }, []);

  // ── Auto-scroll chat on new messages ─────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Event handlers ───────────────────────────────────────────────────
  const handleLangChange = (lang) => {
    socket.emit("lang-change", { roomId, lang, fileId: activeFileId });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    socket.emit("send-message", { roomId, content: input });
    setInput("");
  };

  const handleRun = () => {
    socket.emit("run-code", { roomId, fileId: activeFileId });
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    socket.emit("leave-room", { roomId });
    try {
      await api.post(`/rooms/${roomId}/leave`);
    } catch (error) {
      console.log("Error leaving room:", error);
    }
    navigate("/");
  };

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#0d0d12] flex flex-col overflow-hidden font-mono">
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

      <div className="flex flex-1 overflow-hidden">
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
