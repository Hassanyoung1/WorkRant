export * from './report';

// API Response Types
export interface User {
  id: string;
  pseudonym: string;
  created_at: string;
  is_anonymous_user: boolean;
}

export interface LoginResponse {
  user: User;
  disclaimer: string;
}

export interface RegisterResponse {
  user: User;
  disclaimer: string;
  recovery_token?: string;
  recovery_warning?: string;
}

export interface Post {
  id: string;
  title?: string;
  body: string; // Backend uses 'body' not 'content'
  content_with_disclaimer: string;
  media_urls: string[];
  tags: string[];
  post_type: 'experience' | 'advice' | 'question' | 'warning';
  company?: Company;
  author_pseudonym: string;
  created_at: string;
  updated_at: string;
  score: number;
  vote_score: number;
  vote_count: number;
  upvotes: number;
  downvotes: number;
  user_vote?: 'upvote' | 'downvote' | null;
  comment_count: number;
  is_flagged?: boolean;
}

export interface Comment {
  id: string;
  body: string;
  author_pseudonym: string;
  created_at: string;
  parent?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  description?: string;
  website?: string;
  created_at: string;
    average_rating: number;
  post_count: number;
}

export interface Comment {
  id: string;
  content: string;
  author_pseudonym: string;
  created_at: string;
  vote_score: number;
  user_vote?: 'upvote' | 'downvote' | null;
  parent?: string;
  replies?: Comment[];
}

// Form Types
export interface LoginFormData {
  pseudonym: string;
  password?: string;
  recovery_token?: string;
}

export interface RegisterFormData {
  pseudonym: string;
  password: string;
  password_confirm: string;
  account_type: 'persistent' | 'ephemeral';
}

export interface PostFormData {
  content: string;
  post_type?: 'experience' | 'advice' | 'question' | 'warning';
  company_name?: string;
  tags?: string[];
  image?: File;
}

export interface CompanyRatingData {
  fairness: number;
  work_life_balance: number;
  management_toxicity: number;
}

// API Error Types
export class APIError extends Error {
  code?: string;
  details?: Record<string, string[]>;

  constructor(message: string, code?: string, details?: Record<string, string[]>) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
  }
}

// Filter and Search Types
export interface PostFilters {
  post_type?: string;
  company?: string;
  sort_by?: 'newest' | 'oldest' | 'most_voted' | 'most_controversial';
}

export interface CompanyFilters {
  search?: string;
  industry?: string;
  sort_by?: 'newest' | 'highest_rated' | 'most_posts';
}

// Context Types
export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface PostContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  filters: PostFilters;
  setFilters: (filters: PostFilters) => void;
  createPost: (data: PostFormData) => Promise<void>;
  voteOnPost: (postId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  loadMorePosts: () => Promise<void>;
  hasMore: boolean;
}
