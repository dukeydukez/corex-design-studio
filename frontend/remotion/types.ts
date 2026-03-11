// ─── Shared Types for Canvas + Remotion ──────────────────────────────────────

export type ElementType = 'text' | 'rect' | 'circle' | 'line' | 'polygon' | 'star';
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'soft-light' | 'hard-light' | 'difference' | 'exclusion';
export type AnimationType = 'none' | 'fadeIn' | 'fadeOut' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'scaleIn' | 'scaleOut' | 'bounceIn' | 'rotateIn' | 'typewriter' | 'blur';
export type KeyframeProperty = 'x' | 'y' | 'opacity' | 'rotation' | 'scaleX' | 'scaleY' | 'blur';
export type EasingType = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface Keyframe {
  readonly id: string;
  readonly time: number;
  readonly property: KeyframeProperty;
  readonly value: number;
  readonly easing: EasingType;
}

export interface ElementAnimation {
  readonly enterAnimation: AnimationType;
  readonly exitAnimation: AnimationType;
  readonly enterDuration: number;
  readonly exitDuration: number;
  readonly startTime: number;
  readonly duration: number;
  readonly easing: EasingType;
  readonly keyframes: readonly Keyframe[];
}

export interface CanvasElement {
  readonly id: string;
  readonly type: ElementType;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: number;
  readonly opacity: number;
  readonly rotation: number;
  readonly borderRadius: number;
  readonly blur: number;
  readonly shadowX: number;
  readonly shadowY: number;
  readonly shadowBlur: number;
  readonly shadowColor: string;
  readonly blendMode: BlendMode;
  readonly locked: boolean;
  readonly visible: boolean;
  readonly content?: string;
  readonly fontSize?: number;
  readonly fontFamily?: string;
  readonly fontWeight?: number;
  readonly letterSpacing?: number;
  readonly lineHeight?: number;
  readonly textAlign?: 'left' | 'center' | 'right';
  readonly colour?: string;
  readonly name: string;
  readonly points?: number;
  readonly backgroundImage?: string;
}

export interface CompositionProps {
  readonly elements: readonly CanvasElement[];
  readonly animations: Readonly<Record<string, ElementAnimation>>;
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly totalDuration: number;
  readonly fps: number;
  readonly backgroundColor: string;
}

export const DEFAULT_ANIMATION: ElementAnimation = {
  enterAnimation: 'none',
  exitAnimation: 'none',
  enterDuration: 0.5,
  exitDuration: 0.5,
  startTime: 0,
  duration: 3,
  easing: 'ease-out',
  keyframes: [],
};
