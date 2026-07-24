
import { getUserColorIndex } from "./cursorColors";

export const createCursorDecoration = (monaco, position, userId) => {
  const colorIndex = getUserColorIndex(userId); // Get the color index
  return {
    range: new monaco.Range(
      position.lineNumber,
      position.column,
      position.lineNumber,
      position.column
    ),
    options: {
      className: `remote-cursor-line-${colorIndex}`, // Use the centralized class
      // You might also want to add 'linesDecorationsClassName' for the gutter
      // linesDecorationsClassName: `remote-cursor-gutter-${colorIndex}`,
    },
  };
};





export const createCursorLabel = (userId, username) => {
  let label = document.getElementById(`label-${userId}`);
  const colorIndex = getUserColorIndex(userId); // Get the color index

  if (!label) {
    label = document.createElement("div");
    label.id = `label-${userId}`;
    // Apply the centralized class
    label.className = `remote-cursor-label-${colorIndex}`;
    document.body.appendChild(label);
  }

  // Only update text if it actually changed, no recreation
  if (label.innerText !== username) {
    label.innerText = username;
  }

  // No inline style needed anymore if class is applied correctly

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
