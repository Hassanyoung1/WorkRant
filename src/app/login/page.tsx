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
          <div className="relative hidden min-h-[560px] bg-[#4a2d24] lg:block">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
              alt="People in a meeting"
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/30 to-stone-900/10" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-300">WorkRant</p>
              <h1 className="mt-3 max-w-sm text-3xl font-semibold tracking-[-0.06em]">Conversations people actually need.</h1>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e7d7cb] bg-[#4a2d24] text-lg font-bold text-white shadow-sm">
                  W
                </div>
                <h2 className="text-3xl font-semibold tracking-[-0.06em] text-[#2f241f]">Welcome back</h2>
                <p className="mt-2 text-sm text-[#5d4c44]">Sign in to continue the conversation.</p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
