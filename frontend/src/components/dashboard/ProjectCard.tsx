'use client';

import React from 'react';
import Link from 'next/link';
import { ProjectWithStats } from '@/types';
import { formatDistanceToNow } from '@/utils/dateFormat';

interface ProjectCardProps {
  project: ProjectWithStats;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const timeAgo = formatDistanceToNow(project.lastModified, { addSuffix: true });

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition group overflow-hidden">
      {/* Thumbnail */}
      <Link href={`/dashboard/projects/${project.id}`}>
        <div className="relative w-full h-40 bg-gradient-to-br from-blue-400 to-purple-600 overflow-hidden cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white/50"
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
        <Link href={`/dashboard/projects/${project.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition truncate">
            {project.name}
          </h3>
        </Link>

        {project.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>{project.designCount} designs</span>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Open Project
                </Link>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(project.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Copy Project ID
                </button>
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this project?')) {
                        onDelete(project.id);
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

        {/* Last modified */}
        <p className="text-xs text-gray-500 mt-3">Modified {timeAgo}</p>
      </div>
    </div>
  );
}
