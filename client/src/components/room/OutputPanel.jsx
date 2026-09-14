function OutputPanel({ setOutputOpen, isRunning, output, runUser }) {
  const isError = output?.startsWith("❌");
  return (
    <div className="panel-slide-up bg-[#0c0e11] border-t border-white/[0.06] shrink-0" style={{ height: 148 }}>
      <div className="flex items-center justify-between pl-3 pr-2 py-1.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <span className="w-2 h-2 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-zinc-500 text-[10px] font-mono tracking-wider ml-1">
            TERMINAL{runUser ? <span className="text-zinc-600 normal-case"> — run by {runUser}</span> : null}
          </span>
          {isRunning && <span className="text-amber-400/90 text-[10px] font-mono animate-pulse">● running</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOutputOpen(false)}
            title="Close panel"
            className="btn-press w-5 h-5 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div className={`px-3 py-2 text-[11px] font-mono leading-relaxed overflow-auto ${isError ? "text-red-400" : "text-zinc-300"}`} style={{ height: 112 }}>
        {isRunning ? (
          <span className="text-zinc-600 animate-pulse">$ running…</span>
        ) : output ? (
          <pre className="whitespace-pre-wrap">$ {output}</pre>
        ) : (
          <span className="text-zinc-700">$ no output yet — press Run</span>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
