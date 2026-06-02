// Hook de feedback: gestiona los mensajes de éxito y error del panel admin.
import { useState, useCallback } from 'react';

export interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const showSuccess = useCallback((message: string) => {
    setFeedback({ type: 'success', message });
    setTimeout(() => setFeedback(null), 3500);
  }, []);

  const showError = useCallback((message: string) => {
    setFeedback({ type: 'error', message });
    setTimeout(() => setFeedback(null), 6000);
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return { feedback, showSuccess, showError, clearFeedback };
};
