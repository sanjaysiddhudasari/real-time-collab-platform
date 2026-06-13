import { useCallback } from "react";

export const useCursorTracking = ({ roomId, socket }) => {
  const handleCursorMove = useCallback(
    (e) => {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      if (!currentUser) return;

      socket.emit("cursor-move", {
        roomId,
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
