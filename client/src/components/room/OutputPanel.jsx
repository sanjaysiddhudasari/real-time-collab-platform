function OutputPanel({setOutputOpen,isRunning,output,runUser}) {
  const isError = output?.startsWith("❌");
  return (
    <div
      className="bg-zinc-950 border-t border-zinc-800 shrink-0"
      style={{ height: 140 }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 17l6-6-6-6M12 19h8" />
          </svg>
          <span className="text-zinc-400 text-xs font-medium">
            Output{runUser ? <span className="text-zinc-600 ml-1">· {runUser}</span> : null}
          </span>
        </div>
        <button
          onClick={() => setOutputOpen(false)}
          className="text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div
        className={`px-4 py-3 text-xs font-mono overflow-auto ${isError ? "text-red-400" : "text-green-400"}`}
        style={{ height: 100 }}
      >
        {isRunning ? (
          <span className="text-zinc-500 animate-pulse">Running code…</span>
        ) : (
          <pre className="whitespace-pre-wrap">{output}</pre>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
