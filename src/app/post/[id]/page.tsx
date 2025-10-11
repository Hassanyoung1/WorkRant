'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/types';
import PostCard from '@/components/PostCard';
import CommentSection from '@/components/CommentSection';
import apiService from '@/lib/api';

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await apiService.getPost(params.id as string);
        setPost(response);
      } catch (err) {
        setError('Failed to load post');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    // Refresh post data after voting
    try {
      const updatedPost = await apiService.getPost(postId);
      setPost(updatedPost);
    } catch (err) {
      console.error('Error refreshing post after vote:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-64 mb-6"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <p className="text-gray-600 mb-6">{error || 'This post may have been deleted or moved.'}</p>
          <Link 
            href="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link 
          href="/"
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to feed</span>
        </Link>
      </div>

      {/* Post */}
      <PostCard post={post} onVote={handleVote} />

      {/* Comments */}
      <CommentSection postId={post.id} />
    </div>
  );
}
