import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import api from "../services/api";
import toast from "react-hot-toast";

import MonacoEditor from "../components/room/MonacoEditor";
import RoomNav from "../components/room/RoomNav";
import OutputPanel from "../components/room/OutputPanel";
import ChatSideBar from "../components/room/ChatSideBar";
import FileTab from "../components/room/FileTab";
import CreateFileModal from "../components/room/CreateFileModal";
import RenameFileModal from "../components/room/RenameFileModal";
import { CURSOR_COLORS } from "../utils/cursorColors";
import { useRoomSocket } from "../hooks/useRoomSocket";
import useUser from "../hooks/useUser";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [isloading, setIsLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [runningFiles, setRunningFiles] = useState({});
  const [output, setOutput] = useState("");
  const [outputOpen, setOutputOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [inviteCode, setInviteCode] = useState(null);
  const [lastRunFileId, setLastRunFileId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);

  const chatEndRef = useRef(null);
  const editorRef = useRef(null);
  const removeCursorRef = useRef(null);   // set by useCursors, used by useRoomSocket
  const lastSyncedRef = useRef(null);     // set by useRoomSocket, checked by MonacoEditor

  const activeFile = files?.find(
    (file) => file?._id?.toString() === activeFileId?.toString(),
  );

  useRoomSocket({
    roomId,
    user,
    setFiles,
    setMessages,
    setUsers,
    setRoomName,
    setOutputOpen,
    setOutput,
    setActiveFileId,
    setIsLoading,
    activeFileId,
    editorRef,
    removeCursorRef,
    lastSyncedRef,
    setInviteCode,
    setLastRunFileId,
    setRunningFiles,
  });

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
        setIsLoading(false);
        if (data.files?.length > 0) setActiveFileId(data.files[0]._id);
      } catch (error) {
        toast.error("Room not found");
        navigate("/", { replace: true });
      }
    };
    fetchRoomData();
  }, [roomId]);

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
      `,
    ).join("\n");
    document.head.appendChild(styleTag);
    return () => document.getElementById("dynamic-cursor-styles")?.remove();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateFile = ({ name, lang }) => {
    socket.emit("create-file", { roomId, name, lang });
  };

  const handleRenameFile = (fileId, newName) => {
    socket.emit("rename-file", { roomId, fileId, name: newName });
  };

  const handleLangChange = (lang) => {
    socket.emit("lang-change", { roomId, lang, fileId: activeFileId });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    socket.emit("send-message", { roomId, content: input });
    setInput("");
  };

  const handleTyping = () => {
    socket.emit("typing", { roomId });
  };

  const handleRun = () => {
    socket.emit("run-code", { roomId, fileId: activeFileId });
  };

  const handleCopyInvite = () => {
    const link = inviteCode
      ? `${window.location.origin}/invite/${inviteCode}`
      : `${window.location.origin}/room/${roomId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    } else {
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
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

  if (isloading) {
    return (
      <div className="h-screen bg-[#0d0d12] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

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
        isRunning={!!runningFiles[activeFileId]?.running}
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
            onAddFile={() => setShowCreateModal(true)}
            onRenameFile={(fileId) => setRenameTarget(fileId)}
            onDeleteFile={(fileId) => socket.emit("delete-file", { roomId, fileId })}
          />

          <MonacoEditor
            activeFileId={activeFileId}
            files={files}
            setFiles={setFiles}
            roomId={roomId}
            editorRef={editorRef}
            removeCursorRef={removeCursorRef}
            lastSyncedRef={lastSyncedRef}
          />

          {outputOpen && lastRunFileId === activeFileId?.toString() && (
            <OutputPanel
              setOutputOpen={setOutputOpen}
              isRunning={!!runningFiles[activeFileId]?.running}
              output={output}
              runUser={runningFiles[activeFileId]?.username}
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
            onTyping={handleTyping}
          />
        )}
      </div>

      <CreateFileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateFile}
      />

      {renameTarget && (
        <RenameFileModal
          file={files.find((f) => f._id === renameTarget)}
          onClose={() => setRenameTarget(null)}
          onRename={(newName) => {
            handleRenameFile(renameTarget, newName);
            setRenameTarget(null);
          }}
        />
      )}
    </div>
  );
}
