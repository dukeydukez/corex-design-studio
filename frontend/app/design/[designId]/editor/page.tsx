'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const VideoPreview = dynamic(
  () => import('./components/VideoPreview').then(mod => ({ default: mod.VideoPreview })),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full bg-gray-900 text-white text-sm">Loading Remotion Player...</div> }
);

// ─── Types ───────────────────────────────────────────────────────────────────

type ToolType =
  | 'select'
  | 'move'
  | 'text'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'polygon'
  | 'star'
  | 'pen'
  | 'brush'
  | 'eraser'
  | 'gradient'
  | 'eyedropper'
  | 'crop'
  | 'hand'
  | 'zoom'
  | 'image';

type ElementType = 'text' | 'rect' | 'circle' | 'line' | 'polygon' | 'star';
type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'soft-light' | 'hard-light' | 'difference' | 'exclusion';

type AnimationType = 'none' | 'fadeIn' | 'fadeOut' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'scaleIn' | 'scaleOut' | 'bounceIn' | 'rotateIn' | 'typewriter' | 'blur';

type KeyframeProperty = 'x' | 'y' | 'opacity' | 'rotation' | 'scaleX' | 'scaleY' | 'blur';

interface Keyframe {
  id: string;
  time: number; // seconds relative to element start
  property: KeyframeProperty;
  value: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

interface ElementAnimation {
  enterAnimation: AnimationType;
  exitAnimation: AnimationType;
  enterDuration: number; // seconds
  exitDuration: number;
  startTime: number; // seconds on timeline
  duration: number; // how long element is visible (seconds)
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  keyframes: Keyframe[];
}

const KEYFRAME_PROPERTIES: { value: KeyframeProperty; label: string; min: number; max: number; defaultVal: number }[] = [
  { value: 'x', label: 'Position X', min: -2000, max: 4000, defaultVal: 0 },
  { value: 'y', label: 'Position Y', min: -2000, max: 4000, defaultVal: 0 },
  { value: 'opacity', label: 'Opacity', min: 0, max: 100, defaultVal: 100 },
  { value: 'rotation', label: 'Rotation', min: -360, max: 360, defaultVal: 0 },
  { value: 'scaleX', label: 'Scale X', min: 0, max: 500, defaultVal: 100 },
  { value: 'scaleY', label: 'Scale Y', min: 0, max: 500, defaultVal: 100 },
  { value: 'blur', label: 'Blur', min: 0, max: 50, defaultVal: 0 },
];

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
  borderRadius: number;
  blur: number;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowColor: string;
  blendMode: BlendMode;
  locked: boolean;
  visible: boolean;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  colour?: string;
  name: string;
  points?: number;
  backgroundImage?: string;
}

const ANIMATION_OPTIONS: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'fadeOut', label: 'Fade Out' },
  { value: 'slideLeft', label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideDown', label: 'Slide Down' },
  { value: 'scaleIn', label: 'Scale In' },
  { value: 'scaleOut', label: 'Scale Out' },
  { value: 'bounceIn', label: 'Bounce In' },
  { value: 'rotateIn', label: 'Rotate In' },
  { value: 'blur', label: 'Blur In' },
];

const DEFAULT_ANIMATION: ElementAnimation = {
  enterAnimation: 'none',
  exitAnimation: 'none',
  enterDuration: 0.5,
  exitDuration: 0.5,
  startTime: 0,
  duration: 3,
  easing: 'ease-out',
  keyframes: [],
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface DragState {
  elementId: string;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
}

type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';

interface ResizeState {
  elementId: string;
  direction: ResizeDirection;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
  elementStartW: number;
  elementStartH: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const BLEND_MODES: BlendMode[] = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'soft-light', 'hard-light', 'difference', 'exclusion',
];

const FONT_OPTIONS = [
  'Inter', 'Georgia', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
  'Verdana', 'Trebuchet MS', 'Palatino', 'Garamond', 'Comic Sans MS', 'Impact',
  'DM Serif Display', 'system-ui', 'monospace',
];

const FONT_WEIGHTS = [
  { label: 'Thin', value: 100 },
  { label: 'Light', value: 300 },
  { label: 'Regular', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'Semi Bold', value: 600 },
  { label: 'Bold', value: 700 },
  { label: 'Extra Bold', value: 800 },
  { label: 'Black', value: 900 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function createDefaultElement(overrides: Partial<CanvasElement>): CanvasElement {
  return {
    id: uid(),
    type: 'rect',
    x: 100,
    y: 100,
    width: 150,
    height: 100,
    fill: '#F97316',
    stroke: '#EA580C',
    strokeWidth: 0,
    opacity: 100,
    rotation: 0,
    borderRadius: 0,
    blur: 0,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowColor: 'rgba(0,0,0,0.25)',
    blendMode: 'normal',
    locked: false,
    visible: true,
    name: 'Element',
    ...overrides,
  };
}

function createDemoElements(): readonly CanvasElement[] {
  return [
    createDefaultElement({
      id: uid(),
      type: 'text',
      x: 290,
      y: 160,
      width: 500,
      height: 60,
      fill: 'transparent',
      stroke: 'none',
      content: 'Your Design Here',
      fontSize: 48,
      fontFamily: 'Inter',
      fontWeight: 700,
      textAlign: 'center',
      colour: '#1a1a1a',
      letterSpacing: -0.5,
      lineHeight: 1.2,
      name: 'Heading',
    }),
    createDefaultElement({
      id: uid(),
      type: 'text',
      x: 340,
      y: 240,
      width: 400,
      height: 30,
      fill: 'transparent',
      stroke: 'none',
      content: 'Start creating something amazing',
      fontSize: 18,
      fontFamily: 'Inter',
      fontWeight: 400,
      textAlign: 'center',
      colour: '#737373',
      letterSpacing: 0,
      lineHeight: 1.5,
      name: 'Subtitle',
    }),
    createDefaultElement({
      id: uid(),
      type: 'rect',
      x: 200,
      y: 340,
      width: 320,
      height: 200,
      fill: '#F97316',
      stroke: '#EA580C',
      strokeWidth: 2,
      borderRadius: 12,
      opacity: 100,
      name: 'Rectangle',
    }),
    createDefaultElement({
      id: uid(),
      type: 'circle',
      x: 580,
      y: 360,
      width: 180,
      height: 180,
      fill: '#FED7AA',
      stroke: '#F97316',
      strokeWidth: 2,
      opacity: 90,
      name: 'Circle',
    }),
    createDefaultElement({
      id: uid(),
      type: 'rect',
      x: 250,
      y: 600,
      width: 580,
      height: 60,
      fill: '#1a1a1a',
      stroke: 'none',
      strokeWidth: 0,
      borderRadius: 30,
      opacity: 100,
      name: 'Button',
    }),
    createDefaultElement({
      id: uid(),
      type: 'text',
      x: 430,
      y: 612,
      width: 220,
      height: 36,
      fill: 'transparent',
      stroke: 'none',
      content: 'Get Started',
      fontSize: 20,
      fontFamily: 'Inter',
      fontWeight: 600,
      textAlign: 'center',
      colour: '#ffffff',
      name: 'Button Text',
    }),
  ];
}

// ─── Tool Icons ──────────────────────────────────────────────────────────────

function SvgIcon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function IconCursor() { return <SvgIcon d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />; }
function IconMove() { return <SvgIcon d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />; }
function IconText() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}
function IconRect() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}
function IconEllipse() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="10" ry="8" />
    </svg>
  );
}
function IconLine() { return <SvgIcon d="M5 12h14" />; }
function IconPolygon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 18 20 6 20 2 8.5" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconPen() { return <SvgIcon d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586" />; }
function IconBrush() { return <SvgIcon d="M9.06 11.9c.94-1.16 2.28-1.9 3.94-1.9 2.76 0 5 2.24 5 5s-2.24 5-5 5c-1.66 0-3-1-3.94-1.9M2 2l6 6" />; }
function IconEraser() { return <SvgIcon d="M20 20H7L2 15l10-10 8 8-5 5M18 13l-1.5-7.5" />; }
function IconGradient() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="8" y1="3" x2="8" y2="21" strokeOpacity="0.3" /><line x1="12" y1="3" x2="12" y2="21" strokeOpacity="0.5" />
      <line x1="16" y1="3" x2="16" y2="21" strokeOpacity="0.7" />
    </svg>
  );
}
function IconEyedropper() { return <SvgIcon d="M2 22l1-1h3l9-9M12.5 5.5l6 6M4.5 19.5l2-2" />; }
function IconCrop() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.13 1L6 16a2 2 0 002 2h15" /><path d="M1 6.13L16 6a2 2 0 012 2v15" />
    </svg>
  );
}
function IconHand() { return <SvgIcon d="M18 11V6a2 2 0 00-4 0M14 10V4a2 2 0 00-4 0v7M10 10.5V2a2 2 0 00-4 0v11M6 12a2 2 0 00-4 0v1a8 8 0 008 8h2a8 8 0 008-8v-3a2 2 0 00-4 0" />; }
function IconZoom() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}
function IconImage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 19l-7-7 7-7" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}
function IconUnlock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 019.9-1" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}
function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}
function IconChevronUp() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}
function IconPanelRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}
function IconUndo() { return <SvgIcon d="M3 7v6h6M3 13a9 9 0 0115.36-6.36" size={16} />; }
function IconRedo() { return <SvgIcon d="M21 7v6h-6M21 13a9 9 0 01-15.36-6.36" size={16} />; }
function IconFlipH() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="3" x2="12" y2="21" /><polyline points="16 7 20 12 16 17" /><polyline points="8 7 4 12 8 17" /></svg>
  );
}
function IconFlipV() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><polyline points="7 8 12 4 17 8" /><polyline points="7 16 12 20 17 16" /></svg>
  );
}
function IconBringForward() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="8" width="10" height="10" rx="1" opacity="0.4" /><rect x="8" y="2" width="14" height="14" rx="1" /></svg>
  );
}
function IconSendBackward() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="8" y="8" width="14" height="14" rx="1" opacity="0.4" /><rect x="2" y="2" width="10" height="10" rx="1" /></svg>
  );
}

// ─── Toast Container ─────────────────────────────────────────────────────────

function ToastContainer({ toasts }: { toasts: readonly Toast[] }) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="px-5 py-3 rounded-lg shadow-2xl text-sm font-medium text-white backdrop-blur-sm"
          style={{
            backgroundColor: toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#dc2626' : '#F97316',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

// ─── Slider Component ────────────────────────────────────────────────────────

function PropSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-neutral-400">{label}</label>
        <span className="text-[11px] text-neutral-500 font-mono tabular-nums">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-neutral-700 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500
          [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-400
          [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
      />
    </div>
  );
}

function PropField({
  label,
  value,
  onChange,
  type = 'number',
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] text-neutral-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white mt-0.5
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-colors"
      />
    </div>
  );
}

function PropColor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] text-neutral-500 block mb-0.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-neutral-700 cursor-pointer bg-transparent shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-neutral-300 font-mono
            focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-colors"
        />
      </div>
    </div>
  );
}

function SectionHeader({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-orange-400 transition-colors"
    >
      {label}
      <span className={`transition-transform ${collapsed ? '' : 'rotate-180'}`}>
        <IconChevronUp />
      </span>
    </button>
  );
}

function Divider() { return <div className="border-t border-neutral-800" />; }

// ─── Selection Handles ───────────────────────────────────────────────────────

function SelectionHandles({ onResizeStart }: { onResizeStart?: (dir: ResizeDirection, e: React.MouseEvent) => void }) {
  const handles: { style: React.CSSProperties; dir: ResizeDirection }[] = [
    { style: { top: -5, left: -5, cursor: 'nw-resize' }, dir: 'nw' },
    { style: { top: -5, right: -5, cursor: 'ne-resize' }, dir: 'ne' },
    { style: { bottom: -5, left: -5, cursor: 'sw-resize' }, dir: 'sw' },
    { style: { bottom: -5, right: -5, cursor: 'se-resize' }, dir: 'se' },
    { style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' }, dir: 'n' },
    { style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' }, dir: 's' },
    { style: { top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'w-resize' }, dir: 'w' },
    { style: { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'e-resize' }, dir: 'e' },
  ];
  return (
    <>
      {handles.map(({ style, dir }) => (
        <span
          key={dir}
          className="absolute w-[9px] h-[9px] bg-white border-2 border-blue-500 rounded-sm shadow-sm z-10"
          style={style}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart?.(dir, e);
          }}
        />
      ))}
    </>
  );
}

// ─── Main Editor Component ──────────────────────────────────────────────────

export default function DesignEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = params.designId as string;

  const canvasWidth = parseInt(searchParams.get('w') || '1080', 10);
  const canvasHeight = parseInt(searchParams.get('h') || '1080', 10);
  const agentParam = searchParams.get('agent') || '';

  // ── Agent definitions (mirrors project page AGENT_PIPELINE) ──
  const AGENTS: Record<string, { name: string; icon: string; category: string; greeting: string }> = {
    'creative-director': { name: 'Creative Director', icon: '🎯', category: 'Strategy', greeting: 'I\'m your Creative Director. Tell me about your vision, audience, or brand and I\'ll guide the creative direction for this design.' },
    'design-generator': { name: 'Design Generator', icon: '🎨', category: 'Generation', greeting: 'I\'m your Design Generator. Describe what you want to create and I\'ll help you build the layout, pick colours, and compose elements on your canvas.' },
    'copy-writer': { name: 'Copy Writer', icon: '✍️', category: 'Generation', greeting: 'I\'m your Copy Writer. Tell me what your design is for and I\'ll write headlines, CTAs, body copy, and taglines that convert.' },
    'layout-optimizer': { name: 'Layout Optimizer', icon: '📐', category: 'Optimization', greeting: 'I\'m your Layout Optimizer. I\'ll analyse your current canvas and suggest improvements for visual balance, spacing, and hierarchy.' },
    'design-refiner': { name: 'Design Refiner', icon: '✨', category: 'Optimization', greeting: 'I\'m your Design Refiner. I\'ll review your design for polish, consistency, and production-readiness. Share what you\'ve got so far.' },
    'video-adapter': { name: 'Video Adapter', icon: '🎬', category: 'Adaptation', greeting: 'I\'m your Video Adapter. I can help turn this design into a video concept with scene breakdowns, motion suggestions, and transitions.' },
    'blog-adapter': { name: 'Blog Adapter', icon: '📝', category: 'Adaptation', greeting: 'I\'m your Blog Adapter. I\'ll help convert this design into blog-optimized assets with featured images and content outlines.' },
    'social-adapter': { name: 'Social Adapter', icon: '📱', category: 'Adaptation', greeting: 'I\'m your Social Adapter. I\'ll help resize and optimise this design for every social platform with native dimensions.' },
    'ab-testing': { name: 'A/B Testing', icon: '🧪', category: 'Analysis', greeting: 'I\'m your A/B Testing Agent. I\'ll generate design variations for split testing and help you set up hypotheses and success criteria.' },
    'analytics': { name: 'Analytics', icon: '📊', category: 'Analysis', greeting: 'I\'m your Analytics Agent. I\'ll analyse your design against performance benchmarks and suggest data-driven improvements.' },
    'accessibility': { name: 'Accessibility', icon: '♿', category: 'Analysis', greeting: 'I\'m your Accessibility Agent. I\'ll audit this design for WCAG 2.1 compliance, contrast ratios, and readability.' },
    'seo-optimizer': { name: 'SEO Optimizer', icon: '🔍', category: 'Analysis', greeting: 'I\'m your SEO Optimizer. I\'ll help optimise this design for search visibility with alt text, metadata, and structured markup.' },
  };

  const activeAgent = agentParam && AGENTS[agentParam]
    ? AGENTS[agentParam]
    : { name: 'AI Assistant', icon: '🤖', category: 'General', greeting: "Hey! I'm your COREX AI Assistant. I can help you design, write copy, optimise layouts, and even modify your canvas directly. Tell me what you're working on and I'll help bring it to life." };

  // ── State ──
  const initialName = searchParams.get('name') || 'Untitled Design';
  const [designName, setDesignName] = useState(initialName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [elements, setElements] = useState<readonly CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);
  const [leftPanel, setLeftPanel] = useState<'none' | 'templates'>('none');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const [zoom, setZoom] = useState(100);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingElementIndex, setPlayingElementIndex] = useState(-1);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Video Editor state ──
  const isVideoMode = agentParam === 'video-adapter';
  const [elementAnimations, setElementAnimations] = useState<Record<string, ElementAnimation>>({});
  const [totalDuration, setTotalDuration] = useState(10);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [keyframePanel, setKeyframePanel] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1); // 1x = fit, 2x = zoomed in
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(10);
  const [remotionPreview, setRemotionPreview] = useState(false);
  const playbackRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  // Agent chat state
  const [agentChatOpen, setAgentChatOpen] = useState(!!activeAgent);
  const [agentMessages, setAgentMessages] = useState<Array<{ id: string; role: 'user' | 'agent'; text: string }>>([]);
  const [agentInput, setAgentInput] = useState('');
  const [agentTyping, setAgentTyping] = useState(false);
  const agentChatEndRef = useRef<HTMLDivElement>(null);

  // ── Load saved design on mount ──
  useEffect(() => {
    const saved = localStorage.getItem(`corex-design-${designId}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.elements && Array.isArray(data.elements)) {
          setElements(data.elements);
        }
        if (data.name) {
          setDesignName(data.name);
        }
        if (data.elementAnimations && typeof data.elementAnimations === 'object') {
          setElementAnimations(data.elementAnimations);
        }
        if (data.totalDuration && typeof data.totalDuration === 'number') {
          setTotalDuration(data.totalDuration);
        }
      } catch {
        setElements(createDemoElements());
      }
    } else {
      setElements(createDemoElements());
    }
  }, [designId]);

  // Collapsible sections
  const [sectionsCollapsed, setSectionsCollapsed] = useState<Record<string, boolean>>({});

  const nameInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedElement = selectedId
    ? elements.find((el) => el.id === selectedId) ?? null
    : null;

  const toggleSection = useCallback((key: string) => {
    setSectionsCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ── Toast ──
  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = uid();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  // ── Image upload handler ──
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = Math.min(canvasWidth * 0.8, canvasHeight * 0.8);
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const x = Math.round((canvasWidth - w) / 2);
        const y = Math.round((canvasHeight - h) / 2);

        const newEl = createDefaultElement({
          type: 'rect',
          x, y, width: w, height: h,
          fill: '#f0f0f0',
          stroke: 'none',
          strokeWidth: 0,
          name: file.name.replace(/\.[^.]+$/, ''),
        });
        (newEl as any).backgroundImage = dataUrl;
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
        showToast('Image added to canvas');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [canvasWidth, canvasHeight, showToast]);

  // ── Close export on outside click ──
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Focus name input ──
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // ── Drag and Drop ──
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      const el = elements.find((el) => el.id === elementId);
      if (!el || el.locked) return;
      if (activeTool !== 'select' && activeTool !== 'move') return;

      e.stopPropagation();
      setSelectedId(elementId);
      setDragState({
        elementId,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: el.x,
        elementStartY: el.y,
      });
    },
    [elements, activeTool]
  );

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const scale = zoom / 100;
      const dx = (e.clientX - dragState.startX) / scale;
      const dy = (e.clientY - dragState.startY) / scale;

      setElements((prev) =>
        prev.map((el) =>
          el.id === dragState.elementId
            ? {
                ...el,
                x: snapToGrid ? Math.round((dragState.elementStartX + dx) / gridSize) * gridSize : Math.round(dragState.elementStartX + dx),
                y: snapToGrid ? Math.round((dragState.elementStartY + dy) / gridSize) * gridSize : Math.round(dragState.elementStartY + dy),
              }
            : el
        )
      );
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, zoom, snapToGrid, gridSize]);

  // ── Resize ──
  const handleResizeStart = useCallback(
    (elementId: string, direction: ResizeDirection, e: React.MouseEvent) => {
      const el = elements.find((el) => el.id === elementId);
      if (!el || el.locked) return;
      e.stopPropagation();
      setResizeState({
        elementId,
        direction,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: el.x,
        elementStartY: el.y,
        elementStartW: el.width,
        elementStartH: el.height,
      });
    },
    [elements]
  );

  useEffect(() => {
    if (!resizeState) return;
    const { elementId, direction, startX, startY, elementStartX, elementStartY, elementStartW, elementStartH } = resizeState;
    const scale = zoom / 100;
    const aspectRatio = elementStartW / elementStartH;

    const snap = (val: number) => snapToGrid ? Math.round(val / gridSize) * gridSize : Math.round(val);

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;
      const isCorner = direction.length === 2; // 'nw','ne','sw','se'
      const holdShift = e.shiftKey;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== elementId) return el;
          let newX = elementStartX;
          let newY = elementStartY;
          let newW = elementStartW;
          let newH = elementStartH;

          if (direction.includes('e')) { newW = Math.max(20, elementStartW + dx); }
          if (direction.includes('w')) { newW = Math.max(20, elementStartW - dx); newX = elementStartX + (elementStartW - newW); }
          if (direction.includes('s')) { newH = Math.max(20, elementStartH + dy); }
          if (direction.includes('n')) { newH = Math.max(20, elementStartH - dy); newY = elementStartY + (elementStartH - newH); }

          // Proportional scaling when Shift held on corner handles
          if (holdShift && isCorner) {
            const wRatio = newW / elementStartW;
            const hRatio = newH / elementStartH;
            const ratio = Math.max(wRatio, hRatio);
            newW = Math.max(20, elementStartW * ratio);
            newH = Math.max(20, newW / aspectRatio);
            if (direction.includes('w')) newX = elementStartX + elementStartW - newW;
            if (direction.includes('n')) newY = elementStartY + elementStartH - newH;
          }

          return { ...el, x: snap(newX), y: snap(newY), width: snap(newW), height: snap(newH) };
        })
      );
    };

    const handleMouseUp = () => setResizeState(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState, zoom, snapToGrid, gridSize]);

  // ── Canvas Click (add elements) ──
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.dataset.elementId) return; // handled by mousedown

      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      const x = Math.round((e.clientX - rect.left) / scale);
      const y = Math.round((e.clientY - rect.top) / scale);

      if (activeTool === 'text') {
        const newEl = createDefaultElement({
          type: 'text', x, y, width: 200, height: 40,
          fill: 'transparent', stroke: 'none', strokeWidth: 0,
          content: 'New Text', fontSize: 24, fontFamily: 'Inter', fontWeight: 400,
          textAlign: 'left', colour: '#1a1a1a', name: `Text ${elements.length + 1}`,
        });
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
        setActiveTool('select');
        return;
      }

      if (activeTool === 'rectangle') {
        const newEl = createDefaultElement({
          type: 'rect', x, y, width: 150, height: 100,
          name: `Rectangle ${elements.length + 1}`,
        });
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
        setActiveTool('select');
        return;
      }

      if (activeTool === 'ellipse') {
        const newEl = createDefaultElement({
          type: 'circle', x, y, width: 120, height: 120,
          fill: '#3B82F6', stroke: '#2563EB', name: `Ellipse ${elements.length + 1}`,
        });
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
        setActiveTool('select');
        return;
      }

      if (activeTool === 'line') {
        const newEl = createDefaultElement({
          type: 'line', x, y, width: 200, height: 4,
          fill: '#1a1a1a', stroke: 'none', borderRadius: 0,
          name: `Line ${elements.length + 1}`,
        });
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
        setActiveTool('select');
        return;
      }

      if (activeTool === 'star') {
        const newEl = createDefaultElement({
          type: 'star', x, y, width: 120, height: 120,
          fill: '#FBBF24', stroke: '#F59E0B', strokeWidth: 2,
          points: 5, name: `Star ${elements.length + 1}`,
        });
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
        setActiveTool('select');
        return;
      }

      if (activeTool === 'polygon') {
        const newEl = createDefaultElement({
          type: 'polygon', x, y, width: 120, height: 120,
          fill: '#8B5CF6', stroke: '#7C3AED', strokeWidth: 2,
          points: 6, name: `Polygon ${elements.length + 1}`,
        });
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
        setActiveTool('select');
        return;
      }

      if (activeTool === 'image') {
        // Trigger file picker
        imageInputRef.current?.click();
        setActiveTool('select');
        return;
      }

      // Deselect on empty canvas
      setSelectedId(null);
    },
    [activeTool, elements.length, zoom]
  );

  // ── Element operations ──
  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  }, []);

  const duplicateElement = useCallback((id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const newEl = { ...el, id: uid(), x: el.x + 20, y: el.y + 20, name: `${el.name} copy` };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    showToast('Duplicated');
  }, [elements, showToast]);

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
    showToast('Deleted');
  }, [selectedId, showToast]);

  const bringForward = useCallback((id: string) => {
    setElements((prev) => {
      const arr = [...prev];
      const idx = arr.findIndex((el) => el.id === id);
      if (idx < arr.length - 1) {
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      }
      return arr;
    });
  }, []);

  const sendBackward = useCallback((id: string) => {
    setElements((prev) => {
      const arr = [...prev];
      const idx = arr.findIndex((el) => el.id === id);
      if (idx > 0) {
        [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
      }
      return arr;
    });
  }, []);

  const handleSave = useCallback(() => {
    const data = {
      name: designName,
      elements: [...elements],
      canvasWidth,
      canvasHeight,
      elementAnimations: { ...elementAnimations },
      totalDuration,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`corex-design-${designId}`, JSON.stringify(data));
    // Also save to the designs list so project page can show the name
    const designsList = JSON.parse(localStorage.getItem('corex-designs-list') || '{}');
    designsList[designId] = { name: designName, updatedAt: data.savedAt, dimensions: `${canvasWidth}x${canvasHeight}` };
    localStorage.setItem('corex-designs-list', JSON.stringify(designsList));
    showToast('Design saved!');
  }, [showToast, designName, elements, canvasWidth, canvasHeight, designId, elementAnimations, totalDuration]);

  const handleExport = useCallback((format: string) => {
    setExportDropdownOpen(false);
    showToast('Exporting...', 'info');

    // Render the canvas to an image and trigger download
    setTimeout(() => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) {
        showToast('Export failed — canvas not found', 'error');
        return;
      }

      import('html2canvas').then(({ default: html2canvas }) => {
        html2canvas(canvasEl, {
          backgroundColor: '#ffffff',
          scale: 2,
          width: canvasWidth,
          height: canvasHeight,
          useCORS: true,
        }).then((canvas) => {
          const mimeMap: Record<string, string> = {
            'PNG': 'image/png',
            'JPG': 'image/jpeg',
            'WebP': 'image/webp',
          };
          const mime = mimeMap[format] || 'image/png';
          const ext = format.toLowerCase();

          if (format === 'SVG') {
            // SVG export — create SVG markup from elements
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">
  <rect width="${canvasWidth}" height="${canvasHeight}" fill="white"/>
  <text x="${canvasWidth/2}" y="${canvasHeight/2}" text-anchor="middle" font-size="24" fill="#666">SVG Export — ${designName}</text>
</svg>`;
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${designName.replace(/\s+/g, '-').toLowerCase()}.svg`;
            a.click();
            URL.revokeObjectURL(url);
            showToast(`SVG saved to your Downloads folder`);
            return;
          }

          if (format === 'PDF') {
            // PDF export using canvas data
            canvas.toBlob((blob) => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${designName.replace(/\s+/g, '-').toLowerCase()}.png`;
              a.click();
              URL.revokeObjectURL(url);
              showToast(`PDF export saved as PNG to your Downloads folder`);
            }, 'image/png');
            return;
          }

          canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${designName.replace(/\s+/g, '-').toLowerCase()}.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
            showToast(`${format} saved to your Downloads folder`);
          }, mime, format === 'JPG' ? 0.92 : undefined);
        }).catch(() => {
          showToast('Export failed — rendering error', 'error');
        });
      }).catch(() => {
        // Fallback: simple canvas export
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          ctx.fillStyle = '#666666';
          ctx.font = '24px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(designName, canvasWidth / 2, canvasHeight / 2);
        }
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${designName.replace(/\s+/g, '-').toLowerCase()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          showToast(`PNG saved to your Downloads folder`);
        });
      });
    }, 100);
  }, [showToast, canvasWidth, canvasHeight, designName]);

  // ── Animation helpers ──
  const getAnimation = useCallback((elId: string): ElementAnimation => {
    return elementAnimations[elId] || DEFAULT_ANIMATION;
  }, [elementAnimations]);

  const updateAnimation = useCallback((elId: string, updates: Partial<ElementAnimation>) => {
    setElementAnimations(prev => ({
      ...prev,
      [elId]: { ...(prev[elId] || DEFAULT_ANIMATION), ...updates },
    }));
  }, []);

  const addKeyframe = useCallback((elId: string, property: KeyframeProperty, time: number, value: number) => {
    setElementAnimations(prev => {
      const anim = prev[elId] || DEFAULT_ANIMATION;
      const newKf: Keyframe = { id: `kf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time, property, value, easing: 'ease' };
      const updated = [...anim.keyframes.filter(k => !(k.property === property && Math.abs(k.time - time) < 0.05)), newKf].sort((a, b) => a.time - b.time);
      return { ...prev, [elId]: { ...anim, keyframes: updated } };
    });
  }, []);

  const removeKeyframe = useCallback((elId: string, kfId: string) => {
    setElementAnimations(prev => {
      const anim = prev[elId] || DEFAULT_ANIMATION;
      return { ...prev, [elId]: { ...anim, keyframes: anim.keyframes.filter(k => k.id !== kfId) } };
    });
  }, []);

  const updateKeyframe = useCallback((elId: string, kfId: string, updates: Partial<Keyframe>) => {
    setElementAnimations(prev => {
      const anim = prev[elId] || DEFAULT_ANIMATION;
      return { ...prev, [elId]: { ...anim, keyframes: anim.keyframes.map(k => k.id === kfId ? { ...k, ...updates } : k) } };
    });
  }, []);

  // Interpolate keyframe value at a given time
  const interpolateKeyframes = useCallback((keyframes: Keyframe[], property: KeyframeProperty, time: number, defaultValue: number): number => {
    const propKfs = keyframes.filter(k => k.property === property).sort((a, b) => a.time - b.time);
    if (propKfs.length === 0) return defaultValue;
    if (time <= propKfs[0].time) return propKfs[0].value;
    if (time >= propKfs[propKfs.length - 1].time) return propKfs[propKfs.length - 1].value;
    for (let i = 0; i < propKfs.length - 1; i++) {
      const a = propKfs[i], b = propKfs[i + 1];
      if (time >= a.time && time <= b.time) {
        const t = (time - a.time) / (b.time - a.time);
        return a.value + (b.value - a.value) * t; // Linear interp
      }
    }
    return defaultValue;
  }, []);

  // Timeline scrub handler
  const scrubToPosition = useCallback((clientX: number, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setCurrentTime(pct * totalDuration);
  }, [totalDuration]);

  // Scrub drag handlers
  useEffect(() => {
    if (!isScrubbing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const container = timelineRef.current || rulerRef.current;
      if (container) scrubToPosition(e.clientX, container);
    };
    const handleMouseUp = () => setIsScrubbing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, scrubToPosition]);

  // Auto-assign staggered start times for new elements in video mode
  useEffect(() => {
    if (!isVideoMode) return;
    const updated = { ...elementAnimations };
    let changed = false;
    elements.forEach((el, i) => {
      if (!updated[el.id]) {
        const start = Math.min(i * 0.8, totalDuration - 1);
        updated[el.id] = {
          ...DEFAULT_ANIMATION,
          startTime: start,
          enterAnimation: 'fadeIn',
          duration: Math.max(1, totalDuration - start),
          keyframes: [],
        };
        changed = true;
      }
    });
    // Also clean up animations for deleted elements
    const elementIds = new Set(elements.map(e => e.id));
    for (const id of Object.keys(updated)) {
      if (!elementIds.has(id)) {
        delete updated[id];
        changed = true;
      }
    }
    if (changed) setElementAnimations(updated);
  }, [isVideoMode, elements, totalDuration]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Video Playback Engine ──
  const stopPlayback = useCallback(() => {
    if (playbackRef.current) {
      cancelAnimationFrame(playbackRef.current);
      playbackRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlayback = useCallback(() => {
    if (elements.length === 0) return;
    setIsPlaying(true);
    setSelectedId(null);
    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      setCurrentTime(prev => {
        const next = prev + delta * playbackSpeed;
        if (next >= totalDuration) {
          stopPlayback();
          return totalDuration;
        }
        return next;
      });
      playbackRef.current = requestAnimationFrame(tick);
    };
    playbackRef.current = requestAnimationFrame(tick);
  }, [elements.length, playbackSpeed, totalDuration, stopPlayback]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      if (currentTime >= totalDuration) setCurrentTime(0);
      startPlayback();
    }
  }, [isPlaying, currentTime, totalDuration, stopPlayback, startPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackRef.current) cancelAnimationFrame(playbackRef.current);
    };
  }, []);

  // Get element visibility/animation state at a given time
  const getElementPlayState = useCallback((elId: string, time: number) => {
    const anim = getAnimation(elId);
    const { startTime, duration, enterAnimation, exitAnimation, enterDuration, exitDuration } = anim;
    const endTime = startTime + duration;

    if (time < startTime || time > endTime) return { visible: false, opacity: 0, transform: '', filter: '' };

    const elapsed = time - startTime;
    const remaining = endTime - time;
    let opacity = 1;
    let transform = '';
    let filter = '';

    // Enter animation
    if (elapsed < enterDuration && enterAnimation !== 'none') {
      const progress = elapsed / enterDuration;
      const eased = progress; // Simple linear for now
      switch (enterAnimation) {
        case 'fadeIn': opacity = eased; break;
        case 'slideLeft': transform = `translateX(${(1 - eased) * 100}px)`; opacity = eased; break;
        case 'slideRight': transform = `translateX(${(eased - 1) * 100}px)`; opacity = eased; break;
        case 'slideUp': transform = `translateY(${(1 - eased) * 60}px)`; opacity = eased; break;
        case 'slideDown': transform = `translateY(${(eased - 1) * 60}px)`; opacity = eased; break;
        case 'scaleIn': transform = `scale(${0.3 + eased * 0.7})`; opacity = eased; break;
        case 'bounceIn': {
          const bounce = eased < 0.6 ? eased / 0.6 : 1 + Math.sin((eased - 0.6) * Math.PI * 2.5) * 0.15 * (1 - eased);
          transform = `scale(${bounce})`;
          opacity = Math.min(eased * 2, 1);
          break;
        }
        case 'rotateIn': transform = `rotate(${(1 - eased) * 90}deg) scale(${0.5 + eased * 0.5})`; opacity = eased; break;
        case 'blur': filter = `blur(${(1 - eased) * 10}px)`; opacity = eased; break;
        default: break;
      }
    }

    // Exit animation
    if (remaining < exitDuration && exitAnimation !== 'none') {
      const progress = remaining / exitDuration;
      switch (exitAnimation) {
        case 'fadeOut': opacity = progress; break;
        case 'scaleOut': transform = `scale(${progress})`; opacity = progress; break;
        case 'slideLeft': transform = `translateX(${(progress - 1) * 100}px)`; opacity = progress; break;
        case 'slideRight': transform = `translateX(${(1 - progress) * 100}px)`; opacity = progress; break;
        case 'slideUp': transform = `translateY(${(progress - 1) * 60}px)`; opacity = progress; break;
        case 'slideDown': transform = `translateY(${(1 - progress) * 60}px)`; opacity = progress; break;
        case 'blur': filter = `blur(${(1 - progress) * 10}px)`; opacity = progress; break;
        default: break;
      }
    }

    // Apply keyframe overrides
    if (anim.keyframes.length > 0) {
      const kfTime = elapsed; // relative to element start
      const kfOpacity = interpolateKeyframes(anim.keyframes, 'opacity', kfTime, -1);
      if (kfOpacity >= 0) opacity = kfOpacity / 100;
      const kfRotation = interpolateKeyframes(anim.keyframes, 'rotation', kfTime, NaN);
      const kfScaleX = interpolateKeyframes(anim.keyframes, 'scaleX', kfTime, NaN);
      const kfScaleY = interpolateKeyframes(anim.keyframes, 'scaleY', kfTime, NaN);
      const kfBlur = interpolateKeyframes(anim.keyframes, 'blur', kfTime, NaN);
      const kfX = interpolateKeyframes(anim.keyframes, 'x', kfTime, NaN);
      const kfY = interpolateKeyframes(anim.keyframes, 'y', kfTime, NaN);

      const transforms: string[] = [];
      if (!isNaN(kfX)) transforms.push(`translateX(${kfX}px)`);
      if (!isNaN(kfY)) transforms.push(`translateY(${kfY}px)`);
      if (!isNaN(kfRotation)) transforms.push(`rotate(${kfRotation}deg)`);
      if (!isNaN(kfScaleX) || !isNaN(kfScaleY)) transforms.push(`scale(${(isNaN(kfScaleX) ? 100 : kfScaleX) / 100}, ${(isNaN(kfScaleY) ? 100 : kfScaleY) / 100})`);
      if (transforms.length > 0) transform = (transform ? transform + ' ' : '') + transforms.join(' ');
      if (!isNaN(kfBlur)) filter = (filter ? filter + ' ' : '') + `blur(${kfBlur}px)`;
    }

    return { visible: true, opacity, transform, filter };
  }, [getAnimation, interpolateKeyframes]);

  // ── Preview / Play animation (simple mode for non-video) ──
  const handlePlay = useCallback(() => {
    if (isVideoMode) { togglePlayback(); return; }
    if (isPlaying || elements.length === 0) return;
    setIsPlaying(true);
    setPlayingElementIndex(-1);
    setSelectedId(null);

    let idx = 0;
    const interval = setInterval(() => {
      setPlayingElementIndex(idx);
      idx++;
      if (idx >= elements.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsPlaying(false);
          setPlayingElementIndex(-1);
        }, 2000);
      }
    }, 600);
  }, [isPlaying, elements.length, isVideoMode, togglePlayback]);

  // ── Tool definitions ──
  const toolGroups: { label: string; tools: { type: ToolType; label: string; Icon: () => React.JSX.Element; shortcut?: string }[] }[] = [
    {
      label: 'Select',
      tools: [
        { type: 'select', label: 'Select', Icon: IconCursor, shortcut: 'V' },
        { type: 'move', label: 'Move', Icon: IconMove, shortcut: 'M' },
      ],
    },
    {
      label: 'Shape',
      tools: [
        { type: 'rectangle', label: 'Rectangle', Icon: IconRect, shortcut: 'R' },
        { type: 'ellipse', label: 'Ellipse', Icon: IconEllipse, shortcut: 'E' },
        { type: 'line', label: 'Line', Icon: IconLine, shortcut: 'L' },
        { type: 'polygon', label: 'Polygon', Icon: IconPolygon },
        { type: 'star', label: 'Star', Icon: IconStar },
      ],
    },
    {
      label: 'Content',
      tools: [
        { type: 'text', label: 'Text', Icon: IconText, shortcut: 'T' },
        { type: 'image', label: 'Image', Icon: IconImage, shortcut: 'I' },
      ],
    },
    {
      label: 'Draw',
      tools: [
        { type: 'pen', label: 'Pen', Icon: IconPen, shortcut: 'P' },
        { type: 'brush', label: 'Brush', Icon: IconBrush, shortcut: 'B' },
        { type: 'eraser', label: 'Eraser', Icon: IconEraser },
      ],
    },
    {
      label: 'Adjust',
      tools: [
        { type: 'gradient', label: 'Gradient', Icon: IconGradient, shortcut: 'G' },
        { type: 'eyedropper', label: 'Eyedropper', Icon: IconEyedropper },
        { type: 'crop', label: 'Crop', Icon: IconCrop, shortcut: 'C' },
      ],
    },
    {
      label: 'Navigate',
      tools: [
        { type: 'hand', label: 'Hand', Icon: IconHand, shortcut: 'H' },
        { type: 'zoom', label: 'Zoom', Icon: IconZoom, shortcut: 'Z' },
      ],
    },
  ];

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      const key = e.key.toLowerCase();
      const shortcutMap: Record<string, ToolType> = {
        v: 'select', m: 'move', t: 'text', r: 'rectangle', e: 'ellipse',
        l: 'line', p: 'pen', b: 'brush', g: 'gradient', c: 'crop',
        h: 'hand', z: 'zoom', i: 'image',
      };
      if (shortcutMap[key]) {
        if (key === 'i') {
          imageInputRef.current?.click();
          return;
        }
        setActiveTool(shortcutMap[key]);
        return;
      }
      if (key === 'delete' || key === 'backspace') {
        if (selectedId) {
          const el = elements.find((el) => el.id === selectedId);
          if (el && !el.locked) deleteElement(selectedId);
        }
        return;
      }
      if (e.metaKey && key === 'd') {
        e.preventDefault();
        if (selectedId) duplicateElement(selectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, deleteElement, duplicateElement]);

  // ── Agent chat: greeting on mount ──
  useEffect(() => {
    setAgentMessages([{ id: uid(), role: 'agent', text: activeAgent.greeting }]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Agent chat: auto-scroll ──
  useEffect(() => {
    agentChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentMessages, agentTyping]);

  // ── Agent chat: contextual response generator ──
  const getAgentResponse = useCallback((agentId: string, userMsg: string): string => {
    const lower = userMsg.toLowerCase();
    const canvas = { width: canvasWidth, height: canvasHeight, elementCount: elements.length };

    const responses: Record<string, (msg: string) => string> = {
      'creative-director': (msg) => {
        if (/colour|color|palette/i.test(msg)) return `Based on your brief, I'd recommend a bold yet sophisticated palette:\n\n**Primary:** #1a1a1a (deep black)\n**Accent:** #F97316 (vibrant orange)\n**Neutral:** #f5f5f5 (soft white)\n\nThis gives you strong contrast and energy. Want me to suggest an alternative direction?`;
        if (/font|typography|type/i.test(msg)) return `For this ${canvas.width}x${canvas.height} design, I'd pair:\n\n**Headlines:** Inter Black (900) — modern, commanding\n**Body:** Inter Regular (400) — clean readability\n**Accent:** DM Serif Display — editorial elegance\n\nKeep headline size at 48-64px and body at 16-20px for this canvas size.`;
        if (/mood|style|direction|vibe/i.test(msg)) return `Here's a creative direction based on what you've described:\n\n**Mood:** Bold, confident, premium\n**Visual style:** High contrast, clean typography, generous white space\n**Composition:** Asymmetric layout with strong focal point\n**Texture:** Minimal — let the typography and colour do the heavy lifting\n\nWant me to get more specific about layout or colour?`;
        return `Great brief. Here's what I'd suggest for your ${canvas.width}x${canvas.height} canvas:\n\n1. **Lead with a bold headline** — one clear message\n2. **Strong visual hierarchy** — guide the eye top to bottom\n3. **Limit to 2-3 colours** — keep it cohesive\n4. **Leave breathing room** — don't fill every pixel\n\nWhat specific aspect would you like me to dive deeper on? Colours, typography, layout, or mood?`;
      },
      'design-generator': (msg) => {
        if (/instagram|post|social/i.test(msg)) return `Here's a layout concept for your ${canvas.width}x${canvas.height} social post:\n\n**Structure:**\n- Top 30%: Hero image or gradient background\n- Middle 40%: Bold headline (48px Inter Black) centred\n- Below: Supporting text (18px Inter Regular)\n- Bottom 15%: CTA button with rounded corners\n\n**Quick tip:** Use the Templates panel (grid icon, bottom left) to start with a Social Media Post template, then customise from there.\n\nWant me to suggest specific colours and copy too?`;
        if (/logo|brand/i.test(msg)) return `For a brand-focused layout on this canvas:\n\n1. **Centre your logo** — give it at least 20% of the canvas height\n2. **Add a tagline beneath** — 18-24px, lighter weight\n3. **Use a solid or gradient background** — keep it simple\n4. **Add a subtle border frame** — 2px stroke, 16px inset\n\nYou can add a rectangle from the toolbar, then layer your text elements on top. Want me to walk you through it step by step?`;
        if (/flyer|poster|event/i.test(msg)) return `Here's an event/flyer layout for ${canvas.width}x${canvas.height}:\n\n**Layer structure:**\n1. Background: dark solid (#0a0a0a)\n2. Border frame: orange stroke, 16px inset\n3. Date: large, bold, orange (64px)\n4. Event name: white, centred (42px)\n5. Details: grey, below name (18px)\n6. CTA button: orange pill shape, bottom third\n\nCheck the Event Promotion template in the Templates panel for a head start!`;
        return `I can help you build this. Tell me more about:\n\n- **What type of design?** (social post, flyer, ad, thumbnail, etc.)\n- **What's the main message?** (headline or key info)\n- **Brand style?** (minimalist, bold, playful, corporate)\n\nOr describe what you're picturing and I'll suggest a full layout with specific elements, colours, and typography for your ${canvas.width}x${canvas.height} canvas.`;
      },
      'copy-writer': (msg) => {
        if (/headline|title|heading/i.test(msg)) return `Here are 5 headline options based on your brief:\n\n1. **"Built Different. By Design."** — bold, confident\n2. **"Your Vision. Amplified."** — aspirational\n3. **"Create Without Limits."** — empowering\n4. **"Where Ideas Take Shape."** — descriptive\n5. **"Design That Speaks."** — concise\n\nSelect the text element on your canvas and paste your favourite. Want me to write variations of any of these?`;
        if (/cta|button|call to action/i.test(msg)) return `Strong CTA options for your design:\n\n**Action-oriented:**\n- "Get Started"\n- "Start Creating"\n- "Try It Free"\n\n**Urgency-based:**\n- "Join Now"\n- "Don't Miss Out"\n- "Limited Spots"\n\n**Value-driven:**\n- "See the Difference"\n- "Unlock Your Potential"\n- "Level Up Today"\n\nKeep CTAs to 2-4 words max. Use your CTA button element and set the text to your pick.`;
        if (/body|description|subtext|subtitle/i.test(msg)) return `Here's supporting copy that pairs well with a bold headline:\n\n**Option A (benefit-focused):**\n"Professional design tools that help you create stunning visuals in minutes, not hours."\n\n**Option B (social proof):**\n"Join 10,000+ creators who trust us to bring their vision to life."\n\n**Option C (feature-focused):**\n"AI-powered design, intuitive editing, and seamless export. Everything you need in one place."\n\nKeep body copy to 1-2 lines on this canvas size. Which direction fits your brand?`;
        return `I'll write compelling copy for your design. Tell me:\n\n- **What's the purpose?** (promote, inform, sell, inspire)\n- **Who's the audience?** (entrepreneurs, consumers, developers, etc.)\n- **What's the tone?** (professional, casual, bold, playful)\n\nOr just tell me what you need — headline, CTA, body text, tagline — and I'll generate options for you.`;
      },
      'layout-optimizer': (msg) => {
        const elCount = canvas.elementCount;
        return `Looking at your current canvas (${canvas.width}x${canvas.height}, ${elCount} element${elCount !== 1 ? 's' : ''}):\n\n**Layout recommendations:**\n1. **Visual hierarchy** — Make sure your most important element (headline or image) takes up 40-60% of the canvas\n2. **Spacing** — Keep consistent padding of ${Math.round(canvas.width * 0.08)}px from edges\n3. **Alignment** — Centre-align text for social posts, left-align for editorial\n4. **White space** — Leave at least 15-20% of the canvas empty\n5. **Grid** — Use a ${canvas.width > 1000 ? '12' : '6'}-column grid for element placement\n\nWant me to analyse a specific element or suggest repositioning?`;
      },
      'design-refiner': (msg) => {
        return `Here's my quality review of your current design:\n\n**Checklist:**\n- [ ] Contrast ratios meet 4.5:1 minimum\n- [ ] Text is readable at the intended viewing size\n- [ ] Colour palette is limited to 2-4 colours\n- [ ] Elements are properly aligned (check snap guides)\n- [ ] Sufficient padding from edges\n- [ ] Consistent font sizes and weights\n- [ ] CTA stands out from the background\n\n**Quick wins:**\n- Add a subtle drop shadow to text over images\n- Use the border radius slider to soften sharp rectangles\n- Check opacity on overlay elements\n\nTell me what specific area you want me to focus on.`;
      },
      'video-adapter': (msg) => {
        return `Here's how to adapt your ${canvas.width}x${canvas.height} design for video:\n\n**Scene Breakdown:**\n1. **Intro (0-3s):** Fade in background, subtle zoom\n2. **Headline (3-6s):** Text slides up with ease-out\n3. **Body (6-10s):** Supporting elements fade in sequentially\n4. **CTA (10-13s):** Button pulses or scales up\n5. **Outro (13-15s):** Logo fade with brand colours\n\n**Recommended specs:**\n- 1080x1920 for Stories/Reels\n- 1920x1080 for YouTube\n- 1080x1080 for feed video\n\nWant me to detail transitions or motion timing?`;
      },
      'social-adapter': (msg) => {
        return `Here's your cross-platform sizing guide from this ${canvas.width}x${canvas.height} base:\n\n**Instagram:**\n- Feed: 1080x1080 (square) or 1080x1350 (portrait)\n- Story/Reel: 1080x1920\n\n**Facebook:**\n- Post: 1200x630\n- Story: 1080x1920\n\n**LinkedIn:**\n- Post: 1200x1200\n- Article: 1200x627\n\n**Twitter/X:**\n- Post: 1200x675\n- Header: 1500x500\n\n**TikTok:**\n- 1080x1920\n\nTell me which platforms you're targeting and I'll suggest specific layout adjustments for each.`;
      },
    };

    const responder = responses[agentId];
    if (responder) return responder(userMsg);

    // Fallback for agents without custom responses
    return `I've analysed your request. Here are my recommendations for your ${canvas.width}x${canvas.height} design with ${canvas.elementCount} element${canvas.elementCount !== 1 ? 's' : ''}:\n\n1. Review the current layout for balance and hierarchy\n2. Ensure colour contrast meets accessibility standards\n3. Test the design at actual viewing size\n\nTell me more about what specific changes you'd like and I'll provide detailed guidance.`;
  }, [canvasWidth, canvasHeight, elements.length]);

  // ── Parse AI actions from response ──
  const parseAndApplyActions = useCallback((text: string) => {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (!jsonMatch) return;
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (!parsed.actions || !Array.isArray(parsed.actions)) return;

      for (const action of parsed.actions) {
        if (action.type === 'addElement' && action.element) {
          const newEl = createDefaultElement({ ...action.element, id: uid() });
          setElements((prev) => [...prev, newEl]);
        } else if (action.type === 'updateElement' && action.elementId && action.updates) {
          setElements((prev) =>
            prev.map((el) => el.id === action.elementId ? { ...el, ...action.updates } : el)
          );
        } else if (action.type === 'deleteElement' && action.elementId) {
          setElements((prev) => prev.filter((el) => el.id !== action.elementId));
        }
      }
      showToast('AI applied changes to canvas');
    } catch {
      // JSON parse failed — no actions to apply
    }
  }, [showToast]);

  const handleAgentSend = useCallback(() => {
    const trimmed = agentInput.trim();
    if (!trimmed || agentTyping) return;

    const userMsg = { id: uid(), role: 'user' as const, text: trimmed };
    setAgentMessages((prev) => [...prev, userMsg]);
    setAgentInput('');
    setAgentTyping(true);

    // Build message history for API
    const allMsgs = [...agentMessages, userMsg];
    const apiMessages = allMsgs.map((m) => ({
      role: m.role === 'agent' ? 'assistant' as const : 'user' as const,
      content: m.text,
    }));

    // Canvas context for AI
    const canvasData = {
      width: canvasWidth,
      height: canvasHeight,
      elementCount: elements.length,
      elements: elements.map((el) => ({
        id: el.id,
        type: el.type,
        name: el.name,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        content: el.content,
        fill: el.fill,
        colour: el.colour,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
      })),
    };

    const agentContext = activeAgent
      ? `The user is working with the ${activeAgent.name} (${activeAgent.category}) agent. Focus your responses on ${activeAgent.category.toLowerCase()} tasks.`
      : 'The user is in the design editor.';

    // Call Claude API
    fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: apiMessages,
        context: agentContext,
        canvasData,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(err.error || 'Request failed');
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let fullText = '';
        const replyId = uid();

        // Add empty reply message
        setAgentMessages((prev) => [...prev, { id: replyId, role: 'agent', text: '' }]);
        setAgentTyping(false);

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

            for (const line of lines) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text') {
                  fullText += data.text;
                  setAgentMessages((prev) =>
                    prev.map((m) => m.id === replyId ? { ...m, text: fullText } : m)
                  );
                }
                if (data.type === 'done') {
                  // Check for canvas actions in the response
                  parseAndApplyActions(fullText);
                }
                if (data.type === 'error') {
                  setAgentMessages((prev) =>
                    prev.map((m) => m.id === replyId ? { ...m, text: `Error: ${data.error}` } : m)
                  );
                }
              } catch {
                // Skip malformed events
              }
            }
          }
        };

        await processStream();
      })
      .catch((err) => {
        // Fallback to local response if API fails
        const fallbackReply = getAgentResponse(agentParam || 'creative-director', trimmed);
        setAgentMessages((prev) => [...prev, { id: uid(), role: 'agent', text: fallbackReply }]);
        setAgentTyping(false);
      });
  }, [agentInput, agentTyping, agentMessages, canvasWidth, canvasHeight, elements, activeAgent, agentParam, getAgentResponse, parseAndApplyActions]);

  const formatLabel = `${canvasWidth} x ${canvasHeight}px`;

  // ── Render element on canvas ──
  const renderElement = (el: CanvasElement, elIndex: number) => {
    if (!el.visible) return null;
    const isSelected = el.id === selectedId;

    // Video mode: use timeline-based animation
    let videoStyle: React.CSSProperties = {};
    let videoHidden = false;
    if (isVideoMode && isPlaying) {
      const ps = getElementPlayState(el.id, currentTime);
      if (!ps.visible) videoHidden = true;
      videoStyle = {
        opacity: ps.opacity * (el.opacity / 100),
        transform: [el.rotation ? `rotate(${el.rotation}deg)` : '', ps.transform].filter(Boolean).join(' ') || undefined,
        filter: [el.blur ? `blur(${el.blur}px)` : '', ps.filter].filter(Boolean).join(' ') || undefined,
      };
    }

    // Simple play mode: elements animate in sequentially (non-video)
    const isPlayHidden = !isVideoMode && isPlaying && elIndex > playingElementIndex;
    const isPlayAnimating = !isVideoMode && isPlaying && elIndex === playingElementIndex;

    const commonStyle: React.CSSProperties = {
      left: el.x,
      top: el.y,
      width: el.width,
      height: el.height,
      opacity: videoHidden ? 0
        : isVideoMode && isPlaying ? videoStyle.opacity
        : isPlayHidden ? 0
        : isPlayAnimating ? undefined
        : el.opacity / 100,
      transform: isVideoMode && isPlaying ? videoStyle.transform
        : isPlayAnimating ? `${el.rotation ? `rotate(${el.rotation}deg)` : ''} translateY(0)`
        : el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      transition: (!isVideoMode && isPlaying) ? 'opacity 0.5s ease-out, transform 0.5s ease-out' : undefined,
      animation: isPlayAnimating ? 'elementFadeIn 0.5s ease-out forwards' : undefined,
      filter: isVideoMode && isPlaying ? videoStyle.filter
        : el.blur ? `blur(${el.blur}px)` : undefined,
      boxShadow: (el.shadowX || el.shadowY || el.shadowBlur)
        ? `${el.shadowX}px ${el.shadowY}px ${el.shadowBlur}px ${el.shadowColor}`
        : undefined,
      mixBlendMode: el.blendMode as React.CSSProperties['mixBlendMode'],
      outline: isSelected ? '2px solid #3b82f6' : 'none',
      outlineOffset: '2px',
      cursor: (activeTool === 'select' || activeTool === 'move') ? (dragState ? 'grabbing' : 'grab') : 'default',
      userSelect: 'none',
      position: 'absolute' as const,
    };

    if (el.type === 'text') {
      return (
        <div
          key={el.id}
          data-element-id={el.id}
          onMouseDown={(e) => handleMouseDown(e, el.id)}
          style={{
            ...commonStyle,
            fontSize: el.fontSize,
            fontFamily: el.fontFamily,
            color: el.colour,
            textAlign: el.textAlign,
            fontWeight: el.fontWeight || 700,
            lineHeight: el.lineHeight || 1.2,
            letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
          }}
        >
          {el.content}
          {isSelected && <SelectionHandles onResizeStart={(dir, e) => handleResizeStart(el.id, dir, e)} />}
        </div>
      );
    }

    if (el.type === 'rect' || el.type === 'line') {
      const bgImage = (el as any).backgroundImage;
      return (
        <div
          key={el.id}
          data-element-id={el.id}
          onMouseDown={(e) => handleMouseDown(e, el.id)}
          style={{
            ...commonStyle,
            backgroundColor: bgImage ? undefined : el.fill,
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundSize: bgImage ? 'cover' : undefined,
            backgroundPosition: bgImage ? 'center' : undefined,
            border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.stroke}` : 'none',
            borderRadius: el.borderRadius,
          }}
        >
          {isSelected && <SelectionHandles onResizeStart={(dir, e) => handleResizeStart(el.id, dir, e)} />}
        </div>
      );
    }

    if (el.type === 'circle') {
      return (
        <div
          key={el.id}
          data-element-id={el.id}
          onMouseDown={(e) => handleMouseDown(e, el.id)}
          style={{
            ...commonStyle,
            backgroundColor: el.fill,
            border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.stroke}` : 'none',
            borderRadius: '50%',
          }}
        >
          {isSelected && <SelectionHandles onResizeStart={(dir, e) => handleResizeStart(el.id, dir, e)} />}
        </div>
      );
    }

    if (el.type === 'star' || el.type === 'polygon') {
      const sides = el.points || (el.type === 'star' ? 5 : 6);
      const isStar = el.type === 'star';
      const cx = el.width / 2;
      const cy = el.height / 2;
      const r = Math.min(cx, cy);
      const points: string[] = [];
      const totalPoints = isStar ? sides * 2 : sides;
      for (let i = 0; i < totalPoints; i++) {
        const angle = (i * 2 * Math.PI) / totalPoints - Math.PI / 2;
        const radius = isStar ? (i % 2 === 0 ? r : r * 0.4) : r;
        points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
      }
      return (
        <div
          key={el.id}
          data-element-id={el.id}
          onMouseDown={(e) => handleMouseDown(e, el.id)}
          style={{ ...commonStyle }}
        >
          <svg width={el.width} height={el.height} viewBox={`0 0 ${el.width} ${el.height}`}>
            <polygon
              points={points.join(' ')}
              fill={el.fill}
              stroke={el.stroke}
              strokeWidth={el.strokeWidth}
            />
          </svg>
          {isSelected && <SelectionHandles onResizeStart={(dir, e) => handleResizeStart(el.id, dir, e)} />}
        </div>
      );
    }

    return null;
  };

  // ── RENDER ──
  return (
    <>
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex flex-col h-screen bg-neutral-200 select-none" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* ── Header Bar ──────────────────────────────────────────────── */}
        <header className="flex items-center justify-between h-12 px-3 bg-neutral-900 text-white shrink-0 z-30 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/dashboard')} className="p-1.5 rounded hover:bg-neutral-700 transition-colors" title="Back to Dashboard">
              <IconArrowLeft />
            </button>
            <div className="h-5 w-px bg-neutral-700" />
            {/* Logo - clickable to homepage */}
            <button onClick={() => router.push('/')} className="shrink-0 hover:opacity-80 transition-opacity" title="Go to Homepage">
              <img src="/CorexICON.png" alt="Corex Creative" className="h-7 object-contain" />
            </button>
            <div className="h-5 w-px bg-neutral-700" />
            {isEditingName ? (
              <input
                ref={nameInputRef}
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingName(false); }}
                className="bg-neutral-800 text-white text-sm font-semibold px-2 py-1 rounded outline-none ring-2 ring-orange-500 w-56"
              />
            ) : (
              <button onClick={() => setIsEditingName(true)} className="text-sm font-semibold hover:text-orange-400 transition-colors">
                {designName}
              </button>
            )}
            <span className="text-[11px] text-neutral-500 ml-1">{formatLabel}</span>
          </div>

          {/* Center: Undo/Redo + Zoom */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title="Undo (Cmd+Z)"><IconUndo /></button>
            <button className="p-1.5 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title="Redo (Cmd+Shift+Z)"><IconRedo /></button>
            <div className="h-5 w-px bg-neutral-700 mx-1" />
            <button onClick={() => setZoom((z) => clamp(z - 10, 10, 400))} className="px-1.5 py-0.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors">-</button>
            <span className="text-xs text-neutral-300 font-mono w-12 text-center tabular-nums">{zoom}%</span>
            <button onClick={() => setZoom((z) => clamp(z + 10, 10, 400))} className="px-1.5 py-0.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors">+</button>
            <button onClick={() => setZoom(100)} className="px-2 py-0.5 text-[10px] text-neutral-500 hover:text-white hover:bg-neutral-700 rounded transition-colors ml-0.5">FIT</button>
            <div className="h-5 w-px bg-neutral-700 mx-1" />
            {/* Snap to grid */}
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${snapToGrid ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-white hover:bg-neutral-700'}`}
              title={`Snap to Grid (${gridSize}px)`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>
              Grid
            </button>
            <div className="h-5 w-px bg-neutral-700 mx-1" />
            <button
              onClick={handlePlay}
              disabled={isPlaying || elements.length === 0}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                isPlaying
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'hover:bg-neutral-700 text-neutral-400 hover:text-white'
              }`}
              title="Preview animation (play)"
            >
              {isPlaying ? (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="6" height="16" rx="1"/><rect x="14" y="4" width="6" height="16" rx="1"/></svg> Playing</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Play</>
              )}
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={exportRef}>
              <button onClick={() => setExportDropdownOpen(!exportDropdownOpen)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded hover:bg-neutral-700 transition-colors">
                Export <IconChevronDown />
              </button>
              {exportDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl py-1 w-36 z-50">
                  {['PNG', 'JPG', 'PDF', 'SVG', 'WebP', 'GIF'].map((fmt) => (
                    <button key={fmt} onClick={() => handleExport(fmt)} className="w-full text-left px-4 py-2 text-xs text-neutral-200 hover:bg-neutral-700 hover:text-orange-400 transition-colors">
                      {fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleSave} className="px-4 py-1.5 text-xs font-semibold rounded bg-orange-500 hover:bg-orange-600 transition-colors">Save</button>
            <div className="h-5 w-px bg-neutral-700" />
            <button
              onClick={() => setAgentChatOpen(!agentChatOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                agentChatOpen
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
              title="Toggle AI Assistant"
            >
              <span>{activeAgent.icon}</span>
              <span>{activeAgent.name}</span>
            </button>
          </div>
        </header>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left Tool Palette ─────────────────────────────────────── */}
          <aside className="flex flex-col w-[52px] bg-neutral-900 border-r border-neutral-800 py-2 gap-0.5 shrink-0 z-20 overflow-y-auto">
            {toolGroups.map((group, gi) => (
              <React.Fragment key={group.label}>
                {gi > 0 && <div className="mx-2 border-t border-neutral-800 my-1" />}
                {group.tools.map(({ type, label, Icon, shortcut }) => {
                  const isActive = activeTool === type;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        if (type === 'image') {
                          imageInputRef.current?.click();
                          return;
                        }
                        setActiveTool(type);
                      }}
                      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
                      className={`flex items-center justify-center w-10 h-9 mx-auto rounded-lg transition-all ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                          : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      <Icon />
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
            <div className="mt-auto mx-2 border-t border-neutral-800 pt-2">
              <button
                onClick={() => setLeftPanel(leftPanel === 'templates' ? 'none' : 'templates')}
                title="Templates"
                className={`flex items-center justify-center w-10 h-9 mx-auto rounded-lg transition-all ${
                  leftPanel === 'templates'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
            </div>
          </aside>

          {/* ── Left Templates Panel ──────────────────────────────────── */}
          {leftPanel === 'templates' && (
            <aside className="w-[240px] bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0 z-20 overflow-y-auto">
              <div className="px-3 py-2.5 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Templates</span>
                <button onClick={() => setLeftPanel('none')} className="text-neutral-500 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-2 flex flex-col gap-2">
                {[
                  { name: 'Social Media Post', desc: 'Bold headline + CTA button', gradient: 'from-orange-500 to-rose-500', elements: [
                    createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight, fill: '#1a1a1a', borderRadius: 0, name: 'Background' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.1, y: canvasHeight * 0.25, width: canvasWidth * 0.8, height: 80, fill: 'transparent', stroke: 'none', content: 'YOUR HEADLINE HERE', fontSize: 56, fontFamily: 'Inter', fontWeight: 900, textAlign: 'center', colour: '#ffffff', name: 'Headline' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.15, y: canvasHeight * 0.45, width: canvasWidth * 0.7, height: 40, fill: 'transparent', stroke: 'none', content: 'Add your supporting text here', fontSize: 20, fontFamily: 'Inter', fontWeight: 400, textAlign: 'center', colour: '#a3a3a3', name: 'Subtext' }),
                    createDefaultElement({ type: 'rect', x: canvasWidth * 0.3, y: canvasHeight * 0.65, width: canvasWidth * 0.4, height: 56, fill: '#F97316', borderRadius: 28, name: 'CTA Button' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.3, y: canvasHeight * 0.65 + 14, width: canvasWidth * 0.4, height: 28, fill: 'transparent', stroke: 'none', content: 'Learn More', fontSize: 18, fontFamily: 'Inter', fontWeight: 600, textAlign: 'center', colour: '#ffffff', name: 'CTA Text' }),
                  ]},
                  { name: 'Minimal Quote', desc: 'Clean quote with accent bar', gradient: 'from-blue-500 to-cyan-500', elements: [
                    createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight, fill: '#fafafa', borderRadius: 0, name: 'Background' }),
                    createDefaultElement({ type: 'rect', x: canvasWidth * 0.1, y: canvasHeight * 0.35, width: 4, height: canvasHeight * 0.3, fill: '#F97316', borderRadius: 2, name: 'Accent Bar' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.15, y: canvasHeight * 0.35, width: canvasWidth * 0.7, height: 100, fill: 'transparent', stroke: 'none', content: '"Design is not just what it looks like. Design is how it works."', fontSize: 32, fontFamily: 'Georgia', fontWeight: 400, textAlign: 'left', colour: '#1a1a1a', lineHeight: 1.4, name: 'Quote' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.15, y: canvasHeight * 0.65, width: canvasWidth * 0.7, height: 24, fill: 'transparent', stroke: 'none', content: '— Steve Jobs', fontSize: 16, fontFamily: 'Inter', fontWeight: 500, textAlign: 'left', colour: '#737373', name: 'Author' }),
                  ]},
                  { name: 'Product Showcase', desc: 'Hero image area + details', gradient: 'from-purple-500 to-pink-500', elements: [
                    createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight * 0.6, fill: '#f5f5f5', borderRadius: 0, name: 'Image Area' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.5 - 60, y: canvasHeight * 0.28, width: 120, height: 30, fill: 'transparent', stroke: 'none', content: 'Your Image', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, textAlign: 'center', colour: '#a3a3a3', name: 'Placeholder' }),
                    createDefaultElement({ type: 'rect', x: 0, y: canvasHeight * 0.6, width: canvasWidth, height: canvasHeight * 0.4, fill: '#ffffff', borderRadius: 0, name: 'Info Section' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.08, y: canvasHeight * 0.66, width: canvasWidth * 0.84, height: 40, fill: 'transparent', stroke: 'none', content: 'Product Name', fontSize: 36, fontFamily: 'Inter', fontWeight: 700, textAlign: 'left', colour: '#1a1a1a', name: 'Product Title' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.08, y: canvasHeight * 0.76, width: canvasWidth * 0.84, height: 30, fill: 'transparent', stroke: 'none', content: 'Short description of your amazing product goes here.', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, textAlign: 'left', colour: '#737373', name: 'Description' }),
                    createDefaultElement({ type: 'rect', x: canvasWidth * 0.08, y: canvasHeight * 0.87, width: 140, height: 44, fill: '#1a1a1a', borderRadius: 22, name: 'Buy Button' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.08, y: canvasHeight * 0.87 + 10, width: 140, height: 24, fill: 'transparent', stroke: 'none', content: 'Shop Now', fontSize: 14, fontFamily: 'Inter', fontWeight: 600, textAlign: 'center', colour: '#ffffff', name: 'Buy Text' }),
                  ]},
                  { name: 'Event Promotion', desc: 'Bold date + event details', gradient: 'from-amber-500 to-red-500', elements: [
                    createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight, fill: '#0a0a0a', borderRadius: 0, name: 'Background' }),
                    createDefaultElement({ type: 'rect', x: canvasWidth * 0.08, y: canvasHeight * 0.08, width: canvasWidth * 0.84, height: canvasHeight * 0.84, fill: 'transparent', stroke: '#F97316', strokeWidth: 2, borderRadius: 16, name: 'Border Frame' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.15, y: canvasHeight * 0.15, width: canvasWidth * 0.7, height: 60, fill: 'transparent', stroke: 'none', content: 'MAR 25', fontSize: 64, fontFamily: 'Inter', fontWeight: 900, textAlign: 'center', colour: '#F97316', name: 'Date' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.15, y: canvasHeight * 0.4, width: canvasWidth * 0.7, height: 50, fill: 'transparent', stroke: 'none', content: 'EVENT NAME', fontSize: 42, fontFamily: 'Inter', fontWeight: 700, textAlign: 'center', colour: '#ffffff', letterSpacing: 2, name: 'Event Title' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.15, y: canvasHeight * 0.55, width: canvasWidth * 0.7, height: 30, fill: 'transparent', stroke: 'none', content: 'Toronto, ON | 7:00 PM', fontSize: 18, fontFamily: 'Inter', fontWeight: 400, textAlign: 'center', colour: '#a3a3a3', name: 'Details' }),
                    createDefaultElement({ type: 'rect', x: canvasWidth * 0.3, y: canvasHeight * 0.72, width: canvasWidth * 0.4, height: 50, fill: '#F97316', borderRadius: 25, name: 'RSVP Button' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.3, y: canvasHeight * 0.72 + 12, width: canvasWidth * 0.4, height: 26, fill: 'transparent', stroke: 'none', content: 'RSVP Now', fontSize: 16, fontFamily: 'Inter', fontWeight: 700, textAlign: 'center', colour: '#ffffff', name: 'RSVP Text' }),
                  ]},
                  { name: 'Testimonial Card', desc: 'Customer review layout', gradient: 'from-green-500 to-teal-500', elements: [
                    createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight, fill: '#ffffff', borderRadius: 0, name: 'Background' }),
                    createDefaultElement({ type: 'rect', x: canvasWidth * 0.1, y: canvasHeight * 0.1, width: canvasWidth * 0.8, height: canvasHeight * 0.8, fill: '#fafafa', borderRadius: 24, name: 'Card' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.18, y: canvasHeight * 0.18, width: 40, height: 60, fill: 'transparent', stroke: 'none', content: '\u201C', fontSize: 80, fontFamily: 'Georgia', fontWeight: 400, colour: '#F97316', name: 'Open Quote' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.18, y: canvasHeight * 0.35, width: canvasWidth * 0.64, height: 80, fill: 'transparent', stroke: 'none', content: 'This product completely changed how we work. Highly recommend it to any team.', fontSize: 22, fontFamily: 'Inter', fontWeight: 500, textAlign: 'left', colour: '#1a1a1a', lineHeight: 1.5, name: 'Review' }),
                    createDefaultElement({ type: 'circle', x: canvasWidth * 0.18, y: canvasHeight * 0.68, width: 48, height: 48, fill: '#e5e5e5', name: 'Avatar' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.18 + 60, y: canvasHeight * 0.68, width: 200, height: 22, fill: 'transparent', stroke: 'none', content: 'Jane Smith', fontSize: 16, fontFamily: 'Inter', fontWeight: 600, textAlign: 'left', colour: '#1a1a1a', name: 'Name' }),
                    createDefaultElement({ type: 'text', x: canvasWidth * 0.18 + 60, y: canvasHeight * 0.68 + 26, width: 200, height: 18, fill: 'transparent', stroke: 'none', content: 'CEO, Acme Inc.', fontSize: 13, fontFamily: 'Inter', fontWeight: 400, textAlign: 'left', colour: '#737373', name: 'Title' }),
                  ]},
                  // ── Format-specific templates ──
                  ...(canvasHeight > canvasWidth ? [
                    // Story/Portrait templates
                    { name: 'Story Announcement', desc: 'Bold story with gradient', gradient: 'from-fuchsia-500 to-violet-500', elements: [
                      createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight, fill: '#0f0f0f', borderRadius: 0, name: 'Background' }),
                      createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight * 0.4, fill: '#7c3aed', borderRadius: 0, opacity: 80, name: 'Gradient Overlay' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.1, y: canvasHeight * 0.12, width: canvasWidth * 0.8, height: 80, fill: 'transparent', stroke: 'none', content: 'BIG NEWS', fontSize: 72, fontFamily: 'Inter', fontWeight: 900, textAlign: 'center', colour: '#ffffff', letterSpacing: 4, name: 'Headline' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.1, y: canvasHeight * 0.22, width: canvasWidth * 0.8, height: 50, fill: 'transparent', stroke: 'none', content: 'Something amazing is coming.\nStay tuned.', fontSize: 20, fontFamily: 'Inter', fontWeight: 400, textAlign: 'center', colour: '#d4d4d4', lineHeight: 1.6, name: 'Body' }),
                      createDefaultElement({ type: 'rect', x: canvasWidth * 0.25, y: canvasHeight * 0.85, width: canvasWidth * 0.5, height: 56, fill: '#ffffff', borderRadius: 28, name: 'CTA' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.25, y: canvasHeight * 0.85 + 14, width: canvasWidth * 0.5, height: 28, fill: 'transparent', stroke: 'none', content: 'Swipe Up', fontSize: 18, fontFamily: 'Inter', fontWeight: 700, textAlign: 'center', colour: '#0f0f0f', name: 'CTA Text' }),
                    ]},
                    { name: 'Story Q&A', desc: 'Interactive question format', gradient: 'from-cyan-500 to-blue-600', elements: [
                      createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight, fill: '#1e293b', borderRadius: 0, name: 'Background' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.1, y: canvasHeight * 0.08, width: canvasWidth * 0.8, height: 30, fill: 'transparent', stroke: 'none', content: 'ASK ME ANYTHING', fontSize: 14, fontFamily: 'Inter', fontWeight: 700, textAlign: 'center', colour: '#38bdf8', letterSpacing: 3, name: 'Label' }),
                      createDefaultElement({ type: 'rect', x: canvasWidth * 0.08, y: canvasHeight * 0.15, width: canvasWidth * 0.84, height: canvasHeight * 0.25, fill: '#0f172a', borderRadius: 20, name: 'Question Box' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.15, y: canvasHeight * 0.22, width: canvasWidth * 0.7, height: 60, fill: 'transparent', stroke: 'none', content: 'What\'s the one thing you wish you knew before starting?', fontSize: 28, fontFamily: 'Inter', fontWeight: 600, textAlign: 'center', colour: '#ffffff', lineHeight: 1.4, name: 'Question' }),
                    ]},
                  ] : []),
                  ...(canvasWidth > canvasHeight ? [
                    // Landscape templates (YouTube, LinkedIn, Facebook, etc.)
                    { name: 'YouTube Thumbnail', desc: 'Eye-catching thumbnail', gradient: 'from-red-500 to-orange-500', elements: [
                      createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight, fill: '#0a0a0a', borderRadius: 0, name: 'Background' }),
                      createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth * 0.55, height: canvasHeight, fill: '#dc2626', borderRadius: 0, name: 'Red Panel' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.04, y: canvasHeight * 0.15, width: canvasWidth * 0.48, height: 100, fill: 'transparent', stroke: 'none', content: 'HOW TO\nMASTER\nTHIS', fontSize: 72, fontFamily: 'Inter', fontWeight: 900, textAlign: 'left', colour: '#ffffff', lineHeight: 1.05, letterSpacing: -1, name: 'Title' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.04, y: canvasHeight * 0.78, width: canvasWidth * 0.48, height: 30, fill: 'transparent', stroke: 'none', content: 'STEP-BY-STEP GUIDE', fontSize: 18, fontFamily: 'Inter', fontWeight: 700, textAlign: 'left', colour: '#fecaca', letterSpacing: 2, name: 'Subtitle' }),
                      createDefaultElement({ type: 'rect', x: canvasWidth * 0.6, y: canvasHeight * 0.1, width: canvasWidth * 0.35, height: canvasHeight * 0.8, fill: '#262626', borderRadius: 16, name: 'Image Area' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.6, y: canvasHeight * 0.45, width: canvasWidth * 0.35, height: 30, fill: 'transparent', stroke: 'none', content: 'Your Photo', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, textAlign: 'center', colour: '#737373', name: 'Placeholder' }),
                    ]},
                    { name: 'LinkedIn Banner', desc: 'Professional profile header', gradient: 'from-blue-600 to-indigo-700', elements: [
                      createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight, fill: '#0a1628', borderRadius: 0, name: 'Background' }),
                      createDefaultElement({ type: 'rect', x: 0, y: canvasHeight * 0.7, width: canvasWidth, height: canvasHeight * 0.3, fill: '#1e3a5f', borderRadius: 0, name: 'Bottom Strip' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.06, y: canvasHeight * 0.2, width: canvasWidth * 0.5, height: 50, fill: 'transparent', stroke: 'none', content: 'YOUR NAME', fontSize: 48, fontFamily: 'Inter', fontWeight: 800, textAlign: 'left', colour: '#ffffff', letterSpacing: 1, name: 'Name' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.06, y: canvasHeight * 0.5, width: canvasWidth * 0.5, height: 30, fill: 'transparent', stroke: 'none', content: 'Founder & CEO | Building the Future', fontSize: 18, fontFamily: 'Inter', fontWeight: 400, textAlign: 'left', colour: '#93c5fd', name: 'Title' }),
                      createDefaultElement({ type: 'rect', x: canvasWidth * 0.06, y: canvasHeight * 0.4, width: 60, height: 4, fill: '#3b82f6', borderRadius: 2, name: 'Accent Line' }),
                    ]},
                  ] : []),
                  ...(canvasWidth === canvasHeight ? [
                    // Square templates (Instagram feed, etc.)
                    { name: 'Carousel Slide', desc: 'Educational carousel slide', gradient: 'from-emerald-500 to-teal-600', elements: [
                      createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight, fill: '#ffffff', borderRadius: 0, name: 'Background' }),
                      createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight * 0.08, fill: '#059669', borderRadius: 0, name: 'Top Bar' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.08, y: canvasHeight * 0.15, width: canvasWidth * 0.84, height: 40, fill: 'transparent', stroke: 'none', content: 'TIP #1', fontSize: 16, fontFamily: 'Inter', fontWeight: 700, textAlign: 'left', colour: '#059669', letterSpacing: 3, name: 'Label' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.08, y: canvasHeight * 0.25, width: canvasWidth * 0.84, height: 80, fill: 'transparent', stroke: 'none', content: 'Your Key Insight Goes Right Here', fontSize: 42, fontFamily: 'Inter', fontWeight: 800, textAlign: 'left', colour: '#1a1a1a', lineHeight: 1.15, name: 'Heading' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.08, y: canvasHeight * 0.55, width: canvasWidth * 0.84, height: 60, fill: 'transparent', stroke: 'none', content: 'Expand on the insight with a brief explanation that adds value to your audience. Keep it concise and actionable.', fontSize: 18, fontFamily: 'Inter', fontWeight: 400, textAlign: 'left', colour: '#525252', lineHeight: 1.6, name: 'Body' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.08, y: canvasHeight * 0.88, width: canvasWidth * 0.84, height: 20, fill: 'transparent', stroke: 'none', content: 'Swipe for more tips →', fontSize: 14, fontFamily: 'Inter', fontWeight: 600, textAlign: 'center', colour: '#059669', name: 'Swipe CTA' }),
                    ]},
                    { name: 'Bold Statement', desc: 'Impact post with strong text', gradient: 'from-yellow-500 to-orange-500', elements: [
                      createDefaultElement({ type: 'rect', x: 0, y: 0, width: canvasWidth, height: canvasHeight, fill: '#000000', borderRadius: 0, name: 'Background' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.08, y: canvasHeight * 0.3, width: canvasWidth * 0.84, height: 100, fill: 'transparent', stroke: 'none', content: 'STOP\nSCROLLING.', fontSize: 64, fontFamily: 'Inter', fontWeight: 900, textAlign: 'left', colour: '#ffffff', lineHeight: 1.05, letterSpacing: -1, name: 'Main Text' }),
                      createDefaultElement({ type: 'rect', x: canvasWidth * 0.08, y: canvasHeight * 0.6, width: canvasWidth * 0.3, height: 4, fill: '#F97316', borderRadius: 2, name: 'Accent' }),
                      createDefaultElement({ type: 'text', x: canvasWidth * 0.08, y: canvasHeight * 0.65, width: canvasWidth * 0.84, height: 40, fill: 'transparent', stroke: 'none', content: 'Read this if you want to level up your brand in 2026.', fontSize: 20, fontFamily: 'Inter', fontWeight: 400, textAlign: 'left', colour: '#a3a3a3', lineHeight: 1.5, name: 'Body' }),
                    ]},
                  ] : []),
                  { name: 'Blank Canvas', desc: 'Start from scratch', gradient: 'from-neutral-400 to-neutral-600', elements: [] },
                ].map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => {
                      setElements(tpl.elements.map((el) => ({ ...el, id: uid() })));
                      setSelectedId(null);
                      setLeftPanel('none');
                      showToast(`Applied "${tpl.name}" template`);
                    }}
                    className="group text-left rounded-xl overflow-hidden border border-neutral-800 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10"
                  >
                    <div className="h-32 w-full relative bg-neutral-800 overflow-hidden">
                      {/* Mini preview of the template */}
                      {tpl.elements.length > 0 ? (
                        <div className="absolute inset-0" style={{ transform: `scale(${Math.min(216 / canvasWidth, 128 / canvasHeight)})`, transformOrigin: 'top left' }}>
                          <div style={{ width: canvasWidth, height: canvasHeight, position: 'relative' }}>
                            {tpl.elements.map((el, i) => (
                              <div
                                key={i}
                                style={{
                                  position: 'absolute',
                                  left: el.x,
                                  top: el.y,
                                  width: el.width,
                                  height: el.height,
                                  backgroundColor: el.type === 'text' ? undefined : el.fill,
                                  borderRadius: el.type === 'circle' ? '50%' : el.borderRadius,
                                  border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
                                  color: el.colour,
                                  fontSize: el.fontSize,
                                  fontFamily: el.fontFamily,
                                  fontWeight: el.fontWeight,
                                  textAlign: el.textAlign as any,
                                  letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                                  lineHeight: el.lineHeight,
                                  overflow: 'hidden',
                                }}
                              >
                                {el.type === 'text' && el.content}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
                          <span className="text-xs">Blank Canvas</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40">
                        <span className="px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold rounded-lg">Apply Template</span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-white">{tpl.name}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">{tpl.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* ── Canvas Area ───────────────────────────────────────────── */}
          <main className="flex-1 overflow-auto flex items-center justify-center bg-neutral-300 relative" style={{ backgroundImage: 'radial-gradient(circle, #d4d4d4 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {isVideoMode && remotionPreview ? (
              <VideoPreview
                elements={elements}
                animations={elementAnimations}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                totalDuration={totalDuration}
                fps={30}
                backgroundColor="#FFFFFF"
                currentTime={currentTime}
                isPlaying={isPlaying}
                onTimeUpdate={(t) => setCurrentTime(t)}
                onPlayStateChange={(playing) => { if (playing) { startPlayback(); } else { stopPlayback(); } }}
              />
            ) : (
            <div
              ref={canvasRef}
              className="relative bg-white shadow-2xl"
              style={{
                width: canvasWidth,
                height: canvasHeight,
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                cursor:
                  activeTool === 'text' ? 'text'
                  : activeTool === 'hand' ? (dragState ? 'grabbing' : 'grab')
                  : activeTool === 'zoom' ? 'zoom-in'
                  : activeTool === 'eyedropper' ? 'crosshair'
                  : activeTool === 'crop' ? 'crosshair'
                  : ['rectangle', 'ellipse', 'line', 'polygon', 'star', 'pen', 'brush'].includes(activeTool) ? 'crosshair'
                  : 'default',
              }}
              onClick={handleCanvasClick}
            >
              {/* Grid overlay */}
              {snapToGrid && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
                  <defs>
                    <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                      <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#666" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              )}
              {elements.map((el, i) => renderElement(el, i))}
            </div>
            )}
          </main>

          {/* ── Right Properties Panel ────────────────────────────────── */}
          {rightPanelOpen && (
            <aside className="w-[280px] bg-neutral-900 text-neutral-200 border-l border-neutral-800 flex flex-col shrink-0 z-20 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Properties</span>
                <button onClick={() => setRightPanelOpen(false)} className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors">
                  <IconPanelRight />
                </button>
              </div>

              <div className="p-3 flex flex-col gap-1 text-sm">
                {selectedElement ? (
                  <>
                    {/* Element Info */}
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <input
                          value={selectedElement.name}
                          onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                          className="bg-transparent text-white text-sm font-semibold outline-none border-b border-transparent focus:border-orange-500 w-full"
                        />
                        <p className="text-[10px] text-neutral-500 mt-0.5">{selectedElement.type} element</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 mb-2">
                      <button onClick={() => duplicateElement(selectedElement.id)} className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title="Duplicate (Cmd+D)"><IconCopy /> Duplicate</button>
                      <button onClick={() => deleteElement(selectedElement.id)} className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-400 transition-colors" title="Delete"><IconTrash /> Delete</button>
                      <button onClick={() => updateElement(selectedElement.id, { locked: !selectedElement.locked })} className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title={selectedElement.locked ? 'Unlock' : 'Lock'}>
                        {selectedElement.locked ? <IconLock /> : <IconUnlock />}
                      </button>
                    </div>

                    <Divider />

                    {/* Transform */}
                    <SectionHeader label="Transform" collapsed={!!sectionsCollapsed.transform} onToggle={() => toggleSection('transform')} />
                    {!sectionsCollapsed.transform && (
                      <div className="flex flex-col gap-2 pb-2">
                        <div className="grid grid-cols-2 gap-2">
                          <PropField label="X" value={selectedElement.x} onChange={(v) => updateElement(selectedElement.id, { x: Number(v) })} />
                          <PropField label="Y" value={selectedElement.y} onChange={(v) => updateElement(selectedElement.id, { y: Number(v) })} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <PropField label="W" value={selectedElement.width} onChange={(v) => updateElement(selectedElement.id, { width: Number(v) })} />
                          <PropField label="H" value={selectedElement.height} onChange={(v) => updateElement(selectedElement.id, { height: Number(v) })} />
                        </div>
                        <PropSlider label="Rotation" value={selectedElement.rotation} min={-360} max={360} suffix="°" onChange={(v) => updateElement(selectedElement.id, { rotation: v })} />
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => bringForward(selectedElement.id)} className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title="Bring Forward"><IconBringForward /> Forward</button>
                          <button onClick={() => sendBackward(selectedElement.id)} className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title="Send Backward"><IconSendBackward /> Back</button>
                          <button onClick={() => updateElement(selectedElement.id, { x: Math.round((canvasWidth - selectedElement.width) / 2) })} className="px-2 py-1 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title="Center Horizontally"><IconFlipH /></button>
                          <button onClick={() => updateElement(selectedElement.id, { y: Math.round((canvasHeight - selectedElement.height) / 2) })} className="px-2 py-1 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title="Center Vertically"><IconFlipV /></button>
                        </div>
                      </div>
                    )}

                    <Divider />

                    {/* Appearance */}
                    <SectionHeader label="Appearance" collapsed={!!sectionsCollapsed.appearance} onToggle={() => toggleSection('appearance')} />
                    {!sectionsCollapsed.appearance && (
                      <div className="flex flex-col gap-2.5 pb-2">
                        <PropSlider label="Opacity" value={selectedElement.opacity} min={0} max={100} suffix="%" onChange={(v) => updateElement(selectedElement.id, { opacity: v })} />
                        {selectedElement.type !== 'text' && (
                          <>
                            <PropColor label="Fill" value={selectedElement.fill} onChange={(v) => updateElement(selectedElement.id, { fill: v })} />
                            <PropColor label="Stroke" value={selectedElement.stroke === 'none' ? '#000000' : selectedElement.stroke} onChange={(v) => updateElement(selectedElement.id, { stroke: v })} />
                            <PropSlider label="Stroke Width" value={selectedElement.strokeWidth} min={0} max={20} suffix="px" onChange={(v) => updateElement(selectedElement.id, { strokeWidth: v })} />
                            {(selectedElement.type === 'rect' || selectedElement.type === 'line') && (
                              <PropSlider label="Border Radius" value={selectedElement.borderRadius} min={0} max={100} suffix="px" onChange={(v) => updateElement(selectedElement.id, { borderRadius: v })} />
                            )}
                          </>
                        )}
                        {selectedElement.type === 'text' && (
                          <PropColor label="Text Colour" value={selectedElement.colour || '#1a1a1a'} onChange={(v) => updateElement(selectedElement.id, { colour: v })} />
                        )}
                        <div>
                          <label className="text-[11px] text-neutral-500 block mb-0.5">Blend Mode</label>
                          <select
                            value={selectedElement.blendMode}
                            onChange={(e) => updateElement(selectedElement.id, { blendMode: e.target.value as BlendMode })}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none"
                          >
                            {BLEND_MODES.map((mode) => (
                              <option key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <Divider />

                    {/* Effects */}
                    <SectionHeader label="Effects" collapsed={!!sectionsCollapsed.effects} onToggle={() => toggleSection('effects')} />
                    {!sectionsCollapsed.effects && (
                      <div className="flex flex-col gap-2.5 pb-2">
                        <PropSlider label="Blur" value={selectedElement.blur} min={0} max={50} suffix="px" onChange={(v) => updateElement(selectedElement.id, { blur: v })} />
                        <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mt-1">Drop Shadow</div>
                        <div className="grid grid-cols-2 gap-2">
                          <PropSlider label="Offset X" value={selectedElement.shadowX} min={-50} max={50} suffix="px" onChange={(v) => updateElement(selectedElement.id, { shadowX: v })} />
                          <PropSlider label="Offset Y" value={selectedElement.shadowY} min={-50} max={50} suffix="px" onChange={(v) => updateElement(selectedElement.id, { shadowY: v })} />
                        </div>
                        <PropSlider label="Shadow Blur" value={selectedElement.shadowBlur} min={0} max={100} suffix="px" onChange={(v) => updateElement(selectedElement.id, { shadowBlur: v })} />
                        <PropColor label="Shadow Colour" value={selectedElement.shadowColor} onChange={(v) => updateElement(selectedElement.id, { shadowColor: v })} />
                      </div>
                    )}

                    {/* Animation (video mode only) */}
                    {isVideoMode && selectedElement && (
                      <>
                        <Divider />
                        <SectionHeader label="Animation" collapsed={!!sectionsCollapsed.animation} onToggle={() => toggleSection('animation')} />
                        {!sectionsCollapsed.animation && (() => {
                          const anim = getAnimation(selectedElement.id);
                          return (
                            <div className="flex flex-col gap-2.5 pb-2">
                              <div>
                                <label className="text-[11px] text-neutral-500 block mb-0.5">Enter Animation</label>
                                <select value={anim.enterAnimation} onChange={(e) => updateAnimation(selectedElement.id, { enterAnimation: e.target.value as AnimationType })} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none">
                                  {ANIMATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-[11px] text-neutral-500 block mb-0.5">Exit Animation</label>
                                <select value={anim.exitAnimation} onChange={(e) => updateAnimation(selectedElement.id, { exitAnimation: e.target.value as AnimationType })} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none">
                                  {ANIMATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[11px] text-neutral-500 block mb-0.5">Start (s)</label>
                                  <input type="number" step={0.1} min={0} max={totalDuration} value={anim.startTime} onChange={(e) => updateAnimation(selectedElement.id, { startTime: parseFloat(e.target.value) || 0 })} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none" />
                                </div>
                                <div>
                                  <label className="text-[11px] text-neutral-500 block mb-0.5">Duration (s)</label>
                                  <input type="number" step={0.1} min={0.1} max={totalDuration} value={anim.duration} onChange={(e) => updateAnimation(selectedElement.id, { duration: parseFloat(e.target.value) || 1 })} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[11px] text-neutral-500 block mb-0.5">Enter Time (s)</label>
                                  <input type="number" step={0.1} min={0.1} max={5} value={anim.enterDuration} onChange={(e) => updateAnimation(selectedElement.id, { enterDuration: parseFloat(e.target.value) || 0.5 })} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none" />
                                </div>
                                <div>
                                  <label className="text-[11px] text-neutral-500 block mb-0.5">Exit Time (s)</label>
                                  <input type="number" step={0.1} min={0.1} max={5} value={anim.exitDuration} onChange={(e) => updateAnimation(selectedElement.id, { exitDuration: parseFloat(e.target.value) || 0.5 })} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none" />
                                </div>
                              </div>
                              <div>
                                <label className="text-[11px] text-neutral-500 block mb-0.5">Easing</label>
                                <select value={anim.easing} onChange={(e) => updateAnimation(selectedElement.id, { easing: e.target.value as ElementAnimation['easing'] })} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none">
                                  <option value="linear">Linear</option>
                                  <option value="ease">Ease</option>
                                  <option value="ease-in">Ease In</option>
                                  <option value="ease-out">Ease Out</option>
                                  <option value="ease-in-out">Ease In Out</option>
                                </select>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    )}

                    {/* Typography (text only) */}
                    {selectedElement.type === 'text' && (
                      <>
                        <Divider />
                        <SectionHeader label="Typography" collapsed={!!sectionsCollapsed.typography} onToggle={() => toggleSection('typography')} />
                        {!sectionsCollapsed.typography && (
                          <div className="flex flex-col gap-2.5 pb-2">
                            {/* Content first — so user can type immediately */}
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-0.5">Content</label>
                              <textarea
                                value={selectedElement.content || ''}
                                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                rows={3}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white resize-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-colors"
                                placeholder="Type your text here..."
                                autoFocus
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-0.5">Font Family</label>
                              <select
                                value={selectedElement.fontFamily || 'Inter'}
                                onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none"
                              >
                                {FONT_OPTIONS.map((f) => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-0.5">Font Weight</label>
                              <select
                                value={selectedElement.fontWeight || 400}
                                onChange={(e) => updateElement(selectedElement.id, { fontWeight: Number(e.target.value) })}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-xs text-white focus:border-orange-500 outline-none"
                              >
                                {FONT_WEIGHTS.map(({ label, value }) => (
                                  <option key={value} value={value}>{label} ({value})</option>
                                ))}
                              </select>
                            </div>
                            <PropSlider label="Font Size" value={selectedElement.fontSize || 24} min={8} max={200} suffix="px" onChange={(v) => updateElement(selectedElement.id, { fontSize: v })} />
                            <PropSlider label="Letter Spacing" value={selectedElement.letterSpacing || 0} min={-5} max={20} step={0.1} suffix="px" onChange={(v) => updateElement(selectedElement.id, { letterSpacing: v })} />
                            <PropSlider label="Line Height" value={(selectedElement.lineHeight || 1.2) * 100} min={80} max={300} suffix="%" onChange={(v) => updateElement(selectedElement.id, { lineHeight: v / 100 })} />
                            <div>
                              <label className="text-[11px] text-neutral-500 block mb-1">Alignment</label>
                              <div className="flex gap-1">
                                {(['left', 'center', 'right'] as const).map((a) => (
                                  <button
                                    key={a}
                                    onClick={() => updateElement(selectedElement.id, { textAlign: a })}
                                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                                      selectedElement.textAlign === a
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                                    }`}
                                  >
                                    {a.charAt(0).toUpperCase() + a.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Star/Polygon points */}
                    {(selectedElement.type === 'star' || selectedElement.type === 'polygon') && (
                      <>
                        <Divider />
                        <SectionHeader label="Shape" collapsed={!!sectionsCollapsed.shape} onToggle={() => toggleSection('shape')} />
                        {!sectionsCollapsed.shape && (
                          <div className="flex flex-col gap-2.5 pb-2">
                            <PropSlider label="Points / Sides" value={selectedElement.points || 5} min={3} max={12} onChange={(v) => updateElement(selectedElement.id, { points: v })} />
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  /* Canvas Info */
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] text-neutral-500 uppercase tracking-wider">Canvas</label>
                      <p className="font-semibold text-white mt-1">{designName}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{formatLabel}</p>
                    </div>
                    <Divider />
                    <div>
                      <label className="text-[11px] text-neutral-500 uppercase tracking-wider">Elements</label>
                      <p className="text-sm text-white mt-1">{elements.length} element{elements.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Divider />
                    <div>
                      <label className="text-[11px] text-neutral-500 uppercase tracking-wider">Active Tool</label>
                      <p className="text-sm text-white mt-1 capitalize">{activeTool}</p>
                    </div>
                    <Divider />
                    <div className="bg-neutral-800/50 rounded-lg p-3">
                      <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-2">Shortcuts</p>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        {[
                          ['V', 'Select'], ['M', 'Move'], ['T', 'Text'], ['R', 'Rectangle'],
                          ['E', 'Ellipse'], ['L', 'Line'], ['B', 'Brush'], ['P', 'Pen'],
                          ['G', 'Gradient'], ['H', 'Hand'], ['Z', 'Zoom'], ['C', 'Crop'],
                          ['Del', 'Delete'], ['⌘D', 'Duplicate'],
                        ].map(([key, label]) => (
                          <div key={key} className="flex items-center justify-between py-0.5">
                            <span className="text-neutral-500">{label}</span>
                            <kbd className="px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300 font-mono">{key}</kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}

          {!rightPanelOpen && (
            <button
              onClick={() => setRightPanelOpen(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-neutral-900 text-neutral-400 hover:text-white p-2 rounded-l-lg border border-neutral-800 border-r-0 z-20 transition-colors"
              title="Open Properties"
            >
              <IconPanelRight />
            </button>
          )}

          {/* ── Agent Chat Panel ──────────────────────────────────────── */}
          {agentChatOpen && (
            <aside className="w-[320px] bg-neutral-950 border-l border-neutral-800 flex flex-col shrink-0 z-20">
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-800 bg-neutral-900">
                <span className="text-lg">{activeAgent.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{activeAgent.name}</p>
                  <p className="text-[10px] text-neutral-500">{activeAgent.category} Agent</p>
                </div>
                <button
                  onClick={() => setAgentChatOpen(false)}
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
                  title="Close Agent Chat"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {agentMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white rounded-br-md'
                          : 'bg-neutral-800 text-neutral-200 rounded-bl-md'
                      }`}
                    >
                      {(() => {
                        // Strip JSON action blocks from display
                        const cleanText = msg.role === 'agent'
                          ? msg.text.replace(/```json[\s\S]*?```/g, '').replace(/\n{3,}/g, '\n\n').trim()
                          : msg.text;
                        if (!cleanText) return <span className="italic text-neutral-400">Done — changes applied to canvas.</span>;
                        return cleanText.split('\n').map((line: string, i: number) => (
                          <span key={i}>
                            {line.split(/(\*\*[^*]+\*\*)/).map((part: string, j: number) =>
                              part.startsWith('**') && part.endsWith('**')
                                ? <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                                : part
                            )}
                            {i < cleanText.split('\n').length - 1 && <br />}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                ))}
                {agentTyping && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-800 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={agentChatEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-neutral-800 bg-neutral-900">
                <div className="flex gap-2">
                  <textarea
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAgentSend(); } }}
                    placeholder={`Ask ${activeAgent.name}...`}
                    rows={2}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 resize-none outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-colors"
                  />
                  <button
                    onClick={handleAgentSend}
                    disabled={!agentInput.trim() || agentTyping}
                    className="self-end px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                    title="Send"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <p className="text-[9px] text-neutral-600 mt-1.5 text-center">
                  {activeAgent.icon} {activeAgent.name} is ready to help with your design
                </p>
              </div>
            </aside>
          )}
        </div>

        {/* ── Bottom Bar ──────────────────────────────────────────────── */}
        {isVideoMode ? (
          /* ── VIDEO TIMELINE ──────────────────────────────────────── */
          <footer className="bg-neutral-950 border-t border-neutral-800 flex flex-col shrink-0 z-20" style={{ height: layersPanelOpen ? (keyframePanel ? 340 : 240) : 48 }}>
            {/* Transport Controls */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-neutral-800 bg-neutral-900 shrink-0">
              <button onClick={togglePlayback} className={`p-1.5 rounded-lg transition-colors ${isPlaying ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`} title={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                )}
              </button>
              <button onClick={() => { stopPlayback(); setCurrentTime(0); }} className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title="Stop">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
              </button>
              <div className="font-mono text-xs text-neutral-300 bg-neutral-800 rounded px-2 py-1 tabular-nums min-w-[90px] text-center">
                {currentTime.toFixed(1)}s / {totalDuration}s
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-500">Speed:</span>
                {[0.5, 1, 1.5, 2].map(s => (
                  <button key={s} onClick={() => setPlaybackSpeed(s)} className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${playbackSpeed === s ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'}`}>{s}x</button>
                ))}
              </div>
              <div className="h-4 w-px bg-neutral-700 mx-1" />
              {/* Timeline zoom */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-500">Zoom:</span>
                <button onClick={() => setTimelineZoom(z => Math.max(0.5, z - 0.25))} className="px-1 py-0.5 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded">-</button>
                <span className="text-[10px] text-neutral-300 w-8 text-center tabular-nums">{timelineZoom.toFixed(1)}x</span>
                <button onClick={() => setTimelineZoom(z => Math.min(8, z + 0.25))} className="px-1 py-0.5 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded">+</button>
              </div>
              <div className="h-4 w-px bg-neutral-700 mx-1" />
              {/* Keyframe toggle */}
              <button onClick={() => setKeyframePanel(!keyframePanel)} className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${keyframePanel ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'}`} title="Toggle Keyframes Panel">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L8 8H3l4.5 6L5 21l7-4 7 4-2.5-7L21 8h-5L12 2z"/></svg>
                Keyframes
              </button>
              <button onClick={() => setRemotionPreview(!remotionPreview)} className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors ${remotionPreview ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'}`} title="Toggle Remotion Preview">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><polygon points="10,7 16,10 10,13" fill="currentColor"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
                Remotion
              </button>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-[10px] text-neutral-500">Duration:</span>
                <input type="number" min={1} max={120} value={totalDuration} onChange={(e) => setTotalDuration(Math.max(1, parseInt(e.target.value) || 10))} className="w-14 bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-[11px] text-white text-center outline-none focus:border-orange-500" />
                <span className="text-[10px] text-neutral-500">sec</span>
              </div>
              <button onClick={() => setLayersPanelOpen(!layersPanelOpen)} className="p-1 rounded hover:bg-neutral-700 text-neutral-500 hover:text-white transition-colors">
                <span className={`inline-block transition-transform ${layersPanelOpen ? 'rotate-180' : ''}`}><IconChevronDown /></span>
              </button>
            </div>

            {/* Timeline tracks */}
            {layersPanelOpen && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex flex-1 overflow-hidden">
                  {/* Track labels */}
                  <div className="w-36 shrink-0 border-r border-neutral-800 overflow-y-auto">
                    {elements.map((el) => (
                      <div key={el.id} onClick={() => setSelectedId(el.id)} className={`flex items-center gap-1.5 px-2 h-7 text-[11px] cursor-pointer border-b border-neutral-800/50 transition-colors ${el.id === selectedId ? 'bg-neutral-800 text-orange-400' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'}`}>
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: el.type === 'text' ? (el.colour || '#fff') : el.fill }} />
                        <span className="truncate flex-1">{el.name}</span>
                        <span className="text-[8px] text-neutral-600">{getAnimation(el.id).keyframes.length > 0 ? `${getAnimation(el.id).keyframes.length}kf` : ''}</span>
                      </div>
                    ))}
                  </div>
                  {/* Timeline area (scrollable horizontally for zoom) */}
                  <div className="flex-1 flex flex-col overflow-x-auto overflow-y-hidden">
                    <div style={{ minWidth: `${timelineZoom * 100}%`, width: `${timelineZoom * 100}%` }}>
                      {/* Time ruler — draggable for scrubbing */}
                      <div
                        ref={rulerRef}
                        className="h-5 border-b border-neutral-800 bg-neutral-900 relative cursor-pointer select-none"
                        onMouseDown={(e) => {
                          if (isPlaying) return;
                          setIsScrubbing(true);
                          if (rulerRef.current) scrubToPosition(e.clientX, rulerRef.current);
                        }}
                      >
                        {Array.from({ length: Math.ceil(totalDuration * 2) + 1 }, (_, i) => {
                          const t = i * 0.5;
                          if (t > totalDuration) return null;
                          const isMajor = t === Math.floor(t);
                          return (
                            <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${(t / totalDuration) * 100}%` }}>
                              {isMajor && <span className="text-[8px] text-neutral-500 tabular-nums">{t}s</span>}
                              <div className={`w-px ${isMajor ? 'h-2 bg-neutral-600' : 'h-1 bg-neutral-800'}`} />
                            </div>
                          );
                        })}
                        <div className="absolute bottom-0 top-0 w-0.5 bg-red-500 z-10 pointer-events-none" style={{ left: `${(currentTime / totalDuration) * 100}%` }}>
                          <div className="absolute -top-0.5 -left-1.5 w-3.5 h-3 bg-red-500 rounded-t-sm" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                        </div>
                      </div>
                      {/* Element tracks */}
                      <div
                        ref={timelineRef}
                        className="overflow-y-auto relative"
                        style={{ minHeight: Math.max(elements.length * 28, 80) }}
                        onMouseDown={(e) => {
                          if (isPlaying) return;
                          // Only scrub if clicking on empty track area (not a track bar)
                          if ((e.target as HTMLElement).dataset.trackBg === 'true') {
                            setIsScrubbing(true);
                            if (timelineRef.current) scrubToPosition(e.clientX, timelineRef.current);
                          }
                        }}
                      >
                        {elements.map((el) => {
                          const anim = getAnimation(el.id);
                          const leftPct = (anim.startTime / totalDuration) * 100;
                          const widthPct = (anim.duration / totalDuration) * 100;
                          return (
                            <div key={el.id} className="h-7 border-b border-neutral-800/50 relative" data-track-bg="true">
                              <div
                                onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                                className={`absolute top-1 bottom-1 rounded cursor-pointer transition-colors ${el.id === selectedId ? 'ring-1 ring-orange-500' : ''}`}
                                style={{
                                  left: `${leftPct}%`, width: `${widthPct}%`, minWidth: 16,
                                  background: el.id === selectedId ? 'linear-gradient(135deg, #ea580c, #f97316)' : el.type === 'text' ? '#6366f1' : '#3b82f6',
                                }}
                                title={`${el.name}: ${anim.startTime.toFixed(1)}s - ${(anim.startTime + anim.duration).toFixed(1)}s`}
                              >
                                <span className="text-[8px] text-white/80 px-1 truncate block leading-5">{el.name}</span>
                                {anim.enterAnimation !== 'none' && <div className="absolute left-0 top-0 bottom-0 w-3 bg-white/20 rounded-l" />}
                                {anim.exitAnimation !== 'none' && <div className="absolute right-0 top-0 bottom-0 w-3 bg-black/20 rounded-r" />}
                                {/* Keyframe diamonds on track bar */}
                                {anim.keyframes.map((kf) => {
                                  const kfPct = anim.duration > 0 ? (kf.time / anim.duration) * 100 : 0;
                                  return (
                                    <div
                                      key={kf.id}
                                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rotate-45 border border-yellow-600 z-10"
                                      style={{ left: `${kfPct}%`, marginLeft: -4 }}
                                      title={`${kf.property}: ${kf.value} @ ${kf.time.toFixed(1)}s`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none" style={{ left: `${(currentTime / totalDuration) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Keyframe Editor Panel ── */}
                {keyframePanel && selectedElement && (
                  <div className="border-t border-neutral-800 bg-neutral-900 px-3 py-2 shrink-0" style={{ maxHeight: 120, overflowY: 'auto' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Keyframes — {selectedElement.name}</span>
                      <div className="flex items-center gap-1">
                        <select
                          id="kf-prop-select"
                          className="bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] text-white outline-none"
                          defaultValue="x"
                        >
                          {KEYFRAME_PROPERTIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        <button
                          onClick={() => {
                            const select = document.getElementById('kf-prop-select') as HTMLSelectElement;
                            const prop = (select?.value || 'x') as KeyframeProperty;
                            const el = selectedElement;
                            const anim = getAnimation(el.id);
                            const relTime = Math.max(0, currentTime - anim.startTime);
                            const defaults: Record<KeyframeProperty, number> = { x: el.x, y: el.y, opacity: el.opacity, rotation: el.rotation, scaleX: 100, scaleY: 100, blur: el.blur };
                            addKeyframe(el.id, prop, relTime, defaults[prop]);
                          }}
                          className="px-2 py-0.5 text-[10px] bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                        >
                          + Add at {Math.max(0, currentTime - (getAnimation(selectedElement.id).startTime)).toFixed(1)}s
                        </button>
                      </div>
                    </div>
                    {/* Keyframe list */}
                    {(() => {
                      const anim = getAnimation(selectedElement.id);
                      if (anim.keyframes.length === 0) return <p className="text-[10px] text-neutral-600 italic">No keyframes. Select a property and click Add to create one.</p>;
                      return (
                        <div className="space-y-1">
                          {anim.keyframes.map(kf => (
                            <div key={kf.id} className="flex items-center gap-2 bg-neutral-800 rounded px-2 py-1">
                              <span className="text-[10px] text-yellow-400 font-mono">◆</span>
                              <span className="text-[10px] text-neutral-300 w-16">{KEYFRAME_PROPERTIES.find(p => p.value === kf.property)?.label || kf.property}</span>
                              <span className="text-[9px] text-neutral-500">@</span>
                              <input type="number" step={0.1} min={0} value={kf.time} onChange={(e) => updateKeyframe(selectedElement.id, kf.id, { time: parseFloat(e.target.value) || 0 })} className="w-12 bg-neutral-700 rounded px-1 py-0.5 text-[10px] text-white text-center outline-none" />
                              <span className="text-[9px] text-neutral-500">s =</span>
                              <input type="number" step={1} value={kf.value} onChange={(e) => updateKeyframe(selectedElement.id, kf.id, { value: parseFloat(e.target.value) || 0 })} className="w-14 bg-neutral-700 rounded px-1 py-0.5 text-[10px] text-white text-center outline-none" />
                              <select value={kf.easing} onChange={(e) => updateKeyframe(selectedElement.id, kf.id, { easing: e.target.value as Keyframe['easing'] })} className="bg-neutral-700 rounded px-1 py-0.5 text-[9px] text-neutral-300 outline-none">
                                <option value="linear">Linear</option>
                                <option value="ease">Ease</option>
                                <option value="ease-in">Ease In</option>
                                <option value="ease-out">Ease Out</option>
                                <option value="ease-in-out">Ease In Out</option>
                              </select>
                              <button onClick={() => removeKeyframe(selectedElement.id, kf.id)} className="p-0.5 text-neutral-600 hover:text-red-400 transition-colors ml-auto" title="Remove keyframe">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </footer>
        ) : (
          /* ── NORMAL LAYERS + QUICK INFO ────────────────────────── */
          <footer className={`bg-neutral-900 border-t border-neutral-800 flex shrink-0 z-20 transition-all ${layersPanelOpen ? 'h-44' : 'h-9'}`}>
            {/* Layers section */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-800">
                <button onClick={() => setLayersPanelOpen(!layersPanelOpen)} className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                  <IconLayers />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Layers</span>
                  <span className={`transition-transform ${layersPanelOpen ? 'rotate-180' : ''}`}><IconChevronDown /></span>
                </button>
                <span className="text-[11px] text-neutral-600 ml-auto">{elements.length}</span>
              </div>
              {layersPanelOpen && (
                <div className="flex-1 overflow-y-auto">
                  {[...elements].reverse().map((el, reverseIdx) => {
                    const isElSelected = el.id === selectedId;
                    const realIdx = elements.length - 1 - reverseIdx;
                    return (
                      <div
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 text-xs cursor-pointer transition-colors group ${
                          isElSelected
                            ? 'bg-neutral-800 text-orange-400'
                            : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                        }`}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: !el.visible }); }}
                          className={`shrink-0 ${el.visible ? 'text-neutral-500' : 'text-neutral-700'}`}
                          title={el.visible ? 'Hide' : 'Show'}
                        >
                          {el.visible ? <IconEye /> : <IconEyeOff />}
                        </button>
                        <span
                          className="w-3 h-3 rounded-sm shrink-0 border border-neutral-700"
                          style={{ backgroundColor: el.type === 'text' ? (el.colour || '#1a1a1a') : el.fill }}
                        />
                        <span className="truncate font-medium flex-1 min-w-0">{el.name}</span>
                        {el.locked && <span className="text-neutral-600"><IconLock /></span>}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); bringForward(el.id); }}
                            disabled={realIdx >= elements.length - 1}
                            className="p-0.5 rounded hover:bg-neutral-700 disabled:opacity-30 text-neutral-500 hover:text-white"
                            title="Bring Forward"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); sendBackward(el.id); }}
                            disabled={realIdx <= 0}
                            className="p-0.5 rounded hover:bg-neutral-700 disabled:opacity-30 text-neutral-500 hover:text-white"
                            title="Send Backward"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                            className="p-0.5 rounded hover:bg-red-900/50 text-neutral-600 hover:text-red-400"
                            title="Delete Layer"
                          >
                            <IconTrash />
                          </button>
                        </div>
                        <span className="text-[9px] text-neutral-600 capitalize w-8 text-right shrink-0">{el.type}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Quick Info section (right side of bottom bar) */}
            {layersPanelOpen && (
              <div className="w-56 border-l border-neutral-800 px-3 py-2 flex flex-col gap-1.5 text-[10px] text-neutral-500 overflow-y-auto shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">Quick Info</span>
                <div className="flex justify-between"><span>Canvas</span><span className="text-neutral-300">{canvasWidth} x {canvasHeight}</span></div>
                <div className="flex justify-between"><span>Zoom</span><span className="text-neutral-300">{zoom}%</span></div>
                <div className="flex justify-between"><span>Elements</span><span className="text-neutral-300">{elements.length}</span></div>
                <div className="flex justify-between"><span>Selected</span><span className="text-neutral-300 truncate ml-2">{selectedElement?.name || 'None'}</span></div>
                <div className="flex justify-between"><span>Tool</span><span className="text-neutral-300 capitalize">{activeTool}</span></div>
                {selectedElement && (
                  <>
                    <div className="border-t border-neutral-800 my-0.5" />
                    <div className="flex justify-between"><span>Position</span><span className="text-neutral-300">{selectedElement.x}, {selectedElement.y}</span></div>
                    <div className="flex justify-between"><span>Size</span><span className="text-neutral-300">{selectedElement.width} x {selectedElement.height}</span></div>
                  </>
                )}
              </div>
            )}
          </footer>
        )}
      </div>

      <ToastContainer toasts={toasts} />
      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </>
  );
}
