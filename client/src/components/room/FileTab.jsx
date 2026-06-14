function FileTab({ files, activeFileId, setActiveFileId, onAddFile }) {
  return (
    <div className="h-9 bg-zinc-950 border-b border-zinc-800/50 flex items-end px-3 gap-0.5 shrink-0">
      {files?.map((file) => (
        <div
          key={file._id}
          onClick={() => setActiveFileId(file._id)}
          className={
            file._id.toString() === activeFileId.toString()
              ? "flex items-center gap-2 bg-[#0d0d12] border border-zinc-800/70 border-b-0 rounded-t-md px-3 py-1.5 text-xs text-zinc-300 cursor-pointer"
              : "flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors"
          }
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>

          {file.name}
        </div>
      ))}

      {/* ── Add file button ──────────────────────────────────────── */}
      <button
        onClick={onAddFile}
        className="ml-1 w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        title="Create new file"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

export default FileTab;
