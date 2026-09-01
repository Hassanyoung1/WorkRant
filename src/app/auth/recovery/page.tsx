'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RecoveryPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [pseudonym, setPseudonym] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!pseudonym.trim()) {
      setFieldError('Pseudonym is required.');
      return;
    }

    if (!recoveryToken.trim()) {
      setFieldError('Recovery token is required.');
      return;
    }

    setIsSubmitting(true);
    setFieldError('');

    try {
      await login({ pseudonym: pseudonym.trim(), recovery_token: recoveryToken.trim() });
      router.push('/');
    } catch {
      // Error is handled by the auth context.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-gray-900 to-orange-600 font-bold text-xl text-white">
            W
          </div>
          <h1 className="text-3xl font-bold">Recover access</h1>
          <p className="mt-2 text-sm text-gray-400">
            Use your recovery token to sign in without a password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="pseudonym" className="mb-1 block text-sm font-medium text-gray-300">
              Pseudonym
            </label>
            <input
              id="pseudonym"
              type="text"
              value={pseudonym}
              onChange={(event) => setPseudonym(event.target.value)}
              placeholder="Enter your pseudonym"
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="recoveryToken" className="mb-1 block text-sm font-medium text-gray-300">
              Recovery token
            </label>
            <input
              id="recoveryToken"
              type="text"
              value={recoveryToken}
              onChange={(event) => setRecoveryToken(event.target.value)}
              placeholder="Paste your recovery token"
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {fieldError && (
            <div className="rounded-md border border-red-800 bg-red-900/40 p-3 text-sm text-red-200">
              {fieldError}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-800 bg-red-900/40 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="btn btn-primary w-full"
          >
            {isLoading || isSubmitting ? 'Signing in...' : 'Sign in with recovery token'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
