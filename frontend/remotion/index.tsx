// @ts-nocheck — This file is the Remotion Studio entry point, not used by Next.js
import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import React from 'react';
import { DesignComposition } from './DesignComposition';
import type { CompositionProps } from './types';

const RemotionRoot: React.FC = () => {
  const defaultProps: CompositionProps = {
    elements: [],
    animations: {},
    canvasWidth: 1920,
    canvasHeight: 1080,
    totalDuration: 10,
    fps: 30,
    backgroundColor: '#FFFFFF',
  };

  return (
    <Composition
      id="DesignComposition"
      component={DesignComposition}
      durationInFrames={defaultProps.totalDuration * defaultProps.fps}
      fps={defaultProps.fps}
      width={defaultProps.canvasWidth}
      height={defaultProps.canvasHeight}
      defaultProps={defaultProps}
    />
  );
};

registerRoot(RemotionRoot);
