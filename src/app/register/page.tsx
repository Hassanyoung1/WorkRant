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
          <div className="relative hidden min-h-[640px] bg-[#171615] lg:block">
            <div className="absolute inset-0 p-10">
              <p className="eyebrow text-[#e08a6f]">Join the record</p>
              <h1 className="display-title mt-6 max-w-sm text-5xl text-[#fff8f1]">A pseudonym is enough to start telling the truth.</h1>
              <div className="mt-16 border-l-2 border-[#d46a4a] pl-5 text-[#c9bdb5]">No public profile to perform. Just the experience and what it taught you.</div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-lg">
              <div className="mb-8 text-center">
                <p className="eyebrow text-[#9d4134]">Create your private account</p>
                <h2 className="text-3xl font-semibold tracking-[-0.06em] text-[#2f241f]">Join WorkRant</h2>
                <p className="mt-2 text-sm text-[#5d4c44]">Your name stays out of it. Your experience does not.</p>
              </div>
              <RegisterForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
