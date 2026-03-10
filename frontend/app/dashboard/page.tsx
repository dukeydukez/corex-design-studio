'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { AIChatBot } from '../components/AIChatBot';

interface DemoProject {
  id: string;
  name: string;
  description: string;
  designCount: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

const DEMO_PROJECTS: DemoProject[] = [
  {
    id: 'proj-1',
    name: 'Corex Brand Refresh',
    description: 'Complete visual identity overhaul for 2026. Includes logo variants, colour system, typography, and social templates.',
    designCount: 12,
    status: 'active',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-10T14:30:00Z',
  },
  {
    id: 'proj-2',
    name: 'Social Campaign Q2',
    description: 'Instagram, LinkedIn, and TikTok content series for spring launch. 30+ assets across 5 formats.',
    designCount: 8,
    status: 'active',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-03-09T16:00:00Z',
  },
  {
    id: 'proj-3',
    name: 'Client: Perus Investor Deck',
    description: 'Pitch deck, one-pager, and supplementary visuals for Series A fundraising materials.',
    designCount: 5,
    status: 'active',
    createdAt: '2026-02-20T11:00:00Z',
    updatedAt: '2026-03-08T12:00:00Z',
  },
  {
    id: 'proj-4',
    name: 'YouTube Thumbnail System',
    description: 'Templated thumbnail designs for documentary-style content. A/B test variants included.',
    designCount: 15,
    status: 'draft',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-02-28T10:00:00Z',
  },
  {
    id: 'proj-5',
    name: 'Email Marketing Templates',
    description: 'Nurture sequence visuals, newsletter headers, and promotional banners. Responsive designs.',
    designCount: 6,
    status: 'draft',
    createdAt: '2026-01-25T14:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'proj-6',
    name: 'Creative Connect Event',
    description: 'Event branding for the annual Creative Connect gathering. Posters, badges, and digital assets.',
    designCount: 9,
    status: 'archived',
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-12-20T16:00:00Z',
  },
];

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-gray-50 text-gray-500 border-gray-200',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'modified' | 'name'>('modified');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [projects, setProjects] = useState<DemoProject[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('demo_projects');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* fall through */ }
      }
    }
    return DEMO_PROJECTS;
  });

  // Persist projects to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_projects', JSON.stringify(projects));
    }
  }, [projects]);

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

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'modified') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [projects, searchTerm, sortBy]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: DemoProject = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      description: newProjectDesc,
      designCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    setNewProjectName('');
    setNewProjectDesc('');
    setShowNewProject(false);
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
              <span className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg font-medium">Projects</span>
              <Link href="/templates" className="px-3 py-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-smooth">Templates</Link>
              <Link href="/brand-kit" className="px-3 py-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-smooth">Brand Kit</Link>
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
              <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-gray-700 transition-smooth">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.firstName}
            </h1>
            <p className="text-gray-500 mt-2">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-smooth font-medium flex items-center gap-2 text-sm shadow-lg shadow-gray-900/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex gap-3 flex-wrap animate-fade-in stagger-1">
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm bg-white hover:border-gray-300"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-smooth text-sm bg-white hover:border-gray-300 cursor-pointer"
          >
            <option value="modified">Recently Modified</option>
            <option value="date">Date Created</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project, i) => (
            <li key={project.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 12)} list-none`}>
              <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-gray-200 p-2">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <Link
                  href={`/project/${project.id}`}
                  className="relative flex h-full flex-col rounded-xl border-[0.75px] border-gray-100 bg-white p-6 shadow-sm group cursor-pointer hover:shadow-lg transition-smooth"
                >
                  <div className="h-1.5 w-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4 group-hover:w-24 transition-all duration-500" />
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-orange-700 transition-smooth line-clamp-1">
                      {project.name}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ml-2 ${STATUS_STYLES[project.status]}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                    <span>{project.designCount} design{project.designCount !== 1 ? 's' : ''}</span>
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </Link>
              </div>
            </li>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No projects found</h3>
            <p className="text-gray-500 mt-1 text-sm">Try a different search term or create a new project.</p>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={() => setShowNewProject(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-8 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create New Project</h2>
            <p className="text-gray-500 text-sm mb-6">Organize your designs under a project.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300"
                  placeholder="e.g., Q2 Social Campaign"
                  maxLength={200}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm resize-none hover:border-gray-300"
                  placeholder="Brief description of the project..."
                  rows={3}
                  maxLength={2000}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewProject(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-smooth text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-smooth text-sm"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
      <AIChatBot context="dashboard" />
    </div>
  );
}
