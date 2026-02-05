
import { Deployment } from '../types';

interface InvoiceDetails {
  lineItems: { totalCost: number }[];
  grandTotal: number;
}

// Define the payload structures for our backend proxy
export type GeminiPayload = 
  | { type: 'invoice'; deployment: Deployment; invoiceDetails: InvoiceDetails }
  | { type: 'chat'; question: string };

export const queryGeminiApi = async (payload: GeminiPayload): Promise<string> => {
  try {
    // In a real app, this URL would point to our deployed serverless function.
    // For this example, we assume it's at `/api/gemini`.
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error querying Gemini API proxy:', error);
    throw new Error('Failed to communicate with the AI service.');
  }
};
