import React, { useEffect } from "react";
import { LANGS } from "./dashboard.constants";

function CreateRoomModal({ newRoom, setNewRoom, handleCreate, setShowModal }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setShowModal]);

  return (
    <div
      className="backdrop-fade fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => e.target === e.currentTarget && setShowModal(false)}
    >
      <div className="modal-pop w-full max-w-sm surface rounded-xl p-5 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
        <h3 className="text-[14px] font-semibold text-zinc-100 tracking-tight">Create room</h3>
        <p className="text-zinc-500 text-[11px] mt-0.5 mb-4">Start a new collaborative session</p>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Room name</label>
            <input
              autoFocus
              type="text"
              placeholder="auth-module"
              value={newRoom.roomname}
              onChange={(e) => setNewRoom((p) => ({ ...p, roomname: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="field w-full bg-[#15181c] border border-white/[0.06] rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Language</label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(LANGS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNewRoom((p) => ({ ...p, language: key }))}
                  className={`btn-press py-1.5 rounded-md text-[11px] font-medium border transition-colors duration-150 cursor-pointer ${
                    newRoom.language === key
                      ? val.color + " border-current"
                      : "bg-[#15181c] border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Visibility</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { v: "public", label: "Public", dot: "bg-emerald-500", active: "bg-blue-600/15 border-blue-500/40 text-blue-300" },
                { v: "private", label: "Private", dot: "bg-amber-500", active: "bg-violet-600/15 border-violet-500/40 text-violet-300" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setNewRoom((p) => ({ ...p, visibility: o.v }))}
                  className={`btn-press flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-medium border transition-colors duration-150 cursor-pointer ${
                    newRoom.visibility === o.v
                      ? o.active
                      : "bg-[#15181c] border-white/[0.06] text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${o.dot}`} />
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => setShowModal(false)}
            className="btn-press flex-1 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 text-xs rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!newRoom.roomname.trim()}
            className="btn-press flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            Create →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomModal;
