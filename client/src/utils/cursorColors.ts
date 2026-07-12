const COLORS = [
  "#FF5252",
  "#42A5F5",
  "#66BB6A",
  "#AB47BC",
  "#FFA726",
  "#26C6DA",
  "#EC407A",
  "#8D6E63",
];

export function getCursorColor(userId: string): string {
  let hash = 0;

  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }

  return COLORS[Math.abs(hash) % COLORS.length];
}