export const ICONS = {
  code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  plus: "M12 5v14M5 12h14",
  participants: [
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    "M23 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  clock: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 6v6l4 2",
  ],
  logout: [
    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
    "M16 17l5-5-5-5",
    "M21 12H9",
  ],
  copy: [
    "M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z",
  ],
  trash: ["M3 6h18", "M19 6l-1 14H6L5 6", "M8 6V4h8v2"],
  terminal: "M4 17l6-6-6-6M12 19h8",
  bolt: "M13 10V3L4 14h7v7l9-11h-7z",
  grid: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"],
  search: ["M21 21l-4.35-4.35", "M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"],
  signal: ["M22 12h-4l-3 9L9 3l-3 9H2"],
};

export const LANGS = {
  javascript: {
    label: "JavaScript",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  },
  typescript: {
    label: "TypeScript",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  python: {
    label: "Python",
    color: "text-green-400 bg-green-400/10 border-green-400/20",
  },
  cpp: {
    label: "C++",
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  },
  java: {
    label: "Java",
    color: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  },
  go: { label: "Go", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
};



export const AVATARS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
];

export const avatarColor = (str) => AVATARS[str.charCodeAt(0) % AVATARS.length];

