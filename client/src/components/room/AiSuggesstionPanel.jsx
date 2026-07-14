function AISuggestionPanel({
  suggestion,
  isStreaming,
  error,
  onReview,
  code,
  language,
  editorRef,
  parsedSuggestions,
  toggleLine
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
    <div className="flex h-full w-80 shrink-0 flex-col border-l border-gray-700 bg-gray-900 text-white ai-panel-slide-in">
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold">🤖 AI Review</h2>
        <p className="mt-1 text-sm text-gray-400">
          {isStreaming ? "Reviewing code..." : "Ready"}
        </p>
      </div>

      <div className="border-b border-gray-700 p-4">
        <button
          onClick={() => onReview(editorRef.current?.getValue(), language)}
          disabled={isStreaming}
          className={`w-full rounded-md px-4 py-2 font-medium transition ${
            isStreaming
              ? "cursor-not-allowed bg-gray-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isStreaming ? "Reviewing..." : "Review Code"}
        </button>
      </div>

      {error && (
        <div className="m-4 rounded-md border border-red-500 bg-red-900/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {!suggestion && !isStreaming && !error && (
          <div className="text-sm text-gray-400">
            Click <b>Review Code</b> to generate an AI review.
          </div>
        )}
        {parsedSuggestions.length === 0 ? (
          <pre className="whitespace-pre-wrap">
            {suggestion}
            {isStreaming && <span className="ai-stream-cursor">▌</span>}
          </pre>
        ) : (
          parsedSuggestions.map((item, index) => (
            <div
              key={index}
              className="mb-3 rounded border border-gray-700 p-3 cursor-pointer hover:bg-gray-800"
              onClick={() => jumpToLine(item.line)}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-blue-600/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
                  Line {item.line}
                </span>
                <span className="rounded bg-amber-600/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                  {item.type}
                </span>
              </div>
              <p className="text-sm text-gray-300">{item.explanation}</p>
              {item.suggestion && (
                <pre className="mt-2 whitespace-pre-wrap rounded bg-black/30 p-2 text-xs text-gray-400">
                  {item.suggestion}
                </pre>
              )}
            </div>
          ))
        )}
        {isStreaming && parsedSuggestions.length > 0 && (
          <span className="ai-stream-cursor">▌</span>
        )}
      </div>
    </div>
  );
}

export default AISuggestionPanel;
