'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { User } from '@/types';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    postCount: 0,
    commentCount: 0,
    votesReceived: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Fetch user statistics
    const fetchUserStats = async () => {
      try {
        // Fetch user's posts to calculate stats
        const userPostsData = await apiService.getUserPosts();
        
        // Calculate statistics from user's posts
        const postCount = userPostsData.count || 0;
        const votesReceived = userPostsData.results?.reduce((total, post) => total + (post.vote_score || 0), 0) || 0;
        
        // For comments, we'll need to implement a separate endpoint later
        // For now, using 0 as placeholder
        const commentCount = 0;

        setUserStats({
          postCount,
          commentCount,
          votesReceived,
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Keep default stats on error
        setUserStats({
          postCount: 0,
          commentCount: 0,
          votesReceived: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {user?.pseudonym?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">{user?.pseudonym || 'User'}</h2>
              <p className="text-gray-400">Anonymous Workplace Voice</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {userStats.postCount}
              </div>
              <div className="text-gray-400">Posts Shared</div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {userStats.commentCount}
              </div>
              <div className="text-gray-400">Comments Made</div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {userStats.votesReceived}
              </div>
              <div className="text-gray-400">Votes Received</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/create')}
              className="flex items-center justify-center px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <span className="mr-2">✏️</span>
              Share New Experience
            </button>
            
            <button
              onClick={() => router.push('/posts')}
              className="flex items-center justify-center px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
            >
              <span className="mr-2">📋</span>
              View All Posts
            </button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">Privacy & Anonymity</h3>
          <div className="text-gray-400 space-y-2">
            <p>• Your posts and comments are completely anonymous to other users</p>
            <p>• No personal information is ever shared publicly</p>
            <p>• Your identity is protected across all workplace discussions</p>
            <p>• Only you can see this profile page</p>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <span className="mr-2">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}