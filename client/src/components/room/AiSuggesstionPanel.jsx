const TYPE = {
  Bug: { dot: "bg-red-500", text: "text-red-400", chip: "bg-red-500/10 border-red-500/20" },
  Performance: { dot: "bg-blue-500", text: "text-blue-400", chip: "bg-blue-500/10 border-blue-500/20" },
  Style: { dot: "bg-amber-500", text: "text-amber-400", chip: "bg-amber-500/10 border-amber-500/20" },
};

function AiSuggesstionPanel({
  suggestion, isStreaming, error, onReview, code, language,
  editorRef, parsedSuggestions, toggleLine, onAddSuggestion,
}) {
  const jumpToLine = (line) => {
    const editor = editorRef?.current;
    if (!editor) return;
    toggleLine(line);
    editor.revealLineInCenter(line);
    editor.setPosition({ lineNumber: line, column: 1 });
    editor.focus();
  };

  return (
    <div className="panel-slide-right flex h-full w-[280px] shrink-0 flex-col bg-[#0e1114] border-l border-white/[0.06]">
      <div className="px-3 py-2.5 border-b border-white/[0.05]">
        <div className="flex items-center justify-between">
          <span className="text-zinc-300 text-[11px] font-semibold tracking-wide">AI Review</span>
          <span className={`text-[10px] font-medium ${isStreaming ? "text-amber-400 animate-pulse" : "text-zinc-600"}`}>
            {isStreaming ? "reviewing" : parsedSuggestions.length ? `${parsedSuggestions.length} found` : "idle"}
          </span>
        </div>
        <button
          onClick={() => onReview(editorRef.current?.getValue(), language)}
          disabled={isStreaming}
          className="btn-press mt-2 w-full rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white"
        >
          {isStreaming ? "Reviewing…" : "Review code"}
        </button>
      </div>

      {error && (
        <div className="m-2.5 rounded-md border border-red-500/20 bg-red-500/[0.07] px-2.5 py-2 text-[11px] text-red-300">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {!suggestion && !isStreaming && !error && (
          <p className="text-[11px] text-zinc-600 leading-relaxed px-1 py-3 text-center">
            Run a review to get line-level<br />suggestions on this file.
          </p>
        )}
        {parsedSuggestions.length === 0 ? (
          <pre className="whitespace-pre-wrap text-[11px] font-mono text-zinc-400 leading-relaxed">
            {suggestion}
            {isStreaming && <span className="ai-stream-cursor">▌</span>}
          </pre>
        ) : (
          parsedSuggestions.map((item, index) => {
            const t = TYPE[item.type] || TYPE.Style;
            return (
              <div
                key={index}
                onClick={() => jumpToLine(item.line)}
                className="msg-in rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5 cursor-pointer hover:border-white/[0.1] hover:bg-white/[0.04] transition-colors"
              >
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="rounded border border-white/[0.07] bg-white/[0.05] px-1.5 py-px text-[10px] font-semibold font-mono text-zinc-300">
                    L{item.line}
                  </span>
                  <span className={`flex items-center gap-1 rounded border px-1.5 py-px text-[10px] font-medium ${t.chip} ${t.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                    {item.type}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">{item.explanation}</p>
                {item.suggestion && (
                  <pre className="mt-1.5 whitespace-pre-wrap rounded bg-black/40 border border-white/[0.05] p-2 text-[10px] font-mono text-zinc-400 leading-relaxed">
                    {item.suggestion}
                  </pre>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onAddSuggestion?.(item); }}
                  className="btn-press mt-1.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  + Add as comment
                </button>
              </div>
            );
          })
        )}
        {isStreaming && parsedSuggestions.length > 0 && <span className="ai-stream-cursor">▌</span>}
      </div>
    </div>
  );
}

export default AiSuggesstionPanel;
