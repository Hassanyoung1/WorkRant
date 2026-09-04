'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f1eb]">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[32px] border border-[#e4d4c8] bg-[#fffaf7] shadow-[0_24px_80px_rgba(74,45,36,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden min-h-[560px] bg-[#171615] lg:block">
            <div className="absolute inset-0 p-10">
              <p className="eyebrow text-[#e08a6f]">WorkRant</p>
              <h1 className="display-title mt-6 max-w-sm text-5xl text-[#fff8f1]">The version of work nobody puts on the careers page.</h1>
              <div className="mt-16 border-l-2 border-[#d46a4a] pl-5 text-[#c9bdb5]">Read first-hand accounts. Keep your identity out of the conversation.</div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center">
                <p className="eyebrow text-[#9d4134]">Private entrance</p>
                <h2 className="text-3xl font-semibold tracking-[-0.06em] text-[#2f241f]">Welcome back</h2>
                <p className="mt-2 text-sm text-[#5d4c44]">Sign in to keep reading and add your own context.</p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
