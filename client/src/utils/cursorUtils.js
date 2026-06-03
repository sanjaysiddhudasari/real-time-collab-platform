export const createCursorDecoration = (monaco, position, userId) => ({
  range: new monaco.Range(
    position.lineNumber,
    position.column,
    position.lineNumber,
    position.column
  ),
  options: {
    className: `remoteCursor${userId}`,
  },
});

export const injectCursorStyles = (userId, color) => {
  const styleId = `style-${userId}`;

  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = `
    .remoteCursor${userId} {
      border-left: 3px solid ${color.cursor};
    }

    .cursorLabel${userId} {
      position: absolute;
      background: ${color.label};
      color: white;
      padding: 2px 6px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 600;
      z-index: 1000;
      pointer-events: none;
      white-space: nowrap;
    }
  `;

  document.head.appendChild(style);
};

export const createCursorLabel = (userId, username, color) => {
  const oldLabel = document.getElementById(`label-${userId}`);
  if (oldLabel) oldLabel.remove();

  const label = document.createElement("div");
  label.id = `label-${userId}`;
  label.className = `cursorLabel`;
  label.style.background = color.label;
  label.innerText = username;

  document.body.appendChild(label);
  return label;
};

export const updateCursorLabelPosition = (label, editor, position) => {
  const coords = editor.getScrolledVisiblePosition({
    lineNumber: position.lineNumber,
    column: position.column,
  });

  if (!coords) return;

  const editorDom = editor.getDomNode();
  const rect = editorDom.getBoundingClientRect();

  label.style.left = `${rect.left + coords.left + 8}px`;
  label.style.top = `${rect.top + coords.top - 22}px`;
};
