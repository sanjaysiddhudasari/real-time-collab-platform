import { Icon } from "../common/Icon";
import { LANGS, avatarColor, ICONS } from "./dashboard.constants";
import { formatDistanceToNow } from "date-fns";

function RoomCard({ rooms, userId, onJoin, onDelete, joining, tab, search }) {
  const filtered = rooms
    ?.filter((r) =>
      tab === "mine"
        ? r.owner?.toString() === userId.toString() ||
          r.participants?.some((p) => (p._id?.toString() || p.toString()) === userId.toString())
        : true,
    )
    ?.filter((r) => r.roomname.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      {filtered.length === 0 ? (
        <div className="animate-enter flex flex-col items-center justify-center py-16 border border-dashed border-white/[0.08] rounded-lg">
          <Icon d={ICONS.terminal} size={20} className="mb-2 text-zinc-700" />
          <p className="text-xs text-zinc-500">No rooms found</p>
          <p className="text-[11px] text-zinc-700 mt-0.5">Try a different search or create a room</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filtered.map((room, i) => {
            const lang = LANGS[room.files[0]?.lang || "javascript"];
            const isJoining = joining === room.roomId;
            const isOwner = room.owner.toString() === userId.toString();
            return (
              <div
                key={room.roomId}
                style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
                className="animate-enter group surface surface-hover rounded-lg p-4 flex flex-col gap-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold text-zinc-100 truncate tracking-tight">
                      {room.roomname}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-medium px-1.5 py-px rounded border ${lang.color}`}>
                        {lang.label}
                      </span>
                      {isOwner && (
                        <span className="text-[10px] text-zinc-500 border border-white/[0.06] px-1.5 py-px rounded">
                          Owner
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <span
                          className={`w-1 h-1 rounded-full ${room.isPublic ? "bg-emerald-500" : "bg-amber-500"}`}
                        />
                        {room.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                    {!room.isPublic && room.inviteCode && isOwner && (
                      <p className="text-[10px] text-zinc-600 mt-1.5 font-mono">invite · {room.inviteCode}</p>
                    )}
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => onDelete(room.roomId)}
                      title="Delete room"
                      className="btn-press opacity-0 group-hover:opacity-100 focus:opacity-100 text-zinc-600 hover:text-red-400 transition-all duration-150 p-1 cursor-pointer"
                    >
                      <Icon d={ICONS.trash} size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                  <div className="flex items-center">
                    <div className="flex -space-x-1.5">
                      {room.participants.slice(0, 4).map((u, idx) => (
                        <div
                          key={idx}
                          title={u.username}
                          className={`w-5 h-5 rounded-full ${avatarColor(u.username)} flex items-center justify-center text-[8px] font-bold ring-2 ring-[#101013]`}
                        >
                          {u.username.slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {room.participants.length > 4 && (
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-400 ring-2 ring-[#101013]">
                          +{room.participants.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="ml-2 text-zinc-600 text-[11px] tabular-nums">
                      {room.participants.length} member{room.participants.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <span className="text-zinc-700 text-[10px] tabular-nums">
                    {formatDistanceToNow(new Date(room.updatedAt), { addSuffix: true })}
                  </span>
                </div>

                <button
                  onClick={() => onJoin(room)}
                  disabled={isJoining}
                  className="btn-press w-full py-1.5 bg-white/[0.06] hover:bg-blue-600 disabled:opacity-60 border border-white/[0.06] hover:border-blue-500 text-zinc-200 hover:text-white text-xs font-medium rounded-md transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isJoining ? (
                    <>
                      <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                      </svg>
                      Joining
                    </>
                  ) : (
                    <>
                      Join session
                      <span aria-hidden className="text-zinc-500 group-hover:text-white/70 transition-colors">→</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default RoomCard;
