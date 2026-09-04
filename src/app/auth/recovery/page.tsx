'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

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
    <div className="min-h-screen bg-[#f3e9df] px-4 py-12 text-[#241c19]"><Header />
      <div className="mx-auto mt-10 w-full max-w-md border border-[#cdb9aa] bg-[#fffaf7] p-8 shadow-[12px_14px_0_#d46a4a]">
        <div className="mb-6 text-center">
          <p className="eyebrow text-[#9d4134]">Account recovery</p>
          <h1 className="display-title mt-4 text-4xl">Recover access.</h1>
          <p className="mt-2 text-sm text-[#6e5b52]">
            Use your recovery token to sign in without a password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="pseudonym" className="mb-1 block text-sm font-medium text-[#584944]">
              Pseudonym
            </label>
            <input
              id="pseudonym"
              type="text"
              value={pseudonym}
              onChange={(event) => setPseudonym(event.target.value)}
              placeholder="Enter your pseudonym"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="recoveryToken" className="mb-1 block text-sm font-medium text-[#584944]">
              Recovery token
            </label>
            <input
              id="recoveryToken"
              type="text"
              value={recoveryToken}
              onChange={(event) => setRecoveryToken(event.target.value)}
              placeholder="Paste your recovery token"
              className="input"
            />
          </div>

          {fieldError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {fieldError}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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

        <div className="mt-6 text-center text-sm text-[#6e5b52]">
          <Link href="/login" className="font-medium text-[#9d4134] hover:text-[#713229]">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
