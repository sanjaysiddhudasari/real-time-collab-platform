import React from "react";
import { ICONS } from "./dashboard.constants";
import { Icon } from "../common/Icon";

function Toolbar({rooms,search,onSearchChange,tab,onTabChange,userId,onCreate}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
      <div>
        <h2 className="text-base font-semibold text-white">Your rooms</h2>
        <p className="text-zinc-500 text-xs mt-0.5">
          Join a session or create a new one
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* Search */}
        <div className="relative flex-1 sm:flex-none">
          <Icon
            d={ICONS.search}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search rooms…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-48 bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
          {["all", "mine"].map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 capitalize
                    ${tab === t ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Create */}
        <button
          onClick={() => onCreate(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] active:translate-y-0 whitespace-nowrap"
        >
          <Icon d={ICONS.plus} size={13} />
          New room
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
