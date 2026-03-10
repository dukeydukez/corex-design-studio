'use client';

import React from 'react';
import Link from 'next/link';
import { Design } from '@/types';
import { formatDistanceToNow } from '@/utils/dateFormat';

interface DesignCardProps {
  design: Design;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function DesignCard({ design, onDelete, onDuplicate }: DesignCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const timeAgo = formatDistanceToNow(design.updatedAt, { addSuffix: true });

  // Status badge color
  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    saved: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition group overflow-hidden">
      {/* Thumbnail */}
      <Link href={`/design/${design.id}/editor`}>
        <div className="relative w-full h-40 bg-gradient-to-br from-indigo-300 to-purple-400 overflow-hidden cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white/40"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link href={`/design/${design.id}/editor`}>
            <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition truncate flex-1">
              {design.name}
            </h3>
          </Link>
          <span
            className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
              statusColors[design.status]
            }`}
          >
            {design.status}
          </span>
        </div>

        {design.description && (
          <p className="text-xs text-gray-600 line-clamp-1 mb-3">
            {design.description}
          </p>
        )}

        {/* Format & Dimensions */}
        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-100">
          <span className="bg-gray-50 px-2 py-1 rounded">{design.format}</span>
          <span>
            {design.width}x{design.height}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Modified {timeAgo}</span>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10">
                <Link
                  href={`/design/${design.id}/editor`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </Link>
                {onDuplicate && (
                  <button
                    onClick={() => {
                      onDuplicate(design.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Duplicate
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this design?')) {
                        onDelete(design.id);
                        setShowMenu(false);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
