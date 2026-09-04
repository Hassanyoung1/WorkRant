'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import PostSkeleton from '@/components/PostSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import apiService, { APIError } from '@/lib/api';

import { ErrorBoundary } from '@/components/ErrorBoundary';

const MyPostsContent: React.FC = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR(
    user ? 'my-posts' : null,
    () => apiService.getUserPosts().then(res => res.results),
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
    }
  );

  // Check if redirected from post creation
  useEffect(() => {
    if (searchParams.get('refresh') === 'true') {
      setShowSuccess(true);
      mutate(); // Force revalidate SWR cache
      
      // Remove query param and hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        window.history.replaceState({}, '', '/my-posts');
      }, 3000);
    }
  }, [searchParams, mutate]);

  const posts = data;

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await apiService.voteOnPost(postId, voteType);
      mutate(); // Refresh data after voting
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f3e9df]">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-[#fffaf7] border border-[#cdb9aa] p-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="display-title text-3xl text-[#241c19] mb-2">Your record is waiting.</h2>
              <p className="text-[#584944] mb-6">Log in to view the workplace experiences you have shared.</p>
              <Link 
                href="/auth/login"
                className="btn btn-primary"
              >
                Log In
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3e9df]">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">My Posts</h1>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    const isUnauthorized = error instanceof APIError && error.status === 401;
    
    return (
      <div className="min-h-screen bg-[#f3e9df]">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-[#fffaf7] border border-[#cdb9aa] p-8">
              <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="display-title text-3xl text-[#241c19] mb-2">
                {isUnauthorized ? 'Session Expired' : 'Unable to Load Posts'}
              </h2>
              <p className="text-[#584944] mb-6">
                {isUnauthorized 
                  ? 'Your session has expired. Please log in again.'
                  : 'There was a problem loading your posts. Please try again.'
                }
              </p>
              <div className="flex justify-center space-x-4">
                {isUnauthorized ? (
                  <Link 
                    href="/auth/login"
                    className="btn btn-primary"
                  >
                    Log In
                  </Link>
                ) : (
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn border border-[#9d4134] text-[#9d4134] hover:bg-[#f0d9d1]"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#f3e9df]">
        <Header />
      
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Success message after creating post */}
            {showSuccess && (
              <div className="mb-6 bg-gray-900 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-green-400">Post shared successfully!</h3>
                    <p className="text-sm text-green-200">Your workplace experience is now visible to the community.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="eyebrow text-[#9d4134]">Your contributions</p>
                  <h1 className="display-title mt-3 text-5xl text-[#241c19]">The things you decided to say out loud.</h1>
                  <p className="mt-4 text-lg leading-8 text-[#584944]">
                    Your anonymous workplace record, in one place.
                  </p>
                </div>
                <Link
                  href="/create"
                    className="btn btn-primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Post
                </Link>
              </div>

              {posts && posts.length > 0 && (
                <div className="border-l-2 border-[#9d4134] bg-[#e2d2c4] p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-400">Your Contributions</h3>
                      <p className="text-sm text-blue-200">
                        You&apos;ve shared {posts.length} workplace experience{posts.length === 1 ? '' : 's'}. Thank you for contributing to the community!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Posts Content */}
            <div className="space-y-6">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onVote={handleVote}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto border border-[#cdb9aa] bg-[#fffaf7] p-10">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="display-title text-3xl text-[#241c19] mb-2">No posts yet.</h3>
                    <p className="text-[#584944] mb-6">
                      You haven&apos;t shared any workplace experiences yet. Start by creating your first post!
                    </p>
                    <Link
                      href="/create"
                      className="btn btn-primary"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Share Your Experience
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

const MyPostsPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f3e9df]">
        <Header />
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-4xl mx-auto">
            <PostSkeleton count={3} />
          </div>
        </main>
      </div>
    }>
      <MyPostsContent />
    </Suspense>
  );
};

export default MyPostsPage;