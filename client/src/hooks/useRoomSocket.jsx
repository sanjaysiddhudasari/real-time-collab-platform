import { useEffect, useRef } from "react";
import { socket } from "../socket/socket";
import toast from "react-hot-toast";

export const useRoomSocket = ({
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
}) => {
  const typingTimeouts = useRef({});
  const initialized = useRef(false);

  useEffect(() => {
    socket.connect();
    socket.emit("join-room", { roomId });

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
      if (files.length > 0 && !initialized.current) {
        setActiveFileId(files[0]._id);
        initialized.current = true;
      }
      setUsers(participants.map((u) => ({ ...u, active: true })));
      setRoomName(roomname);
      setIsLoading(false);
      if (data.inviteCode) setInviteCode(data.inviteCode);
    });

    socket.on("room-error", ({ message }) => {
      console.log(message);
    });

    socket.on("receive-code", ({ code, fileId }) => {
      if (lastSyncedRef) lastSyncedRef.current = code;
      setFiles((prev) =>
        prev.map((file) =>
          file?._id?.toString() === fileId?.toString()
            ? { ...file, code }
            : file,
        ),
      );
    });

    socket.on("file-renamed", ({ fileId, name, lang }) => {
      setFiles((prev) =>
        prev.map((f) =>
          f._id.toString() === fileId.toString()
            ? { ...f, name, ...(lang ? { lang } : {}) }
            : f,
        ),
      );
    });

    socket.on("run-start", ({ fileId, username }) => {
      setLastRunFileId(fileId);
      setRunningFiles((prev) => ({ ...prev, [fileId]: { running: true, username } }));
      setOutputOpen(true);
      setOutput("");
    });

    socket.on("run-output", ({ fileId, output, error }) => {
      setLastRunFileId(fileId);
      setRunningFiles((prev) => ({ ...prev, [fileId]: { running: false } }));
      if (error) {
        setOutput(`❌ ${error}`);
      } else {
        setOutput(`✅ ${output}`);
      }
    });

    socket.on("user-joined", ({ username, userId }) => {
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
      setUsers((prev) => {
        if (prev.some((u) => u._id.toString() === userId?.toString())) {
          return prev.map((u) =>
            u._id.toString() === userId?.toString()
              ? { ...u, active: true }
              : u,
          );
        }
        return [...prev, { _id: userId, username, active: true }];
      });
    });

    socket.on("user-left", ({ username, userId }) => {
      toast.custom(
        (t) => (
          <div
            className={`flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl transition-all ${t.visible ? "opacity-100" : "opacity-0"}`}
          >
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-300 text-xs font-medium">{username} left the room</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">Just now</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1 shrink-0" />
          </div>
        ),
        { duration: 3000 },
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id.toString() === userId.toString()
            ? { ...u, active: false }
            : u,
        ),
      );
      removeCursorRef?.current?.(userId);
    });

    socket.on("lang-change", ({ lang, fileId }) => {
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
          : { _id: msg.sender, username: "Unknown" },
        self:
          (msg.sender?._id?.toString() || msg.sender?.toString()) ===
          user?.userId?.toString(),
      };
      setMessages((prev) => [...prev, formattedMsg]);
    });

    socket.on("file-created", (newFile) => {
      setFiles((prev) => [...prev, newFile]);
    });

    socket.on("file-deleted", ({ fileId }) => {
      setFiles((prev) => {
        const next = prev.filter((f) => f._id.toString() !== fileId.toString());
        if (activeFileId?.toString() === fileId.toString() && next.length > 0) {
          setActiveFileId(next[0]._id);
        }
        return next;
      });
    });

    socket.on("user-online", ({ userId }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id.toString() === userId.toString() ? { ...u, active: true } : u,
        ),
      );
    });

    socket.on("user-offline", ({ userId }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id.toString() === userId.toString()
            ? { ...u, active: false }
            : u,
        ),
      );
    });

    socket.on("user-typing", ({ userId }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id.toString() === userId.toString()
            ? { ...u, typing: true }
            : u,
        ),
      );
      if (typingTimeouts.current[userId]) {
        clearTimeout(typingTimeouts.current[userId]);
      }
      typingTimeouts.current[userId] = setTimeout(() => {
        setUsers((prev) =>
          prev.map((u) =>
            u._id.toString() === userId.toString()
              ? { ...u, typing: false }
              : u,
          ),
        );
        delete typingTimeouts.current[userId];
      }, 2000);
    });

    socket.on("room-deleted", () => {
      window.location.href = "/";
    });

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
      socket.off("file-created");
      socket.off("file-deleted");
      socket.off("file-renamed");
      socket.off("cursor-move");
      socket.off("user-typing");
      socket.off("user-offline");
      socket.off("user-online");
      socket.off("room-deleted");
      document.querySelectorAll('[id^="label-"]').forEach((el) => el.remove());
    };
  }, [roomId]);
};
