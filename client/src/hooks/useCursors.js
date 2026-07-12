import { useEffect, useRef, useCallback } from "react";
import {
  createCursorDecoration,
  createCursorLabel,
  updateCursorLabelPosition,
} from "../utils/cursorUtils";

export function useCursors({ editorRef, roomId, activeFileId, socket, removeCursorRef }) {
  const decorations = useRef({});

  // ── 1. Emit local cursor position ──────────────────────────────────
  const handleCursorMove = useCallback(
    (e) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;
      socket.emit("cursor-move", {
        roomId,
        fileId: activeFileId,
        position: {
          lineNumber: e.position.lineNumber,
          column: e.position.column,
        },
      });
    },
    [roomId, activeFileId, socket],
  );

  // ── 2. Listen for remote cursor events ──────────────────────────────
  useEffect(() => {
    socket.off("cursor-move");
    socket.on("cursor-move", ({ userId, username, fileId, position }) => {
      if (fileId && activeFileId && fileId !== activeFileId) return;
      if (!editorRef.current || !window.monaco) return;

      const editor = editorRef.current;
      const monaco = window.monaco;

      if (decorations.current[userId]) {
        decorations.current[userId] = editor.deltaDecorations(
          decorations.current[userId], [],
        );
      }
      const decoration = createCursorDecoration(monaco, position, userId);
      decorations.current[userId] = editor.deltaDecorations([], [decoration]);

      const label = createCursorLabel(userId, username);
      updateCursorLabelPosition(label, editor, position);
    });

    return () => { socket.off("cursor-move"); };
  }, [roomId, activeFileId, editorRef, socket]);

  // ── 3. Clean up on file switch ─────────────────────────────────────
  useEffect(() => {
    document.querySelectorAll('[id^="label-"]').forEach((el) => el.remove());
    if (editorRef.current) {
      Object.values(decorations.current).forEach((ids) => {
        if (ids?.length) editorRef.current.deltaDecorations(ids, []);
      });
      decorations.current = {};
    }
  }, [activeFileId, editorRef]);

  // ── 4. Expose removeUserCursor for useRoomSocket ───────────────────
  if (removeCursorRef) {
    removeCursorRef.current = useCallback((userId) => {
      const label = document.getElementById(`label-${userId}`);
      label?.remove();
      if (decorations.current[userId] && editorRef.current) {
        editorRef.current.deltaDecorations(decorations.current[userId], []);
        delete decorations.current[userId];
      }
    }, [editorRef]);
  }

  return { handleCursorMove };
}
