'use client';

import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { useUI } from '@/hooks/useApi';
import { toggleSidebar } from '@/store/slices/uiSlice';

interface SidebarProps {
  children: React.ReactNode;
  side?: 'left' | 'right';
}

export function Sidebar({ children, side = 'left' }: SidebarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { sidebarOpen } = useUI();

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="md:hidden fixed bottom-8 left-8 z-50 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          side === 'left' ? 'left-0' : 'right-0'
        } fixed top-0 h-screen w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto transition-transform duration-200 ${
          !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
        } md:relative md:translate-x-0 md:top-auto md:h-auto z-40`}
      >
        {children}
      </aside>
    </>
  );
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}

export function SidebarSection({ title, children, collapsible = true }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className="w-full px-4 py-3 font-semibold text-sm text-gray-900 hover:bg-gray-100 flex justify-between items-center"
      >
        <span>{title}</span>
        {collapsible && (
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
      </button>
      {isOpen && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}
