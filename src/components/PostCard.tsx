'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import apiService from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Disclaimer from './Disclaimer';
import ReportModal from './ReportModal';

interface PostCardProps {
  post: Post;
  onVote?: (postId: string, voteType: 'upvote' | 'downvote') => void;
}

export default function PostCard({ post, onVote }: PostCardProps) {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [currentVote, setCurrentVote] = useState(post.user_vote);
  const [upvotes, setUpvotes] = useState(Number(post.upvotes) || 0);
  const [downvotes, setDownvotes] = useState(Number(post.downvotes) || 0);
  const [showReportModal, setShowReportModal] = useState(false);
  const mediaUrls = Array.isArray(post.media_urls) ? post.media_urls : [];
  const authorInitial = (post.author_pseudonym || 'A').charAt(0).toUpperCase();

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user || isVoting) return;

    // Optimistic UI update for separate vote counts
    const wasCurrentVote = currentVote === voteType;
    const newVote = wasCurrentVote ? null : voteType;
    
    // Calculate changes to individual vote counts
    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (voteType === 'upvote') {
      if (wasCurrentVote) {
        upvoteDelta = -1; // Remove upvote
      } else {
        upvoteDelta = 1; // Add upvote
        if (currentVote === 'downvote') {
          downvoteDelta = -1; // Remove previous downvote
        }
      }
    } else { // downvote
      if (wasCurrentVote) {
        downvoteDelta = -1; // Remove downvote
      } else {
        downvoteDelta = 1; // Add downvote
        if (currentVote === 'upvote') {
          upvoteDelta = -1; // Remove previous upvote
        }
      }
    }

    // Update state
    setCurrentVote(newVote);
    setUpvotes(prev => Math.max(0, (Number(prev) || 0) + upvoteDelta));
    setDownvotes(prev => Math.max(0, (Number(prev) || 0) + downvoteDelta));

    try {
      setIsVoting(true);
      await apiService.voteOnPost(post.id, voteType);
      onVote?.(post.id, voteType);
    } catch (error) {
      // Revert optimistic update on error
      setCurrentVote(post.user_vote);
      setUpvotes(Number(post.upvotes) || 0);
      setDownvotes(Number(post.downvotes) || 0);
      console.error('Vote failed:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'experience': return 'bg-orange-100 text-orange-800';
      case 'advice': return 'bg-green-100 text-green-800';
      case 'question': return 'bg-gray-100 text-gray-800';
      case 'warning': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <article className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Post header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center">
            <span className="text-orange-300 font-medium">
              {authorInitial}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-stone-900">{post.author_pseudonym}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.post_type)}`}>
                {post.post_type}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-stone-500">
              <span>{formatDate(post.created_at)}</span>
              {post.company && (
                <>
                  <span>•</span>
                  <Link 
                    href={`/companies/${post.company.slug}`}
                    className="text-orange-700 hover:text-orange-900 font-medium"
                  >
                    {post.company.name}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="text-gray-500 hover:text-gray-300 p-1"
          title="Report this post"
          aria-label="Report post"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {showReportModal && (
          <ReportModal 
            postId={post.id} 
            onClose={() => setShowReportModal(false)} 
          />
        )}
      </div>

      {/* Post content */}
      <div className="mb-4">
        {/* Body */}
        <p className="text-stone-700 mb-4 whitespace-pre-wrap">{post.body}</p>
        
        {/* Images/Media */}
        {mediaUrls.length > 0 && (
          <div className="mt-4 space-y-3">
            {mediaUrls.map((url, index) => {
              const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              const isPDF = url.endsWith('.pdf');
              const isDoc = url.match(/\.(doc|docx|xls|xlsx)$/i);
              
              if (isImage) {
                return (
                  <div key={index} className="rounded-xl overflow-hidden border border-gray-800 bg-gray-800">
                    <div className="relative w-full" style={{ minHeight: '200px' }}>
                      <Image
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        width={800}
                        height={600}
                        className="w-full h-auto max-h-96 object-contain"
                        style={{ width: '100%', height: 'auto' }}
                        unoptimized
                      />
                    </div>
                  </div>
                );
              } else if (isPDF || isDoc) {
                return (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-orange-500 transition-all group"
                  >
                    <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600/30">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {url.split('/').pop()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isPDF ? 'PDF Document' : 'Office Document'} • Click to open
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      {/* Post footer */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        {/* Voting */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleVote('upvote')}
            disabled={!user || isVoting}
            className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
              currentVote === 'upvote'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
            title={user ? 'Upvote' : 'Sign in to vote'}
            aria-label={user ? 'Upvote post' : 'Sign in to vote'}
            aria-pressed={currentVote === 'upvote'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{upvotes}</span>
          </button>

          <button
            onClick={() => handleVote('downvote')}
            disabled={!user || isVoting}
            className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
              currentVote === 'downvote'
                ? 'bg-red-100 text-red-600'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
            } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
            title={user ? 'Downvote' : 'Sign in to vote'}
            aria-label={user ? 'Downvote post' : 'Sign in to vote'}
            aria-pressed={currentVote === 'downvote'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{downvotes}</span>
          </button>
        </div>

        {/* Comments link */}
        <Link
          href={`/post/${post.id}`}
          className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm">{post.comment_count} comments</span>
        </Link>
      </div>

      {/* Disclaimer for each post as per rules */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Disclaimer />
      </div>
    </article>
  );
}
