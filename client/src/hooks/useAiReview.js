import {useState,} from 'react';

function useAiReview() {
    const [suggestion,setSuggestion]=useState("");
    const [isStreaming,setIsStreaming]=useState(false);
    const [error,setError]=useState(null);
    const API_URL = 'http://192.168.29.55:5000';

    async function triggerReview(code, language) {
        setIsStreaming(true);
        setSuggestion("");
        setError(null);
        //dont use axios for streaming, use fetch instead
        console.log(localStorage.getItem('jwt'));
        try {
            const response = await fetch(`${API_URL}/api/ai/review`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language }),
            });
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            while (!done) {
                const { done: doneReading, value } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                const lines=chunkValue.split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data.trim() === '[DONE]') {
                            break;
                        }
                        setSuggestion(prev => prev + data);
                    }
                }
            }

        }catch (err) {
            console.error('Error in triggerReview:', err);
            setError(err.message || 'An error occurred while streaming the review.');
        }finally {
            setIsStreaming(false);
        }
    }

    function clearReview() {
        setSuggestion("");
        setError(null);
    }


    return {
        suggestion,
        isStreaming,
        error,
        triggerReview,
        clearReview,
    }
}

export default useAiReview;