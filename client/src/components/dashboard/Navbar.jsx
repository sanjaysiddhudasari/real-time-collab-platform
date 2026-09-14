import React from "react";
import { useNavigate } from "react-router-dom";
import { ICONS } from "./dashboard.constants";
import { Icon } from "../common/Icon";

function Navbar({ connected, user }) {
  const navigate = useNavigate();
  return (
    <nav className="relative z-10 border-b border-white/[0.06] bg-[#0e1114]/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
            <Icon d={ICONS.bolt} size={13} className="text-white" />
          </div>
          <span className="font-semibold text-[13px] tracking-tight text-zinc-100">CodeSync</span>
          <span className="hidden sm:inline text-[10px] font-mono text-zinc-600 border border-white/[0.06] rounded px-1.5 py-0.5 ml-1">beta</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium tabular-nums ${
              connected
                ? "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400"
                : "bg-white/[0.03] border-white/[0.06] text-zinc-500"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 live-dot text-emerald-400" : "bg-zinc-600"}`} />
            {connected ? "Connected" : "Connecting"}
          </div>

          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-200 ring-1 ring-white/10 cursor-pointer">
            {user?.username?.slice(0, 2).toUpperCase()}
          </div>

          <button
            onClick={() => navigate("/login")}
            className="btn-press flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs transition-colors px-1.5 py-1"
          >
            <Icon d={ICONS.logout} size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
