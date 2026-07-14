import { useRef, useCallback } from "react";
import { parseAISuggestions } from "../utils/reviewParser";
import useAiReview from "./useAiReview";

export default function useAiReviewController({editorRef, activeFileId}) {
    const { reviews, isStreaming, error, triggerReview, clearReview } = useAiReview();
    const raw = reviews[activeFileId] || "";
    const parsed = parseAISuggestions(raw);
    const activeDecos = useRef({});

    const toggleLine = useCallback((line) => {
        const editor = editorRef?.current;
        if (!editor || !window.monaco) return;
        const suggestion = parsed.find((s) => s.line === line);
        if (!suggestion) return;

        const existing = activeDecos.current[line];
        if (existing) {
            editor.deltaDecorations(existing, []);
            delete activeDecos.current[line];
            return;
        }

        const TYPE_COLOR = { Bug: "red", Performance: "blue", Style: "yellow" };
        const color = TYPE_COLOR[suggestion.type] || "blue";
        const ids = editor.deltaDecorations([], [{
            range: new window.monaco.Range(line, 1, line, 1),
            options: {
                isWholeLine: true,
                className: `ai-suggest-${color}`,
                glyphMarginClassName: `ai-suggest-margin-${color}`,
                hoverMessage: {
                    value: `**${suggestion.type}** — Line ${line}\n\n${suggestion.explanation}\n\n${suggestion.suggestion ? `\`\`\`\n${suggestion.suggestion}\n\`\`\`` : ""}`,
                    isTrusted: true,
                },
            },
        }]);
        activeDecos.current[line] = ids;
    }, [editorRef, parsed]);

    return { reviews, currentRaw: raw, parsedSuggestions: parsed, isStreaming, error, triggerReview, clearReview, toggleLine };
}
