'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { Design } from '@/types';
import { deleteDesignSuccess, deleteDesignFailure } from '@/store/slices/designsSlice';
import { apiClient } from '@/services/api';
import { addNotification } from '@/store/slices/uiSlice';
import { DesignCard } from './DesignCard';
import { EmptyState } from '../common/EmptyState';
import { LoadingCard } from '../common/LoadingCard';

interface DesignGridProps {
  designs: Design[];
  onCreateClick: () => void;
  isLoading?: boolean;
}

export function DesignGrid({ designs, onCreateClick, isLoading = false }: DesignGridProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (designId: string) => {
    if (!window.confirm('Are you sure you want to delete this design?')) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(designId));

    try {
      await apiClient.deleteDesign(designId);
      dispatch(deleteDesignSuccess(designId));
      dispatch(
        addNotification({
          type: 'success',
          message: 'Design deleted successfully',
          duration: 3000,
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete design';
      dispatch(deleteDesignFailure(message));
      dispatch(
        addNotification({
          type: 'error',
          message,
          duration: 5000,
        })
      );
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(designId);
        return next;
      });
    }
  };

  const handleDuplicate = async (designId: string) => {
    try {
      await apiClient.duplicateDesign(designId, 'Copy');
      dispatch(
        addNotification({
          type: 'success',
          message: 'Design duplicated successfully',
          duration: 3000,
        })
      );
      // Trigger refresh or add to local state
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to duplicate design';
      dispatch(
        addNotification({
          type: 'error',
          message,
          duration: 5000,
        })
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (designs.length === 0) {
    return (
      <EmptyState
        icon="📐"
        title="No designs yet"
        description="Create your first design to get started with your amazing visuals"
        action={{ label: 'Create Design', onClick: onCreateClick }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {designs.map((design) => (
        <div
          key={design.id}
          className={`opacity-${deletingIds.has(design.id) ? '50 pointer-events-none' : '100'} transition-opacity duration-200`}
        >
          <DesignCard
            design={design}
            onDelete={() => handleDelete(design.id)}
            onDuplicate={() => handleDuplicate(design.id)}
          />
        </div>
      ))}
    </div>
  );
}
