import { useState, useEffect } from "react";

const TYPE = {
  Bug: { dot: "bg-red-500", text: "text-red-400", chip: "bg-red-500/10 border-red-500/20" },
  Performance: { dot: "bg-blue-500", text: "text-blue-400", chip: "bg-blue-500/10 border-blue-500/20" },
  Style: { dot: "bg-amber-500", text: "text-amber-400", chip: "bg-amber-500/10 border-amber-500/20" },
  Comment: { dot: "bg-zinc-500", text: "text-zinc-400", chip: "bg-white/[0.05] border-white/[0.08]" },
};

export default function CommentThread({ comments, onClose, onReply, onResolve, onUnresolve, onCreate, line, editorRef }) {
  const [replyText, setReplyText] = useState("");
  const [newText, setNewText] = useState("");
  const [pos, setPos] = useState({ top: "20%", left: "auto" });
  // ponytail: hooks before early return — line null guard moved after effects
  const activeComments = (comments || []).filter((c) => c.line === line);

  useEffect(() => {
    const editor = editorRef?.current;
    if (!editor || !line) return;
    const vp = editor.getScrolledVisiblePosition({ lineNumber: line, column: 1 });
    const rect = editor.getDomNode().getBoundingClientRect();
    if (vp) setPos({ top: `${vp.top + rect.top + window.scrollY}px`, left: `${rect.left + rect.width - 340}px` });
  }, [line, editorRef]);

  if (!line) return null;

  const handleReply = (id) => {
    if (!replyText.trim()) return;
    onReply(id, replyText.trim());
    setReplyText("");
  };

  const handleCreate = () => {
    if (!newText.trim()) return;
    onCreate({ line, type: "Comment", explanation: newText.trim() });
    setNewText("");
  };

  return (
    <div className="modal-pop fixed z-50 w-80 surface rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden" style={pos}>
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-zinc-300 text-[11px] font-semibold font-mono">Line {line}</span>
        <button onClick={onClose} className="btn-press text-zinc-600 hover:text-zinc-300 text-xs cursor-pointer px-1">✕</button>
      </div>

      <div className="max-h-64 overflow-y-auto p-2.5 space-y-2">
        {activeComments.length === 0 && <p className="text-zinc-600 text-[11px] text-center py-3">No comments on this line yet.</p>}
        {activeComments.map((c) => {
          const t = TYPE[c.type] || TYPE.Comment;
          return (
            <div key={c._id} className={`p-2.5 rounded-md text-[11px] border ${c.isResolved ? "bg-white/[0.02] opacity-60 border-white/[0.05]" : c.isAI ? "bg-violet-500/[0.06] border-violet-500/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-zinc-400 font-semibold text-[11px]">{c.isAI ? "AI" : c.author?.username || "User"}</span>
                <span className={`flex items-center gap-1 px-1.5 py-px rounded border text-[10px] font-medium ${t.chip} ${t.text}`}>
                  <span className={`w-1 h-1 rounded-full ${t.dot}`} />
                  {c.type}
                </span>
                {c.isResolved && <span className="text-emerald-400 text-[10px]">Resolved</span>}
              </div>
              <p className="text-zinc-300 leading-relaxed">{c.explanation}</p>
              {c.suggestion && <pre className="mt-1.5 bg-black/40 border border-white/[0.05] text-zinc-400 p-2 rounded text-[10px] font-mono whitespace-pre-wrap leading-relaxed">{c.suggestion}</pre>}

              {c.replies?.length > 0 && (
                <details className="mt-1.5">
                  <summary className="text-zinc-500 text-[10px] cursor-pointer hover:text-zinc-300">{c.replies.length} {c.replies.length > 1 ? "replies" : "reply"}</summary>
                  <div className="mt-1 space-y-1">
                    {c.replies.map((r, i) => (
                      <div key={i} className="pl-2 border-l-2 border-white/10 text-zinc-400 text-[11px]">
                        <span className="text-zinc-500 font-medium">{r.author?.username || "User"}:</span> {r.explanation}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {!c.isResolved && (
                <div className="mt-1.5 flex gap-1.5">
                  <input className="field flex-1 bg-black/30 text-zinc-300 text-[11px] px-2 py-1 rounded border border-white/[0.07] outline-none" placeholder="Reply…" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleReply(c._id)} />
                  <button onClick={() => handleReply(c._id)} className="btn-press text-[11px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded cursor-pointer">Send</button>
                </div>
              )}
              <button onClick={() => (c.isResolved ? onUnresolve(c._id) : onResolve(c._id))} className="btn-press mt-1.5 text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer">{c.isResolved ? "Reopen" : "Resolve"}</button>
            </div>
          );
        })}
      </div>

      <div className="px-2.5 py-2 border-t border-white/[0.06] flex gap-1.5">
        <input className="field flex-1 bg-black/30 text-zinc-200 text-[11px] px-2 py-1.5 rounded border border-white/[0.07] outline-none" placeholder="Comment on this line…" value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
        <button onClick={handleCreate} className="btn-press text-[11px] font-medium bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded cursor-pointer">Add</button>
      </div>
    </div>
  );
}
