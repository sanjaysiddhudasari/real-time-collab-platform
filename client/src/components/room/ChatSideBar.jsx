import { avatarColor } from "./room.constants";
import { formatDistanceToNow } from "date-fns";

function ChatSideBar({ users, messages, input, setInput, handleSend, chatEndRef, onTyping }) {
  const online = users.filter((u) => u?.active !== false).length;
  return (
    <div className="panel-slide-right w-72 bg-[#0e1114] border-l border-white/[0.06] flex flex-col shrink-0">
      <div className="h-9 border-b border-white/[0.05] flex items-center justify-between px-3 shrink-0">
        <span className="text-zinc-400 text-[11px] font-semibold tracking-wide">Chat</span>
        <span className="text-zinc-600 text-[10px] tabular-nums">
          {online} online · {messages.length} msgs
        </span>
      </div>

      <div className="border-b border-white/[0.05] px-3 py-2 shrink-0 max-h-28 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {users.map((u) => (
            <div key={u?._id} className="flex items-center gap-1.5">
              <div className={`w-[18px] h-[18px] rounded-full ${avatarColor(u?.username?.slice(0, 2).toUpperCase())} flex items-center justify-center text-[7px] font-bold shrink-0`}>
                {u?.username?.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-zinc-400 text-[11px] truncate leading-none">{u?.username}</span>
              {u?.typing && <span className="text-[10px] text-zinc-600 italic animate-pulse">typing</span>}
              <span className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${u?.active ? "bg-emerald-500" : "bg-zinc-700"}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-1.5">
        {messages.length === 0 && (
          <p className="text-zinc-700 text-[11px] text-center py-6">No messages yet.<br />Say hello to the room.</p>
        )}
        {messages.map((msg) => (
          <div key={msg?._id} className="msg-in flex gap-2 px-2 py-1.5 rounded hover:bg-white/[0.03] transition-colors">
            <div className={`w-6 h-6 rounded-md ${avatarColor(msg?.sender?.username?.slice(0, 2).toUpperCase())} flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5`}>
              {msg?.sender?.username?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-[11px] font-semibold leading-none ${msg.self ? "text-blue-400" : "text-zinc-300"}`}>
                  {msg.self ? "you" : msg?.sender?.username}
                </span>
                <span className="text-zinc-700 text-[9px] tabular-nums">
                  {msg?.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : null}
                </span>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed break-words mt-0.5">
                {msg?.content?.split("\n").map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-white/[0.05] p-2 shrink-0">
        <div className="flex items-end gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-1.5 field">
          <textarea
            rows={1}
            placeholder="Message…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value.trim()) onTyping?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-5 max-h-24"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            title="Send"
            className="btn-press shrink-0 w-6 h-6 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatSideBar;
