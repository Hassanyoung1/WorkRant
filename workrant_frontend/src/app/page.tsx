'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import PostFeed from '@/components/PostFeed';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {user ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Welcome message */}
            <div className="bg-gradient-to-r from-gray-900 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user.pseudonym}!
              </h1>
              <p className="text-orange-50">
                Share your workplace experiences anonymously and help others make informed career decisions.
              </p>
            </div>

            {/* Post Feed */}
            <PostFeed />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent mb-4">
                Anonymous Workplace Transparency
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Share honest workplace experiences, rate companies, and get advice from fellow professionals. 
                Your identity is protected, your voice is heard.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mt-12">
                {/* Features */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-8">
                  <h2 className="text-2xl font-semibold mb-6 text-white">Why WorkRant?</h2>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-medium text-white">100% Anonymous</h3>
                        <p className="text-gray-400 text-sm">No personal information required. Use any pseudonym.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-medium text-white">Real Experiences</h3>
                        <p className="text-gray-400 text-sm">Authentic workplace stories from real employees.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-medium text-white">Company Insights</h3>
                        <p className="text-gray-400 text-sm">Rate and review company culture, management, work-life balance.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-medium text-white">Career Advice</h3>
                        <p className="text-gray-400 text-sm">Get guidance from experienced professionals.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Login Form */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-8">
                  <LoginForm />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
