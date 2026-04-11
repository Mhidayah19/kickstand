export type FeedbackType = 'bug' | 'feature' | 'feedback';

let pendingFeedbackType: FeedbackType | null = null;

export function setPendingFeedbackType(type: FeedbackType | null): void {
  pendingFeedbackType = type;
}

export function getPendingFeedbackType(): FeedbackType | null {
  return pendingFeedbackType;
}
