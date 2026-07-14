import { useEffect } from "react";
import { CURSOR_COLORS } from "../utils/cursorColors";

function useCursorStyles() {
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.id = "dynamic-cursor-styles";
    const cursorCSS = CURSOR_COLORS.map(
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
      `
    ).join("\n");
    const aiCSS = [
      ".ai-suggest-red { background: #ef444420; border-left: 3px solid #ef4444; }",
      ".ai-suggest-blue { background: #3b82f620; border-left: 3px solid #3b82f6; }",
      ".ai-suggest-yellow { background: #eab30820; border-left: 3px solid #eab308; }",
      ".ai-suggest-margin-red { background: #ef4444; width: 4px !important; height: 4px !important; border-radius: 50%; }",
      ".ai-suggest-margin-blue { background: #3b82f6; width: 4px !important; height: 4px !important; border-radius: 50%; }",
      ".ai-suggest-margin-yellow { background: #eab308; width: 4px !important; height: 4px !important; border-radius: 50%; }",
    ].join("\n");
    styleTag.innerHTML = cursorCSS + "\n" + aiCSS;
    document.head.appendChild(styleTag);
    return () => document.getElementById("dynamic-cursor-styles")?.remove();
  }, []);
}

export default useCursorStyles;
