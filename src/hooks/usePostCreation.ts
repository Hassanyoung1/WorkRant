import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { checkForPII } from '@/lib/validation';
import { apiService } from '@/lib/api';

interface UsePostCreationOptions {
  onSuccess?: (post: Post) => void;
  redirectOnSuccess?: boolean;
  redirectPath?: string;
}

export function usePostCreation(options: UsePostCreationOptions = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (data: {
    content: string;
    company_name?: string;
    tags?: string[];
    image?: File;
    post_type?: 'experience' | 'advice' | 'question' | 'warning';
  }) => {
    // Reset error
    setError(null);

    // Validation
    if (!data.content.trim()) {
      setError('Please enter your experience');
      return null;
    }

    if (data.content.length < 10) {
      setError('Please provide more details (at least 10 characters)');
      return null;
    }

    // Check for PII
    if (checkForPII(data.content)) {
      setError('Please remove personal information (email, phone, NIN) before submitting');
      return null;
    }

    setIsSubmitting(true);
    try {
      const newPost = await apiService.createPost({
        content: data.content,
        company_name: data.company_name,
        post_type: data.post_type || 'experience',
        tags: data.tags,
        image: data.image,
      });

      // Call success callback
      options.onSuccess?.(newPost);

      // Redirect if specified
      if (options.redirectOnSuccess) {
        router.push(options.redirectPath || '/posts?refresh=true');
        router.refresh();
      }

      return newPost;
    } catch (err) {
      // Handle 401 errors (session expired) by redirecting to login
      if (err instanceof Error && err.message.includes('Session expired')) {
        router.push('/login?message=Session expired. Please log in again.');
        return null;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post. Please try again.';
      setError(errorMessage);
      console.error('Error creating post:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createPost,
    isSubmitting,
    error,
    setError,
  };
}
