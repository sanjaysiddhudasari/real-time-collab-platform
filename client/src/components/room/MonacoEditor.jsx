import Editor from "@monaco-editor/react";
import { EDITOR_OPTIONS, configureTypeScript } from "../../utils/editorOptions";
import { socket } from "../../socket/socket";
import { useCursorTracking } from "../../hooks/useCursorTracking";
import { useRemoteCursorRendering } from "../../hooks/useRemoteCursorRendering";

function MonacoEditor({
  activeFileId,
  files,
  setFiles,
  roomId,
  editorRef,
  cursorDecorations,
  isRemoteChange,
}) {
  const { handleCursorMove } = useCursorTracking({ roomId, socket });
  useRemoteCursorRendering({ editorRef, cursorDecorations, socket, roomId });
  const activeFile = files?.find((file) => file._id.toString() === activeFileId.toString()); 

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
          configureTypeScript(monaco);
        }}
        onChange={(value) => {
          if (isRemoteChange.current) return;
          const activeFile = files?.find((file) => file._id.toString() === activeFileId.toString());
          if (!activeFile) return;  
          setFiles((prev) => {
            return prev.map((file) =>
              file._id.toString() === activeFileId.toString() ? { ...file, code: value } : file
            );
           });
          socket.emit("sync-code", { roomId, code: value, fileId: activeFileId.toString() });
        }}
        options={EDITOR_OPTIONS}
        value={activeFile?.code}
      />
    </div>
  );
}

export default MonacoEditor;
