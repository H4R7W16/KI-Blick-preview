import type { FeedbackPayload } from '../types/feedback.types';

const API_URL = import.meta.env.VITE_FEEDBACK_API_URL as string | undefined;

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  if (!API_URL) {
    throw new Error('Feedback API URL is not configured');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  if (!response.ok) {
    throw new Error(`Feedback API error: ${response.status}`);
  }
}
