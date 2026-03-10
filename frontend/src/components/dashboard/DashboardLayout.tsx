'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar, SidebarSection } from '@/components/layout/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar>
          <SidebarSection title="Projects" collapsible={false}>
            <nav className="space-y-2">
              <a
                href="/dashboard"
                className="block px-3 py-2 text-sm font-medium text-gray-900 bg-gray-200 rounded-lg"
              >
                All Projects
              </a>
              <a
                href="/dashboard?filter=recent"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Recent
              </a>
              <a
                href="/dashboard?filter=shared"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Shared
              </a>
            </nav>
          </SidebarSection>

          <SidebarSection title="Resources" collapsible={true}>
            <nav className="space-y-2">
              <a
                href="/templates"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Templates
              </a>
              <a
                href="/brand"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Brand Kit
              </a>
              <a
                href="/assets"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Assets
              </a>
            </nav>
          </SidebarSection>

          <SidebarSection title="Help & Support" collapsible={true}>
            <nav className="space-y-2">
              <a
                href="/docs"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Documentation
              </a>
              <a
                href="/support"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Get Help
              </a>
              <a
                href="/feedback"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Send Feedback
              </a>
            </nav>
          </SidebarSection>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
