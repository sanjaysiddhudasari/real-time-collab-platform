import React from "react";
import { ICONS } from "./dashboard.constants";
import { Icon } from "../common/Icon";

function Stats({ rooms, socketId, connected, userId }) {
  const stats = [
    { label: "Active rooms", value: rooms.length, icon: ICONS.grid },
    {
      label: "Collaborators",
      value: [...new Set(rooms.flatMap((r) => r.participants || []))].length,
      icon: ICONS.participants,
    },
    {
      label: "My rooms",
      value: rooms.filter((r) => r.owner?.toString() === userId?.toString()).length,
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{ animationDelay: `${i * 50}ms` }}
          className="animate-enter surface rounded-lg px-3.5 py-3"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-[11px] font-medium">{s.label}</span>
            <Icon d={s.icon} size={13} className="text-zinc-600" />
          </div>
          <p
            className={`text-lg font-semibold tracking-tight tabular-nums ${
              s.live ? (connected ? "text-emerald-400" : "text-zinc-500") : "text-zinc-100"
            }`}
          >
            {s.value}
          </p>
          {s.live && socketId && (
            <p className="text-zinc-600 text-[10px] mt-0.5 font-mono truncate">{socketId.slice(0, 8)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default Stats;
