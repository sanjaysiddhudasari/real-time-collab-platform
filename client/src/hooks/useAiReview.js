import { useState } from 'react';
import { parseAISuggestions } from '../utils/reviewParser';

function useAiReview() {
    const [reviews, setReviews] = useState({});
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);
    const API_URL = 'http://192.168.29.94:5000';

    async function postAiComments({ roomId, fileId, suggestions }) {
        for (const item of suggestions) {
            try {
                await fetch(`${API_URL}/api/comments`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomId,
                        fileId,
                        line: item.line,
                        type: item.type,
                        explanation: item.explanation,
                        suggestion: item.suggestion,
                        isAI: true,
                    }),
                });
            } catch (err) {
                console.error('Error posting AI comment:', err);
            }
        }
    }

    async function triggerReview({ code, language, fileId, roomId }) {
        setIsStreaming(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/ai/review`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language }),
            });
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulated = "";
            while (!done) {
                const { done: doneReading, value } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                const lines = chunkValue.split('\n').filter(l => l.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data.trim() === '[DONE]') break;
                        accumulated += data;
                        setReviews(prev => ({ ...prev, [fileId]: (prev[fileId] || "") + data }));
                    }
                }
            }

            const suggestions = parseAISuggestions(accumulated);
            if (suggestions.length > 0) {
                await postAiComments({ roomId, fileId, suggestions });
            }
        } catch (err) {
            console.error('Error in triggerReview:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setIsStreaming(false);
        }
    }

    function clearReview(fileId) {
        setReviews(prev => {
            const next = { ...prev };
            delete next[fileId];
            return next;
        });
        setError(null);
    }

    return { reviews, isStreaming, error, triggerReview, clearReview };
}

export default useAiReview;
