import { useMemo } from "react";
import type { Socket } from "socket.io-client";
import type * as Monaco from "monaco-editor";

import { throttle } from "../utils/throttle";

interface Props {
  socket: Socket;
  roomId: string;
  activeFileId: string;
}

export function useCursorTracking({
  socket,
  roomId,
  activeFileId,
}: Props) {
  const handleCursorMove = useMemo(
    () =>
      throttle(
        (
          event: Monaco.editor.ICursorPositionChangedEvent,
        ) => {
          socket.emit("cursor-update", {
            roomId,

            fileId: activeFileId,

            lineNumber: event.position.lineNumber,

            column: event.position.column,
          });
        },
        30,
      ),

    [socket, roomId, activeFileId],
  );

  return {
    handleCursorMove,
  };
}