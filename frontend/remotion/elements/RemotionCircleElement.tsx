import React from 'react';
import type { CanvasElement } from '../types';
import type { FrameStyle } from '../animationMapper';

interface Props {
  readonly element: CanvasElement;
  readonly frameStyle: FrameStyle;
}

export const RemotionCircleElement: React.FC<Props> = ({ element, frameStyle }) => {
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
    backgroundColor: element.fill || '#8B5CF6',
    border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.stroke}` : 'none',
    borderRadius: '50%',
    boxShadow:
      element.shadowBlur > 0 || element.shadowX !== 0 || element.shadowY !== 0
        ? `${element.shadowX}px ${element.shadowY}px ${element.shadowBlur}px ${element.shadowColor}`
        : 'none',
  };

  return <div style={baseStyle} />;
};
