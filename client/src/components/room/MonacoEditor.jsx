import Editor from "@monaco-editor/react";
import { EDITOR_OPTIONS, configureTypeScript } from "../../utils/editorOptions";
import { socket } from "../../socket/socket";
import { useCursors } from "../../hooks/useCursors";
import { useRef } from "react";

function MonacoEditor({
  activeFileId,
  files,
  setFiles,
  roomId,
  editorRef,
  removeCursorRef,
  lastSyncedRef,
}) {
  const { handleCursorMove, repositionOnScroll } = useCursors({ editorRef, roomId, activeFileId, socket, removeCursorRef });
  const syncTimer = useRef(null);

  const activeFile = files?.find(
    (file) => file._id?.toString() === activeFileId?.toString(),
  );

  return (
    <div className="flex-1 overflow-hidden relative">
      <Editor
        height="100%"
        language={activeFile?.lang}
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
          const f = files?.find(
            (file) => file._id?.toString() === activeFileId?.toString(),
          );
          if (!f) return;
          setFiles((prev) =>
            prev.map((file) =>
              file._id?.toString() === activeFileId?.toString()
                ? { ...file, code: value }
                : file,
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
        value={activeFile?.code}
      />
    </div>
  );
}

export default MonacoEditor;
