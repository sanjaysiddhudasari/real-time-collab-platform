import React from "react";
import { useNavigate } from "react-router-dom";
import { ICONS } from "./dashboard.constants";
import { Icon } from "../common/Icon";

function Navbar({ connected,user }) {
  const navigate = useNavigate();
  return (
    <nav className="relative z-10 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Icon d={ICONS.bolt} size={14} />
          </div>
          <span className="font-bold text-sm tracking-tight">CodeSync</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all duration-500
              ${connected ? "bg-green-500/10 border-green-500/25 text-green-400" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-zinc-500"}`}
            />
            {connected ? "Connected" : "Connecting…"}
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xs font-semibold cursor-pointer">
            {user.username.slice(0,2).toUpperCase()}
          </div>

          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors px-2 py-1"
          >
            <Icon d={ICONS.logout} size={14} />
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
