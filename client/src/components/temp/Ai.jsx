import AISuggestionPanel from "../room/AiSuggesstionPanel";
import useAiReview from "../../hooks/useAiReview";

export default function Test() {
  const {
    suggestion,
    isStreaming,
    error,
    triggerReview,
  } = useAiReview();

  const code = `function add(a,b){
return a+b;
}`;

  return (
    <div className="flex h-screen">
      <div className="flex-1"></div>

      <AISuggestionPanel
        suggestion={suggestion}
        isStreaming={isStreaming}
        error={error}
        onReview={triggerReview}
        code={code}
        language="javascript"
      />
    </div>
  );
}