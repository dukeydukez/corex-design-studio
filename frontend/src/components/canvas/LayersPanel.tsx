'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setSelectedElementId, deleteElement, updateElementPosition } from '@/store/slices/editorSlice';

export function LayersPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const { elements, selectedElementId } = useSelector((state: RootState) => state.editor);

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '✏️';
      case 'rect':
        return '▭';
      case 'image':
        return '🖼️';
      default:
        return '◊';
    }
  };

  const getElementLabel = (element: any) => {
    if (element.type === 'text') return element.content || 'Text';
    if (element.type === 'rect') return 'Shape';
    if (element.type === 'image') return 'Image';
    return 'Element';
  };

  const handleLayerClick = (elementId: string) => {
    dispatch(setSelectedElementId(elementId));
  };

  const handleDeleteLayer = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    dispatch(deleteElement(elementId));
  };

  const handleMoveUp = (e: React.MouseEvent, elementId: string, index: number) => {
    e.stopPropagation();
    if (index < elements.length - 1) {
      // Swap z-index by updating y position
      // In real app, handle z-index properly in Redux
    }
  };

  const handleMoveDown = (e: React.MouseEvent, elementId: string, index: number) => {
    e.stopPropagation();
    if (index > 0) {
      // Swap z-index by updating y position
      // In real app, handle z-index properly in Redux
    }
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Layers</h3>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {elements.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <p>No layers yet</p>
            <p className="text-xs mt-1">Add elements from the toolbar</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {[...elements].reverse().map((element, index) => (
              <div
                key={element.id}
                onClick={() => handleLayerClick(element.id)}
                className={`p-2 rounded-lg cursor-pointer transition flex items-center justify-between group ${
                  selectedElementId === element.id
                    ? 'bg-blue-50 border border-blue-300'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg">{getElementIcon(element.type)}</span>
                  <span className="text-sm text-gray-700 truncate">
                    {getElementLabel(element)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => handleMoveUp(e, element.id, index)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleMoveDown(e, element.id, index)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8v12m0 0l-4-4m4 4l4-4"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteLayer(e, element.id)}
                    className="p-1 hover:bg-red-100 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Element Count */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        {elements.length} {elements.length === 1 ? 'layer' : 'layers'}
      </div>
    </div>
  );
}
