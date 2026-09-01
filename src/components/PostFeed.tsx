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
          <div key={i} className="rounded-[24px] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-4 w-1/4 rounded-full bg-stone-200" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-stone-200" />
              <div className="h-3 w-5/6 rounded-full bg-stone-200" />
              <div className="h-3 w-4/6 rounded-full bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_18px_48px_rgba(28,25,23,0.04)] sm:p-6">
        {showPostForm ? (
          <PostForm onPostCreated={handlePostCreated} onCancel={() => setShowPostForm(false)} />
        ) : (
          <button
            onClick={() => setShowPostForm(true)}
            className="group flex w-full items-center gap-4 rounded-[20px] border border-dashed border-stone-300 bg-stone-50 p-4 text-left transition hover:border-stone-400 hover:bg-stone-100"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-stone-600 group-hover:text-stone-900">Share your workplace experience...</span>
          </button>
        )}
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-[0_18px_48px_rgba(28,25,23,0.04)]">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.post_type || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, post_type: e.target.value || undefined }))}
            className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 outline-none transition focus:border-stone-400 focus:bg-white"
          >
            <option value="">All categories</option>
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
            className="min-w-[180px] flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
          />

          <select
            value={filters.sort_by || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value as PostFilters['sort_by'] }))}
            className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 outline-none transition focus:border-stone-400 focus:bg-white"
          >
            <option value="">Latest</option>
            <option value="upvotes">Most upvotes</option>
            <option value="controversial">Most controversial</option>
          </select>

          {(filters.post_type || filters.company || filters.sort_by) && (
            <button onClick={() => setFilters({})} className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-50">
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={`rounded-[24px] border p-4 ${error.includes('Authentication required') ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          <p>{error}</p>
          {error.includes('Authentication required') ? (
            <a href="/login" className="mt-2 inline-block font-medium underline">Log in</a>
          ) : (
            <button onClick={() => loadPosts(1, true)} className="mt-2 font-medium underline">Try again</button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} onVote={handleVote} />)
        ) : (
          !loading && !error && (
            <div className="rounded-[28px] border border-stone-200 bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-medium text-stone-800">No posts available yet.</p>
              <p className="mt-2 text-sm text-stone-600">Be the first to share a workplace experience.</p>
            </div>
          )
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />
        </div>
      )}

      {!loading && hasMore && posts.length > 0 && (
        <div className="flex justify-center py-2">
          <button onClick={handleLoadMore} className="btn btn-secondary">
            Load more posts
          </button>
        </div>
      )}
    </div>
  );
}
