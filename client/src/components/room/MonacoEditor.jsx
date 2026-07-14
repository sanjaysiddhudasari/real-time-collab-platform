import Editor from "@monaco-editor/react";
import { EDITOR_OPTIONS, configureTypeScript } from "../../utils/editorOptions";
import { socket } from "../../socket/socket";
import { useCursors } from "../../hooks/useCursors";
import { useRef } from "react";

function MonacoEditor({
  file,
  setFiles,
  roomId,
  editorRef,
  removeCursorRef,
  lastSyncedRef,
}) {
  const activeFileId = file?._id;
  const { handleCursorMove, repositionOnScroll } = useCursors({ editorRef, roomId, activeFileId, socket, removeCursorRef });
  const syncTimer = useRef(null);

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
