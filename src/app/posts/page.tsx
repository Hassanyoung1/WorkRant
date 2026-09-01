'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import PostSkeleton from '@/components/PostSkeleton';
import Disclaimer from '@/components/Disclaimer';
import apiService, { APIError } from '@/lib/api';

import { ErrorBoundary } from '@/components/ErrorBoundary';

const PostsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const companyId = searchParams.get('company');
  
  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR(
    companyId ? `posts-company-${companyId}` : 'posts',
    () => apiService.getPosts(companyId ? { company: companyId } : {}).then(res => res.results),
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
        window.history.replaceState({}, '', '/posts');
      }, 3000);
    }
  }, [searchParams, mutate]);

  const posts = data;

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await apiService.voteOnPost(postId, voteType);
      await mutate(); // This will revalidate the data with SWR
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {[...Array(3)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    const isAuthError = error instanceof APIError && error.message.includes('Authentication required');
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className={`border rounded-2xl p-6 text-center bg-white shadow-sm ${
              isAuthError 
                ? 'bg-orange-900/20 border-orange-600' 
                : 'bg-red-900/20 border-red-600'
            }`}>
              <h2 className={`text-lg font-semibold mb-2 ${
                isAuthError ? 'text-orange-200' : 'text-red-200'
              }`}>
                {isAuthError ? 'Authentication Required' : 'Error Loading Posts'}
              </h2>
              <p className={isAuthError ? 'text-orange-300' : 'text-red-300'}>
                {error instanceof APIError ? error.message : 'An error occurred while loading posts'}
              </p>
              <div className="mt-4 space-x-3">
                {isAuthError ? (
                  <a 
                    href="/login" 
                    className="px-4 py-2 bg-gradient-to-r from-gray-900 to-orange-600 text-white rounded-lg hover:from-black hover:to-orange-700 transition-colors shadow-md"
                  >
                    Log In
                  </a>
                ) : (
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
      <div className="min-h-screen bg-stone-50">
        <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success message after creating post */}
          {showSuccess && (
            <div className="mb-6 bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm animate-fade-in">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-green-200">Post shared successfully!</h3>
                  <p className="text-sm text-green-300">Your workplace experience is now visible to the community.</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-2">
              {companyId ? 'Company Posts' : 'All Posts'}
            </h1>
            <p className="text-stone-600">
              {companyId 
                ? 'Browse workplace experiences for this company.'
                : 'Browse all workplace experiences and discussions from the community.'
              }
            </p>
            {companyId && (
              <div className="mt-4">
                <Link
                  href="/posts"
                  className="inline-flex items-center text-sm font-medium text-orange-700 hover:text-orange-900 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  View all posts
                </Link>
              </div>
            )}
          </div>

      {(!Array.isArray(posts) || posts.length === 0) ? (
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-12 text-center">
              <h2 className="text-xl font-semibold text-stone-900 mb-2">No Posts Yet</h2>
              <p className="text-stone-600 mb-6">
                Be the first to share a workplace experience!
              </p>
              <a 
                href="/create" 
                className="btn btn-primary"
              >
                Create First Post
              </a>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Disclaimer variant="feed" />
              </div>
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onVote={handleVote}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      </div>
    </ErrorBoundary>
  );
};

const PostsPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50">
        <Header />
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-4xl mx-auto">
            <PostSkeleton count={3} />
          </div>
        </main>
      </div>
    }>
      <PostsContent />
    </Suspense>
  );
};

export default PostsPage;