const DOT = { javascript: "#facc15", typescript: "#60a5fa", python: "#4ade80", cpp: "#c084fc", java: "#fb923c", go: "#22d3ee" };

function FileTab({ files, activeFileId, setActiveFileId, onAddFile, onRenameFile, onDeleteFile }) {
  return (
    <div className="h-9 bg-[#0e1114] border-b border-white/[0.06] flex items-stretch px-2 gap-px shrink-0 overflow-x-auto">
      {files?.map((file) => {
        const active = file._id?.toString() === activeFileId?.toString();
        return (
          <div
            key={file._id}
            onClick={() => setActiveFileId(file._id)}
            onDoubleClick={() => onRenameFile?.(file._id)}
            title={`${file.name} — double-click to rename`}
            className={`relative group flex items-center gap-1.5 pl-3 pr-2 text-xs cursor-pointer select-none whitespace-nowrap border-r border-white/[0.04] transition-colors ${
              active ? "bg-[#1e1e1e] text-zinc-200" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
            }`}
          >
            {active && <span className="absolute top-0 left-0 right-0 h-px bg-blue-500" />}
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: DOT[file.lang] || "#52525b" }}
            />
            <span className="font-mono text-[11px]">{file.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteFile?.(file._id); }}
              className={`ml-0.5 w-4 h-4 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-200 hover:bg-white/10 cursor-pointer ${active ? "" : "opacity-0 group-hover:opacity-100 focus:opacity-100"}`}
              title="Delete file"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}

      <button
        onClick={onAddFile}
        className="btn-press w-8 flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors shrink-0 cursor-pointer"
        title="New file"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

export default FileTab;
