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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-96 shadow-2xl">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-white text-sm font-semibold">Create new file</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-zinc-400 text-xs font-medium block mb-1.5">
              File name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. main.js"
              autoFocus
              className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:border-blue-600 placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="text-zinc-400 text-xs font-medium block mb-1.5">
              Language
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setName("");
                setLang("javascript");
                onClose();
              }}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
