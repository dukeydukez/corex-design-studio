'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AIChatBot } from '../components/AIChatBot';

type TemplateCategory = 'All' | 'Social Media' | 'Marketing' | 'Presentations' | 'Print';

interface DemoTemplate {
  id: string;
  name: string;
  category: Exclude<TemplateCategory, 'All'>;
  width: number;
  height: number;
  gradientFrom: string;
  gradientTo: string;
}

const DEMO_TEMPLATES: DemoTemplate[] = [
  { id: 'tmpl-1', name: 'Instagram Post', category: 'Social Media', width: 1080, height: 1080, gradientFrom: '#E8501C', gradientTo: '#F7941D' },
  { id: 'tmpl-2', name: 'Instagram Story', category: 'Social Media', width: 1080, height: 1920, gradientFrom: '#F15A24', gradientTo: '#FF8C42' },
  { id: 'tmpl-3', name: 'LinkedIn Banner', category: 'Social Media', width: 1584, height: 396, gradientFrom: '#0A66C2', gradientTo: '#4A90D9' },
  { id: 'tmpl-4', name: 'YouTube Thumbnail', category: 'Social Media', width: 1280, height: 720, gradientFrom: '#FF0000', gradientTo: '#FF6B6B' },
  { id: 'tmpl-5', name: 'TikTok Cover', category: 'Social Media', width: 1080, height: 1920, gradientFrom: '#25F4EE', gradientTo: '#FE2C55' },
  { id: 'tmpl-6', name: 'Email Header', category: 'Marketing', width: 600, height: 200, gradientFrom: '#6366F1', gradientTo: '#A78BFA' },
  { id: 'tmpl-7', name: 'Newsletter Banner', category: 'Marketing', width: 600, height: 300, gradientFrom: '#EC4899', gradientTo: '#F472B6' },
  { id: 'tmpl-8', name: 'Ad Banner (Leaderboard)', category: 'Marketing', width: 728, height: 90, gradientFrom: '#10B981', gradientTo: '#34D399' },
  { id: 'tmpl-9', name: 'Pitch Deck (16:9)', category: 'Presentations', width: 1920, height: 1080, gradientFrom: '#1E293B', gradientTo: '#475569' },
  { id: 'tmpl-10', name: 'Slide Deck (4:3)', category: 'Presentations', width: 1024, height: 768, gradientFrom: '#0F172A', gradientTo: '#334155' },
  { id: 'tmpl-11', name: 'Business Card', category: 'Print', width: 1050, height: 600, gradientFrom: '#78350F', gradientTo: '#D97706' },
  { id: 'tmpl-12', name: 'Poster (A3)', category: 'Print', width: 1191, height: 1684, gradientFrom: '#7C3AED', gradientTo: '#C084FC' },
  { id: 'tmpl-13', name: 'Flyer (Letter)', category: 'Print', width: 816, height: 1056, gradientFrom: '#DC2626', gradientTo: '#F87171' },
  { id: 'tmpl-14', name: 'Facebook Cover', category: 'Social Media', width: 820, height: 312, gradientFrom: '#1877F2', gradientTo: '#64B5F6' },
  { id: 'tmpl-15', name: 'Brochure (Tri-fold)', category: 'Print', width: 2550, height: 1650, gradientFrom: '#059669', gradientTo: '#6EE7B7' },
  { id: 'tmpl-16', name: 'Google Ads Banner', category: 'Marketing', width: 300, height: 250, gradientFrom: '#F59E0B', gradientTo: '#FBBF24' },
];

const CATEGORIES: TemplateCategory[] = ['All', 'Social Media', 'Marketing', 'Presentations', 'Print'];

const CATEGORY_STYLES: Record<string, string> = {
  'Social Media': 'bg-blue-50 text-blue-700 border-blue-200',
  'Marketing': 'bg-purple-50 text-purple-700 border-purple-200',
  'Presentations': 'bg-slate-50 text-slate-700 border-slate-200',
  'Print': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function formatDimensions(w: number, h: number): string {
  return `${w} x ${h} px`;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<DemoTemplate | null>(null);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
      } else {
        router.push('/auth/login');
      }
    }
  }, [router]);

  const filteredTemplates = useMemo(() => {
    let result = [...DEMO_TEMPLATES];
    if (activeCategory !== 'All') {
      result = result.filter((t) => t.category === activeCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term)
      );
    }
    return result;
  }, [activeCategory, searchTerm]);

  const handleUseTemplate = () => {
    if (!projectName.trim()) return;
    const designId = `demo-design-${Date.now()}`;
    router.push(`/design/${designId}/editor`);
  };

  const handleOpenModal = (template: DemoTemplate) => {
    setSelectedTemplate(template);
    setProjectName(`${template.name} - Untitled`);
  };

  const handleCloseModal = () => {
    setSelectedTemplate(null);
    setProjectName('');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_mode');
    }
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="glass border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/CorexCreative_Black.png" alt="Corex Creative" className="h-7 object-contain" />
            </Link>
            <div className="hidden sm:flex items-center gap-1 text-sm">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-smooth"
              >
                Projects
              </Link>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg font-medium">
                Templates
              </span>
              <Link
                href="/brand-kit"
                className="px-3 py-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-smooth"
              >
                Brand Kit
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                Demo Mode
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-700 transition-smooth"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 mt-2">
            Start from a pre-built template and customise it for your brand.
          </p>
        </div>

        {/* Search & Category Filters */}
        <div className="mb-8 space-y-4 animate-fade-in stagger-1">
          {/* Search */}
          <div className="relative max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm bg-white hover:border-gray-300"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTemplates.map((template, i) => (
            <li key={template.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 12)} list-none`}>
              <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-gray-200 p-2">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <button
                  onClick={() => handleOpenModal(template)}
                  className="relative flex h-full w-full flex-col rounded-xl border-[0.75px] border-gray-100 bg-white shadow-sm overflow-hidden group cursor-pointer text-left hover:shadow-lg transition-smooth"
                >
                  {/* Preview */}
                  <div
                    className="w-full h-40 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${template.gradientFrom}, ${template.gradientTo})`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-lg shadow-lg">
                        Use Template
                      </span>
                    </div>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 left-4 w-16 h-3 bg-white/60 rounded" />
                      <div className="absolute top-10 left-4 w-24 h-2 bg-white/40 rounded" />
                      <div className="absolute top-14 left-4 w-20 h-2 bg-white/30 rounded" />
                      <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-white/40 rounded-lg" />
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 transition-smooth mb-2">
                      {template.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatDimensions(template.width, template.height)}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[template.category]}`}
                      >
                        {template.category}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </li>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No templates found</h3>
            <p className="text-gray-500 mt-1 text-sm">
              Try a different search term or category filter.
            </p>
          </div>
        )}
      </div>

      {/* Use Template Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-8 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Use this template</h2>
            <p className="text-gray-500 text-sm mb-6">
              Create a new design from{' '}
              <span className="font-medium text-gray-700">{selectedTemplate.name}</span>{' '}
              ({formatDimensions(selectedTemplate.width, selectedTemplate.height)})
            </p>

            {/* Template Preview */}
            <div
              className="w-full h-32 rounded-xl mb-6 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${selectedTemplate.gradientFrom}, ${selectedTemplate.gradientTo})`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/60 text-xs font-medium tracking-wide uppercase">
                  {selectedTemplate.category}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300"
                placeholder="e.g., My Instagram Post"
                maxLength={200}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUseTemplate();
                }}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-smooth text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUseTemplate}
                disabled={!projectName.trim()}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-smooth text-sm"
              >
                Create Design
              </button>
            </div>
          </div>
        </div>
      )}
      <AIChatBot context="templates" />
    </div>
  );
}
