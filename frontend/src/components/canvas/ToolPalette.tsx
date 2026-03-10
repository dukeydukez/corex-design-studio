'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { addElement, undo, redo } from '@/store/slices/editorSlice';

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `el-${Date.now()}-${idCounter}`;
}

export function ToolPalette() {
  const dispatch = useDispatch<AppDispatch>();
  const { historyStep, history } = useSelector((state: RootState) => state.editor);

  const handleAddText = () => {
    dispatch(
      addElement({
        id: generateId(),
        type: 'text',
        x: 100,
        y: 100,
        content: 'New Text',
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000',
        width: 200,
      })
    );
  };

  const handleAddShape = () => {
    dispatch(
      addElement({
        id: generateId(),
        type: 'rect',
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        fill: '#3b82f6',
        cornerRadius: 0,
      })
    );
  };

  const handleAddImage = () => {
    dispatch(
      addElement({
        id: generateId(),
        type: 'image',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        fill: '#f0f0f0',
      })
    );
  };

  const canUndo = historyStep > 0;
  const canRedo = historyStep < history.length - 1;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
      {/* Text Tool */}
      <button
        onClick={handleAddText}
        className="p-2 hover:bg-gray-100 text-gray-700 rounded-lg transition"
        title="Add Text (T)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </button>

      {/* Shape Tool */}
      <button
        onClick={handleAddShape}
        className="p-2 hover:bg-gray-100 text-gray-700 rounded-lg transition"
        title="Add Shape (S)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
        </svg>
      </button>

      {/* Image Tool */}
      <button
        onClick={handleAddImage}
        className="p-2 hover:bg-gray-100 text-gray-700 rounded-lg transition"
        title="Add Image (I)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-2" />

      {/* Undo */}
      <button
        onClick={() => dispatch(undo())}
        disabled={!canUndo}
        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition"
        title="Undo (Ctrl+Z)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      {/* Redo */}
      <button
        onClick={() => dispatch(redo())}
        disabled={!canRedo}
        className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition"
        title="Redo (Ctrl+Y)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-2" />

      {/* Zoom Info */}
      <span className="text-sm text-gray-600 px-2">100%</span>
    </div>
  );
}
