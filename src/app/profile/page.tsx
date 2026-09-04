'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import Header from '@/components/Header';

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
      <div className="min-h-screen bg-[#f3e9df] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f3e9df] text-[#241c19]">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Card */}
        <div className="border-b-2 border-[#241c19] pb-8 mb-8">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-[#9d4134] flex items-center justify-center">
              <span className="font-serif text-2xl font-bold text-[#fffaf7]">
                {user?.pseudonym?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="display-title text-4xl text-[#241c19]">{user?.pseudonym || 'User'}</h1>
              <p className="mt-2 text-[#9d4134]">Anonymous workplace voice</p>
              <p className="mt-1 text-sm text-[#6e5b52]">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#cdb9aa] mb-8">
          <div className="bg-[#fffaf7] p-6">
            <div className="text-center">
              <div className="display-title text-4xl text-[#9d4134] mb-2">
                {userStats.postCount}
              </div>
              <div className="eyebrow text-[#6e5b52]">Posts shared</div>
            </div>
          </div>
          
          <div className="bg-[#fffaf7] p-6">
            <div className="text-center">
              <div className="display-title text-4xl text-[#9d4134] mb-2">
                {userStats.commentCount}
              </div>
              <div className="eyebrow text-[#6e5b52]">Comments made</div>
            </div>
          </div>
          
          <div className="bg-[#fffaf7] p-6">
            <div className="text-center">
              <div className="display-title text-4xl text-[#9d4134] mb-2">
                {userStats.votesReceived}
              </div>
              <div className="eyebrow text-[#6e5b52]">Votes received</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border border-[#cdb9aa] bg-[#fffaf7] p-6 mb-8">
          <h2 className="display-title text-3xl text-[#241c19] mb-4">Keep the record going.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/create')}
              className="btn btn-primary"
            >
              Share New Experience
            </button>
            
            <button
              onClick={() => router.push('/posts')}
              className="btn btn-secondary"
            >
              View All Posts
            </button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="border-l-2 border-[#9d4134] bg-[#e2d2c4] p-6 mb-8">
          <h2 className="display-title text-3xl text-[#241c19] mb-3">Privacy is the point.</h2>
          <div className="space-y-2 text-[#584944]">
            <p>Your public posts and comments use your pseudonym.</p>
            <p>No personal information is shared with other users.</p>
            <p>Your profile and account activity are visible only to you.</p>
          </div>
        </div>

        {/* Account Actions */}
        <div className="border-t border-[#cdb9aa] pt-6">
          <h2 className="eyebrow text-[#6e5b52] mb-4">Account</h2>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="btn border border-[#9d4134] text-[#9d4134] hover:bg-[#f0d9d1]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}