import CreateFileModal from "./CreateFileModal";
import RenameFileModal from "./RenameFileModal";

export default function RoomModals({
  showCreateModal, setShowCreateModal,
  handleCreateFile,
  files, renameTarget, setRenameTarget, handleRenameFile,
}) {
  return (
    <>
      <CreateFileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateFile}
      />
      {renameTarget && (
        <RenameFileModal
          file={files.find((f) => f._id === renameTarget)}
          onClose={() => setRenameTarget(null)}
          onRename={(newName) => {
            handleRenameFile(renameTarget, newName);
            setRenameTarget(null);
          }}
        />
      )}
    </>
  );
}
