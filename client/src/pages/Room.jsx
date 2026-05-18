import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import Editor from "@monaco-editor/react";
import api from "../services/api";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// ROOM PAGE — UI ONLY
// All function placeholders are marked with:  🔌 ADD FUNCTION HERE
// ─────────────────────────────────────────────────────────────────────────────

const LANGUAGES = ["javascript", "typescript", "python", "cpp", "java", "go"];

const MOCK_USERS = [
  { id: "u1", name: "You", initials: "AK", color: "bg-blue-500", active: true },
  {
    id: "u2",
    name: "Jay Shah",
    initials: "JS",
    color: "bg-violet-500",
    active: true,
  },
  {
    id: "u3",
    name: "Mia Russo",
    initials: "MR",
    color: "bg-green-500",
    active: false,
  },
];

const MOCK_MESSAGES = [
  {
    id: 1,
    user: "Jay Shah",
    initials: "JS",
    color: "bg-violet-500",
    text: "I've added the auth middleware, check line 12",
    time: "2:31 PM",
    self: false,
  },
  {
    id: 2,
    user: "You",
    initials: "AK",
    color: "bg-blue-500",
    text: "Nice! I'll wire up the token refresh logic now",
    time: "2:33 PM",
    self: true,
  },
  {
    id: 3,
    user: "Mia Russo",
    initials: "MR",
    color: "bg-green-500",
    text: "Should we use httpOnly cookies or localStorage for tokens?",
    time: "2:35 PM",
    self: false,
  },
];

const MOCK_CODE = `// Auth Module — JWT Middleware
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};`;

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [lang, setLang] = useState("typescript");
  const [code, setCode] = useState("// write you code here");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState(MOCK_USERS);
  const [chatOpen, setChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [outputOpen, setOutputOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const chatEndRef = useRef(null);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  const AVATARS = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
  ];
  const avatarColor = (str = "U") =>
    AVATARS[str.charCodeAt(0) % AVATARS.length];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("join-room", {
      roomId,
      userId: user.userId,
      username: user.username,
    });
    socket.on("room-data", (data) => {
      const roomname = data.roomname;
      const participants = data.participants;
      console.log(`room data ${data}`);
      setUsers(participants);
      setRoomName(roomname);
    });

    socket.on("room-error", ({ message }) => {
      console.log(message);
    });

    socket.on("receive-code", ({ code }) => {
      if (!editorRef.current) return;
      isRemoteChange.current = true;
      const position = editorRef.current.getPosition();
      editorRef.current.setValue(code);
      editorRef.current.setPosition(position);
      isRemoteChange.current = false;
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

    socket.on("user-left", ({ username }) => {
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
    });

    socket.on("lang-change", ({ lang }) => setLang(lang));

    // socket.on("new-message",  (msg)    => setMessages((p) => [...p, msg]));

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("room-data");
      socket.off("receive-code");
      socket.off("room-error");
      socket.off("lang-change");
      socket.off("run-start");
      socket.off("run-output");
      // socket.off("new-message");
    };
  }, [roomId]);

  const handleLangChange = (l) => {
    socket.emit("lang-change", { roomId, lang: l });
  };

  //handle later
  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      id: Date.now(),
      user: "You",
      initials: "AK",
      color: "bg-blue-500",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      self: true,
    };
    setMessages((p) => [...p, msg]);
    // socket.emit("send-message", { roomId, message: msg });
    setInput("");
  };

  const handleRun = () => {
    socket.emit("run-code", { roomId, code, lang });
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    socket.emit("leave-room", { roomId, username: user.username });
    try {
      const response = await api.post(`/rooms/${roomId}/leave`);
      console.log(response);
    } catch (error) {
      console.log(`error in leaving room ${room}`);
    }
    navigate("/");
  };

  const lines = code.split("\n");

  return (
    <div className="h-screen bg-[#0d0d12] flex flex-col overflow-hidden font-mono">
      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <nav className="h-12 bg-zinc-950 border-b border-zinc-800/70 flex items-center justify-between px-4 shrink-0 z-20">
        {/* Left — logo + room name */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-linear-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 text-xs">
            <span
              className="hover:text-zinc-300 cursor-pointer transition-colors"
              onClick={() => navigate("/")}
            >
              Dashboard
            </span>
            <span>/</span>
            <span className="text-white font-medium">{roomName}</span>
          </div>

          {/* Live badge */}
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-[10px] font-medium tracking-wide">
              LIVE
            </span>
          </div>
        </div>

        {/* Center — language selector */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              onClick={() => handleLangChange(l)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all duration-150
                ${lang === l ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {l === "cpp"
                ? "C++"
                : l === "javascript"
                  ? "JS"
                  : l === "typescript"
                    ? "TS"
                    : l == "java"
                      ? "Java"
                      : l.charAt(0).toUpperCase() + l.slice(1, 2)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Active users */}
          <div className="hidden sm:flex items-center -space-x-1.5">
            {users?.slice(0, 4).map((u, idx) => (
              <div
                key={u?._id || `${u?.username}-${idx}`}
                title={u?.username || "User"}
                className={`w-7 h-7 rounded-full ${avatarColor(
                  u?.username || "U",
                )} flex items-center justify-center text-[10px] font-bold border-2 border-zinc-950 cursor-pointer`}
              >
                {(u?.username || "U").slice(0, 2).toUpperCase()}
              </div>
            ))}

            {users?.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold border-2 border-zinc-950">
                +{users.length - 4}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-zinc-800" />

          {/* Run button — 🔌 calls handleRun */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition duration-150"
          >
            {isRunning ? (
              <svg
                className="animate-spin"
                width="12"
                height="12"
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
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            )}
            {isRunning ? "Running…" : "Run"}
          </button>

          {/* Invite — 🔌 calls handleCopyInvite */}
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-medium px-3 py-1.5 rounded-lg transition duration-150"
          >
            {copied ? (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>{" "}
                Copied!
              </>
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>{" "}
                Invite
              </>
            )}
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen((p) => !p)}
            className={`p-1.5 rounded-lg border transition duration-150 ${chatOpen ? "bg-blue-600/20 border-blue-600/40 text-blue-400" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Leave — 🔌 calls handleLeave */}
          <button
            onClick={handleLeave}
            className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition duration-150"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Editor pane ─────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* File tab bar */}
          <div className="h-9 bg-zinc-950 border-b border-zinc-800/50 flex items-end px-3 gap-0.5 shrink-0">
            <div className="flex items-center gap-2 bg-[#0d0d12] border border-zinc-800/70 border-b-0 rounded-t-md px-3 py-1.5 text-xs text-zinc-300">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              middleware.ts
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              routes.ts
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <Editor
              height="100%"
              language={lang}
              theme="vs-dark"
              onMount={(editor, monaco) => {
                editorRef.current = editor;

                // Enable TypeScript/JavaScript type checking
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                  {
                    noSemanticValidation: false, // ← enables red squiggles
                    noSyntaxValidation: false, // ← enables syntax squiggles
                  },
                );

                monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
                  {
                    target: monaco.languages.typescript.ScriptTarget.ESNext,
                    allowNonTsExtensions: true,
                  },
                );
              }}
              onChange={(value) => {
                if (isRemoteChange.current) return;
                setCode(value);
                socket.emit("sync-code", { roomId, code: value });
              }}
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                cursorBlinking: "smooth",

                // ── Squiggles & validation ──────────────────────────
                renderValidationDecorations: "on",

                // ── Auto suggestions ────────────────────────────────
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: true,
                },
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
                wordBasedSuggestions: true,
                parameterHints: { enabled: true }, // shows fn signature
                suggestSelection: "first",

                // ── Code formatting hints ───────────────────────────
                formatOnType: true,
                formatOnPaste: true,

                // ── Bracket & pair helpers ──────────────────────────
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                autoIndent: "full",
                matchBrackets: "always",
                bracketPairColorization: { enabled: true }, // colorizes bracket pairs

                // ── Visual helpers ──────────────────────────────────
                renderLineHighlight: "all",
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on",
                scrollbar: {
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6,
                },
              }}
            />
          </div>

          {/* ── Output panel ────────────────────────────────────────────────── */}
          {outputOpen && (
            <div
              className="bg-zinc-950 border-t border-zinc-800 shrink-0"
              style={{ height: 140 }}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M4 17l6-6-6-6M12 19h8" />
                  </svg>
                  <span className="text-zinc-400 text-xs font-medium">
                    Output
                  </span>
                </div>
                <button
                  onClick={() => setOutputOpen(false)}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div
                className="px-4 py-3 text-xs text-green-400 font-mono overflow-auto"
                style={{ height: 100 }}
              >
                {isRunning ? (
                  <span className="text-zinc-500 animate-pulse">
                    Running code…
                  </span>
                ) : (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Chat sidebar ─────────────────────────────────────────────────── */}
        {chatOpen && (
          <div className="w-72 bg-zinc-950 border-l border-zinc-800/70 flex flex-col shrink-0">
            {/* Chat header */}
            <div className="h-9 border-b border-zinc-800/50 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-zinc-300 text-xs font-medium">
                  Room chat
                </span>
              </div>
              <span className="text-zinc-600 text-[10px]">
                {messages.length} messages
              </span>
            </div>

            {/* Users in room */}
            <div className="border-b border-zinc-800/50 px-4 py-2.5 shrink-0">
              <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-widest mb-2">
                In this room
              </p>
              <div className="flex flex-col gap-1.5">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full ${u.color} flex items-center justify-center text-[8px] font-bold shrink-0`}
                    >
                      {u.initials}
                    </div>
                    <span className="text-zinc-400 text-xs truncate">
                      {u.name}
                    </span>
                    <span
                      className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${u.active ? "bg-green-400" : "bg-zinc-700"}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Messages list
                🔌 messages come from socket.on("new-message") → setMessages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.self ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!msg.self && (
                    <div
                      className={`w-6 h-6 rounded-full ${msg.color} flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5`}
                    >
                      {msg.initials}
                    </div>
                  )}
                  <div
                    className={`flex flex-col gap-1 max-w-[85%] ${msg.self ? "items-end" : "items-start"}`}
                  >
                    {!msg.self && (
                      <span className="text-zinc-500 text-[10px] px-1">
                        {msg.user}
                      </span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-xl text-xs leading-relaxed
                      ${
                        msg.self
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-zinc-600 text-[9px] px-1">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input
                🔌 on send → socket.emit("send-message", { roomId, message }) */}
            <div className="border-t border-zinc-800/50 p-3 shrink-0">
              <div className="flex items-end gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 focus-within:border-zinc-600 transition-colors">
                <textarea
                  rows={1}
                  placeholder="Message the room…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 bg-transparent text-xs text-white placeholder-zinc-600 outline-none resize-none leading-5 max-h-24"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="shrink-0 w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors mb-0.5"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <p className="text-zinc-700 text-[10px] mt-1.5 text-center">
                Enter to send · Shift+Enter for newline
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
