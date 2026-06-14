import { useCallback, useRef, useEffect } from "react";

export const useCursorTracking = ({ roomId, socket, activeFileId }) => {
  // Use a ref so the emit always sends the latest activeFileId
  // without re-creating the callback and re-attaching the editor listener
  const fileIdRef = useRef(activeFileId);
  useEffect(() => {
    fileIdRef.current = activeFileId;
  }, [activeFileId]);

  const handleCursorMove = useCallback(
    (e) => {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser) return;

      socket.emit("cursor-move", {
        roomId,
        fileId: fileIdRef.current,
        position: {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        },
      });
    },
    [roomId, socket]
  );

  return { handleCursorMove };
};
