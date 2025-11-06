'use client';

import { useState, useEffect, useCallback } from 'react';
import { Post, PostFilters } from '@/types';
import apiService, { APIError } from '@/lib/api';
import PostCard from './PostCard';
import PostForm from './PostForm';

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PostFilters>({});
  const [showPostForm, setShowPostForm] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (pageNum = 1, resetPosts = false) => {
    try {
      setLoading(true);
      const response = await apiService.getPosts(filters, pageNum);
      const results = Array.isArray(response.results) ? response.results : [];
      
      if (resetPosts) {
        setPosts(results);
      } else {
        setPosts(prev => [...(prev || []), ...results]);
      }
      
      setHasMore(!!response.next);
      setPage(pageNum);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof APIError && err.status === 401) {
        setError('Authentication required. Please log in to access posts.');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPosts(1, true);
  }, [loadPosts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...(prev || [])]);
    setShowPostForm(false);
  };

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await apiService.voteOnPost(postId, voteType);
      // Refresh the specific post or update local state
      setPosts(prev => {
        if (!prev || !Array.isArray(prev)) return [];
        return prev.map(post => {
          if (post.id === postId) {
          const currentUserVote = post.user_vote;
          let upvoteChange = 0;
          let downvoteChange = 0;
          
          if (voteType === 'upvote') {
            if (currentUserVote === 'upvote') {
              upvoteChange = -1;
            } else if (currentUserVote === 'downvote') {
              upvoteChange = 1;
              downvoteChange = -1;
            } else {
              upvoteChange = 1;
            }
          } else {
            if (currentUserVote === 'downvote') {
              downvoteChange = -1;
            } else if (currentUserVote === 'upvote') {
              downvoteChange = 1;
              upvoteChange = -1;
            } else {
              downvoteChange = 1;
            }
          }
          
            return {
              ...post,
              vote_score: (Number(post.vote_score) || 0) + upvoteChange + downvoteChange,
              user_vote: currentUserVote === voteType ? null : voteType,
            };
          }
          return post;
        });
      });
    } catch (err) {
      console.error('Voting failed:', err);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPosts(page + 1, false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded w-5/6"></div>
              <div className="h-3 bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Creation - Dark Theme */}
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-6">
        {showPostForm ? (
          <PostForm 
            onPostCreated={handlePostCreated}
            onCancel={() => setShowPostForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowPostForm(true)}
            className="w-full text-left p-5 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all border-2 border-dashed border-gray-700 hover:border-orange-500/50 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-gray-400 group-hover:text-gray-300 font-medium">Share your workplace experience...</span>
            </div>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filters.post_type || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, post_type: e.target.value || undefined }))}
            className="px-3 py-2 bg-gray-800 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">All Categories</option>
            <option value="experience">Experience</option>
            <option value="question">Question</option>
            <option value="advice">Advice</option>
            <option value="warning">Warning</option>
            <option value="review">Review</option>
          </select>

          <input
            type="text"
            placeholder="Search companies..."
            value={filters.company || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value || undefined }))}
            className="px-3 py-2 bg-gray-800 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
          />

          <select
            value={filters.sort_by || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value as PostFilters['sort_by'] }))}
            className="px-3 py-2 bg-gray-800 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Latest</option>
            <option value="upvotes">Most Upvotes</option>
            <option value="controversial">Most Controversial</option>
          </select>

          {(filters.post_type || filters.company || filters.sort_by) && (
            <button
              onClick={() => setFilters({})}
              className="px-3 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-md hover:bg-gray-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className={`border rounded-lg p-4 ${
          error.includes('Authentication required')
            ? 'bg-blue-50 border-blue-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={error.includes('Authentication required') ? 'text-blue-800' : 'text-red-800'}>
            {error}
          </p>
          {error.includes('Authentication required') ? (
            <a
              href="/login"
              className="mt-2 inline-block text-blue-600 hover:text-blue-800 underline"
            >
              Log In
            </a>
          ) : (
            <button
              onClick={() => loadPosts(1, true)}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onVote={handleVote}
            />
          ))
        ) : (
          !loading && !error && (
            <div className="text-center py-8 text-gray-500">
              No posts available yet. Be the first to share your experience!
            </div>
          )
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && posts.length > 0 && (
        <div className="flex justify-center py-4">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Load More Posts
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No posts found.</p>
          <button
            onClick={() => setShowPostForm(true)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create the First Post
          </button>
        </div>
      )}
    </div>
  );
}
