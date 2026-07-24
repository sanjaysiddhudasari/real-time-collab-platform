import { avatarColor } from "./room.constants";
import { formatDistanceToNow } from "date-fns";

function ChatSideBar({
  users,
  messages,
  input,
  setInput,
  handleSend,
  chatEndRef,
  onTyping,
}) {
  return (
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
          <span className="text-zinc-300 text-xs font-medium">Room chat</span>
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
            <div key={u?._id} className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full ${avatarColor(u?.username?.slice(0, 2).toUpperCase())} flex items-center justify-center text-[8px] font-bold shrink-0`}
              >
                {u?.username?.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-zinc-400 text-xs truncate">
                {u?.username}
              </span>
              {u?.typing && (
                <span className="text-[10px] text-yellow-400 ml-1 animate-pulse">
                  typing...
                </span>
              )}
              <span
                className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${u?.active ? "bg-green-400" : "bg-zinc-700"}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map((msg) => (
          <div
            key={msg?._id}
            className={`flex gap-2 ${msg.self ? "flex-row-reverse" : "flex-row"}`}
          >
            {!msg.self && (
              <div
                className={`w-6 h-6 rounded-full ${avatarColor(msg?.sender?.username?.slice(0, 2).toUpperCase())} flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5`}
              >
                {msg?.sender?.username?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div
              className={`flex flex-col gap-1 max-w-[85%] ${msg.self ? "items-end" : "items-start"}`}
            >
              {!msg.self && (
                <span className="text-zinc-500 text-[10px] px-1">
                  {msg?.sender?.username}
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
                {msg?.content?.split("\n").map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </div>
              <span className="text-zinc-600 text-[9px] px-1">
                {msg?.createdAt
                  ? formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                    })
                  : null}
              </span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      {/* Message input */}
      <div className="border-t border-zinc-800/50 p-3 shrink-0">
        <div className="flex items-end gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 focus-within:border-zinc-600 transition-colors">
          <textarea
            rows={1}
            placeholder="Message the room…"
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
  );
}

export default ChatSideBar;
