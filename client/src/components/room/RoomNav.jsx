import { useNavigate } from 'react-router-dom'
import { LANGUAGES,avatarColor } from './room.constants';


function RoomNav({lang,setChatOpen,chatOpen,setAiOpen,aiOpen,setCommentsOpen,commentsOpen,roomName,handleLangChange,users,handleRun,handleLeave,isRunning,handleCopyInvite,copied}) {
    const navigate=useNavigate();
  return (
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

          {/* AI review toggle */}
          <button
            onClick={() => setAiOpen((p) => !p)}
            className={`p-1.5 rounded-lg border transition duration-150 ${aiOpen ? "bg-blue-600/20 border-blue-600/40 text-blue-400" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"}`}
          >
            <span className="text-xs leading-none">🤖</span>
          </button>

          {/* Comments toggle */}
          <button
            onClick={() => setCommentsOpen((p) => !p)}
            className={`p-1.5 rounded-lg border transition duration-150 ${commentsOpen ? "bg-blue-600/20 border-blue-600/40 text-blue-400" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"}`}
          >
            <span className="text-xs leading-none">💬</span>
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
  )
}

export default RoomNav