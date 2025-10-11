
import { APIError } from '@/lib/api';

export const swrConfig = {
  fetcher: async (url: string) => {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code,
        errorData.details
      );
    }
    
    return response.json();
  },
  onError: (error: APIError) => {
    // Handle 401 errors globally
    if (error?.status === 401) {
      window.location.href = '/login';
    }
  }
};
