import { useNavigate } from 'react-router-dom'
import { LANGUAGES, avatarColor } from './room.constants';

const LANG_SHORT = { javascript: "JS", typescript: "TS", python: "Py", cpp: "C++", java: "Java", go: "Go" };

function RoomNav({ lang, setChatOpen, chatOpen, setAiOpen, aiOpen, setCommentsOpen, commentsOpen, roomName, handleLangChange, users, handleRun, handleLeave, isRunning, handleCopyInvite, copied }) {
  const navigate = useNavigate();
  return (
    <nav className="h-11 bg-[#0e1114] border-b border-white/[0.06] flex items-center justify-between pl-3 pr-2.5 shrink-0 z-20">
      {/* Left — logo + breadcrumb + live */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => navigate("/")}
          title="Back to dashboard"
          className="btn-press w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0 cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-xs min-w-0">
          <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors shrink-0" onClick={() => navigate("/")}>
            Rooms
          </span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-200 font-medium truncate max-w-44">{roomName || "Untitled"}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-full px-2 py-px shrink-0">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-400 text-emerald-400" />
          <span className="text-emerald-400 text-[10px] font-semibold tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Center — language */}
      <div className="hidden md:flex items-center gap-px bg-white/[0.04] border border-white/[0.06] rounded-md p-0.5">
        {LANGUAGES.map((l) => (
          <button
            key={l}
            onClick={() => handleLangChange(l)}
            title={l}
            className={`btn-press px-2 py-1 rounded text-[11px] font-medium font-mono capitalize transition-colors duration-150 cursor-pointer ${
              lang === l ? "bg-zinc-700/90 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {LANG_SHORT[l] || l}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Active users */}
        <div className="hidden sm:flex items-center -space-x-1.5 mr-1">
          {users?.slice(0, 4).map((u, idx) => (
            <div
              key={u?._id || `${u?.username}-${idx}`}
              title={u?.username || "User"}
              className={`w-6 h-6 rounded-full ${avatarColor(u?.username || "U")} flex items-center justify-center text-[9px] font-bold ring-2 ring-[#0e1114] cursor-default`}
            >
              {(u?.username || "U").slice(0, 2).toUpperCase()}
            </div>
          ))}
          {users?.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[9px] font-semibold text-zinc-300 ring-2 ring-[#0e1114]">
              +{users.length - 4}
            </div>
          )}
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning}
          title="Run active file"
          className="btn-press flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          {isRunning ? (
            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          )}
          {isRunning ? "Running" : "Run"}
        </button>

        <button
          onClick={handleCopyInvite}
          title="Copy invite link"
          className="btn-press flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07] text-zinc-300 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Invite
            </>
          )}
        </button>

        <div className="w-px h-5 bg-white/[0.07] mx-0.5" />

        {/* Chat toggle */}
        <button
          onClick={() => setChatOpen((p) => !p)}
          title="Toggle chat"
          className={`btn-press p-1.5 rounded-md border transition-colors cursor-pointer ${chatOpen ? "bg-blue-600/15 border-blue-500/30 text-blue-400" : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* AI review toggle */}
        <button
          onClick={() => setAiOpen((p) => !p)}
          title="Toggle AI review"
          className={`btn-press px-1.5 py-1 rounded-md border text-xs leading-none transition-colors cursor-pointer ${aiOpen ? "bg-violet-600/15 border-violet-500/30 text-violet-300" : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"}`}
        >
          AI
        </button>

        {/* Comments toggle */}
        <button
          onClick={() => setCommentsOpen((p) => !p)}
          title="Toggle comments"
          className={`btn-press p-1.5 rounded-md border transition-colors cursor-pointer ${commentsOpen ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>

        {/* Leave */}
        <button
          onClick={handleLeave}
          title="Leave room"
          className="btn-press p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
