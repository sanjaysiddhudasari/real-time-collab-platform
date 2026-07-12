import { Icon } from "../common/Icon";
import { LANGS, avatarColor, ICONS } from "./dashboard.constants";
import { formatDistanceToNow } from "date-fns";

function RoomCard({ rooms, userId, onJoin, onDelete, joining, tab, search }) {
  const filtered = rooms
    ?.filter((r) =>
      tab === "mine" ? r.owner.toString() === userId.toString() : true,
    )
    ?.filter((r) => r.roomname.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <Icon d={ICONS.terminal} size={32} className="mb-3" />
          <p className="text-sm">No rooms found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((room) => {
            console.log(room);
            const lang = LANGS[room.files[0]?.lang || "javascript"];
            const isJoining = joining === room.roomId;
            return (
              <div
                key={room.roomId}
                className="group bg-zinc-950/60 backdrop-blur border border-zinc-800/60 hover:border-zinc-700 rounded-2xl p-5 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col gap-4"
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${lang.color}`}
                      >
                        {lang.label}
                      </span>
                      {room.owner.toString() === userId.toString() && (
                        <span className="text-[11px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-md">
                          Owner
                        </span>
                      )}
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${room.isPublic ? "text-green-500 border border-green-500/30" : "text-violet-400 border border-violet-500/30"}`}>
                        {room.isPublic ? "🌍 Public" : "🔒 Private"}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {room.roomname}
                    </h3>
                    {!room.isPublic && room.inviteCode && room.owner.toString() === userId.toString() && (
                      <p className="text-[10px] text-violet-400/60 mt-1">code: {room.inviteCode}</p>
                    )}
                  </div>

                  {room.owner.toString() === userId.toString() && (
                    <button
                      onClick={() => onDelete(room.roomId)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all duration-150 p-1 ml-2"
                    >
                      <Icon d={ICONS.trash} size={13} />
                    </button>
                  )}
                </div>

                {/* participants */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {room.participants.slice(0, 4).map((u, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-full ${avatarColor(u.username)} flex items-center justify-center text-[9px] font-bold border-2 border-[#0a0a0f]`}
                        >
                          {u.username.slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {room.participants.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 border-2 border-[#0a0a0f]">
                          +{room.participants.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="ml-2 text-zinc-500 text-xs">
                      {room.participants.length} online
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-600 text-[11px]">
                    <Icon d={ICONS.clock} size={11} />
                    {formatDistanceToNow(new Date(room.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                {/* Join button */}
                <button
                  onClick={() => onJoin(room)}
                  disabled={isJoining}
                  className="w-full py-2.5 bg-zinc-800/80 hover:bg-blue-600 disabled:opacity-60 border border-zinc-700/50 hover:border-blue-500 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <svg
                        className="animate-spin"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                          strokeLinecap="round"
                        />
                      </svg>
                      Joining…
                    </>
                  ) : (
                    <>
                      <Icon d={ICONS.terminal} size={13} />
                      Join session
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
