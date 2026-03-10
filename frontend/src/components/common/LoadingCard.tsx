'use client';

import React from 'react';

export function LoadingCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>

      {/* Title skeleton */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>

      {/* Description skeleton */}
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>

      {/* Footer skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}

interface LoadingGridProps {
  count?: number;
  columns?: number;
}

export function LoadingGrid({ count = 6, columns = 3 }: LoadingGridProps) {
  return (
    <div
      className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
