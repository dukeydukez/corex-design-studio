'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthLogout } from '@/hooks/useApi';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { closeAllModals } from '@/store/slices/uiSlice';

export function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const { logout } = useAuthLogout();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      dispatch(closeAllModals());
      router.push('/auth/login');
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2z" />
              </svg>
            </div>
            <span className="font-bold text-lg">COREX</span>
          </Link>

          {/* Center navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Projects
            </Link>
            <Link
              href="/templates"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Templates
            </Link>
            <Link
              href="/brand"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Brand Kit
            </Link>
          </nav>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">{user.firstName}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
