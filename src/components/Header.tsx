'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#6f4437]/40 bg-[#4a2d24] text-[#fffaf6] shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#f3d9c8] bg-[#f5efe9] text-sm font-bold text-[#2a1d1a] shadow-sm">
            W
          </div>
          <div>
            <div className="text-lg font-semibold tracking-[-0.04em] text-[#fffaf6]">WorkRant</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/posts" className="text-sm font-medium text-[#f5dcd0] transition hover:text-white">
            Posts
          </Link>
          <Link href="/companies" className="text-sm font-medium text-[#f5dcd0] transition hover:text-white">
            Companies
          </Link>
          {user && (
            <Link href="/create" className="btn btn-primary">
              Share an experience
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 rounded-full border border-[#e7d7cb] bg-[#fffaf7] px-2 py-1.5 text-sm text-[#2f241f] shadow-sm transition hover:border-[#d5b7a4]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4a2d24] text-xs font-semibold text-white">
                  {user.pseudonym.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline">{user.pseudonym}</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.18l3.71-3.95a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#e7d7cb] bg-[#fffaf7] p-2 shadow-lg">
                  <Link href="/profile" className="block rounded-xl px-3 py-2 text-sm text-[#2f241f] transition hover:bg-[#f4e7de]" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link href="/my-posts" className="block rounded-xl px-3 py-2 text-sm text-[#2f241f] transition hover:bg-[#f4e7de]" onClick={() => setIsMenuOpen(false)}>
                    My Posts
                  </Link>
                  <button onClick={handleLogout} className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm text-[#9d4134] transition hover:bg-[#f8e4df]">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden text-sm font-medium text-[#f5dcd0] transition hover:text-white sm:inline-flex">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Join anonymous
              </Link>
            </div>
          )}

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7d7cb] bg-[#fffaf7] text-[#2f241f] md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[#6f4437]/40 bg-[#f7f1eb] md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            <Link href="/posts" className="rounded-xl px-3 py-2 text-sm text-[#2f241f] hover:bg-[#efe2d8]" onClick={() => setIsMenuOpen(false)}>
              Posts
            </Link>
            <Link href="/companies" className="rounded-xl px-3 py-2 text-sm text-[#2f241f] hover:bg-[#efe2d8]" onClick={() => setIsMenuOpen(false)}>
              Companies
            </Link>
            {user && (
              <Link href="/create" className="btn btn-primary mt-1" onClick={() => setIsMenuOpen(false)}>
                Share Experience
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
