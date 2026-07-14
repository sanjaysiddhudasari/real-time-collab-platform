import { socket } from "../../socket/socket";
import FileTab from "./FileTab";
import MonacoEditor from "./MonacoEditor";
import OutputPanel from "./OutputPanel";

export default function Workspace({
  files, setFiles, activeFileId, setActiveFileId,
  roomId, editorRef, removeCursorRef, lastSyncedRef,
  outputOpen, setOutputOpen, output, runningFiles, lastRunFileId,
  setShowCreateModal, setRenameTarget,
}) {
  const activeFile = files?.find(
    (file) => file._id?.toString() === activeFileId?.toString(),
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <FileTab
        files={files}
        activeFileId={activeFileId}
        setActiveFileId={setActiveFileId}
        onAddFile={() => setShowCreateModal(true)}
        onRenameFile={(fileId) => setRenameTarget(fileId)}
        onDeleteFile={(fileId) => socket.emit("delete-file", { roomId, fileId })}
      />
      <MonacoEditor
        file={activeFile}
        setFiles={setFiles}
        roomId={roomId}
        editorRef={editorRef}
        removeCursorRef={removeCursorRef}
        lastSyncedRef={lastSyncedRef}
      />
      {outputOpen && lastRunFileId === activeFileId?.toString() && (
        <OutputPanel
          setOutputOpen={setOutputOpen}
          isRunning={!!runningFiles[activeFileId]?.running}
          output={output}
          runUser={runningFiles[activeFileId]?.username}
        />
      )}
    </div>
  );
}
