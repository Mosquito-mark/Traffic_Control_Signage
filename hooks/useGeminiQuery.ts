
import { useState, useCallback } from 'react';
import { queryGeminiApi, GeminiPayload } from '../services/apiService';

interface GeminiQueryState {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useGeminiQuery = () => {
  const [state, setState] = useState<GeminiQueryState>({
    summary: null,
    isLoading: false,
    error: null,
  });

  const generateSummary = useCallback(async (payload: GeminiPayload) => {
    setState({ summary: null, isLoading: true, error: null });
    try {
      const result = await queryGeminiApi(payload);
      setState({ summary: result, isLoading: false, error: null });
    } catch (err) {
      // SECURITY FIX: Do not use `err.message`. Return a generic, safe error message to the user.
      // This prevents leaking any potentially sensitive details from the backend or network layer.
      const safeErrorMessage = 'An error occurred while contacting the AI service. Please try again later.';
      console.error('Gemini Query Error:', err); // Log the real error for developers.
      setState({ summary: null, isLoading: false, error: safeErrorMessage });
    }
  }, []);

  return { ...state, generateSummary };
};
