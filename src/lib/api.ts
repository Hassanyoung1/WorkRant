import { 
  LoginFormData, 
  RegisterFormData, 
  LoginResponse, 
  RegisterResponse,
  Post,
  PostFormData,
  Comment,
  Company,
  CompanyFilters,
  PostFilters,
  ReportData,
  User
} from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api'
  : process.env.NEXT_PUBLIC_API_URL || 'https://workrant.onrender.com/api';

export class APIError extends Error {
  code?: string;
  details?: Record<string, string[]>;
  status?: number;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class APIService {
  private baseURL: string;
  private refreshInProgress: boolean = false;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  clearTokens() {
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {};

    const csrfToken = typeof document !== 'undefined'
      ? document.cookie.split('; ').find(cookie => cookie.startsWith('csrftoken='))?.split('=')[1]
      : undefined;
    if (csrfToken && options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())) {
      headers['X-CSRFToken'] = decodeURIComponent(csrfToken);
    }

    // Don't set Content-Type for FormData - let browser handle it
    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Merge with any additional headers (but skip empty headers object from FormData requests)
    if (options.headers && Object.keys(options.headers).length > 0) {
      Object.assign(headers, options.headers);
    }

    const config: RequestInit = {
      ...options,
      headers, // Put headers AFTER options spread so they override
      credentials: 'include', // Still include for any cookies
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle 401 errors - only try to refresh for authenticated endpoints
        // Define truly public endpoints that don't require authentication
        const isPublicEndpoint = endpoint === '/posts/' ||
                                  (endpoint.startsWith('/posts/?') && !endpoint.includes('user=current')) ||
                                  endpoint.startsWith('/companies') ||
                                  endpoint.startsWith('/auth/login') ||
                                  endpoint.startsWith('/auth/register') ||
                                  (endpoint.includes('/comments/') && options.method === 'GET'); // viewing comments
        
        if (response.status === 401 && retry && !this.refreshInProgress && !isPublicEndpoint) {
          try {
            this.refreshInProgress = true;
            const refreshed = await this.handleTokenRefresh();
            this.refreshInProgress = false;
            if (refreshed) {
              // Only retry the request if token refresh was successful
              return this.makeRequest<T>(endpoint, options, false);
            }
          } catch {
            this.refreshInProgress = false;
            // Emit logout event for the auth context to handle
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:logout'));
            }
            throw new APIError('Session expired. Please log in again.', 401);
          }
        }
        const responseText = await response.text();
        let errorData: Record<string, unknown> = {};
        try {
          const parsed = responseText ? JSON.parse(responseText) : {};
          if (parsed && typeof parsed === 'object') {
            errorData = parsed as Record<string, unknown>;
          }
        } catch {
          // Keep the raw response for non-JSON server errors.
        }
        const validationMessages: string[] = [];

        const collectMessages = (value: unknown) => {
          if (Array.isArray(value)) {
            value.forEach(item => collectMessages(item));
            return;
          }

          if (typeof value === 'string') {
            if (value.trim()) validationMessages.push(value.trim());
            return;
          }

          if (value && typeof value === 'object') {
            Object.values(value as Record<string, unknown>).forEach(item => collectMessages(item));
          }
        };

        if (errorData && typeof errorData === 'object') {
          collectMessages(errorData);
        }

        const readableMessage =
          validationMessages.length > 0
            ? validationMessages.join(' ')
            : errorData?.message || errorData?.error || `HTTP ${response.status}: ${response.statusText}`;

        console.error('[API] Request failed:', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          responseBody: errorData,
          responseText,
        });

        throw new APIError(
          String(readableMessage),
          response.status,
          typeof errorData.code === 'string' ? errorData.code : undefined,
          errorData.details && typeof errorData.details === 'object'
            ? errorData.details as Record<string, string[]>
            : undefined
        );
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response.text() as unknown as T;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      // Log the actual error for debugging
      console.error('[API] Network error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      throw new APIError(`Network error: ${errorMessage}`);
    }
  }

  private async handleTokenRefresh() {
    const response = await fetch(`${this.baseURL}/auth/refresh/`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      this.clearTokens();
      throw new APIError('Session expired. Please log in again.', 401);
    }

    return true;
  }

  // Health check
  async healthCheck() {
    return this.makeRequest<{ status: string }>('/health/');
  }

  // Authentication
  async login(username: string, password?: string, recoveryToken?: string): Promise<LoginResponse> {
    const payload: Record<string, string> = { pseudonym: username };

    if (password) {
      payload.password = password;
    }

    if (recoveryToken) {
      payload.recovery_token = recoveryToken;
    }

    return this.makeRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async register(username: string, password: string, confirmPassword: string, accountType: 'persistent' | 'ephemeral' = 'persistent'): Promise<RegisterResponse> {
    const isPersistent = accountType === 'persistent';
    
    return this.makeRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ 
        pseudonym: username, 
        password: isPersistent ? password : undefined,
        persistent: isPersistent
      }),
    });
  }

  async refreshTokens(): Promise<LoginResponse> {
    return this.makeRequest('/auth/refresh/', {
      method: 'POST',
    });
  }

  async logout(): Promise<void> {
    const csrfToken = typeof document !== 'undefined'
      ? document.cookie.split('; ').find(cookie => cookie.startsWith('csrftoken='))?.split('=')[1]
      : undefined;

    await fetch(`${this.baseURL}/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: csrfToken ? { 'X-CSRFToken': decodeURIComponent(csrfToken) } : undefined,
    });
  }

  // User Profile
  async getUserProfile(): Promise<User> {
    return this.makeRequest('/auth/profile/');
  }

  async getUserPosts(page = 1): Promise<{
    results: Post[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    // Filter posts by current authenticated user
    return this.makeRequest(`/posts/?user=current&page=${page}`);
  }  // Posts
  async getPosts(filters: PostFilters = {}, page = 1): Promise<{
    results: Post[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ),
    });

    return this.makeRequest(`/posts/?${params}`);
  }

  async getPost(id: string): Promise<Post> {
    return this.makeRequest(`/posts/${id}/`);
  }

  async createPost(data: PostFormData): Promise<Post> {
    // If there's an image, use FormData, otherwise use JSON
    if (data.image) {
      const formData = new FormData();
      formData.append('content', data.content);
      if (data.post_type) formData.append('post_type', data.post_type);
      if (data.company_name) formData.append('company_name', data.company_name);
      if (data.tags && data.tags.length > 0) {
        // Send tags as JSON string for proper array handling
        formData.append('tags', JSON.stringify(data.tags));
      }
      formData.append('image', data.image);
      
      return this.makeRequest('/posts/create/', {
        method: 'POST',
        body: formData,
      });
    }
    
    // For JSON, remove image field if it's undefined
    const jsonData: Partial<PostFormData> = {
      content: data.content,
      post_type: data.post_type,
    };
    
    if (data.company_name) jsonData.company_name = data.company_name;
    if (data.tags && data.tags.length > 0) jsonData.tags = data.tags;
    
    return this.makeRequest('/posts/create/', {
      method: 'POST',
      body: JSON.stringify(jsonData),
    });
  }

  async voteOnPost(postId: string, voteType: 'upvote' | 'downvote'): Promise<void> {
    const vote = voteType === 'upvote' ? 1 : -1;
    await this.makeRequest(`/posts/${postId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    });
  }

  async deletePost(postId: string): Promise<void> {
    await this.makeRequest(`/posts/${postId}/`, {
      method: 'DELETE',
    });
  }

  async reportPost(postId: string, data: ReportData): Promise<void> {
    await this.makeRequest(`/posts/${postId}/report/`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    return this.makeRequest(`/posts/${postId}/comments/`);
  }

  async createComment(postId: string, data: { body: string; parent?: string }): Promise<Comment> {
    return this.makeRequest(`/posts/${postId}/comments/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Companies
  async getCompanies(filters: CompanyFilters = {}): Promise<{
    results: Company[];
    count: number;
  }> {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      )
    );

    return this.makeRequest(`/companies/?${params}`);
  }

  async searchCompanies(query: string) {
    const response = await this.makeRequest<{ query: string; results: Company[]; count: number }>(`/companies/search/?q=${encodeURIComponent(query)}`);
    return response.results; // Extract just the results array
  }

  async getCompany(slug: string): Promise<Company> {
    return this.makeRequest(`/companies/${slug}/`);
  }

  async getCompanyPosts(slug: string, page = 1): Promise<{
    results: Post[];
    count: number;
  }> {
    return this.makeRequest(`/companies/${slug}/posts/?page=${page}`);
  }

  // Moderation
  async reportContent(contentType: 'post' | 'comment', contentId: string, reason: string) {
    return this.makeRequest('/moderation/report/', {
      method: 'POST',
      body: JSON.stringify({
        content_type: contentType,
        content_id: contentId,
        reason,
      }),
    });
  }
}

export const apiService = new APIService();
export default apiService;
