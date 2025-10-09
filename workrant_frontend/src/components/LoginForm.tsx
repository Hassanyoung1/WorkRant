'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFormData } from '@/types';

export default function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    pseudonym: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.pseudonym.trim()) {
      errors.pseudonym = 'Pseudonym is required';
    } else if (formData.pseudonym.length < 3) {
      errors.pseudonym = 'Pseudonym must be at least 3 characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login(formData);
      router.push('/'); // Redirect to home page after successful login
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login failed:', error);
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-gray-900 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to WorkRant
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Share your workplace experiences anonymously
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-gray-900 p-8 rounded-lg shadow-xl border border-gray-800" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Pseudonym field */}
            <div>
              <label htmlFor="pseudonym" className="block text-sm font-medium text-gray-300">
                Pseudonym
              </label>
              <input
                id="pseudonym"
                name="pseudonym"
                type="text"
                autoComplete="username"
                required
                value={formData.pseudonym}
                onChange={handleInputChange('pseudonym')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm ${
                  fieldErrors.pseudonym ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Enter your pseudonym"
              />
              {fieldErrors.pseudonym && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.pseudonym}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange('password')}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm ${
                  fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Enter your password"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-900 bg-opacity-50 border border-red-800 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full relative"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-medium text-orange-600 hover:text-orange-700">
                Create a pseudonym
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/auth/recovery" className="font-medium text-orange-600 hover:text-orange-700">
                Forgot your password?
              </Link>
            </p>
          </div>

          {/* Privacy notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mt-6">
            <p className="text-xs text-orange-900">
              <strong>Privacy Notice:</strong> WorkRant only stores your pseudonym and encrypted password. 
              We never collect real names, emails, or personal information.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
