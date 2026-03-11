import React from 'react';
import type { CanvasElement } from '../types';
import type { FrameStyle } from '../animationMapper';

interface Props {
  readonly element: CanvasElement;
  readonly frameStyle: FrameStyle;
}

export const RemotionTextElement: React.FC<Props> = ({ element, frameStyle }) => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.x + frameStyle.translateX,
    top: element.y + frameStyle.translateY,
    width: element.width,
    height: element.height,
    opacity: element.opacity * frameStyle.opacity,
    transform: `rotate(${element.rotation}deg) ${frameStyle.transform}`.trim(),
    filter: [
      element.blur > 0 ? `blur(${element.blur}px)` : '',
      frameStyle.filter,
    ].filter(Boolean).join(' ') || 'none',
    mixBlendMode: element.blendMode as React.CSSProperties['mixBlendMode'],
    boxShadow:
      element.shadowBlur > 0 || element.shadowX !== 0 || element.shadowY !== 0
        ? `${element.shadowX}px ${element.shadowY}px ${element.shadowBlur}px ${element.shadowColor}`
        : 'none',
    // Text-specific
    color: element.colour || element.fill || '#000',
    fontSize: element.fontSize ?? 24,
    fontFamily: element.fontFamily ?? 'Inter, sans-serif',
    fontWeight: element.fontWeight ?? 400,
    letterSpacing: element.letterSpacing != null ? `${element.letterSpacing}px` : undefined,
    lineHeight: element.lineHeight != null ? element.lineHeight : undefined,
    textAlign: element.textAlign ?? 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent:
      element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  return <div style={baseStyle}>{element.content ?? ''}</div>;
};
