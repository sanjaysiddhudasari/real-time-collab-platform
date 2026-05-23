import React from "react";
import { ICONS } from "./dashboard.constants";
import { Icon } from "../common/Icon";

function Stats({ rooms, socketId, connected, userId }) {
  const stats = [
    {
      label: "Active rooms",
      value: rooms.length,
      icon: ICONS.grid,
    },

    {
      label: "Collaborators",
      value: [...new Set(rooms.flatMap((r) => r.participants || []))].length,
      icon: ICONS.participants,
    },

    {
      label: "My rooms",
      value: rooms.filter((r) => r.owner?.toString() === userId?.toString())
        .length,
      icon: ICONS.code,
    },

    {
      label: "Socket status",
      value: connected ? "Live" : "Offline",
      icon: ICONS.signal,
      live: true,
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-zinc-950/60 backdrop-blur border border-zinc-800/60 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-500 text-xs">{s.label}</span>
            <Icon d={s.icon} size={14} className="text-zinc-600" />
          </div>
          <p
            className={`text-xl font-bold tracking-tight ${s.live ? (connected ? "text-green-400" : "text-zinc-500") : "text-white"}`}
          >
            {s.value}
          </p>
          {s.live && socketId && (
            <p className="text-zinc-600 text-[10px] mt-1 font-mono truncate">
              {socketId}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default Stats;
