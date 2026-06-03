import { useEffect } from "react";
import { CURSOR_COLORS, getUserColorIndex } from "../utils/cursorColors";
import {
  createCursorDecoration,
  injectCursorStyles,
  createCursorLabel,
  updateCursorLabelPosition,
} from "../utils/cursorUtils";

export const useRemoteCursorRendering = ({
  editorRef,
  cursorDecorations,
  socket,
  roomId,
}) => {
  useEffect(() => {
    socket.off("cursor-move");

    socket.on("cursor-move", ({ userId, username, position }) => {
      if (!editorRef.current || !window.monaco) return;

      const editor = editorRef.current;
      const monaco = window.monaco;

      const colorIndex = getUserColorIndex(userId);
      const color = CURSOR_COLORS[colorIndex];

      // Remove old decorations
      if (cursorDecorations.current[userId]) {
        cursorDecorations.current[userId] = editor.deltaDecorations(
          cursorDecorations.current[userId],
          []
        );
      }

      // Create cursor decoration
      const decoration = createCursorDecoration(monaco, position, userId);
      cursorDecorations.current[userId] = editor.deltaDecorations([], [decoration]);

      // Inject cursor styles
      injectCursorStyles(userId, color);

      // Create and position cursor label
      const label = createCursorLabel(userId, username, color);
      updateCursorLabelPosition(label, editor, position);
    });

    console.log("hook running");
    console.log(editorRef.current);

    return () => {
      socket.off("cursor-move");
    };
  }, [socket, editorRef, cursorDecorations, roomId]);
};
