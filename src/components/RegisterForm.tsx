'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterFormData } from '@/types';
import { PIIDetector } from '@/lib/pii-detector';

export default function RegisterForm() {
  const { register, isLoading, error } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    pseudonym: '',
    password: '',
    password_confirm: '',
    account_type: 'persistent',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [piiWarning, setPiiWarning] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Pseudonym validation
    if (!formData.pseudonym.trim()) {
      errors.pseudonym = 'Pseudonym is required';
    } else if (formData.pseudonym.length < 3) {
      errors.pseudonym = 'Pseudonym must be at least 3 characters';
    } else if (formData.pseudonym.length > 64) {
      errors.pseudonym = 'Pseudonym must be less than 64 characters';
    } else {
      // Check for PII in pseudonym
      const piiCheck = PIIDetector.detect(formData.pseudonym);
      if (piiCheck.hasPII) {
        errors.pseudonym = 'Pseudonym cannot contain personal information like emails or phone numbers';
      }
    }

    // Password validation for persistent accounts
    if (formData.account_type === 'persistent') {
      if (!formData.password) {
        errors.password = 'Password is required for persistent accounts';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }

      if (!formData.password_confirm) {
        errors.password_confirm = 'Please confirm your password';
      } else if (formData.password !== formData.password_confirm) {
        errors.password_confirm = 'Passwords do not match';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await register(formData);
      // Registration success is handled by AuthContext
      // Recovery token is shown by AuthContext if provided
      router.push('/'); // Redirect to home page after successful registration
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration failed:', error);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'radio' ? e.target.value : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }

    // Check for PII in pseudonym
    if (field === 'pseudonym' && value) {
      const piiCheck = PIIDetector.detect(value);
      if (piiCheck.hasPII) {
        setPiiWarning('Warning: Your pseudonym may contain personal information. Consider using a different name.');
      } else {
        setPiiWarning(null);
      }
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join WorkRant
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your anonymous account to share workplace experiences
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Account type selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="account_type"
                    value="persistent"
                    checked={formData.account_type === 'persistent'}
                    onChange={handleInputChange('account_type')}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Persistent Account</span>
                    <p className="text-sm text-gray-500">Create a password-protected account you can return to</p>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="account_type"
                    value="ephemeral"
                    checked={formData.account_type === 'ephemeral'}
                    onChange={handleInputChange('account_type')}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Anonymous Session</span>
                    <p className="text-sm text-gray-500">Temporary account for one-time posting</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Pseudonym field */}
            <div>
              <label htmlFor="pseudonym" className="block text-sm font-medium text-gray-700">
                Pseudonym
              </label>
              <input
                id="pseudonym"
                name="pseudonym"
                type="text"
                required
                value={formData.pseudonym}
                onChange={handleInputChange('pseudonym')}
                className={`input mt-1 ${
                  fieldErrors.pseudonym ? 'border-red-300 focus-visible:ring-red-500' : ''
                }`}
                placeholder="Choose a unique pseudonym"
              />
              {piiWarning && (
                <p className="mt-1 text-sm text-yellow-600">{piiWarning}</p>
              )}
              {fieldErrors.pseudonym && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.pseudonym}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will be your public identity. Choose wisely - it cannot be changed.
              </p>
            </div>

            {/* Password fields (only for persistent accounts) */}
            {formData.account_type === 'persistent' && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className={`input mt-1 ${
                      fieldErrors.password ? 'border-red-300 focus-visible:ring-red-500' : ''
                    }`}
                    placeholder="Create a secure password"
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    required
                    value={formData.password_confirm}
                    onChange={handleInputChange('password_confirm')}
                    className={`input mt-1 ${
                      fieldErrors.password_confirm ? 'border-red-300 focus-visible:ring-red-500' : ''
                    }`}
                    placeholder="Confirm your password"
                  />
                  {fieldErrors.password_confirm && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.password_confirm}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Links */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-700">
                Sign in
              </Link>
            </p>
          </div>

          {/* Privacy notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-800">
              <strong>Privacy Guarantee:</strong> WorkRant only stores your pseudonym and encrypted password. 
              We never collect real names, emails, or any personal identifying information.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
