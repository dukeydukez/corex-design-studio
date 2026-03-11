import type { ElementAnimation, AnimationType, KeyframeProperty, Keyframe, EasingType } from './types';

// ─── Native interpolation (no remotion dependency) ──────────────────────────

function clampValue(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function lerp(inputRange: readonly number[], outputRange: readonly number[], value: number): number {
  if (inputRange.length < 2) return outputRange[0] ?? 0;
  const clamped = clampValue(value, inputRange[0], inputRange[inputRange.length - 1]);

  for (let i = 0; i < inputRange.length - 1; i++) {
    if (clamped >= inputRange[i] && clamped <= inputRange[i + 1]) {
      const t = (clamped - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
      return outputRange[i] + t * (outputRange[i + 1] - outputRange[i]);
    }
  }
  return outputRange[outputRange.length - 1];
}

function applyEasing(t: number, easing: (v: number) => number): number {
  return easing(t);
}

function interpolateClamped(
  frame: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  easing?: (t: number) => number,
): number {
  if (inputRange.length < 2) return outputRange[0] ?? 0;
  const clamped = clampValue(frame, inputRange[0], inputRange[inputRange.length - 1]);

  for (let i = 0; i < inputRange.length - 1; i++) {
    if (clamped >= inputRange[i] && clamped <= inputRange[i + 1]) {
      let t = (clamped - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
      if (easing) t = applyEasing(t, easing);
      return outputRange[i] + t * (outputRange[i + 1] - outputRange[i]);
    }
  }
  return outputRange[outputRange.length - 1];
}

// ─── Easing functions ───────────────────────────────────────────────────────

function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number): (t: number) => number {
  return (t: number) => {
    // Newton-Raphson approximation for cubic bezier
    let x = t;
    for (let i = 0; i < 8; i++) {
      const cx = 3 * p1x * x * (1 - x) * (1 - x) + 3 * p2x * x * x * (1 - x) + x * x * x - t;
      const dx = 3 * p1x * (1 - x) * (1 - x) - 6 * p1x * x * (1 - x) + 6 * p2x * x * (1 - x) - 3 * p2x * x * x + 3 * x * x;
      if (Math.abs(dx) < 1e-6) break;
      x -= cx / dx;
    }
    return 3 * p1y * x * (1 - x) * (1 - x) + 3 * p2y * x * x * (1 - x) + x * x * x;
  };
}

function mapEasing(easing: EasingType): ((t: number) => number) {
  switch (easing) {
    case 'linear': return (t: number) => t;
    case 'ease': return cubicBezier(0.25, 0.1, 0.25, 1);
    case 'ease-in': return cubicBezier(0.42, 0, 1, 1);
    case 'ease-out': return cubicBezier(0, 0, 0.58, 1);
    case 'ease-in-out': return cubicBezier(0.42, 0, 0.58, 1);
    default: return (t: number) => t;
  }
}

// ─── Keyframe interpolation ─────────────────────────────────────────────────

function interpolateKeyframesProp(
  keyframes: readonly Keyframe[],
  property: KeyframeProperty,
  frame: number,
  fps: number,
  defaultValue: number,
): number {
  const propKfs = keyframes.filter(k => k.property === property).sort((a, b) => a.time - b.time);
  if (propKfs.length === 0) return defaultValue;

  const inputRange = propKfs.map(k => k.time * fps);
  const outputRange = propKfs.map(k => k.value);

  if (frame <= inputRange[0]) return outputRange[0];
  if (frame >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];

  return lerp(inputRange, outputRange, frame);
}

// ─── Enter/exit animation styles ────────────────────────────────────────────

function getEnterStyle(
  type: AnimationType,
  progress: number,
): { opacity: number; transform: string; filter: string } {
  let opacity = 1;
  let transform = '';
  let filter = '';

  switch (type) {
    case 'fadeIn': opacity = progress; break;
    case 'slideLeft': transform = `translateX(${(1 - progress) * 100}px)`; opacity = progress; break;
    case 'slideRight': transform = `translateX(${(progress - 1) * 100}px)`; opacity = progress; break;
    case 'slideUp': transform = `translateY(${(1 - progress) * 60}px)`; opacity = progress; break;
    case 'slideDown': transform = `translateY(${(progress - 1) * 60}px)`; opacity = progress; break;
    case 'scaleIn': transform = `scale(${0.3 + progress * 0.7})`; opacity = progress; break;
    case 'bounceIn': {
      const bounce = progress < 0.6
        ? progress / 0.6
        : 1 + Math.sin((progress - 0.6) * Math.PI * 2.5) * 0.15 * (1 - progress);
      transform = `scale(${bounce})`;
      opacity = Math.min(progress * 2, 1);
      break;
    }
    case 'rotateIn': transform = `rotate(${(1 - progress) * 90}deg) scale(${0.5 + progress * 0.5})`; opacity = progress; break;
    case 'blur': filter = `blur(${(1 - progress) * 10}px)`; opacity = progress; break;
    default: break;
  }

  return { opacity, transform, filter };
}

function getExitStyle(
  type: AnimationType,
  progress: number,
): { opacity: number; transform: string; filter: string } {
  let opacity = 1;
  let transform = '';
  let filter = '';

  switch (type) {
    case 'fadeOut': opacity = progress; break;
    case 'scaleOut': transform = `scale(${progress})`; opacity = progress; break;
    case 'slideLeft': transform = `translateX(${(progress - 1) * 100}px)`; opacity = progress; break;
    case 'slideRight': transform = `translateX(${(1 - progress) * 100}px)`; opacity = progress; break;
    case 'slideUp': transform = `translateY(${(progress - 1) * 60}px)`; opacity = progress; break;
    case 'slideDown': transform = `translateY(${(1 - progress) * 60}px)`; opacity = progress; break;
    case 'blur': filter = `blur(${(1 - progress) * 10}px)`; opacity = progress; break;
    default: break;
  }

  return { opacity, transform, filter };
}

// ─── Main: compute element style at given frame ─────────────────────────────

export interface FrameStyle {
  readonly opacity: number;
  readonly transform: string;
  readonly filter: string;
  readonly translateX: number;
  readonly translateY: number;
}

export function getElementFrameStyle(
  animation: ElementAnimation,
  elementFrame: number,
  fps: number,
  baseElement: { x: number; y: number; opacity: number; rotation: number; blur: number },
): FrameStyle {
  const time = elementFrame / fps;
  const { enterAnimation, exitAnimation, enterDuration, exitDuration, duration } = animation;

  let opacity = 1;
  let transform = '';
  let filter = '';

  // Enter animation
  if (time < enterDuration && enterAnimation !== 'none') {
    const progress = interpolateClamped(
      elementFrame, [0, enterDuration * fps], [0, 1], mapEasing(animation.easing),
    );
    const enterStyle = getEnterStyle(enterAnimation, progress);
    opacity = enterStyle.opacity;
    transform = enterStyle.transform;
    filter = enterStyle.filter;
  }

  // Exit animation
  const remaining = duration - time;
  if (remaining < exitDuration && exitAnimation !== 'none') {
    const progress = interpolateClamped(
      elementFrame,
      [(duration - exitDuration) * fps, duration * fps],
      [1, 0],
      mapEasing(animation.easing),
    );
    const exitStyle = getExitStyle(exitAnimation, progress);
    opacity = exitStyle.opacity;
    transform = exitStyle.transform;
    filter = exitStyle.filter;
  }

  // Keyframe overrides
  let kfTranslateX = 0;
  let kfTranslateY = 0;
  if (animation.keyframes.length > 0) {
    const kfOpacity = interpolateKeyframesProp(animation.keyframes, 'opacity', elementFrame, fps, -1);
    if (kfOpacity >= 0) opacity = kfOpacity / 100;

    const kfRotation = interpolateKeyframesProp(animation.keyframes, 'rotation', elementFrame, fps, NaN);
    const kfScaleX = interpolateKeyframesProp(animation.keyframes, 'scaleX', elementFrame, fps, NaN);
    const kfScaleY = interpolateKeyframesProp(animation.keyframes, 'scaleY', elementFrame, fps, NaN);
    const kfBlur = interpolateKeyframesProp(animation.keyframes, 'blur', elementFrame, fps, NaN);
    const kfX = interpolateKeyframesProp(animation.keyframes, 'x', elementFrame, fps, NaN);
    const kfY = interpolateKeyframesProp(animation.keyframes, 'y', elementFrame, fps, NaN);

    const transforms: string[] = [];
    if (!isNaN(kfX)) { transforms.push(`translateX(${kfX}px)`); kfTranslateX = kfX; }
    if (!isNaN(kfY)) { transforms.push(`translateY(${kfY}px)`); kfTranslateY = kfY; }
    if (!isNaN(kfRotation)) transforms.push(`rotate(${kfRotation}deg)`);
    if (!isNaN(kfScaleX) || !isNaN(kfScaleY)) {
      transforms.push(`scale(${(isNaN(kfScaleX) ? 100 : kfScaleX) / 100}, ${(isNaN(kfScaleY) ? 100 : kfScaleY) / 100})`);
    }
    if (transforms.length > 0) transform = (transform ? transform + ' ' : '') + transforms.join(' ');
    if (!isNaN(kfBlur)) filter = (filter ? filter + ' ' : '') + `blur(${kfBlur}px)`;
  }

  return { opacity, transform, filter, translateX: kfTranslateX, translateY: kfTranslateY };
}
