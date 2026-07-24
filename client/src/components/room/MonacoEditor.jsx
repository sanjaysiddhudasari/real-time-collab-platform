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
    const decos = [];
    const seen = new Set();
    comments.forEach((c) => {
      if (seen.has(c.line)) return;
      seen.add(c.line);
      decos.push({
        range: new window.monaco.Range(c.line, 1, c.line, 1),
        options: {
          glyphMarginClassName: "comment-gutter-dot",
          glyphMarginHoverMessage: { value: `${seen.size > 1 ? "Multiple" : c.type} — Line ${c.line}`, isTrusted: true },
        },
      });
    });
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
