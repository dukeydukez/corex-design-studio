import React from 'react';
// @ts-expect-error - remotion types resolve at runtime via Remotion Player/bundler
import { useCurrentFrame, useVideoConfig, Sequence, AbsoluteFill } from 'remotion';
import type { CompositionProps, CanvasElement, ElementAnimation } from './types';
import { DEFAULT_ANIMATION } from './types';
import { getElementFrameStyle } from './animationMapper';
import { RemotionTextElement } from './elements/RemotionTextElement';
import { RemotionRectElement } from './elements/RemotionRectElement';
import { RemotionCircleElement } from './elements/RemotionCircleElement';

function renderElement(element: CanvasElement, animation: ElementAnimation, fps: number, frame: number) {
  const elementFrame = frame - Math.round(animation.startTime * fps);
  const frameStyle = getElementFrameStyle(animation, elementFrame, fps, {
    x: element.x,
    y: element.y,
    opacity: element.opacity,
    rotation: element.rotation,
    blur: element.blur,
  });

  switch (element.type) {
    case 'text':
      return <RemotionTextElement element={element} frameStyle={frameStyle} />;
    case 'rect':
      return <RemotionRectElement element={element} frameStyle={frameStyle} />;
    case 'circle':
      return <RemotionCircleElement element={element} frameStyle={frameStyle} />;
    case 'line':
      return <RemotionRectElement element={{ ...element, height: Math.max(element.strokeWidth, 2) }} frameStyle={frameStyle} />;
    case 'polygon':
    case 'star':
      return <RemotionRectElement element={element} frameStyle={frameStyle} />;
    default:
      return null;
  }
}

export const DesignComposition: React.FC<CompositionProps> = ({
  elements,
  animations,
  canvasWidth,
  canvasHeight,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: backgroundColor || '#FFFFFF' }}>
      <div
        style={{
          position: 'relative',
          width: canvasWidth,
          height: canvasHeight,
          overflow: 'hidden',
        }}
      >
        {elements
          .filter((el) => el.visible)
          .map((element) => {
            const anim = animations[element.id] ?? DEFAULT_ANIMATION;
            const startFrame = Math.round(anim.startTime * fps);
            const durationFrames = Math.round(anim.duration * fps);

            return (
              <Sequence
                key={element.id}
                from={startFrame}
                durationInFrames={durationFrames}
                layout="none"
              >
                {renderElement(element, anim, fps, frame)}
              </Sequence>
            );
          })}
      </div>
    </AbsoluteFill>
  );
};
