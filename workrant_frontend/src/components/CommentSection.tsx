'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types';
import apiService from '@/lib/api';

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await apiService.getComments(postId);
        setComments(response);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId]);



  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await apiService.createComment(postId, { body: newComment.trim() });
      setNewComment('');
      // Refresh comments
      const response = await apiService.getComments(postId);
      setComments(response);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!user || !replyText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await apiService.createComment(postId, { 
        body: replyText.trim(),
        parent: parentId 
      });
      setReplyText('');
      setReplyTo(null);
      // Refresh comments
      const response = await apiService.getComments(postId);
      setComments(response);
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Organize comments into threads
  const topLevelComments = comments.filter(comment => !comment.parent);
  const getReplies = (parentId: string) => comments.filter(comment => comment.parent === parentId);

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white mb-6">
        Comments ({comments.length})
      </h3>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              rows={3}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-400">
                {1000 - newComment.length} characters remaining
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 bg-gradient-to-r from-gray-900 to-orange-600 text-white rounded-lg hover:from-black hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-800 border border-gray-700 rounded-lg text-center">
          <p className="text-gray-300">
            <a href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in
            </a>{' '}
            to join the conversation
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {topLevelComments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          topLevelComments.map((comment) => (
            <div key={comment.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              {/* Comment header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-900 rounded-full flex items-center justify-center">
                    <span className="text-orange-400 font-medium text-sm">
                      {comment.author_pseudonym.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-white">{comment.author_pseudonym}</span>
                    <span className="text-sm text-gray-400 ml-2">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                </div>
                
                {user && replyTo !== comment.id && (
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="text-sm text-gray-400 hover:text-orange-500 font-medium transition-colors px-3 py-1 rounded hover:bg-gray-800"
                  >
                    Reply
                  </button>
                )}
              </div>

              {/* Comment body */}
              <div className="mb-3">
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>

              {/* Reply form */}
              {replyTo === comment.id && (
                <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    rows={2}
                    maxLength={1000}
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-400">
                      {1000 - replyText.length} characters remaining
                    </span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyText('');
                        }}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!replyText.trim() || submitting}
                        className="px-3 py-1 text-sm bg-gradient-to-r from-gray-900 to-orange-600 text-white rounded hover:from-black hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {submitting ? 'Posting...' : 'Reply'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Replies */}
              {getReplies(comment.id).length > 0 && (
                <div className="mt-4 ml-8 space-y-4">
                  {getReplies(comment.id).map((reply) => (
                    <div key={reply.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-6 h-6 bg-orange-900 rounded-full flex items-center justify-center">
                          <span className="text-orange-400 font-medium text-xs">
                            {reply.author_pseudonym.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-white text-sm">{reply.author_pseudonym}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {reply.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-400 italic text-center">
          Comments are anonymous and unverified. Please be respectful and constructive.
        </p>
      </div>
    </div>
  );
}
