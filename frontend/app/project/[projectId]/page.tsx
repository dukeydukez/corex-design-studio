'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AIChatBot } from '../../components/AIChatBot';

interface DemoProject {
  id: string;
  name: string;
  description: string;
  designCount: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface DemoDesign {
  id: string;
  name: string;
  format: string;
  dimensions: string;
  status: 'draft' | 'saved' | 'published';
  updatedAt: string;
  gradient: string;
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

const GRADIENTS = [
  'from-orange-400 via-amber-400 to-yellow-300',
  'from-violet-500 via-purple-400 to-fuchsia-400',
  'from-cyan-400 via-sky-400 to-blue-500',
  'from-emerald-400 via-green-400 to-teal-400',
  'from-rose-400 via-pink-400 to-red-400',
];

const PROJECT_DESIGNS: Record<string, DemoDesign[]> = {
  'proj-1': [
    { id: 'des-1a', name: 'Logo Primary Variant', format: 'Custom', dimensions: '2000x2000', status: 'published', updatedAt: '2026-03-10T14:00:00Z', gradient: GRADIENTS[0] },
    { id: 'des-1b', name: 'Brand Colour Palette', format: 'Instagram Post', dimensions: '1080x1080', status: 'published', updatedAt: '2026-03-09T11:00:00Z', gradient: GRADIENTS[1] },
    { id: 'des-1c', name: 'Typography Showcase', format: 'LinkedIn Banner', dimensions: '1584x396', status: 'saved', updatedAt: '2026-03-08T10:00:00Z', gradient: GRADIENTS[2] },
    { id: 'des-1d', name: 'Social Template Pack', format: 'Instagram Story', dimensions: '1080x1920', status: 'draft', updatedAt: '2026-03-07T15:00:00Z', gradient: GRADIENTS[3] },
    { id: 'des-1e', name: 'Letterhead Design', format: 'Custom', dimensions: '2480x3508', status: 'draft', updatedAt: '2026-03-06T09:00:00Z', gradient: GRADIENTS[4] },
  ],
  'proj-2': [
    { id: 'des-2a', name: 'Spring Launch Carousel', format: 'Instagram Post', dimensions: '1080x1080', status: 'published', updatedAt: '2026-03-09T16:00:00Z', gradient: GRADIENTS[1] },
    { id: 'des-2b', name: 'Story Announcement', format: 'Instagram Story', dimensions: '1080x1920', status: 'saved', updatedAt: '2026-03-08T14:00:00Z', gradient: GRADIENTS[3] },
    { id: 'des-2c', name: 'LinkedIn Thought Piece', format: 'LinkedIn Banner', dimensions: '1584x396', status: 'draft', updatedAt: '2026-03-07T09:00:00Z', gradient: GRADIENTS[2] },
    { id: 'des-2d', name: 'TikTok Cover Frame', format: 'Custom', dimensions: '1080x1920', status: 'draft', updatedAt: '2026-03-05T12:00:00Z', gradient: GRADIENTS[0] },
  ],
  'proj-3': [
    { id: 'des-3a', name: 'Pitch Deck Cover', format: 'Custom', dimensions: '1920x1080', status: 'published', updatedAt: '2026-03-08T12:00:00Z', gradient: GRADIENTS[4] },
    { id: 'des-3b', name: 'One-Pager Front', format: 'Custom', dimensions: '2480x3508', status: 'saved', updatedAt: '2026-03-07T10:00:00Z', gradient: GRADIENTS[0] },
    { id: 'des-3c', name: 'Investor Summary Visual', format: 'LinkedIn Banner', dimensions: '1584x396', status: 'draft', updatedAt: '2026-03-06T08:00:00Z', gradient: GRADIENTS[2] },
  ],
  'proj-4': [
    { id: 'des-4a', name: 'Doc Series Thumbnail A', format: 'YouTube Thumbnail', dimensions: '1280x720', status: 'saved', updatedAt: '2026-02-28T10:00:00Z', gradient: GRADIENTS[0] },
    { id: 'des-4b', name: 'Doc Series Thumbnail B', format: 'YouTube Thumbnail', dimensions: '1280x720', status: 'saved', updatedAt: '2026-02-27T14:00:00Z', gradient: GRADIENTS[1] },
    { id: 'des-4c', name: 'Interview Style Thumb', format: 'YouTube Thumbnail', dimensions: '1280x720', status: 'draft', updatedAt: '2026-02-25T09:00:00Z', gradient: GRADIENTS[3] },
    { id: 'des-4d', name: 'Behind the Scenes Thumb', format: 'YouTube Thumbnail', dimensions: '1280x720', status: 'draft', updatedAt: '2026-02-22T11:00:00Z', gradient: GRADIENTS[4] },
    { id: 'des-4e', name: 'Podcast Episode Thumb', format: 'YouTube Thumbnail', dimensions: '1280x720', status: 'draft', updatedAt: '2026-02-20T16:00:00Z', gradient: GRADIENTS[2] },
  ],
  'proj-5': [
    { id: 'des-5a', name: 'Newsletter Header', format: 'Custom', dimensions: '600x200', status: 'saved', updatedAt: '2026-02-15T09:00:00Z', gradient: GRADIENTS[2] },
    { id: 'des-5b', name: 'Welcome Email Banner', format: 'Custom', dimensions: '600x300', status: 'saved', updatedAt: '2026-02-12T10:00:00Z', gradient: GRADIENTS[0] },
    { id: 'des-5c', name: 'Promo Banner CTA', format: 'Custom', dimensions: '600x250', status: 'draft', updatedAt: '2026-02-10T15:00:00Z', gradient: GRADIENTS[4] },
  ],
  'proj-6': [
    { id: 'des-6a', name: 'Event Poster Main', format: 'Custom', dimensions: '2480x3508', status: 'published', updatedAt: '2025-12-20T16:00:00Z', gradient: GRADIENTS[0] },
    { id: 'des-6b', name: 'Attendee Badge', format: 'Custom', dimensions: '638x1013', status: 'published', updatedAt: '2025-12-18T11:00:00Z', gradient: GRADIENTS[3] },
    { id: 'des-6c', name: 'Instagram Promo Post', format: 'Instagram Post', dimensions: '1080x1080', status: 'published', updatedAt: '2025-12-15T14:00:00Z', gradient: GRADIENTS[1] },
    { id: 'des-6d', name: 'Story Countdown', format: 'Instagram Story', dimensions: '1080x1920', status: 'saved', updatedAt: '2025-12-12T09:00:00Z', gradient: GRADIENTS[4] },
  ],
};

const FORMAT_OPTIONS = [
  // Instagram
  { label: 'Instagram Post', dimensions: '1080x1080', category: 'Instagram' },
  { label: 'Instagram Story', dimensions: '1080x1920', category: 'Instagram' },
  { label: 'Instagram Reel Cover', dimensions: '1080x1920', category: 'Instagram' },
  { label: 'Instagram Carousel', dimensions: '1080x1350', category: 'Instagram' },
  { label: 'Instagram Profile Pic', dimensions: '320x320', category: 'Instagram' },
  // TikTok
  { label: 'TikTok Video', dimensions: '1080x1920', category: 'TikTok' },
  { label: 'TikTok Profile Pic', dimensions: '200x200', category: 'TikTok' },
  // Facebook
  { label: 'Facebook Post', dimensions: '1200x630', category: 'Facebook' },
  { label: 'Facebook Cover', dimensions: '820x312', category: 'Facebook' },
  { label: 'Facebook Story', dimensions: '1080x1920', category: 'Facebook' },
  { label: 'Facebook Ad', dimensions: '1200x628', category: 'Facebook' },
  // YouTube
  { label: 'YouTube Thumbnail', dimensions: '1280x720', category: 'YouTube' },
  { label: 'YouTube Banner', dimensions: '2560x1440', category: 'YouTube' },
  { label: 'YouTube Shorts', dimensions: '1080x1920', category: 'YouTube' },
  // LinkedIn
  { label: 'LinkedIn Post', dimensions: '1200x1200', category: 'LinkedIn' },
  { label: 'LinkedIn Banner', dimensions: '1584x396', category: 'LinkedIn' },
  { label: 'LinkedIn Story', dimensions: '1080x1920', category: 'LinkedIn' },
  // Twitter / X
  { label: 'Twitter Post', dimensions: '1600x900', category: 'Twitter / X' },
  { label: 'Twitter Header', dimensions: '1500x500', category: 'Twitter / X' },
  // Pinterest
  { label: 'Pinterest Pin', dimensions: '1000x1500', category: 'Pinterest' },
  { label: 'Pinterest Long Pin', dimensions: '1000x2100', category: 'Pinterest' },
  // Print
  { label: 'Business Card', dimensions: '1050x600', category: 'Print' },
  { label: 'A4 Document', dimensions: '2480x3508', category: 'Print' },
  { label: 'Letter Document', dimensions: '2550x3300', category: 'Print' },
  { label: 'Poster 24x36', dimensions: '7200x10800', category: 'Print' },
  // Presentation
  { label: 'Presentation 16:9', dimensions: '1920x1080', category: 'Presentation' },
  { label: 'Presentation 4:3', dimensions: '1024x768', category: 'Presentation' },
  // Email
  { label: 'Email Header', dimensions: '600x200', category: 'Email' },
  { label: 'Email Banner', dimensions: '600x300', category: 'Email' },
  // Custom
  { label: 'Custom', dimensions: '', category: 'Custom' },
];

const AGENT_PIPELINE = [
  {
    id: 'creative-director',
    name: 'Creative Director',
    category: 'Strategy',
    description: 'Analyses briefs and generates creative direction, mood boards, colour palettes, font recommendations, and brand positioning.',
    capabilities: ['Brand strategy', 'Mood boards', 'Colour palettes', 'Font pairing', 'Competitive differentiation'],
    icon: '🎯',
    action: 'Get Creative Direction',
  },
  {
    id: 'design-generator',
    name: 'Design Generator',
    category: 'Generation',
    description: 'Takes creative direction and generates visual design concepts, layouts, and element compositions.',
    capabilities: ['Layout generation', 'Visual composition', 'Element placement', 'Design systems', 'Responsive variants'],
    icon: '🎨',
    action: 'Generate Design',
  },
  {
    id: 'copy-writer',
    name: 'Copy Writer',
    category: 'Generation',
    description: 'Creates persuasive, on-brand copy for headlines, CTAs, body text, and taglines.',
    capabilities: ['Headline writing', 'CTA optimization', 'Body copy', 'Tagline creation', 'Tone matching'],
    icon: '✍️',
    action: 'Write Copy',
  },
  {
    id: 'layout-optimizer',
    name: 'Layout Optimizer',
    category: 'Optimization',
    description: 'Analyses visual balance, optimizes white space, improves hierarchy, and applies grid-based principles.',
    capabilities: ['Visual balance', 'White space', 'Grid alignment', 'Focal points', 'Spacing harmony'],
    icon: '📐',
    action: 'Optimize Layout',
  },
  {
    id: 'design-refiner',
    name: 'Design Refiner',
    category: 'Optimization',
    description: 'Reviews outputs for pixel-perfect quality, consistency, and production-readiness.',
    capabilities: ['Quality scoring', 'Consistency checks', 'Polish suggestions', 'Brand compliance', 'Production readiness'],
    icon: '✨',
    action: 'Refine Design',
  },
  {
    id: 'video-adapter',
    name: 'Video Adapter',
    category: 'Adaptation',
    description: 'Adapts static designs for video with scene breakdowns, motion graphics, and transitions.',
    capabilities: ['Scene planning', 'Motion graphics', 'Audio pairing', 'Platform specs', 'Storyboarding'],
    icon: '🎬',
    action: 'Adapt for Video',
  },
  {
    id: 'blog-adapter',
    name: 'Blog Adapter',
    category: 'Adaptation',
    description: 'Converts designs into blog-optimized assets with featured images and content outlines.',
    capabilities: ['Featured images', 'Content outlines', 'Image optimization', 'CTA placement', 'Distribution'],
    icon: '📝',
    action: 'Adapt for Blog',
  },
  {
    id: 'social-adapter',
    name: 'Social Adapter',
    category: 'Adaptation',
    description: 'Adapts designs for every social platform with native dimensions and hashtag strategy.',
    capabilities: ['Platform sizing', 'Hashtag strategy', 'Content calendar', 'Engagement optimization', 'Cross-platform'],
    icon: '📱',
    action: 'Adapt for Social',
  },
  {
    id: 'ab-testing',
    name: 'A/B Testing',
    category: 'Analysis',
    description: 'Generates design variations for split testing with hypotheses and success criteria.',
    capabilities: ['Variation design', 'Hypothesis generation', 'Sample sizing', 'Metric selection', 'Statistical guidance'],
    icon: '🧪',
    action: 'Create A/B Test',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    category: 'Analysis',
    description: 'Analyses design performance against benchmarks and recommends data-driven optimizations.',
    capabilities: ['Performance scoring', 'Benchmark analysis', 'Gap identification', 'Quick wins', 'Action planning'],
    icon: '📊',
    action: 'Analyse Performance',
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    category: 'Analysis',
    description: 'Audits designs for WCAG 2.1 compliance including contrast, keyboard nav, and screen readers.',
    capabilities: ['WCAG compliance', 'Contrast analysis', 'Keyboard nav', 'Screen reader', 'Remediation'],
    icon: '♿',
    action: 'Run Accessibility Audit',
  },
  {
    id: 'seo-optimizer',
    name: 'SEO Optimizer',
    category: 'Analysis',
    description: 'Optimizes designs for search visibility with keyword strategy and structured data.',
    capabilities: ['Keyword strategy', 'Meta optimization', 'Schema markup', 'Image SEO', 'Structured data'],
    icon: '🔍',
    action: 'Optimize for SEO',
  },
] as const;

const AGENT_CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Strategy: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Generation: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Optimization: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Adaptation: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Analysis: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

const DESIGN_STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  saved: 'bg-sky-50 text-sky-700 border-sky-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const PROJECT_STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-gray-50 text-gray-500 border-gray-200',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date-newest' | 'date-oldest' | 'name'>('date-newest');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'saved' | 'published'>('all');
  const [designs, setDesigns] = useState<DemoDesign[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDesignName, setNewDesignName] = useState('');
  const [newDesignFormat, setNewDesignFormat] = useState('Instagram Post');
  const [customWidth, setCustomWidth] = useState('1080');
  const [customHeight, setCustomHeight] = useState('1080');
  const [project, setProject] = useState<DemoProject | null>(null);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'designs' | 'agents'>('designs');
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENT_PIPELINE[number] | null>(null);
  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);
  const [selectedStartAgent, setSelectedStartAgent] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
      } else {
        router.push('/auth/login');
      }
      // Check hardcoded projects first, then localStorage
      let found = DEMO_PROJECTS.find((p) => p.id === projectId) || null;
      if (!found) {
        const saved = localStorage.getItem('demo_projects');
        if (saved) {
          try {
            const savedProjects: DemoProject[] = JSON.parse(saved);
            found = savedProjects.find((p) => p.id === projectId) || null;
          } catch { /* ignore */ }
        }
      }
      setProject(found);
      setProjectLoaded(true);
    }
  }, [router, projectId]);

  useEffect(() => {
    if (projectId && PROJECT_DESIGNS[projectId]) {
      setDesigns(PROJECT_DESIGNS[projectId]);
    }
  }, [projectId]);

  const selectedFormat = FORMAT_OPTIONS.find((f) => f.label === newDesignFormat);
  const displayDimensions =
    newDesignFormat === 'Custom'
      ? `${customWidth || '0'}x${customHeight || '0'}`
      : selectedFormat?.dimensions ?? '';

  const filteredDesigns = useMemo(() => {
    let result = [...designs];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.format.toLowerCase().includes(term)
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter((d) => d.status === filterStatus);
    }
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date-oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return result;
  }, [designs, searchTerm, sortBy, filterStatus]);

  const handleCreateDesign = () => {
    if (!newDesignName.trim()) return;
    const newDesign: DemoDesign = {
      id: `des-new-${Date.now()}`,
      name: newDesignName,
      format: newDesignFormat,
      dimensions: displayDimensions,
      status: 'draft',
      updatedAt: new Date().toISOString(),
      gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
    };
    setDesigns((prev) => [newDesign, ...prev]);
    setNewDesignName('');
    setNewDesignFormat('Instagram Post');
    setCustomWidth('1080');
    setCustomHeight('1080');
    setShowCreateModal(false);
    const [w, h] = displayDimensions.split('x');
    const agentParam = selectedStartAgent ? `&agent=${selectedStartAgent}` : '';
    router.push(`/design/${newDesign.id}/editor?w=${w}&h=${h}${agentParam}`);
  };

  const handleRunAgent = () => {
    if (!selectedAgent || !agentPrompt.trim()) return;
    setAgentRunning(true);
    setAgentOutput(null);

    // Simulate agent processing with contextual output
    const agentResponses: Record<string, (prompt: string) => string> = {
      'creative-director': (p) => `Creative Direction for "${p}":\n\nMood & Aesthetic: Clean, modern, bold with cinematic depth. Think dark backgrounds with vibrant accent colours that pop.\n\nColour Palette:\n• Primary: #E8501C (Corex Orange) for energy and action\n• Secondary: #1A1A2E (Deep Navy) for sophistication\n• Accent: #F7941D (Warm Amber) for highlights\n• Neutral: #F5F5F5 (Soft White) for breathing room\n\nFont Pairing:\n• Headlines: Satoshi Bold (geometric, modern)\n• Body: Inter Regular (clean, readable)\n\nBrand Positioning: Lead with confidence and visual storytelling. Every element should feel intentional, cinematic, and premium.\n\nNext Steps: Use these guidelines with the Design Generator agent to produce layout concepts.`,
      'design-generator': (p) => `Design Concept for "${p}":\n\nLayout Structure:\n• Hero section with full-bleed background image\n• Bold headline (60pt) centred with -2% letter spacing\n• Subtitle text at 40% opacity below the headline\n• CTA button: rounded rectangle, orange fill, white text\n• Bottom bar with logo lockup and social handles\n\nElement Composition:\n• Background: gradient overlay from #1A1A2E (80%) to transparent\n• Text hierarchy: 3 levels (headline, subtitle, CTA)\n• Focal point: centre-weighted with golden ratio spacing\n• Margin: 60px on all sides for breathing room\n\nRecommended Format: Instagram Post (1080x1080) or Story (1080x1920)\n\nTip: Open the editor, select your format, and use these specs to build your layout. The Layout Optimizer can refine it further.`,
      'copy-writer': (p) => `Copy Options for "${p}":\n\nHeadline Options:\n1. "Built Different. By Design."\n2. "Where Vision Meets Execution"\n3. "Your Story. Our Craft."\n\nSubheadline:\n"Strategic brand storytelling that drives measurable results."\n\nBody Copy:\n"We don\'t just create content, we build systems. Every frame, every word, every pixel is designed to move your audience from awareness to action. This is cinematic brand storytelling, engineered for growth."\n\nCTA Options:\n• "Start Your Project" (action-oriented)\n• "See the Work" (curiosity-driven)\n• "Let\'s Talk" (relationship-first)\n\nHashtags: #BrandStorytelling #CreativeStrategy #VisualIdentity #ContentThatConverts`,
      'layout-optimizer': (p) => `Layout Analysis for "${p}":\n\nBalance Score: 7.2/10\n\nImprovements:\n1. White Space: Increase top margin by 20px for better breathing room\n2. Grid Alignment: Shift headline 8px left to align with the 12-column grid\n3. Focal Point: Move CTA button up by 15% to enter the golden ratio zone\n4. Spacing Harmony: Reduce gap between subtitle and CTA from 40px to 28px for tighter visual flow\n5. Typography Scale: Increase body text from 14px to 16px for better readability\n\nAfter Optimization Score: 9.1/10\n\nApply these changes in the editor using the properties panel sliders.`,
      'design-refiner': (p) => `Quality Review for "${p}":\n\nOverall Score: 8.4/10\n\nChecklist:\n✅ Visual hierarchy is clear and intentional\n✅ Colour contrast passes WCAG AA\n✅ Typography is consistent across elements\n⚠️ Logo could be 10% larger for brand presence\n⚠️ CTA button padding should be 16px 32px (currently 12px 24px)\n❌ Bottom margin is inconsistent (60px left, 48px right)\n\nPolish Suggestions:\n1. Add subtle drop shadow to CTA button (0 4px 12px rgba(0,0,0,0.15))\n2. Apply 1px border to cards for definition\n3. Ensure all text has anti-aliasing enabled\n\nProduction Readiness: 92% (fix bottom margin alignment to hit 100%)`,
      'video-adapter': (p) => `Video Adaptation Plan for "${p}":\n\nScene Breakdown:\n• Scene 1 (0-3s): Logo reveal with zoom animation\n• Scene 2 (3-6s): Headline text appears with typewriter effect\n• Scene 3 (6-9s): Supporting visuals slide in from edges\n• Scene 4 (9-12s): CTA with pulse animation\n• Scene 5 (12-15s): End card with contact info\n\nMotion Graphics:\n• Transitions: Smooth crossfades (0.5s duration)\n• Text animations: Fade up with 20px offset\n• Background: Subtle parallax movement\n\nAudio: Ambient, modern, cinematic underscore (royalty-free)\n\nPlatform Specs:\n• Instagram Reels: 1080x1920, 15s, vertical\n• TikTok: 1080x1920, 15s, vertical\n• YouTube Shorts: 1080x1920, 15s, vertical`,
      'blog-adapter': (p) => `Blog Adaptation for "${p}":\n\nFeatured Image: Resize hero design to 1200x630 (Open Graph format)\n\nContent Outline:\n1. Hook: Open with the problem your audience faces\n2. Context: Why this matters now (industry trends, data)\n3. Solution: Your approach and unique value\n4. Proof: Case study, testimonial, or results\n5. CTA: Clear next step for the reader\n\nImage Optimization:\n• Featured image: WebP format, max 200KB\n• In-article images: 800px wide, lazy loaded\n• Alt text: Descriptive, keyword-rich\n\nSEO Notes:\n• Target keyword in H1 and first 100 words\n• Internal links to related content\n• Meta description under 155 characters`,
      'social-adapter': (p) => `Social Media Adaptation for "${p}":\n\nInstagram:\n• Post (1080x1080): Static hero image with text overlay\n• Story (1080x1920): Vertical adaptation with swipe-up CTA\n• Carousel (1080x1350): 3-5 slides breaking down key points\n\nLinkedIn:\n• Post (1200x1200): Professional tone, longer caption\n• Article header (1200x628): Clean, minimal design\n\nTikTok/Reels:\n• Cover frame (1080x1920): Bold text, eye-catching visual\n\nHashtag Strategy:\n• Primary: #BrandStorytelling #CreativeDirection\n• Secondary: #DesignThinking #VisualIdentity\n• Niche: #TorontoCreatives #FilmmakerLife\n\nPosting Schedule:\n• Best times: Tue/Thu 10am, Wed 2pm (EST)\n• Frequency: 3-5 posts per week across platforms`,
      'ab-testing': (p) => `A/B Test Plan for "${p}":\n\nVariation A (Control): Current design as-is\nVariation B: Swap headline font to DM Sans Bold\nVariation C: Change CTA colour from orange to white with orange border\n\nHypothesis: Variation B will increase readability by 15% based on sans-serif preference in digital contexts.\n\nMetrics to Track:\n• Click-through rate (primary)\n• Time on page (secondary)\n• Scroll depth (tertiary)\n\nSample Size: 1,000 impressions per variation\nDuration: 7 days minimum\nStatistical Significance: 95% confidence level\n\nExpected Outcome: 10-20% improvement in CTR with cleaner typography.`,
      'analytics': (p) => `Performance Analysis for "${p}":\n\nDesign Score: 7.8/10\n\nBenchmark Comparison:\n• Visual appeal: 8.2/10 (above average)\n• Text readability: 7.5/10 (average)\n• CTA visibility: 6.8/10 (below average, needs improvement)\n• Brand consistency: 9.0/10 (excellent)\n\nGap Analysis:\n1. CTA needs more visual weight (larger size, higher contrast)\n2. Information hierarchy could be stronger (reduce competing elements)\n3. Mobile rendering needs testing at smaller breakpoints\n\nQuick Wins:\n• Increase CTA size by 20%\n• Add white space around key elements\n• Test with 3 different headline options\n\nProjected Impact: +25% engagement with recommended changes.`,
      'accessibility': (p) => `Accessibility Audit for "${p}":\n\nWCAG 2.1 Compliance: Level AA (Partial)\n\nContrast Analysis:\n✅ Headline on dark background: 12.4:1 (passes AAA)\n✅ Body text on white: 7.2:1 (passes AAA)\n⚠️ Subtitle text at 40% opacity: 3.8:1 (fails AA, needs 4.5:1)\n❌ Light grey caption text: 2.9:1 (fails AA)\n\nRemediation:\n1. Increase subtitle opacity to 60% minimum\n2. Darken caption text from #999 to #666\n3. Add focus indicators for all interactive elements\n4. Ensure all images have meaningful alt text\n5. Test keyboard navigation flow\n\nScreen Reader: Add aria-labels to icon-only buttons\nMotion: Provide prefers-reduced-motion alternatives`,
      'seo-optimizer': (p) => `SEO Optimization for "${p}":\n\nKeyword Strategy:\n• Primary: "brand storytelling agency Toronto"\n• Secondary: "cinematic content production", "creative direction services"\n• Long-tail: "documentary marketing for founders"\n\nMeta Optimization:\n• Title: "${p} | Corex Creative" (under 60 chars)\n• Description: "Strategic brand storytelling that drives results. Cinematic content production for founders and thought leaders." (under 155 chars)\n\nSchema Markup: Organization + CreativeWork\n\nImage SEO:\n• File naming: descriptive-keyword-rich-name.webp\n• Alt text: Include primary keyword naturally\n• Lazy loading: Enable for all below-fold images\n\nStructured Data: Add FAQ schema if applicable`,
    };

    setTimeout(() => {
      const handler = agentResponses[selectedAgent.id];
      const output = handler ? handler(agentPrompt) : `Agent "${selectedAgent.name}" processed your request: "${agentPrompt}"\n\nResults will appear here when the backend integration is complete. The agent pipeline is ready for full API connectivity.`;
      setAgentOutput(output);
      setAgentRunning(false);
    }, 1500 + Math.random() * 1500);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_mode');
    }
    router.push('/');
  };

  if (!user || !projectLoaded) return null;

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h1>
          <p className="text-gray-500 mb-6 text-sm">The project you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-smooth font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
              <Link href="/dashboard" className="px-3 py-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-smooth">Projects</Link>
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
        {/* Project Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link
                href="/dashboard"
                className="mt-1.5 w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:shadow-sm transition-smooth shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${PROJECT_STATUS_STYLES[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-500 mt-1 max-w-2xl">{project.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>Created {new Date(project.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>Updated {new Date(project.updatedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-smooth font-medium flex items-center gap-2 text-sm shadow-lg shadow-gray-900/10 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Design
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6 flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit animate-fade-in">
          <button
            onClick={() => setActiveTab('designs')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-smooth ${
              activeTab === 'designs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Designs ({filteredDesigns.length})
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-smooth flex items-center gap-2 ${
              activeTab === 'agents' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            AI Agents (12)
          </button>
        </div>

        {activeTab === 'designs' && (
          <>
            {/* Search & Filters */}
            <div className="mb-8 flex gap-3 flex-wrap animate-fade-in stagger-1">
              <div className="flex-1 min-w-[200px] relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search designs..."
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
                <option value="date-newest">Newest</option>
                <option value="date-oldest">Oldest</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-smooth text-sm bg-white hover:border-gray-300 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="saved">Saved</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Designs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDesigns.map((design, i) => (
                <Link
                  key={design.id}
                  href={`/design/${design.id}/editor?w=${design.dimensions.split('x')[0]}&h=${design.dimensions.split('x')[1]}`}
                  className={`animate-fade-in-up stagger-${Math.min(i + 1, 12)} group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-gray-100/80 hover:border-gray-300 hover:scale-[1.01] transition-smooth cursor-pointer`}
                >
                  <div className={`h-40 bg-gradient-to-br ${design.gradient} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth bg-black/20 backdrop-blur-[2px]">
                      <span className="px-4 py-2 bg-white/90 rounded-lg text-sm font-medium text-gray-900 shadow-lg">
                        Open in Editor
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DESIGN_STATUS_STYLES[design.status]}`}>
                        {design.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 transition-smooth line-clamp-1 mb-1.5">
                      {design.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                      {design.format} &middot; {design.dimensions}
                    </p>
                    <div className="text-xs text-gray-400">
                      Updated {new Date(design.updatedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {filteredDesigns.length === 0 && (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No designs found</h3>
                <p className="text-gray-500 mt-1 text-sm">Try a different search term or create a new design.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-smooth font-medium text-sm inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Design
                </button>
              </div>
            )}
          </>
        )}

        {/* AI Agents Tab */}
        {activeTab === 'agents' && (
          <div className="animate-fade-in">
            <p className="text-gray-500 text-sm mb-6">Select an agent to help with your project. Each agent specializes in a different aspect of the creative process.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {AGENT_PIPELINE.map((agent, i) => {
                const styles = AGENT_CATEGORY_STYLES[agent.category];
                const isSelected = selectedAgent?.id === agent.id;

                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(isSelected ? null : agent);
                      setAgentOutput(null);
                      setAgentPrompt('');
                    }}
                    className={`animate-fade-in-up stagger-${Math.min(i + 1, 12)} text-left bg-white border rounded-2xl p-5 transition-smooth cursor-pointer ${
                      isSelected
                        ? `${styles.border} shadow-lg ring-2 ring-offset-1 ${styles.border} scale-[1.01]`
                        : `border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-[1.01]`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{agent.icon}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles.bg} ${styles.text}`}>
                        {agent.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{agent.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{agent.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {agent.capabilities.slice(0, 3).map((cap) => (
                        <span key={cap} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
                          {cap}
                        </span>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-400">
                          +{agent.capabilities.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Agent Interaction Panel */}
            {selectedAgent && (
              <div className={`animate-scale-in bg-white border rounded-2xl p-6 shadow-lg ${AGENT_CATEGORY_STYLES[selectedAgent.category].border}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{selectedAgent.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedAgent.name}</h3>
                    <p className="text-xs text-gray-500">{selectedAgent.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {selectedAgent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg ${AGENT_CATEGORY_STYLES[selectedAgent.category].bg} ${AGENT_CATEGORY_STYLES[selectedAgent.category].text}`}
                    >
                      {cap}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Tell the {selectedAgent.name} what you need
                  </label>
                  <textarea
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                    placeholder={`e.g., "I need ${
                      selectedAgent.id === 'creative-director' ? 'creative direction for a luxury fitness brand launch campaign' :
                      selectedAgent.id === 'copy-writer' ? 'punchy headlines for a product launch Instagram carousel' :
                      selectedAgent.id === 'seo-optimizer' ? 'SEO optimization for my brand storytelling agency website' :
                      selectedAgent.id === 'social-adapter' ? 'my latest campaign adapted for Instagram, LinkedIn, and TikTok' :
                      `help with ${selectedAgent.name.toLowerCase()} for my project`
                    }"`}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleRunAgent}
                    disabled={!agentPrompt.trim() || agentRunning}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-smooth text-sm flex items-center gap-2"
                  >
                    {agentRunning ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Running {selectedAgent.name}...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {selectedAgent.action}
                      </>
                    )}
                  </button>
                </div>

                {/* Agent Output */}
                {agentOutput && (
                  <div className="mt-5 bg-gray-50 border border-gray-100 rounded-xl p-5 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{selectedAgent.icon}</span>
                      <h4 className="text-sm font-semibold text-gray-900">{selectedAgent.name} Output</h4>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono bg-white rounded-lg p-4 border border-gray-100 max-h-[400px] overflow-y-auto">
                      {agentOutput}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          if (typeof navigator !== 'undefined') {
                            navigator.clipboard.writeText(agentOutput);
                          }
                        }}
                        className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-smooth"
                      >
                        Copy to Clipboard
                      </button>
                      <button
                        onClick={() => { setAgentPrompt(''); setAgentOutput(null); }}
                        className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-smooth"
                      >
                        Run Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Design Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-8 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create New Design</h2>
            <p className="text-gray-500 text-sm mb-6">Add a design to {project.name}.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Design Name</label>
                <input
                  type="text"
                  value={newDesignName}
                  onChange={(e) => setNewDesignName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300"
                  placeholder="e.g., Hero Banner V2"
                  maxLength={200}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Format</label>
                <select
                  value={newDesignFormat}
                  onChange={(e) => setNewDesignFormat(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300 cursor-pointer bg-white"
                >
                  {Array.from(new Set(FORMAT_OPTIONS.map((o) => o.category))).map((cat) => (
                    <optgroup key={cat} label={cat}>
                      {FORMAT_OPTIONS.filter((o) => o.category === cat).map((opt) => (
                        <option key={opt.label} value={opt.label}>
                          {opt.label}{opt.dimensions ? ` (${opt.dimensions})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start with AI Agent (optional)</label>
                <select
                  value={selectedStartAgent}
                  onChange={(e) => setSelectedStartAgent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300 cursor-pointer bg-white"
                >
                  <option value="">No agent (blank canvas)</option>
                  {AGENT_PIPELINE.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.icon} {agent.name} — {agent.category}
                    </option>
                  ))}
                </select>
                {selectedStartAgent && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {AGENT_PIPELINE.find(a => a.id === selectedStartAgent)?.description}
                  </p>
                )}
              </div>

              {newDesignFormat === 'Custom' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Dimensions (px)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300"
                      placeholder="Width"
                      min={1}
                    />
                    <span className="text-gray-400 text-sm font-medium">x</span>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300"
                      placeholder="Height"
                      min={1}
                    />
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500">Dimensions:</span>
                  <span className="text-sm font-medium text-gray-700 ml-2">{displayDimensions} px</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-smooth text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDesign}
                disabled={!newDesignName.trim()}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-smooth text-sm"
              >
                Create Design
              </button>
            </div>
          </div>
        </div>
      )}
      <AIChatBot context="dashboard" />
    </div>
  );
}
