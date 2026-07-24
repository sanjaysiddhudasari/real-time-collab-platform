import Editor from "@monaco-editor/react";
import { EDITOR_OPTIONS, configureTypeScript } from "../../utils/editorOptions";
import { socket } from "../../socket/socket";
import { useCursors } from "../../hooks/useCursors";
import { useRef, useEffect } from "react";

function MonacoEditor({
  file,
  setFiles,
  roomId,
  editorRef,
  removeCursorRef,
  lastSyncedRef,
  comments,
  commentsOpen,
  onGutterClick,
  activeCommentLine,
}) {
  const activeFileId = file?._id;
  const { handleCursorMove, repositionOnScroll } = useCursors({ editorRef, roomId, activeFileId, socket, removeCursorRef });
  const syncTimer = useRef(null);
  const commentDecorations = useRef([]);
  const activeLineDeco = useRef([]);

  useEffect(() => {
    const editor = editorRef?.current;
    if (!editor || !window.monaco) return;
    editor.deltaDecorations(commentDecorations.current, []);
    commentDecorations.current = [];
    if (!commentsOpen || !comments?.length) return;
    // Group comments by line; dot color = highest-priority type on that line
    const COLOR = { Bug: "red", Performance: "blue", Style: "yellow" };
    const PRIORITY = { Bug: 0, Performance: 1, Style: 2 };
    const byLine = new Map();
    comments.forEach((c) => {
      const entry = byLine.get(c.line) || { type: c.type, count: 0 };
      entry.count += 1;
      if ((PRIORITY[c.type] ?? 3) < (PRIORITY[entry.type] ?? 3)) entry.type = c.type;
      byLine.set(c.line, entry);
    });
    const decos = [...byLine.entries()].map(([line, entry]) => ({
      range: new window.monaco.Range(line, 1, line, 1),
      options: {
        glyphMarginClassName: `comment-gutter-dot comment-dot-${COLOR[entry.type] || "yellow"}`,
        glyphMarginHoverMessage: { value: `${entry.count > 1 ? "Multiple" : entry.type} — Line ${line}`, isTrusted: true },
      },
    }));
    commentDecorations.current = editor.deltaDecorations([], decos);
  }, [comments, commentsOpen, editorRef]);

  // ── Highlight active comment line ─────────────────────────
  useEffect(() => {
    const editor = editorRef?.current;
    if (!editor || !window.monaco) return;
    editor.deltaDecorations(activeLineDeco.current, []);
    activeLineDeco.current = [];
    if (!activeCommentLine) return;
    activeLineDeco.current = editor.deltaDecorations([], [{
      range: new window.monaco.Range(activeCommentLine, 1, activeCommentLine, 1),
      options: { isWholeLine: true, className: "comment-active-line" },
    }]);
  }, [activeCommentLine, editorRef]);

  return (
    <div className="flex-1 overflow-hidden relative">
      <Editor
        height="100%"
        language={file?.lang}
        theme="vs-dark"
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          window.monaco = monaco;
          editor.onDidChangeCursorPosition(handleCursorMove);
          editor.onDidScrollChange(() => repositionOnScroll(editor));
          editor.onMouseDown((e) => {
            if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
              const line = e.target.position?.lineNumber;
              if (line) onGutterClick?.(line);
            }
          });
          configureTypeScript(monaco);
        }}
        onChange={(value) => {
          if (lastSyncedRef?.current === value) {
            lastSyncedRef.current = null;
            return;
          }
          if (!file) return;
          setFiles((prev) =>
            prev.map((f) =>
              f._id?.toString() === activeFileId?.toString()
                ? { ...f, code: value }
                : f,
            ),
          );
          clearTimeout(syncTimer.current);
          syncTimer.current = setTimeout(() => {
            socket.emit("sync-code", {
              roomId,
              code: value,
              fileId: activeFileId?.toString(),
            });
          }, 50);
        }}
        options={EDITOR_OPTIONS}
        value={file?.code}
      />
    </div>
  );
}

export default MonacoEditor;
