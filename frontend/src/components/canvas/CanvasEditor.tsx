'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  setSelectedElementId,
  updateElementPosition,
  deleteElement,
} from '@/store/slices/editorSlice';
import { Design } from '@/types';

interface CanvasEditorProps {
  design: Design;
  onSave: (canvasData: Record<string, unknown>) => void;
}

export function CanvasEditor({ design, onSave }: CanvasEditorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const { elements, selectedElementId } = useSelector(
    (state: RootState) => state.editor
  );

  // Only render Konva on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const getCanvasDimensions = useCallback((): [number, number] => {
    const formatDimensions: Record<string, [number, number]> = {
      'instagram-feed': [1080, 1080],
      'instagram-story': [1080, 1920],
      'tiktok': [1080, 1920],
      'linkedin': [1200, 628],
      'twitter': [1024, 512],
      'youtube-thumbnail': [1280, 720],
      'pinterest': [1000, 1500],
      'facebook': [1200, 628],
      'email': [600, 300],
      'web-hero': [1920, 600],
      'ad-square': [600, 600],
      'ad-vertical': [1200, 1500],
    };
    return formatDimensions[design.format] || [1080, 1080];
  }, [design.format]);

  const [canvasWidth, canvasHeight] = getCanvasDimensions();

  // Resize stage to fit container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementId) {
        dispatch(deleteElement(selectedElementId));
      }
      if (e.key === 'Escape') {
        dispatch(setSelectedElementId(null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedElementId]);

  if (!mounted) {
    return (
      <div ref={containerRef} className="flex-1 bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading canvas...</div>
      </div>
    );
  }

  // Lazy require Konva components (client only)
  const { Stage, Layer, Rect, Text, Group } = require('react-konva');

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      dispatch(setSelectedElementId(null));
    }
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(0.2, Math.min(direction > 0 ? scale * 1.1 : scale * 0.9, 3));
    setScale(newScale);
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-gray-100 canvas-editor">
      <div className="flex-1 relative overflow-hidden">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          onWheel={handleWheel}
          onMouseDown={handleStageClick}
          draggable={true}
          onDragEnd={(e: any) => {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }}
        >
          <Layer>
            {/* Canvas background */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill="white"
              stroke="#e5e7eb"
              strokeWidth={2}
            />

            {/* Elements */}
            {elements.map((element: any) => {
              const commonProps = {
                key: element.id,
                x: element.x,
                y: element.y,
                draggable: true,
                onClick: () => dispatch(setSelectedElementId(element.id)),
                onTap: () => dispatch(setSelectedElementId(element.id)),
                onDragEnd: (evt: any) => {
                  dispatch(
                    updateElementPosition({
                      elementId: element.id,
                      x: evt.target.x(),
                      y: evt.target.y(),
                    })
                  );
                },
                strokeWidth: element.id === selectedElementId ? 2 : 0,
                stroke: element.id === selectedElementId ? '#3b82f6' : undefined,
              };

              switch (element.type) {
                case 'text':
                  return (
                    <Text
                      {...commonProps}
                      text={element.content}
                      fontSize={element.fontSize || 16}
                      fontFamily={element.fontFamily || 'Arial'}
                      fill={element.fill || '#000000'}
                      width={element.width}
                    />
                  );
                case 'rect':
                  return (
                    <Rect
                      {...commonProps}
                      width={element.width}
                      height={element.height}
                      fill={element.fill || '#ffffff'}
                      cornerRadius={element.cornerRadius || 0}
                    />
                  );
                case 'image':
                  return (
                    <Group {...commonProps}>
                      <Rect
                        x={0}
                        y={0}
                        width={element.width}
                        height={element.height}
                        fill={element.fill || '#f0f0f0'}
                      />
                    </Group>
                  );
                default:
                  return null;
              }
            })}
          </Layer>
        </Stage>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-2 rounded-lg text-sm text-gray-600">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
}
