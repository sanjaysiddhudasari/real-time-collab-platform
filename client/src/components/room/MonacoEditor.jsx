import Editor from "@monaco-editor/react";
import { EDITOR_OPTIONS, configureTypeScript } from "../../utils/editorOptions";
import { socket } from "../../socket/socket";
import { useCursorTracking } from "../../hooks/useCursorTracking";
import { useRemoteCursorRendering } from "../../hooks/useRemoteCursorRendering";

function MonacoEditor({
  lang,
  roomId,
  editorRef,
  cursorDecorations,
  isRemoteChange,
}) {
  const { handleCursorMove } = useCursorTracking({ roomId, socket });
  useRemoteCursorRendering({ editorRef, cursorDecorations, socket, roomId });

  return (
    <div className="flex-1 overflow-hidden relative">
      <Editor
        height="100%"
        language={lang}
        theme="vs-dark"
        defaultValue="// write your code here"
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          window.monaco = monaco;
          editor.onDidChangeCursorPosition(handleCursorMove);
          configureTypeScript(monaco);
        }}
        onChange={(value) => {
          if (isRemoteChange.current) return;
          // setCode(value); common emmitor to all 
          socket.emit("sync-code", { roomId, code: value });
        }}
        options={EDITOR_OPTIONS}
      />
    </div>
  );
}

export default MonacoEditor;
