export const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "JetBrains Mono, monospace",
  minimap: { enabled: false },
  lineNumbers: "on",
  glyphMargin: true,
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
  parameterHints: { enabled: true },
  suggestSelection: "first",

  // ── Code formatting hints ───────────────────────────
  formatOnType: true,
  formatOnPaste: true,

  // ── Bracket & pair helpers ──────────────────────────
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  autoIndent: "full",
  matchBrackets: "always",
  bracketPairColorization: { enabled: true },

  // ── Visual helpers ──────────────────────────────────
  renderLineHighlight: "all",
  smoothScrolling: true,
  cursorSmoothCaretAnimation: "on",
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
};

export const configureTypeScript = (monaco) => {
  // Enable TypeScript/JavaScript type checking
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
  });
};
