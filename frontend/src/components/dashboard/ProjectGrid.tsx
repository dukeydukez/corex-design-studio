'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { ProjectWithStats } from '@/types';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingGrid } from '@/components/common/LoadingCard';
import { openModal } from '@/store/slices/uiSlice';
import { deleteProjectSuccess } from '@/store/slices/projectsSlice';
import { apiClient } from '@/services/api';
import { addNotification } from '@/store/slices/uiSlice';

interface ProjectGridProps {
  projects: ProjectWithStats[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function ProjectGrid({ projects, isLoading, onRefresh }: ProjectGridProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (projectId: string) => {
    setDeletingId(projectId);
    try {
      await apiClient.deleteProject(projectId);
      dispatch(deleteProjectSuccess(projectId));
      dispatch(
        addNotification({
          type: 'success',
          message: 'Project deleted successfully',
          duration: 3000,
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project';
      dispatch(
        addNotification({
          type: 'error',
          message,
          duration: 5000,
        })
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <LoadingGrid count={6} columns={3} />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0v6m0 0v6m0-6h-6m0 0h-6m0 0v-6m0 0v-6"
            />
          </svg>
        }
        title="No projects yet"
        description="Create your first project to get started with COREX"
        action={{
          label: 'Create Project',
          onClick: () => dispatch(openModal('createProject')),
        }}
      />
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className={deletingId === project.id ? 'opacity-50 pointer-events-none' : ''}
        >
          <ProjectCard
            project={project}
            onDelete={handleDelete}
          />
        </div>
      ))}
    </div>
  );
}
