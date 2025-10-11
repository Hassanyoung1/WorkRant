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
  ? 'http://localhost:8000/api' // Development backend URL
  : process.env.NEXT_PUBLIC_API_URL || 'https://api.workrant.app/api'; // Production uses api subdomain with /api path

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
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Load tokens from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  // Debug method to check token status
  getTokenStatus() {
    return {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      accessTokenPreview: this.accessToken ? this.accessToken.substring(0, 20) + '...' : null
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {};

    // Don't set Content-Type for FormData - let browser handle it
    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Add Authorization header if we have an access token (but not for auth endpoints or public endpoints)
    const isAuthEndpoint = endpoint.startsWith('/auth/login') || 
                          endpoint.startsWith('/auth/register');
    const isPublicEndpoint = endpoint === '/posts/' ||
                            (endpoint.startsWith('/posts/?') && !endpoint.includes('user=current')) ||
                            endpoint.startsWith('/companies') ||
                            endpoint.startsWith('/posts/') && endpoint.match(/^\/posts\/[^\/]+\/$/) || // single post view
                            (endpoint.includes('/comments/') && options.method === 'GET') // viewing comments
    
    if (this.accessToken && !isAuthEndpoint && !isPublicEndpoint) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    // Merge with any additional headers (but skip empty headers object from FormData requests)
    if (options.headers && Object.keys(options.headers).length > 0) {
      Object.assign(headers, options.headers);
    }

    const config: RequestInit = {
      headers,
      credentials: 'include', // Still include for any cookies
      ...options,
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
        const errorData = await response.json().catch(() => ({}));
        console.error('[API] Request failed:', {
          endpoint,
          status: response.status,
          statusText: response.statusText
        });
        throw new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details
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
      throw new APIError('Network error occurred');
    }
  }

  private async handleTokenRefresh() {
    if (!this.refreshToken) {
      throw new APIError('No refresh token available', 401);
    }

    const response = await fetch(`${this.baseURL}/auth/refresh/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new APIError('Session expired. Please log in again.', 401);
    }

    // Get new tokens from response
    const data = await response.json();
    if (!data.access) {
      throw new APIError('Invalid refresh token response', 401);
    }

    // Store new access token (and refresh token if rotated)
    if (data.refresh) {
      this.setTokens(data.access, data.refresh);
    } else {
      this.accessToken = data.access;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access);
      }
    }

    // Return true to indicate successful refresh
    return true;
  }

  // Health check
  async healthCheck() {
    return this.makeRequest<{ status: string }>('/health/');
  }

  // Authentication
  async login(username: string, password: string): Promise<LoginResponse> {
    return this.makeRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ pseudonym: username, password }),
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
    if (!this.refreshToken) {
      throw new APIError('No refresh token available', 401);
    }
    
    return this.makeRequest('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: this.refreshToken }),
    });
  }

  async logout(): Promise<void> {
    // For JWT authentication, logout is handled client-side by clearing tokens
    this.clearTokens();
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
