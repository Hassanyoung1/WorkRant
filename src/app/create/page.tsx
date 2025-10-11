'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CompanySearch from '@/components/CompanySearch';
import TagSelector from '@/components/TagSelector';
import { useAuth } from '@/contexts/AuthContext';
import { usePostCreation } from '@/hooks/usePostCreation';

const CreatePostPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { createPost, isSubmitting, error, setError } = usePostCreation({
    redirectOnSuccess: true,
    redirectPath: '/posts?refresh=true'
  });
  
  const [formData, setFormData] = useState({
    content: '',
    companyName: '',
    tags: [] as string[],
    image: null as File | null,
    post_type: 'experience' as 'experience' | 'advice' | 'question' | 'warning',
  });

  // Check authentication
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/create');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-400">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setFormData(prev => ({ ...prev, content }));
    setError(null); // Clear error when user types
  };

  const handleCompanySelect = (companyName: string) => {
    setFormData(prev => ({ ...prev, companyName }));
  };

  const handleTagsChange = (selectedTags: string[]) => {
    setFormData(prev => ({ ...prev, tags: selectedTags }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    await createPost({
      content: formData.content,
      company_name: formData.companyName,
      post_type: formData.post_type,
      tags: formData.tags,
      image: formData.image ?? undefined,
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section with Animation */}
          <div className="text-center mb-12 relative">
            {/* Background Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 text-white mb-6 shadow-2xl shadow-orange-600/30 animate-pulse">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-white via-gray-100 to-orange-500 bg-clip-text text-transparent">
                Share Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Experience
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Your voice matters. Help others make informed career decisions by sharing what you&apos;ve experienced.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">100%</div>
              <div className="text-xs text-gray-400 mt-1">Anonymous</div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">Safe</div>
              <div className="text-xs text-gray-400 mt-1">Protected</div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">Helpful</div>
              <div className="text-xs text-gray-400 mt-1">Community</div>
            </div>
          </div>

          {/* Main Form Card - Modern Design */}
          <form onSubmit={handleSubmit} className="relative">
            {/* Gradient Border Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-800 rounded-2xl blur opacity-20"></div>
            
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
              {/* Error Alert - Sleek Design */}
              {error && (
                <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border-l-4 border-red-500 p-4 m-6 rounded-lg backdrop-blur-sm">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-200 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-10 space-y-8">
                {/* Post Type Selector - Card Style */}
                <div className="space-y-3">
                  <label className="flex items-center text-base font-bold text-white">
                    <div className="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    Choose Post Type
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { value: 'experience', label: 'Experience', icon: '💼', gradient: 'from-blue-600 to-blue-700', description: 'Share your story' },
                      { value: 'advice', label: 'Advice', icon: '💡', gradient: 'from-green-600 to-green-700', description: 'Offer guidance' },
                      { value: 'question', label: 'Question', icon: '❓', gradient: 'from-purple-600 to-purple-700', description: 'Ask community' },
                      { value: 'warning', label: 'Warning', icon: '⚠️', gradient: 'from-red-600 to-red-700', description: 'Alert others' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, post_type: type.value as 'experience' | 'advice' | 'question' | 'warning' }))}
                        className={`relative p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          formData.post_type === type.value
                            ? `border-orange-500 bg-gradient-to-br ${type.gradient} shadow-lg shadow-orange-500/20`
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-3xl mb-2">{type.icon}</div>
                        <div className={`text-sm font-bold mb-1 ${
                          formData.post_type === type.value ? 'text-white' : 'text-gray-300'
                        }`}>
                          {type.label}
                        </div>
                        <div className={`text-xs ${
                          formData.post_type === type.value ? 'text-gray-200' : 'text-gray-500'
                        }`}>
                          {type.description}
                        </div>
                        {formData.post_type === type.value && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company Field - Enhanced */}
                <div className="space-y-3">
                  <label htmlFor="company" className="flex items-center text-base font-bold text-white">
                    <div className="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    Company Name <span className="text-orange-500 ml-1">*</span>
                  </label>
                  <CompanySearch
                    onSelect={handleCompanySelect}
                    value={formData.companyName}
                    id="company"
                    name="company"
                  />
                  <p className="text-xs text-gray-400 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Search for an existing company or create a new one
                  </p>
                </div>

                {/* Content Field - Modern Textarea */}
                <div className="space-y-3">
                  <label htmlFor="content" className="flex items-center text-base font-bold text-white">
                    <div className="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    Your Story <span className="text-orange-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="content"
                      rows={10}
                      className="w-full px-5 py-4 rounded-xl border-2 border-gray-700 bg-gray-800/50 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none placeholder-gray-500 backdrop-blur-sm"
                      placeholder="What happened? How did it make you feel? What did you learn?&#10;&#10;Share your honest experience - it could help someone else..."
                      value={formData.content}
                      onChange={handleContentChange}
                      required
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-gray-900/80 px-2 py-1 rounded">
                      {formData.content.length} chars
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Be detailed and honest - your experience helps others
                  </p>
                </div>

                {/* Tags Field - Chip Design */}
                <div className="space-y-3">
                  <label htmlFor="tags" className="flex items-center text-base font-bold text-white">
                    <div className="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    Add Tags <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
                  </label>
                  <TagSelector
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleTagsChange}
                    suggestions={['salary', 'harassment', 'work-life-balance', 'management', 'culture', 'benefits', 'toxic-workplace', 'career-growth', 'team-dynamics', 'remote-work']}
                  />
                  <p className="text-xs text-gray-400 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Tags help others find posts about similar topics
                  </p>
                </div>

                {/* Image Upload - Drag & Drop Style */}
                <div className="space-y-3">
                  <label htmlFor="image" className="flex items-center text-base font-bold text-white">
                    <div className="w-8 h-8 rounded-lg bg-orange-600/20 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Add Image <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span>
                  </label>
                  <div className="relative group">
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-gray-800/30 hover:border-orange-500 hover:bg-gray-800/50 transition-all cursor-pointer">
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="relative pointer-events-none">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-600 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-400 mb-1">
                          <span className="text-orange-500 font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  </div>
                  {formData.image && (
                    <div className="flex items-center justify-between bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700 px-4 py-3 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-300">{formData.image.name}</p>
                          <p className="text-xs text-green-400">{(formData.image.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Privacy Reminder - Inline */}
                <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-700/50 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-orange-300 mb-1">Your Privacy is Protected</h3>
                      <p className="text-xs text-gray-400">
                        Posts are 100% anonymous. Avoid sharing personal info like emails, phone numbers, or ID numbers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with Actions - Gradient */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 sm:px-10 py-5 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-300 bg-gray-800 border-2 border-gray-700 rounded-xl hover:bg-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Cancel
                  </span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !!error}
                  className="w-full sm:w-auto px-8 py-3 text-base font-bold text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-600/30 transition-all transform hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting Your Story...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Share My Experience
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Bottom Tips Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center hover:border-orange-600/50 transition-all">
              <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Stay Anonymous</h3>
              <p className="text-xs text-gray-400">Your identity is always protected. Share freely.</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center hover:border-orange-600/50 transition-all">
              <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Help Others</h3>
              <p className="text-xs text-gray-400">Your experience guides others in their career decisions.</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center hover:border-orange-600/50 transition-all">
              <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Be Honest</h3>
              <p className="text-xs text-gray-400">Authentic stories have the greatest impact.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePostPage;
