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
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                Join WorkRant
              </h1>
              <p className="text-gray-300">
                Create your anonymous account to share workplace experiences
              </p>
            </div>
            
            <RegisterForm />
          </div>
        </div>
      </main>
    </div>
  );
}
