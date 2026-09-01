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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.pseudonym.trim()) {
      errors.pseudonym = 'Pseudonym is required';
    } else if (formData.pseudonym.length < 3) {
      errors.pseudonym = 'Pseudonym must be at least 3 characters';
    } else if (formData.pseudonym.length > 64) {
      errors.pseudonym = 'Pseudonym must be less than 64 characters';
    } else {
      const piiCheck = PIIDetector.detect(formData.pseudonym);
      if (piiCheck.hasPII) {
        errors.pseudonym = 'Pseudonym cannot contain personal information like emails or phone numbers';
      }
    }

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

    if (isSubmitting || isLoading) {
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await register(formData);
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      const normalized = message.toLowerCase();

      if (normalized.includes('already taken') || normalized.includes('already exists') || normalized.includes('taken')) {
        setFieldErrors(prev => ({
          ...prev,
          pseudonym: 'This pseudonym is already taken. Please choose another one.',
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          pseudonym: message,
        }));
      }

      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }

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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Account type</label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${formData.account_type === 'persistent' ? 'border-[#6e3d2c] bg-[#f8efe9] shadow-sm' : 'border-[#dcc2b2] bg-[#fffaf7]'}`}>
              <input
                type="radio"
                name="account_type"
                value="persistent"
                checked={formData.account_type === 'persistent'}
                onChange={handleInputChange('account_type')}
                className="mt-1 accent-[#6e3d2c]"
              />
              <div>
                <div className="font-medium text-[#2f241f]">Persistent</div>
                <div className="text-xs text-[#5d4c44]">Password protected</div>
              </div>
            </label>

            <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${formData.account_type === 'ephemeral' ? 'border-[#6e3d2c] bg-[#f8efe9] shadow-sm' : 'border-[#dcc2b2] bg-[#fffaf7]'}`}>
              <input
                type="radio"
                name="account_type"
                value="ephemeral"
                checked={formData.account_type === 'ephemeral'}
                onChange={handleInputChange('account_type')}
                className="mt-1 accent-[#6e3d2c]"
              />
              <div>
                <div className="font-medium text-[#2f241f]">Anonymous session</div>
                <div className="text-xs text-[#5d4c44]">Temporary account</div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="pseudonym" className="mb-1.5 block text-sm font-medium text-stone-700">Pseudonym</label>
          <input
            id="pseudonym"
            name="pseudonym"
            type="text"
            required
            value={formData.pseudonym}
            onChange={handleInputChange('pseudonym')}
            className={`input ${fieldErrors.pseudonym ? 'border-red-300 focus:border-red-500' : ''}`}
            placeholder="Choose a unique pseudonym"
          />
          {piiWarning && <p className="mt-1 text-sm text-amber-700">{piiWarning}</p>}
          {fieldErrors.pseudonym && <p className="mt-1 text-sm text-red-600">{fieldErrors.pseudonym}</p>}
          <p className="mt-1 text-xs text-stone-500">This will be your public identity.</p>
        </div>

        {formData.account_type === 'persistent' && (
          <>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange('password')}
                className={`input ${fieldErrors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                placeholder="Create a secure password"
              />
              {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="password_confirm" className="mb-1.5 block text-sm font-medium text-stone-700">Confirm password</label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
                value={formData.password_confirm}
                onChange={handleInputChange('password_confirm')}
                className={`input ${fieldErrors.password_confirm ? 'border-red-300 focus:border-red-500' : ''}`}
                placeholder="Confirm your password"
              />
              {fieldErrors.password_confirm && <p className="mt-1 text-sm text-red-600">{fieldErrors.password_confirm}</p>}
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <button type="submit" disabled={isLoading || isSubmitting} className="btn btn-primary w-full">
        {isLoading || isSubmitting ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-sm text-stone-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-4 hover:text-stone-700">
          Sign in
        </Link>
      </p>

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-[11px] uppercase tracking-[0.12em] text-stone-700">
        Privacy promise — only your pseudonym and encrypted password are stored
      </div>
    </form>
  );
}
