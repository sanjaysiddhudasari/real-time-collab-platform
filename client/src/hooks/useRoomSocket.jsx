import { useEffect } from "react";
import { socket } from "../socket/socket";
import toast from "react-hot-toast";

export const useRoomSocket = ({
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
}) => {
  useEffect(() => {
    socket.emit("join-room", { roomId });

    // ── Room data (full sync) ───────────────────────────────────────────
    socket.on("room-data", (data) => {
      const roomname = data.roomname;
      const participants = data.participants;
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
      const files = data.files || [];
      setFiles(files);
      if (files.length > 0) {
        setActiveFileId(files[0]._id);
      }
      setUsers(participants);
      setRoomName(roomname);
    });

    // ── Room errors ─────────────────────────────────────────────────────
    socket.on("room-error", ({ message }) => {
      console.log(message);
    });

    // ── Code sync ───────────────────────────────────────────────────────
    socket.on("receive-code", ({ code, fileId }) => {
      setFiles((prev) =>
        prev.map((file) =>
          file?._id?.toString() === fileId?.toString()
            ? { ...file, code }
            : file
        )
      );
    });

    // ── Code execution (run) ────────────────────────────────────────────
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

    // ── User presence ───────────────────────────────────────────────────
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
        { duration: 3000 }
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
        { duration: 3000 }
      );

      // Clean up cursor label + decoration for the leaving user
      const label = document.getElementById(`label-${userId}`);
      if (label) label.remove();

      if (cursorDecorations.current[userId] && editorRef.current) {
        cursorDecorations.current[userId] = editorRef.current.deltaDecorations(
          cursorDecorations.current[userId],
          []
        );
        delete cursorDecorations.current[userId];
      }
    });

    // ── Language change ─────────────────────────────────────────────────
    socket.on("lang-change", ({ lang, fileId }) => {
      setFiles((prev) =>
        prev.map((file) =>
          file?._id?.toString() === fileId?.toString()
            ? { ...file, lang }
            : file
        )
      );
    });

    // ── New messages ────────────────────────────────────────────────────
    socket.on("new-message", (msg) => {
      const formattedMsg = {
        ...msg,
        sender: msg.sender?.username
          ? msg.sender
          : { _id: msg.sender, username: "Unknown" },
        self:
          (msg.sender?._id?.toString() || msg.sender?.toString()) ===
          user?.userId?.toString(),
      };
      setMessages((prev) => [...prev, formattedMsg]);
    });

    // ── Cleanup on unmount / room change ────────────────────────────────
    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("room-data");
      socket.off("room-error");
      socket.off("receive-code");
      socket.off("run-start");
      socket.off("run-output");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("lang-change");
      socket.off("new-message");
      socket.off("cursor-move");

      document.querySelectorAll('[id^="label-"]').forEach((el) => el.remove());
      cursorDecorations.current = {};
    };
  }, [roomId]);
};
