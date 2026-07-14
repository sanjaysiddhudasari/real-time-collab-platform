import { useState, useMemo } from "react";
import { socket } from "../socket/socket";

function useFiles({roomId, files}) {
    const [activeFileId, setActiveFileId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [renameTarget, setRenameTarget] = useState(null);

    const activeFile = useMemo(() =>
      files?.find((f) => f?._id?.toString() === activeFileId?.toString()),
      [files, activeFileId],
    );

    const handleCreateFile = ({ name, lang }) => {
    socket.emit("create-file", { roomId, name, lang });
  };

  const handleRenameFile = (fileId, newName) => {
    socket.emit("rename-file", { roomId, fileId, name: newName });
  };

  const handleLangChange = (lang) => {
    socket.emit("lang-change", { roomId, lang, fileId: activeFileId });
  };

  return {activeFile, activeFileId, setActiveFileId, showCreateModal, setShowCreateModal, renameTarget, setRenameTarget, handleCreateFile, handleRenameFile, handleLangChange};
}

export default useFiles;
