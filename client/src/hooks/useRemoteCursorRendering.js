import { useEffect } from "react";
import {
  createCursorDecoration,
  createCursorLabel,
  updateCursorLabelPosition,
} from "../utils/cursorUtils";

export const useRemoteCursorRendering = ({
  editorRef,
  cursorDecorations,
  socket,
  roomId,
  activeFileId,
}) => {
  // ── 1. Clean up old cursor labels when file tab changes ───────────────
  useEffect(() => {
    // Monaco auto-destroys decorations when the model changes (file switch),
    // so we only need to remove the floating label divs from DOM
    document.querySelectorAll('[id^="label-"]').forEach((el) => el.remove());
  }, [activeFileId]);

  // ── 2. Listen for incoming cursor-move events ─────────────────────────
  useEffect(() => {
    socket.off("cursor-move");

    const handler = ({ userId, username, fileId, position }) => {
      // 🎯 ONLY render cursors that belong to the ACTIVE file
      if (fileId && activeFileId && fileId !== activeFileId) return;
      if (!editorRef.current || !window.monaco) return;

      const editor = editorRef.current;
      const monaco = window.monaco;

      // Remove old decorations for this user
      if (cursorDecorations.current[userId]) {
        cursorDecorations.current[userId] = editor.deltaDecorations(
          cursorDecorations.current[userId],
          []
        );
      }

      // Create cursor decoration (colored line in the editor)
      const decoration = createCursorDecoration(monaco, position, userId);
      cursorDecorations.current[userId] = editor.deltaDecorations(
        [],
        [decoration]
      );

      // Create and position floating label
      const label = createCursorLabel(userId, username);
      updateCursorLabelPosition(label, editor, position);
    };

    socket.on("cursor-move", handler);

    return () => {
      socket.off("cursor-move", handler);
    };
  }, [roomId, activeFileId]);
};
