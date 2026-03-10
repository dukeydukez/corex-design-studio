'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { updateElement } from '@/store/slices/editorSlice';

export function PropertiesPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const { elements, selectedElementId } = useSelector((state: RootState) => state.editor);

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500 text-sm">
          <p>Select an element to edit</p>
          <p className="text-xs mt-1">properties</p>
        </div>
      </div>
    );
  }

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, isNaN(val) ? min : val));

  const handlePropertyChange = (key: string, value: any) => {
    // Sanitize numeric inputs with bounds
    let sanitized = value;
    switch (key) {
      case 'x':
      case 'y':
        sanitized = clamp(Number(value), -10000, 10000);
        break;
      case 'width':
      case 'height':
        sanitized = clamp(Number(value), 0, 10000);
        break;
      case 'fontSize':
        sanitized = clamp(Number(value), 1, 1000);
        break;
      case 'cornerRadius':
        sanitized = clamp(Number(value), 0, 1000);
        break;
      case 'opacity':
        sanitized = clamp(Number(value), 0, 1);
        break;
      case 'content':
        sanitized = typeof value === 'string' ? value.slice(0, 10000) : '';
        break;
      case 'fill':
      case 'stroke':
        sanitized = typeof value === 'string' ? value.slice(0, 50) : '';
        break;
    }

    dispatch(
      updateElement({
        elementId: selectedElement.id,
        updates: { [key]: sanitized },
      })
    );
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white">
        <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
        <p className="text-xs text-gray-500 mt-1">{selectedElement.type}</p>
      </div>

      {/* Properties */}
      <div className="p-4 space-y-4">
        {/* Position */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Position</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">X</label>
              <input
                type="number"
                min={-10000}
                max={10000}
                value={Math.round(selectedElement.x)}
                onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Y</label>
              <input
                type="number"
                min={-10000}
                max={10000}
                value={Math.round(selectedElement.y)}
                onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Size</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">W</label>
              <input
                type="number"
                min={0}
                max={10000}
                value={Math.round(selectedElement.width || 0)}
                onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">H</label>
              <input
                type="number"
                min={0}
                max={10000}
                value={Math.round(selectedElement.height || 0)}
                onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Fill Color */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Fill</h4>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedElement.fill || '#ffffff'}
              onChange={(e) => handlePropertyChange('fill', e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={selectedElement.fill || '#ffffff'}
              onChange={(e) => handlePropertyChange('fill', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
            />
          </div>
        </div>

        {/* Text Properties */}
        {selectedElement.type === 'text' && (
          <>
            {/* Font Size */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Font Size</h4>
              <input
                type="number"
                min={1}
                max={1000}
                value={selectedElement.fontSize || 16}
                onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            {/* Font Family */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Font</h4>
              <select
                value={selectedElement.fontFamily || 'Arial'}
                onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            {/* Text Content */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Content</h4>
              <textarea
                maxLength={10000}
                value={selectedElement.content || ''}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                rows={3}
              />
            </div>
          </>
        )}

        {/* Corner Radius (for shapes) */}
        {selectedElement.type === 'rect' && (
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Corner Radius</h4>
            <input
              type="number"
              min={0}
              max={1000}
              value={selectedElement.cornerRadius || 0}
              onChange={(e) => handlePropertyChange('cornerRadius', parseInt(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        )}

        {/* Opacity */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Opacity</h4>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={(selectedElement.opacity || 1) * 100}
              onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value) / 100)}
              className="flex-1"
            />
            <span className="text-xs text-gray-600 w-8 text-right">
              {Math.round((selectedElement.opacity || 1) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
