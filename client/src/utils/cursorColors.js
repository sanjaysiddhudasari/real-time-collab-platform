export const CURSOR_COLORS = [
  { cursor: "#f87171", label: "#ef4444" }, // red
  { cursor: "#fb923c", label: "#f97316" }, // orange
  { cursor: "#a78bfa", label: "#8b5cf6" }, // violet
  { cursor: "#34d399", label: "#10b981" }, // green
  { cursor: "#60a5fa", label: "#3b82f6" }, // blue
  { cursor: "#f472b6", label: "#ec4899" }, // pink
  { cursor: "#facc15", label: "#eab308" }, // yellow
];

export const getUserColorIndex = (userId) => {
  if (!userId) return 0;
  return (
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    CURSOR_COLORS.length
  );
};
