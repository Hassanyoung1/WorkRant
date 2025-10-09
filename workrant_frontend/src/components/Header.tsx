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
    <header className="bg-black shadow-lg border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="text-xl font-bold text-white">WorkRant</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
                          <Link
                href="/posts"
                className="text-gray-300 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Posts
              </Link>
              <Link
                href="/companies"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Companies
              </Link>
            {user && (
              <Link href="/create" className="btn btn-primary">
                Share Experience
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.pseudonym.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block">{user.pseudonym}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg border border-gray-800 py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/my-posts"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Posts
                    </Link>
                    <hr className="my-1 border-gray-800" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Join Anonymous
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/posts"
                className="text-gray-300 hover:text-white py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Posts
              </Link>
              <Link
                href="/companies"
                className="text-gray-300 hover:text-white py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Companies
              </Link>
              {user && (
                <Link
                  href="/create"
                  className="bg-gradient-to-r from-gray-900 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-black hover:to-orange-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Share Experience
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
