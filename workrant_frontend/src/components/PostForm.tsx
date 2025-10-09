'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types';
import { usePostCreation } from '@/hooks/usePostCreation';

interface PostFormProps {
  onPostCreated?: (post: Post) => void;
  onCancel?: () => void;
}

export default function PostForm({ onPostCreated, onCancel }: PostFormProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { createPost, isSubmitting, error, setError } = usePostCreation({
    onSuccess: (post) => {
      onPostCreated?.(post);
      // Reset form after successful creation
      setFormData({ content: '', post_type: 'experience', company_name: '', image: null });
    },
    redirectOnSuccess: false,
  });
  
  const [formData, setFormData] = useState({
    content: '',
    post_type: 'experience' as 'experience' | 'advice' | 'question' | 'warning',
    company_name: '',
    image: null as File | null,
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Redirecting to login...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    await createPost({
      content: formData.content,
      company_name: formData.company_name,
      post_type: formData.post_type,
      image: formData.image ?? undefined,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('File type not supported. Please upload images (JPG, PNG, GIF, WEBP) or documents (PDF, DOC, DOCX, XLS, XLSX)');
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      setError(null);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, image: null }));
  };

  return (
    <div className="space-y-6">
      {/* Modern Header with Icon */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Share Your Experience</h3>
            <p className="text-xs text-gray-400">Your voice matters - post anonymously</p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Post Type Cards */}
        <div>
          <label className="block text-sm font-semibold text-white mb-3">Post Type</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'experience' as const, label: 'Experience', icon: '💼', gradient: 'from-blue-600 to-blue-700' },
              { value: 'advice' as const, label: 'Advice', icon: '💡', gradient: 'from-green-600 to-green-700' },
              { value: 'question' as const, label: 'Question', icon: '❓', gradient: 'from-purple-600 to-purple-700' },
              { value: 'warning' as const, label: 'Warning', icon: '⚠️', gradient: 'from-red-600 to-red-700' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, post_type: type.value }))}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  formData.post_type === type.value
                    ? `border-orange-500 bg-gradient-to-br ${type.gradient} shadow-lg`
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className={`text-sm font-bold ${
                  formData.post_type === type.value ? 'text-white' : 'text-gray-300'
                }`}>
                  {type.label}
                </div>
                {formData.post_type === type.value && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Company Input */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Company <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-gray-700 bg-gray-800 text-white rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-500"
            placeholder="Which company?"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Your Story <span className="text-orange-500">*</span>
          </label>
          <textarea
            rows={5}
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-gray-700 bg-gray-800 text-white rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none placeholder-gray-500"
            placeholder="What happened? How did it affect you? Share your honest experience..."
            required
          />
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center text-xs text-gray-400">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              100% Anonymous
            </div>
            <span className="text-xs text-gray-500">{formData.content.length} chars</span>
          </div>
        </div>

        {/* File Upload - Images and Documents */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Attach File <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <div className="relative group">
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center bg-gray-800/30 hover:border-orange-500 hover:bg-gray-800/50 transition-all cursor-pointer">
              <input
                type="file"
                id="file-upload"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="relative pointer-events-none">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-600 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-400 mb-1">
                  <span className="text-orange-500 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Images: JPG, PNG, GIF, WEBP • Docs: PDF, DOC, DOCX, XLS, XLSX
                </p>
                <p className="text-xs text-gray-600 mt-1">Max size: 10MB</p>
              </div>
            </div>
          </div>
          
          {/* File Preview */}
          {formData.image && (
            <div className="mt-3 flex items-center justify-between bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700 px-4 py-3 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  {formData.image.type.startsWith('image/') ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-300 truncate max-w-xs">
                    {formData.image.name}
                  </p>
                  <p className="text-xs text-green-400">
                    {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-900/30 rounded-lg"
                title="Remove file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-semibold text-gray-300 bg-gray-800 border-2 border-gray-700 rounded-xl hover:bg-gray-700 hover:border-gray-600 transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl hover:from-orange-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-600/30 transition-all transform hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Share Experience
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
