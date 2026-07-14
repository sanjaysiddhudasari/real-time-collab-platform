import { parseAISuggestions } from "../../utils/reviewParser";


function AISuggestionPanel({
  suggestion,
  isStreaming,
  error,
  onReview,
  code,
  language,
  editorRef,
  jumpToLine,
}) {
  const parsedSuggestions = parseAISuggestions(suggestion);


  return (
    <div className="flex h-full w-80 flex-col border-l bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold">🤖 AI Review</h2>
        <p className="mt-1 text-sm text-gray-400">
          {isStreaming ? "Reviewing code..." : "Ready"}
        </p>
      </div>

      {/* Review Button */}
      <div className="border-b border-gray-700 p-4">
        <button
          onClick={() => onReview(editorRef.current?.getValue(), language)}
          disabled={isStreaming}
          className={`w-full rounded-md px-4 py-2 font-medium transition
            ${
              isStreaming
                ? "cursor-not-allowed bg-gray-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isStreaming ? "Reviewing..." : "Review Code"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="m-4 rounded-md border border-red-500 bg-red-900/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Suggestion Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {!suggestion && !isStreaming && !error && (
          <div className="text-sm text-gray-400">
            Click <b>Review Code</b> to generate an AI review.
          </div>
        )}

        {parsedSuggestions.length === 0 ? (
          <pre className="whitespace-pre-wrap">{suggestion}</pre>
        ) : (
          parsedSuggestions.map((item, index) => (
            <div
              key={index}
              className="border rounded p-3 mb-3"
              onClick={() => jumpToLine(item.line)}
            >
              <h4>
                Line {item.line} • {item.type}
              </h4>

              <p>{item.explanation}</p>

              {item.suggestion && <pre>{item.suggestion}</pre>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AISuggestionPanel;
