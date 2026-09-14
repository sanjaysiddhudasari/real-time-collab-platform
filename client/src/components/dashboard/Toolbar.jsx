import React from "react";
import { ICONS } from "./dashboard.constants";
import { Icon } from "../common/Icon";

function Toolbar({ rooms, search, onSearchChange, tab, onTabChange, userId, onCreate }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-4">
      <div>
        <h2 className="text-[13px] font-semibold text-zinc-100 tracking-tight">Your rooms</h2>
        <p className="text-zinc-600 text-[11px] mt-0.5 tabular-nums">
          {rooms.length} session{rooms.length === 1 ? "" : "s"} · Join or create a new one
        </p>
      </div>

      <div className="flex items-center gap-1.5 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <Icon
            d={ICONS.search}
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search rooms"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="field w-full sm:w-44 bg-[#111417] border border-white/[0.06] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none"
          />
        </div>

        <div className="flex bg-[#111417] border border-white/[0.06] rounded-md p-0.5">
          {["all", "mine"].map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`btn-press px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors duration-150 cursor-pointer ${
                tab === t ? "bg-zinc-700/80 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={() => onCreate(true)}
          className="btn-press flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer"
        >
          <Icon d={ICONS.plus} size={12} />
          New room
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
