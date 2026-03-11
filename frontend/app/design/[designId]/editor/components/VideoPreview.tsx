'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { DesignComposition } from '../../../../../remotion/DesignComposition';
import type { CompositionProps, CanvasElement, ElementAnimation } from '../../../../../remotion/types';

interface VideoPreviewProps {
  readonly elements: readonly CanvasElement[];
  readonly animations: Readonly<Record<string, ElementAnimation>>;
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly totalDuration: number;
  readonly fps: number;
  readonly backgroundColor: string;
  readonly currentTime: number;
  readonly isPlaying: boolean;
  readonly onTimeUpdate?: (time: number) => void;
  readonly onPlayStateChange?: (playing: boolean) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  elements,
  animations,
  canvasWidth,
  canvasHeight,
  totalDuration,
  fps,
  backgroundColor,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayStateChange,
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const syncingRef = useRef(false);

  const durationInFrames = Math.max(1, Math.round(totalDuration * fps));

  const compositionProps: CompositionProps = {
    elements: [...elements],
    animations: { ...animations },
    canvasWidth,
    canvasHeight,
    totalDuration,
    fps,
    backgroundColor,
  };

  // Sync editor time → player
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !playerReady || syncingRef.current) return;

    const targetFrame = Math.round(currentTime * fps);
    const clampedFrame = Math.max(0, Math.min(targetFrame, durationInFrames - 1));

    syncingRef.current = true;
    player.seekTo(clampedFrame);
    requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  }, [currentTime, fps, durationInFrames, playerReady]);

  // Sync play/pause state
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !playerReady) return;

    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, playerReady]);

  // Listen for player events
  const handlePlayerReady = useCallback(() => {
    setPlayerReady(true);
  }, []);

  const handleFrameUpdate = useCallback(
    (e: { detail: { frame: number } }) => {
      if (syncingRef.current) return;
      const time = e.detail.frame / fps;
      onTimeUpdate?.(time);
    },
    [fps, onTimeUpdate],
  );

  const handlePlay = useCallback(() => {
    onPlayStateChange?.(true);
  }, [onPlayStateChange]);

  const handlePause = useCallback(() => {
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const el = player as unknown as EventTarget;
    el.addEventListener('playerReady' as string, handlePlayerReady);
    el.addEventListener('frameupdate' as string, handleFrameUpdate as unknown as EventListener);
    el.addEventListener('play' as string, handlePlay);
    el.addEventListener('pause' as string, handlePause);

    return () => {
      el.removeEventListener('playerReady' as string, handlePlayerReady);
      el.removeEventListener('frameupdate' as string, handleFrameUpdate as unknown as EventListener);
      el.removeEventListener('play' as string, handlePlay);
      el.removeEventListener('pause' as string, handlePause);
    };
  }, [handlePlayerReady, handleFrameUpdate, handlePlay, handlePause]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: canvasWidth,
          maxHeight: canvasHeight,
        }}
      >
        <Player
          ref={playerRef}
          component={DesignComposition}
          inputProps={compositionProps}
          durationInFrames={durationInFrames}
          compositionWidth={canvasWidth}
          compositionHeight={canvasHeight}
          fps={fps}
          style={{
            width: '100%',
            height: '100%',
          }}
          controls={false}
          loop
          autoPlay={false}
        />
      </div>
      {!playerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <div className="text-white text-sm">Loading Remotion Player...</div>
        </div>
      )}
    </div>
  );
};
