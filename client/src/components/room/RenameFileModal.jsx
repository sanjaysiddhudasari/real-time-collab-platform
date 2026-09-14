import { useState } from "react";

export default function RenameFileModal({ file, onClose, onRename }) {
  const [name, setName] = useState(file?.name || "");
  if (!file) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onRename(name.trim());
  };

  return (
    <div className="backdrop-fade fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" style={{ backdropFilter: "blur(4px)" }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-pop surface rounded-lg w-72 max-w-full shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-zinc-100 text-[13px] font-semibold tracking-tight">Rename file</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="field w-full bg-black/30 font-mono text-zinc-100 text-[13px] rounded-md px-3 py-2 border border-white/[0.07] outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-press px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.07] rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-press px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-md transition-colors cursor-pointer"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
