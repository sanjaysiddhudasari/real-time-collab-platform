import * as Monaco from "monaco-editor";

export function createCursorDecoration(
  lineNumber: number,
  column: number,
  className: string,
): Monaco.editor.IModelDeltaDecoration {
  return {
    range: new Monaco.Range(
      lineNumber,
      column,
      lineNumber,
      column,
    ),

    options: {
      className,
      stickiness:
        Monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    },
  };
}

export function injectCursorStyle(
  userId: string,
  username: string,
  color: string,
) {
  const id = `cursor-style-${userId}`;

  if (document.getElementById(id)) return;

  const style = document.createElement("style");

  style.id = id;

  style.innerHTML = `
  .remote-cursor-${userId}{
      border-left:2px solid ${color};
      position:relative;
  }

  .remote-cursor-${userId}::after{
      content:"${username}";
      position:absolute;
      top:-18px;
      left:-2px;
      background:${color};
      color:white;
      font-size:11px;
      padding:2px 6px;
      border-radius:4px;
      white-space:nowrap;
      pointer-events:none;
      z-index:1000;
  }
  `;

  document.head.appendChild(style);
}

export function removeCursorStyle(userId: string) {
  const style = document.getElementById(`cursor-style-${userId}`);

  if (style) style.remove();
}