'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AIChatBot } from '../components/AIChatBot';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BrandColour {
  id: string;
  name: string;
  hex: string;
}

interface BrandFont {
  id: string;
  family: string;
  category: string;
  weights: number[];
  sampleText: string;
}

interface LogoVariant {
  id: string;
  name: string;
  description: string;
  bgClass: string;
  textColour: string;
}

interface VoiceCard {
  id: string;
  label: string;
  items: string[];
  type: 'do' | 'dont' | 'keyword';
}

type AssetType = 'colour' | 'font' | 'logo';

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_COLOURS: BrandColour[] = [
  { id: 'c1', name: 'Primary Orange', hex: '#E8501C' },
  { id: 'c2', name: 'Secondary Dark', hex: '#1A1A1A' },
  { id: 'c3', name: 'Accent Amber', hex: '#F7941D' },
  { id: 'c4', name: 'Light Gray', hex: '#F5F5F5' },
  { id: 'c5', name: 'Mid Gray', hex: '#9CA3AF' },
  { id: 'c6', name: 'Dark Gray', hex: '#374151' },
];

const DEMO_FONTS: BrandFont[] = [
  {
    id: 'f1',
    family: 'Inter',
    category: 'Body / UI',
    weights: [400, 500, 600, 700],
    sampleText: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    id: 'f2',
    family: 'DM Serif Display',
    category: 'Display / Headlines',
    weights: [400],
    sampleText: 'Cinematic brand storytelling.',
  },
];

const DEMO_LOGOS: LogoVariant[] = [
  { id: 'l1', name: 'Primary', description: 'Full colour on light', bgClass: 'bg-white', textColour: 'text-gray-900' },
  { id: 'l2', name: 'Reversed', description: 'White on dark', bgClass: 'bg-gray-900', textColour: 'text-white' },
  { id: 'l3', name: 'Icon Only', description: 'Logomark without text', bgClass: 'bg-gray-100', textColour: 'text-gray-900' },
  { id: 'l4', name: 'Horizontal', description: 'Wide format lockup', bgClass: 'bg-white', textColour: 'text-gray-900' },
];

const DEMO_VOICE: VoiceCard[] = [
  { id: 'v1', label: 'Tone Keywords', type: 'keyword', items: ['Cinematic', 'Confident', 'Human', 'Strategic', 'Clear', 'Bold'] },
  { id: 'v2', label: "Do's", type: 'do', items: ['Speak with authority and clarity', 'Use active voice', 'Lead with insight, not hype', 'Be specific and actionable'] },
  { id: 'v3', label: "Don'ts", type: 'dont', items: ['No corporate buzzwords', 'No vague motivational filler', 'No passive voice in headlines', 'No shallow hooks or clickbait'] },
];

const WEIGHT_LABELS: Record<number, string> = {
  400: 'Regular',
  500: 'Medium',
  600: 'Semibold',
  700: 'Bold',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BrandKitPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [colours, setColours] = useState<BrandColour[]>(DEMO_COLOURS);
  const [fonts] = useState<BrandFont[]>(DEMO_FONTS);
  const [logos] = useState<LogoVariant[]>(DEMO_LOGOS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<AssetType>('colour');
  const [editingColourId, setEditingColourId] = useState<string | null>(null);
  const [editColourName, setEditColourName] = useState('');
  const [editColourHex, setEditColourHex] = useState('');

  // Modal form state
  const [newColourName, setNewColourName] = useState('');
  const [newColourHex, setNewColourHex] = useState('#');
  const [newFontFamily, setNewFontFamily] = useState('');
  const [newLogoName, setNewLogoName] = useState('');

  // -------------------------------------------------------------------------
  // Auth check
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleCopyHex = useCallback((id: string, hex: string) => {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_mode');
    }
    router.push('/');
  };

  const openModal = (type: AssetType) => {
    setModalType(type);
    setNewColourName('');
    setNewColourHex('#');
    setNewFontFamily('');
    setNewLogoName('');
    setShowModal(true);
  };

  const handleAddAsset = () => {
    if (modalType === 'colour' && newColourName.trim() && /^#[0-9A-Fa-f]{6}$/.test(newColourHex)) {
      setColours((prev) => [...prev, { id: `c-${Date.now()}`, name: newColourName.trim(), hex: newColourHex.toUpperCase() }]);
    }
    // Font and logo additions are visual-only in demo mode
    setShowModal(false);
  };

  const startEditColour = (colour: BrandColour) => {
    setEditingColourId(colour.id);
    setEditColourName(colour.name);
    setEditColourHex(colour.hex);
  };

  const saveEditColour = () => {
    if (!editingColourId) return;
    if (!editColourName.trim() || !/^#[0-9A-Fa-f]{6}$/.test(editColourHex)) return;
    setColours((prev) =>
      prev.map((c) =>
        c.id === editingColourId
          ? { ...c, name: editColourName.trim(), hex: editColourHex.toUpperCase() }
          : c
      )
    );
    setEditingColourId(null);
  };

  const cancelEditColour = () => {
    setEditingColourId(null);
  };

  // -------------------------------------------------------------------------
  // Render gate
  // -------------------------------------------------------------------------

  if (!user) return null;

  // -------------------------------------------------------------------------
  // JSX
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ----------------------------------------------------------------- */}
      {/* Nav Bar                                                            */}
      {/* ----------------------------------------------------------------- */}
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
              <Link
                href="/templates"
                className="px-3 py-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-smooth"
              >
                Templates
              </Link>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg font-medium">
                Brand Kit
              </span>
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
        {/* --------------------------------------------------------------- */}
        {/* Page Header                                                      */}
        {/* --------------------------------------------------------------- */}
        <div className="flex justify-between items-start mb-10 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Brand Kit</h1>
            <p className="text-gray-500 mt-2">
              Your visual identity system. Colours, typography, logos, and voice guidelines.
            </p>
          </div>
          <button
            onClick={() => openModal('colour')}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-smooth font-medium flex items-center gap-2 text-sm shadow-lg shadow-gray-900/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Brand Asset
          </button>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Section 1: Colours                                               */}
        {/* --------------------------------------------------------------- */}
        <section className="mb-14 animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Colours</h2>
              <p className="text-sm text-gray-500 mt-1">Click any swatch to copy the hex value.</p>
            </div>
            <button
              onClick={() => openModal('colour')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-smooth"
            >
              + Add Colour
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {colours.map((colour) => (
              <div key={colour.id} className="group">
                {editingColourId === colour.id ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                    <input
                      type="text"
                      value={editColourName}
                      onChange={(e) => setEditColourName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth"
                      placeholder="Colour name"
                    />
                    <input
                      type="text"
                      value={editColourHex}
                      onChange={(e) => setEditColourHex(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth"
                      placeholder="#000000"
                      maxLength={7}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditColour}
                        className="flex-1 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-smooth"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditColour}
                        className="flex-1 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-smooth"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-smooth cursor-pointer relative"
                    onClick={() => handleCopyHex(colour.id, colour.hex)}
                  >
                    <div
                      className="h-24 w-full transition-smooth"
                      style={{ backgroundColor: colour.hex }}
                    />
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{colour.name}</p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">
                        {copiedId === colour.id ? 'Copied!' : colour.hex}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditColour(colour);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth hover:bg-white shadow-sm"
                      aria-label={`Edit ${colour.name}`}
                    >
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Section 2: Typography                                            */}
        {/* --------------------------------------------------------------- */}
        <section className="mb-14 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Typography</h2>
              <p className="text-sm text-gray-500 mt-1">Font families and hierarchy for your brand.</p>
            </div>
            <button
              onClick={() => openModal('font')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-smooth"
            >
              + Add Font
            </button>
          </div>

          <div className="space-y-6">
            {fonts.map((font) => (
              <div
                key={font.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-smooth group relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{font.family}</h3>
                    <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100">
                      {font.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {font.weights.map((w) => (
                      <span
                        key={w}
                        className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100"
                      >
                        {WEIGHT_LABELS[w] || w}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Heading hierarchy */}
                <div className="space-y-3 mb-5">
                  <p
                    className="text-3xl text-gray-900"
                    style={{ fontFamily: font.family, fontWeight: font.weights[font.weights.length - 1] }}
                  >
                    Heading 1 &mdash; {font.family}
                  </p>
                  <p
                    className="text-2xl text-gray-800"
                    style={{ fontFamily: font.family, fontWeight: font.weights[Math.min(1, font.weights.length - 1)] }}
                  >
                    Heading 2 &mdash; {font.family}
                  </p>
                  <p
                    className="text-xl text-gray-700"
                    style={{ fontFamily: font.family, fontWeight: font.weights[0] }}
                  >
                    Heading 3 &mdash; {font.family}
                  </p>
                </div>

                {/* Body sample */}
                <p
                  className="text-base text-gray-600 leading-relaxed"
                  style={{ fontFamily: font.family, fontWeight: 400 }}
                >
                  {font.sampleText}
                </p>

                {/* Edit button */}
                <button
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth hover:bg-gray-100"
                  aria-label={`Edit ${font.family}`}
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Section 3: Logos                                                  */}
        {/* --------------------------------------------------------------- */}
        <section className="mb-14 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Logos</h2>
              <p className="text-sm text-gray-500 mt-1">Logo variants and usage guidelines.</p>
            </div>
            <button
              onClick={() => openModal('logo')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-smooth"
            >
              + Upload Logo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-smooth group relative"
              >
                {/* Preview area */}
                <div className={`${logo.bgClass} h-40 flex items-center justify-center border-b border-gray-100`}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg" />
                    <span className={`text-lg font-bold tracking-tight ${logo.textColour}`}>
                      {logo.id === 'l3' ? '' : 'COREX'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900">{logo.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{logo.description}</p>

                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-smooth border border-gray-200">
                      SVG
                    </button>
                    <button className="flex-1 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-smooth border border-gray-200">
                      PNG
                    </button>
                  </div>
                </div>

                {/* Edit button */}
                <button
                  className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth hover:bg-white shadow-sm"
                  aria-label={`Edit ${logo.name} logo`}
                >
                  <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Section 4: Brand Voice                                           */}
        {/* --------------------------------------------------------------- */}
        <section className="mb-14 animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Brand Voice</h2>
              <p className="text-sm text-gray-500 mt-1">Tone, language, and communication guidelines.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {DEMO_VOICE.map((card) => {
              const borderColour =
                card.type === 'do'
                  ? 'border-emerald-200'
                  : card.type === 'dont'
                  ? 'border-red-200'
                  : 'border-orange-200';
              const headerBg =
                card.type === 'do'
                  ? 'bg-emerald-50 text-emerald-800'
                  : card.type === 'dont'
                  ? 'bg-red-50 text-red-800'
                  : 'bg-orange-50 text-orange-800';
              const bulletColour =
                card.type === 'do'
                  ? 'bg-emerald-400'
                  : card.type === 'dont'
                  ? 'bg-red-400'
                  : 'bg-orange-400';

              return (
                <div
                  key={card.id}
                  className={`bg-white border ${borderColour} rounded-2xl overflow-hidden hover:shadow-md transition-smooth group relative`}
                >
                  <div className={`${headerBg} px-5 py-3 font-semibold text-sm`}>
                    {card.label}
                  </div>
                  <div className="p-5">
                    {card.type === 'keyword' ? (
                      <div className="flex flex-wrap gap-2">
                        {card.items.map((item) => (
                          <span
                            key={item}
                            className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-full border border-gray-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {card.items.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                            <span className={`w-1.5 h-1.5 ${bulletColour} rounded-full mt-1.5 shrink-0`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Edit button */}
                  <button
                    className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth hover:bg-white shadow-sm"
                    aria-label={`Edit ${card.label}`}
                  >
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Add Brand Asset Modal                                              */}
      {/* ----------------------------------------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-8 animate-scale-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Add Brand Asset
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Add a new {modalType} to your brand kit.
            </p>

            {/* Asset type tabs */}
            <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
              {(['colour', 'font', 'logo'] as AssetType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setModalType(type)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-smooth capitalize ${
                    modalType === type
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Colour form */}
            {modalType === 'colour' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Colour Name</label>
                  <input
                    type="text"
                    value={newColourName}
                    onChange={(e) => setNewColourName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300"
                    placeholder="e.g., Brand Blue"
                    maxLength={50}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hex Value</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newColourHex}
                      onChange={(e) => setNewColourHex(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm font-mono hover:border-gray-300"
                      placeholder="#3B82F6"
                      maxLength={7}
                    />
                    <div
                      className="w-12 h-12 rounded-xl border border-gray-200 shrink-0"
                      style={{
                        backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(newColourHex) ? newColourHex : '#E5E7EB',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Font form */}
            {modalType === 'font' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Font Family</label>
                  <input
                    type="text"
                    value={newFontFamily}
                    onChange={(e) => setNewFontFamily(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300"
                    placeholder="e.g., Poppins"
                    maxLength={100}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400">
                  In demo mode, fonts are visual placeholders. Connect a type service to use custom fonts.
                </p>
              </div>
            )}

            {/* Logo form */}
            {modalType === 'logo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo Variant Name</label>
                  <input
                    type="text"
                    value={newLogoName}
                    onChange={(e) => setNewLogoName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-smooth text-sm hover:border-gray-300"
                    placeholder="e.g., Monochrome"
                    maxLength={100}
                    autoFocus
                  />
                </div>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-orange-300 transition-smooth cursor-pointer">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500">Drop file here or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">SVG, PNG, or PDF up to 10MB</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-smooth text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAsset}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-smooth text-sm"
              >
                Add {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
      <AIChatBot context="brand-kit" />
    </div>
  );
}
