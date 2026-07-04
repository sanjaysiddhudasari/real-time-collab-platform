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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-80 shadow-2xl">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-white text-sm font-semibold">Rename file</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:border-blue-600"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg transition-colors"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
