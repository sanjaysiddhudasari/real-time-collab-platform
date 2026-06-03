import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import Editor from "@monaco-editor/react";
import api from "../services/api";
import toast from "react-hot-toast";
import RoomNav from "../components/room/RoomNav";
import OutputPanel from "../components/room/OutputPanel";
import ChatSideBar from "../components/room/ChatSideBar";

// ─────────────────────────────────────────────────────────────────────────────
// ROOM PAGE — UI ONLY
// All function placeholders are marked with:  🔌 ADD FUNCTION HERE
// ─────────────────────────────────────────────────────────────────────────────



const CURSOR_COLORS = [
  { cursor: "#f87171", label: "#ef4444" }, // red
  { cursor: "#fb923c", label: "#f97316" }, // orange
  { cursor: "#a78bfa", label: "#8b5cf6" }, // violet
  { cursor: "#34d399", label: "#10b981" }, // green
  { cursor: "#60a5fa", label: "#3b82f6" }, // blue
  { cursor: "#f472b6", label: "#ec4899" }, // pink
  { cursor: "#facc15", label: "#eab308" }, // yellow
];

// Assign color based on userId consistently
const getUserColorIndex = (userId) => {
  if (!userId) return 0;
  return (
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    CURSOR_COLORS.length
  );
};

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [lang, setLang] = useState("typescript");
  const [code, setCode] = useState("// write you code here");
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

 
 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("join-room", {
      roomId,
      userId: user.userId,
      username: user.username,
    });

    // load messages already included in room data

    socket.on("room-data", (data) => {
      const roomname = data.roomname;
      const participants = data.participants;
      const messages=data.messages.map((msg) => ({
        ...msg,
        self: msg?.sender?._id?.toString() === user?.userId?.toString(),
      }));
      setMessages(messages);
      console.log(data);
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
      setCode(code);
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
      if (cursorDecorations.current[userId] && editorRef.current) {
        cursorDecorations.current[userId] = editorRef.current.deltaDecorations(
          cursorDecorations.current[userId],
          [],
        );
        delete cursorDecorations.current[userId];
      }
    });

    socket.on("lang-change", ({ lang }) => setLang(lang));

    socket.on("new-message",  (msg)=>{
      const formattedMsg={
        ...msg,
        self: msg?.sender._id?.toString() === user?.userId?.toString(),
      }
      setMessages((prev) => [...prev, formattedMsg]);
    }); 

    return () => {
      socket.emit("leave-room", {
        roomId,
        userId: user.userId,
        username: user.username,
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
    };
  }, [roomId,user.userId,user.username]);

  useEffect(() => {
    // ─────────────────────────────────────────────
    // Monaco cursor styles
    // ─────────────────────────────────────────────
    const baseStyle = document.createElement("style");

    baseStyle.id = "cursor-styles";

    baseStyle.innerHTML = CURSOR_COLORS.map(
      (c, i) => `
    
    .cursor-line-${i} {
      border-left: 2px solid ${c.cursor};
      margin-left: -1px;
      position: relative;
    }

    .cursor-line-highlight-${i} {
      background: ${c.cursor}10 !important;
    }

    .cursor-gutter-${i}::before {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: ${c.cursor};
      margin: auto;
    }
  `,
    ).join("\n");

    document.head.appendChild(baseStyle);

    // ─────────────────────────────────────────────
    // DOM username label styles
    // ─────────────────────────────────────────────
    const labelStyle = document.createElement("style");

    labelStyle.id = "cursor-label-style";

    labelStyle.innerHTML = `
    .cursorLabel {
      position: absolute;
      color: white;
      padding: 2px 6px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 600;
      z-index: 1000;
      pointer-events: none;
      white-space: nowrap;
    }
  `;

    document.head.appendChild(labelStyle);

    return () => {
      document.getElementById("cursor-styles")?.remove();

      document.getElementById("cursor-label-style")?.remove();
    };
  }, []);

  const handleLangChange = (l) => {
    socket.emit("lang-change", { roomId, lang: l });
  };

  //handle later
  const handleSend = () => {
    if (!input.trim()) return;
    const msg={
      roomId,
      sender:user.username,
      content:input,
    };
    socket.emit("send-message", { message: msg });
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
    socket.emit("leave-room", {
      roomId,
      username: user.username,
      userId: user.userId,
    });
    try {
      const response = await api.post(`/rooms/${roomId}/leave`);
      console.log(response);
    } catch (error) {
      console.log(`error in leaving room  ${error}`);
    }
    navigate("/");
  };



  return (
    <div className="h-screen bg-[#0d0d12] flex flex-col overflow-hidden font-mono">
      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}

      <RoomNav
        users={users}
        lang={lang}
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
                window.monaco = monaco;
                editor.onDidChangeCursorPosition((e) => {
                  const currentUser = JSON.parse(localStorage.getItem("user"));
                  console.log(currentUser);

                  if (!currentUser) return;

                  socket.emit("cursor-move", {
                    roomId,

                    userId: currentUser.userId,

                    username: currentUser.username,

                    position: {
                      lineNumber: e.position.lineNumber,
                      column: e.position.column,
                    },
                  });
                });

                socket.off("cursor-move");

                socket.on("cursor-move", ({ userId, username, position }) => {
                  if (!editorRef.current || !window.monaco) return;

                  const editor = editorRef.current;
                  const monaco = window.monaco;

                  const colorIndex = getUserColorIndex(userId);
                  const color = CURSOR_COLORS[colorIndex];

                  // Remove old decorations
                  if (cursorDecorations.current[userId]) {
                    cursorDecorations.current[userId] = editor.deltaDecorations(
                      cursorDecorations.current[userId],
                      [],
                    );
                  }

                  // Cursor decoration
                  cursorDecorations.current[userId] = editor.deltaDecorations(
                    [],
                    [
                      {
                        range: new monaco.Range(
                          position.lineNumber,
                          position.column,
                          position.lineNumber,
                          position.column,
                        ),

                        options: {
                          className: `remoteCursor${userId}`,
                        },
                      },
                    ],
                  );

                  // Inject style
                  const styleId = `style-${userId}`;

                  if (!document.getElementById(styleId)) {
                    const style = document.createElement("style");

                    style.id = styleId;

                    style.innerHTML = `
      .remoteCursor${userId} {
        border-left: 3px solid ${color.cursor};
      }

      .cursorLabel${userId} {
        position: absolute;
        background: ${color.label};
        color: white;
        padding: 2px 6px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 600;
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
      }
    `;

                    document.head.appendChild(style);
                  }

                  // Remove old label
                  const oldLabel = document.getElementById(`label-${userId}`);

                  if (oldLabel) oldLabel.remove();

                  // Create new label
                  const label = document.createElement("div");

                  label.id = `label-${userId}`;
                  label.className = `cursorLabel`;
                  label.style.background = color.label;

                  label.innerText = username;

                  document.body.appendChild(label);

                  // Get cursor coordinates
                  const coords = editor.getScrolledVisiblePosition({
                    lineNumber: position.lineNumber,
                    column: position.column,
                  });

                  if (!coords) return;

                  const editorDom = editor.getDomNode();

                  const rect = editorDom.getBoundingClientRect();

                  label.style.left = `${rect.left + coords.left + 8}px`;

                  label.style.top = `${rect.top + coords.top - 22}px`;
                });

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
            <OutputPanel setOutputOpen={setOutput} isRunning={isRunning} output={output} />
          )}

        </div>

        {/* ── Chat sidebar ─────────────────────────────────────────────────── */}
        {chatOpen && (
          <ChatSideBar users={users} messages={messages} input={input} setInput={setInput} handleSend={handleSend} chatEndRef={chatEndRef} />
        )}

      </div>
    </div>
  );
}
