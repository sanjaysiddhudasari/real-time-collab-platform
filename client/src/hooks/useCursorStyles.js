import { useEffect } from "react";
import { CURSOR_COLORS } from "../utils/cursorColors";

function useCursorStyles() {
      useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.id = "dynamic-cursor-styles";
    styleTag.innerHTML = CURSOR_COLORS.map(
      (c, i) => `
        .remote-cursor-line-${i} {
          border-left: 2px solid ${c.cursor};
          margin-left: -1px;
          position: relative;
        }
        .remote-cursor-line-highlight-${i} {
          background: ${c.cursor}10 !important;
        }
        .remote-cursor-gutter-${i}::before {
          content: '';
          display: block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: ${c.cursor};
          margin: auto;
        }
        .remote-cursor-label-${i} {
          position: absolute;
          background: ${c.label};
          color: white;
          padding: 2px 6px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          z-index: 1000;
          pointer-events: none;
          white-space: nowrap;
        }
      `,
    ).join("\n");
    document.head.appendChild(styleTag);
    return () => document.getElementById("dynamic-cursor-styles")?.remove();
  }, []);
}

export default useCursorStyles;