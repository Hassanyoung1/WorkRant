'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
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
        <div className="grid overflow-hidden rounded-[32px] border border-[#e4d4c8] bg-[#fffaf7] shadow-[0_24px_80px_rgba(74,45,36,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden min-h-[640px] bg-[#eddcc9] lg:block">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              alt="Team meeting in office"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/65 via-stone-900/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-200">About WorkRant</p>
              <h1 className="mt-3 max-w-sm text-3xl font-semibold tracking-[-0.06em]">Share honest experiences. Build better workplaces.</h1>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-lg">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e7d7cb] bg-[#4a2d24] text-lg font-bold text-white shadow-sm">
                  W
                </div>
                <h2 className="text-3xl font-semibold tracking-[-0.06em] text-[#2f241f]">Join WorkRant</h2>
                <p className="mt-2 text-sm text-[#5d4c44]">Create an anonymous account and share what work is really like.</p>
              </div>
              <RegisterForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
