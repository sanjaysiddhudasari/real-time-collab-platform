import { useState, useEffect } from "react";

export default function CommentThread({ comments, onClose, onReply, onResolve, onUnresolve, onCreate, line, editorRef }) {
  const [replyText, setReplyText] = useState("");
  const [newText, setNewText] = useState("");
  const [pos, setPos] = useState({ top: "20%", left: "auto" });
  if (!line) return null;

  const activeComments = comments.filter((c) => c.line === line);

  useEffect(() => {
    const editor = editorRef?.current;
    if (!editor) return;
    const vp = editor.getScrolledVisiblePosition({ lineNumber: line, column: 1 });
    const rect = editor.getDomNode().getBoundingClientRect();
    if (vp) setPos({ top: `${vp.top + rect.top + window.scrollY}px`, left: `${rect.left + rect.width - 340}px` });
  }, [line, editorRef]);

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
    <div className="fixed z-50 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden" style={pos}>
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-white text-sm font-medium">Line {line}</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xs">✕</button>
      </div>

      <div className="max-h-64 overflow-y-auto p-4 space-y-3">
        {activeComments.length === 0 && <p className="text-zinc-500 text-xs">No comments yet.</p>}
        {activeComments.map((c) => (
          <div key={c._id} className={`p-3 rounded-lg text-xs ${c.isResolved ? "bg-zinc-800/50 opacity-60 border border-zinc-700" : c.isAI ? "bg-blue-900/20 border border-blue-800/30" : "bg-zinc-800 border border-zinc-700"}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-zinc-400 font-medium">{c.isAI ? "🤖 AI" : c.author?.username || "User"}</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{
                background: c.type === "Bug" ? "#ef444420" : c.type === "Performance" ? "#3b82f620" : "#eab30820",
                color: c.type === "Bug" ? "#ef4444" : c.type === "Performance" ? "#3b82f6" : "#eab308",
              }}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${c.type === "Bug" ? "bg-red-500" : c.type === "Performance" ? "bg-blue-500" : "bg-yellow-500"}`} />
                {c.type}
              </span>
              {c.isResolved && <span className="text-green-400">✓ Resolved</span>}
            </div>
            <p className="text-zinc-300 mb-2">{c.explanation}</p>
            {c.suggestion && <pre className="bg-zinc-950 text-zinc-300 p-2 rounded text-xs whitespace-pre-wrap">{c.suggestion}</pre>}

            {c.replies?.length > 0 && (
              <details className="mt-2">
                <summary className="text-zinc-400 text-xs cursor-pointer hover:text-zinc-300">▼ {c.replies.length} repl{c.replies.length > 1 ? "ies" : "y"}</summary>
                <div className="mt-1 space-y-1">
                  {c.replies.map((r, i) => (
                    <div key={i} className="pl-3 border-l-2 border-zinc-600 text-zinc-400 text-xs">
                      <span className="text-zinc-500">{r.author?.username || "User"}:</span> {r.explanation}
                    </div>
                  ))}
                </div>
              </details>
            )}

            {!c.isResolved && (
              <div className="mt-2 flex gap-2">
                <input className="flex-1 bg-zinc-950 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700" placeholder="Reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleReply(c._id)} />
                <button onClick={() => handleReply(c._id)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">Send</button>
              </div>
            )}
            <div className="mt-2">
              <button onClick={() => (c.isResolved ? onUnresolve(c._id) : onResolve(c._id))} className="text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2 py-1 rounded">{c.isResolved ? "Unresolve" : "Resolve"}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-zinc-800 flex gap-2">
        <input className="flex-1 bg-zinc-950 text-zinc-300 text-xs px-2 py-1.5 rounded border border-zinc-700" placeholder="Add a comment..." value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
        <button onClick={handleCreate} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded">Add</button>
      </div>
    </div>
  );
}
