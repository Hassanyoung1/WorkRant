'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFormData } from '@/types';

export default function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    pseudonym: '',
    password: '',
  });
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pseudonym.trim() && formData.password?.trim()) {
      await login(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (showRegister) {
    return <RegisterForm onBackToLogin={() => setShowRegister(false)} />;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to share your experiences</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pseudonym" className="block text-sm font-medium text-gray-700 mb-1">
            Pseudonym
          </label>
          <input
            type="text"
            id="pseudonym"
            name="pseudonym"
            value={formData.pseudonym}
            onChange={handleChange}
            className="input"
            placeholder="Your anonymous username"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            placeholder="Your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => setShowRegister(true)}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Create anonymous account
          </button>
        </p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-700 text-xs">
          🔒 Your identity is completely anonymous. We only store your chosen pseudonym.
        </p>
      </div>
    </div>
  );
}

// Register Form Component
function RegisterForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    pseudonym: '',
    password: '',
    password_confirm: '',
    account_type: 'persistent' as 'persistent' | 'ephemeral',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirm) {
      alert('Passwords do not match');
      return;
    }

    if (formData.pseudonym.trim() && formData.password.trim()) {
      await register(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Join WorkRant</h2>
        <p className="text-gray-600 mt-2">Create your anonymous account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pseudonym" className="block text-sm font-medium text-gray-700 mb-1">
            Choose a Pseudonym
          </label>
          <input
            type="text"
            id="pseudonym"
            name="pseudonym"
            value={formData.pseudonym}
            onChange={handleChange}
            className="input"
            placeholder="e.g., TechWorker2024"
            required
            minLength={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be your anonymous identity. Choose wisely - it can&apos;t be changed.
          </p>
        </div>

        <div>
          <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 mb-1">
            Account Type
          </label>
          <select
            id="account_type"
            name="account_type"
            value={formData.account_type}
            onChange={handleChange}
            className="input"
          >
            <option value="persistent">Persistent (with password)</option>
            <option value="ephemeral">Ephemeral (password-less)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Persistent accounts let you return later. Ephemeral accounts are completely anonymous.
          </p>
        </div>

        {formData.account_type === 'persistent' && (
          <>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="Secure password"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className="input"
                placeholder="Confirm your password"
                required
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Creating account...' : 'Create Anonymous Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <button
            onClick={onBackToLogin}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-700 text-xs">
          ✨ 100% anonymous. No email, phone, or personal info required.
        </p>
      </div>
    </div>
  );
}
