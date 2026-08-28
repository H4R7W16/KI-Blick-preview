export type FeedbackChannel = 'micro' | 'completion' | 'problem';
export type FeedbackArea = 'verstehen' | 'entdecken' | 'einordnen' | 'lernen';
export type FeedbackRole = 'lehrkraft' | 'lernende' | 'other' | null;

export interface FeedbackPayload {
  channel: FeedbackChannel;
  area: FeedbackArea;
  unit_id: string;
  answers: Record<string, string>;
  role?: FeedbackRole;
  freetext?: string;
}

export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';
