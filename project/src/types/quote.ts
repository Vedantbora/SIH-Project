export interface Quote {
  id: number;
  content: string;
  author: string;
  date: string;
  likes: number;
}

export interface UserQuote {
  id: number;
  user_id: number;
  content: string;
  author: string;
  is_approved: boolean;
  likes: number;
  created_at: string;
}

export interface QuoteSubmission {
  content: string;
  author?: string;
}
