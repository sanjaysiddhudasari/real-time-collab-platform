import React from "react";
import { LANGS } from "./dashboard.constants";

function CreateRoomModal({newRoom,setNewRoom,handleCreate,setShowModal}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
    >
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        <h3 className="text-base font-semibold text-white mb-1">
          Create new room
        </h3>
        <p className="text-zinc-500 text-xs mb-5">
          Start a new collaborative coding session
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Room name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Auth Module"
              value={newRoom.roomname}
              onChange={(e) =>
                setNewRoom((p) => ({ ...p, roomname: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(LANGS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNewRoom((p) => ({ ...p, language: key }))}
                  className={`py-2 rounded-xl text-xs font-medium border transition-all duration-150
                        ${newRoom.language === key ? val.color + " border-current" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"}`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Visibility
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                name="public"
                onClick={(e) =>
                  setNewRoom((p) => ({
                    ...p,
                    visibility: e.target.name,
                  }))
                }
                className={`py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200
        ${
          newRoom.visibility === "public"
            ? "bg-blue-600 border-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)]"
            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
        }`}
              >
                🌍 Public
              </button>

              <button
                type="button"
                name="private"
                onClick={(e) =>
                  setNewRoom((p) => ({
                    ...p,
                    visibility: e.target.name,
                  }))
                }
                className={`py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200
        ${
          newRoom.visibility === "private"
            ? "bg-violet-600 border-violet-500 text-white shadow-[0_4px_20px_rgba(139,92,246,0.35)]"
            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
        }`}
              >
                🔒 Private
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 mt-6">
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-sm rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!newRoom.roomname.trim()}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]"
          >
            Create →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomModal;
