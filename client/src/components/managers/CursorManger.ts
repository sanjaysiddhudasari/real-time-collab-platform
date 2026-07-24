import type * as Monaco from "monaco-editor";

import {
  createCursorDecoration,
  injectCursorStyle,
  removeCursorStyle,
} from "../../utils/cursorDecorations";

export interface RemoteCursor {
  userId: string;
  username: string;

  lineNumber: number;
  column: number;

  color: string;

  fileId: string;
}

export class CursorManager {
  private editor: Monaco.editor.IStandaloneCodeEditor;

  /**
   * userId -> decoration ids
   */
  private decorations = new Map<string, string[]>();

  constructor(editor: Monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
  }

  updateCursor(cursor: RemoteCursor) {
    injectCursorStyle(
      cursor.userId,
      cursor.username,
      cursor.color,
    );

    const className = `remote-cursor-${cursor.userId}`;

    const oldDecorations =
      this.decorations.get(cursor.userId) ?? [];

    const newDecorations =
      this.editor.deltaDecorations(
        oldDecorations,
        [
          createCursorDecoration(
            cursor.lineNumber,
            cursor.column,
            className,
          ),
        ],
      );

    this.decorations.set(
      cursor.userId,
      newDecorations,
    );
  }

  removeCursor(userId: string) {
    const decorations =
      this.decorations.get(userId);

    if (!decorations) return;

    this.editor.deltaDecorations(
      decorations,
      [],
    );

    this.decorations.delete(userId);

    removeCursorStyle(userId);
  }

  clear() {
    for (const [userId, decorations] of this.decorations) {
      this.editor.deltaDecorations(
        decorations,
        [],
      );

      removeCursorStyle(userId);
    }

    this.decorations.clear();
  }
}