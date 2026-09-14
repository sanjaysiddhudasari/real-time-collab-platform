import { useState } from "react";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "sql", label: "SQL" },
];

const EXT_MAP = { javascript: ".js", typescript: ".ts", python: ".py", html: ".html", css: ".css", cpp: ".cpp", java: ".java", go: ".go", rust: ".rs", php: ".php", ruby: ".rb", sql: ".sql" };

export default function CreateFileModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [lang, setLang] = useState("javascript");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    let finalName = name.trim();
    if (!finalName.includes(".")) finalName += EXT_MAP[lang] || "";
    onCreate({ name: finalName, lang });
    setName("");
    setLang("javascript");
    onClose();
  };

  return (
    <div className="backdrop-fade fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" style={{ backdropFilter: "blur(4px)" }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-pop surface rounded-lg w-80 max-w-full shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-zinc-100 text-[13px] font-semibold tracking-tight">Create file</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div>
            <label className="text-zinc-400 text-[11px] font-medium block mb-1.5">
              File name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="main.js"
              autoFocus
              className="field w-full bg-black/30 font-mono text-zinc-100 text-[13px] rounded-md px-3 py-2 border border-white/[0.07] outline-none placeholder-zinc-600"
            />
          </div>

          <div>
            <label className="text-zinc-400 text-[11px] font-medium block mb-1.5">
              Language
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full bg-black/30 text-zinc-200 text-xs rounded-md px-3 py-2 border border-white/[0.07] outline-none appearance-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setName("");
                setLang("javascript");
                onClose();
              }}
              className="btn-press px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.07] rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-press px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
