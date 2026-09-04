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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.pseudonym.trim()) {
      errors.pseudonym = 'Pseudonym is required';
    } else if (formData.pseudonym.length < 3) {
      errors.pseudonym = 'Pseudonym must be at least 3 characters';
    }

    if (!formData.password?.trim()) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isLoading) {
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await login(formData);
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));

    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="pseudonym" className="mb-1.5 block text-sm font-medium text-stone-700">
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
            className={`input ${fieldErrors.pseudonym ? 'border-red-300 focus:border-red-500' : ''}`}
            placeholder="Enter your pseudonym"
          />
          {fieldErrors.pseudonym && <p className="mt-1 text-sm text-red-600">{fieldErrors.pseudonym}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">
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
            className={`input ${fieldErrors.password ? 'border-red-300 focus:border-red-500' : ''}`}
            placeholder="Enter your password"
          />
          {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={isLoading || isSubmitting} className="btn btn-primary w-full">
        {isLoading || isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>

      <div className="space-y-2 pt-2 text-center text-sm text-stone-600">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-4 hover:text-stone-700">
            Create a pseudonym
          </Link>
        </p>
        <p>
          <Link href="/auth/recovery" className="font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 hover:text-stone-900">
            Forgot your password?
          </Link>
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] uppercase tracking-[0.12em] text-amber-800">
        Privacy first — no real names, no personal data
      </div>
    </form>
  );
}
