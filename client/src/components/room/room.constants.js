export const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "cpp",
  "java",
  "go",
];

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

export const AVATARS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
];
export const avatarColor = (str = "U") =>
  AVATARS[str.charCodeAt(0) % AVATARS.length];


export const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "JetBrains Mono, monospace",
  minimap: { enabled: false },
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  wordWrap: "on",
  tabSize: 2,
  cursorBlinking: "smooth",

  // ── Squiggles & validation ──────────────────────────
  renderValidationDecorations: "on",

  // ── Auto suggestions ────────────────────────────────
  quickSuggestions: {
    other: true,
    comments: false,
    strings: true,
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: "on",
  tabCompletion: "on",
  wordBasedSuggestions: true,
  parameterHints: { enabled: true }, // shows fn signature
  suggestSelection: "first",

  // ── Code formatting hints ───────────────────────────
  formatOnType: true,
  formatOnPaste: true,

  // ── Bracket & pair helpers ──────────────────────────
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  autoIndent: "full",
  matchBrackets: "always",
  bracketPairColorization: { enabled: true }, // colorizes bracket pairs

  // ── Visual helpers ──────────────────────────────────
  renderLineHighlight: "all",
  smoothScrolling: true,
  cursorSmoothCaretAnimation: "on",
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
};
