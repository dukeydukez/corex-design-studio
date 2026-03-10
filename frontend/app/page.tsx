'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const FEATURES = [
  {
    title: '12 AI Agents',
    description: 'From creative direction to SEO optimization, each agent handles a specialized design task.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    title: 'Canvas Editor',
    description: 'Drag-and-drop design canvas with text, shapes, images, layers, and real-time properties panel.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    title: 'Multi-Format Export',
    description: 'Export to PNG, JPG, PDF, SVG, MP4, and WebM with quality controls and batch processing.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    title: 'Platform-Native Sizes',
    description: 'Instagram, TikTok, LinkedIn, YouTube, Pinterest, Facebook, email, and web presets built in.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
  {
    title: 'Brand Kit System',
    description: 'Store colour palettes, font sets, logos, and brand voice guidelines for consistent output.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
      </svg>
    ),
  },
  {
    title: 'Real-Time Collaboration',
    description: 'WebSocket-powered live updates, agent execution status, and export progress tracking.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
] as const;

const AGENT_PIPELINE = [
  {
    name: 'Creative Director',
    category: 'Strategy',
    description: 'Analyses design briefs and generates creative direction, mood boards, colour palettes, font recommendations, and brand positioning strategy.',
    capabilities: ['Brand strategy', 'Mood & aesthetic direction', 'Colour palette generation', 'Font pairing', 'Competitive differentiation'],
  },
  {
    name: 'Design Generator',
    category: 'Generation',
    description: 'Takes creative direction and generates visual design concepts, layout structures, and design element compositions.',
    capabilities: ['Layout generation', 'Visual composition', 'Element placement', 'Design system creation', 'Responsive variants'],
  },
  {
    name: 'Copy Writer',
    category: 'Generation',
    description: 'Creates persuasive, on-brand copy for headlines, CTAs, body text, and taglines tailored to the design context.',
    capabilities: ['Headline writing', 'CTA optimization', 'Body copy', 'Tagline creation', 'Tone matching'],
  },
  {
    name: 'Layout Optimizer',
    category: 'Optimization',
    description: 'Analyses visual balance, optimizes white space, improves hierarchy, and applies grid-based composition principles.',
    capabilities: ['Visual balance', 'White space optimization', 'Grid alignment', 'Focal point analysis', 'Spacing harmony'],
  },
  {
    name: 'Design Refiner',
    category: 'Optimization',
    description: 'Reviews design outputs for pixel-perfect quality, consistency, and production-readiness across all elements.',
    capabilities: ['Quality scoring', 'Consistency checks', 'Polish suggestions', 'Brand compliance', 'Production readiness'],
  },
  {
    name: 'Video Adapter',
    category: 'Adaptation',
    description: 'Adapts static designs for video formats with scene breakdowns, motion graphics, transitions, and audio pairing.',
    capabilities: ['Scene planning', 'Motion graphics', 'Audio pairing', 'Platform specs', 'Storyboarding'],
  },
  {
    name: 'Blog Adapter',
    category: 'Adaptation',
    description: 'Converts designs into blog-optimized assets with featured images, content outlines, and SEO-ready formatting.',
    capabilities: ['Featured images', 'Content outlines', 'Image optimization', 'CTA placement', 'Distribution strategy'],
  },
  {
    name: 'Social Adapter',
    category: 'Adaptation',
    description: 'Adapts designs for every social platform with native dimensions, hashtag strategy, and posting guidance.',
    capabilities: ['Platform sizing', 'Hashtag strategy', 'Content calendar', 'Engagement optimization', 'Cross-platform consistency'],
  },
  {
    name: 'A/B Testing',
    category: 'Analysis',
    description: 'Generates scientifically rigorous design variations for split testing with clear hypotheses and success criteria.',
    capabilities: ['Variation design', 'Hypothesis generation', 'Sample sizing', 'Metric selection', 'Statistical guidance'],
  },
  {
    name: 'Analytics',
    category: 'Analysis',
    description: 'Analyses design performance against benchmarks, identifies gaps, and recommends data-driven optimizations.',
    capabilities: ['Performance scoring', 'Benchmark analysis', 'Gap identification', 'Quick wins', 'Action planning'],
  },
  {
    name: 'Accessibility',
    category: 'Analysis',
    description: 'Audits designs for WCAG 2.1 compliance including colour contrast, keyboard navigation, and screen reader support.',
    capabilities: ['WCAG compliance', 'Contrast analysis', 'Keyboard nav', 'Screen reader', 'Remediation plans'],
  },
  {
    name: 'SEO Optimizer',
    category: 'Analysis',
    description: 'Optimizes designs for search visibility with keyword strategy, schema markup, and structured data recommendations.',
    capabilities: ['Keyword strategy', 'Meta optimization', 'Schema markup', 'Image SEO', 'Structured data'],
  },
] as const;

const CATEGORY_COLOURS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Strategy: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', glow: 'hover:shadow-purple-100' },
  Generation: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', glow: 'hover:shadow-blue-100' },
  Optimization: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', glow: 'hover:shadow-amber-100' },
  Adaptation: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', glow: 'hover:shadow-emerald-100' },
  Analysis: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', glow: 'hover:shadow-rose-100' },
};

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Nav */}
      <nav className="border-b border-gray-100 glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/CorexCreative_Black.png" alt="Corex Creative" className="h-8 object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-smooth"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-smooth"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-24 text-center relative">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10">
          <div className="animate-fade-in inline-block px-4 py-1.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full mb-8 border border-orange-100">
            12 AI Agents Working Together
          </div>
          <h1 className="animate-fade-in-up text-5xl sm:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Design at the
            <br />
            <span className="text-gradient">speed of strategy</span>
          </h1>
          <p className="animate-fade-in-up stagger-2 text-lg text-gray-500 mt-8 max-w-xl mx-auto leading-relaxed">
            An AI-powered design platform where 12 specialized agents collaborate to produce
            on-brand creative assets across every platform.
          </p>
          <div className="animate-fade-in-up stagger-3 flex items-center justify-center gap-4 mt-12">
            <Link
              href="/dashboard"
              className="group px-8 py-3.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-smooth text-sm shadow-lg shadow-gray-900/10"
            >
              Start Creating
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:scale-[1.02] active:scale-[0.98] transition-smooth text-sm"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Canvas Preview */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="animate-fade-in-up stagger-4 bg-gradient-to-b from-gray-50 to-gray-100/50 border border-gray-200 rounded-2xl p-8 relative overflow-hidden shadow-xl shadow-gray-200/50">
          <div className="flex gap-4">
            <div className="w-48 space-y-2 hidden sm:block animate-slide-in-left">
              <div className="bg-white/80 rounded-xl p-3 border border-gray-200/60 backdrop-blur-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-3 tracking-wider">Layers</div>
                {['Headline', 'Background', 'Logo', 'CTA Button'].map((name, i) => (
                  <div key={name} className={`text-sm text-gray-700 py-1.5 px-2.5 rounded-lg hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-smooth ${i === 0 ? 'bg-orange-50 text-orange-700 font-medium' : ''}`}>
                    {name}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-white rounded-xl border border-gray-200 aspect-video flex items-center justify-center relative shadow-inner">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl mx-auto shadow-lg shadow-orange-200/50 animate-float" />
                <div className="h-4 w-48 bg-gray-200 rounded-full mx-auto" />
                <div className="h-3 w-32 bg-gray-100 rounded-full mx-auto" />
                <div className="h-9 w-28 bg-orange-500 rounded-lg mx-auto mt-4 shadow-md shadow-orange-200/50" />
              </div>
              <div className="absolute top-1/4 left-1/4 w-48 h-20 border-2 border-orange-500 rounded-lg pointer-events-none">
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full" />
              </div>
            </div>
            <div className="w-48 hidden md:block animate-slide-in-right">
              <div className="bg-white/80 rounded-xl p-3 border border-gray-200/60 space-y-3 backdrop-blur-sm">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Properties</div>
                <div>
                  <div className="text-xs text-gray-400 mb-1.5">Position</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-mono">X: 120</div>
                    <div className="bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-mono">Y: 80</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1.5">Fill</div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-500 rounded-lg border border-gray-200 shadow-sm" />
                    <span className="text-xs text-gray-700 font-mono">#F97316</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything you need to ship creative</h2>
          <p className="text-gray-500 mt-4 text-lg">Production-grade tools backed by intelligent automation.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <li
              key={feature.title}
              className={`animate-fade-in-up stagger-${i + 1} list-none min-h-[12rem]`}
            >
              <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-gray-200 p-2">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <div className="relative flex h-full flex-col gap-4 rounded-xl border-[0.75px] border-gray-100 bg-white p-6 shadow-sm group cursor-default">
                  <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition-smooth group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </div>
      </section>

      {/* Agent Pipeline */}
      <section className="bg-gradient-to-b from-gray-50 to-white border-y border-gray-100 relative">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">The Agent Pipeline</h2>
            <p className="text-gray-500 mt-4 text-lg">
              12 specialized agents, each handling a distinct phase. Click to explore.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {AGENT_PIPELINE.map((agent, i) => {
              const colors = CATEGORY_COLOURS[agent.category];
              const isSelected = selectedAgent === i;

              return (
                <button
                  key={agent.name}
                  onClick={() => setSelectedAgent(isSelected ? null : i)}
                  className={`animate-fade-in-up stagger-${i + 1} text-left bg-white border rounded-xl p-4 transition-smooth cursor-pointer ${
                    isSelected
                      ? `${colors.border} shadow-lg ring-2 ring-offset-1 ${colors.border} scale-[1.02]`
                      : `border-gray-200 hover:border-gray-300 hover:shadow-md ${colors.glow} hover:scale-[1.01]`
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-400">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                      {agent.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{agent.name}</h4>
                </button>
              );
            })}
          </div>

          {/* Agent Detail Panel */}
          {selectedAgent !== null && (
            <div className="mt-8 animate-scale-in">
              <div className={`bg-white border rounded-2xl p-8 shadow-lg ${CATEGORY_COLOURS[AGENT_PIPELINE[selectedAgent].category].border}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-400">
                        Agent {String(selectedAgent + 1).padStart(2, '0')}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLOURS[AGENT_PIPELINE[selectedAgent].category].bg} ${CATEGORY_COLOURS[AGENT_PIPELINE[selectedAgent].category].text}`}>
                        {AGENT_PIPELINE[selectedAgent].category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{AGENT_PIPELINE[selectedAgent].name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-smooth"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {AGENT_PIPELINE[selectedAgent].description}
                </p>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {AGENT_PIPELINE[selectedAgent].capabilities.map((cap) => (
                      <span
                        key={cap}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg ${CATEGORY_COLOURS[AGENT_PIPELINE[selectedAgent].category].bg} ${CATEGORY_COLOURS[AGENT_PIPELINE[selectedAgent].category].text}`}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-28 text-center relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-30" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Ready to build?</h2>
          <p className="text-gray-500 mt-4 max-w-md mx-auto text-lg">
            Create your first project and let the agents handle the rest.
          </p>
          <Link
            href="/dashboard"
            className="group inline-block mt-10 px-10 py-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-smooth text-sm shadow-lg shadow-gray-900/10"
          >
            Get Started Free
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <span>COREX Creative Design Studio</span>
          <span>Built by Corex Creative Inc.</span>
        </div>
      </footer>
    </main>
  );
}
