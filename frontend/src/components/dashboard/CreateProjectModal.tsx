'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { closeModal } from '@/store/slices/uiSlice';
import { apiClient } from '@/services/api';
import { createProjectSuccess, createProjectFailure } from '@/store/slices/projectsSlice';
import { addNotification } from '@/store/slices/uiSlice';

interface CreateProjectModalProps {
  open: boolean;
  organizationId: string;
}

export function CreateProjectModal({ open, organizationId }: CreateProjectModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Project name is required';
    } else if (trimmedName.length > 200) {
      newErrors.name = 'Project name must be under 200 characters';
    }

    if (formData.description && formData.description.trim().length > 2000) {
      newErrors.description = 'Description must be under 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.createProject(
        organizationId,
        formData.name,
        formData.description || undefined
      );

      // Convert to ProjectWithStats
      const projectWithStats = {
        ...response.data,
        designCount: 0,
        lastModified: response.data.createdAt,
      };

      dispatch(createProjectSuccess(projectWithStats));
      dispatch(
        addNotification({
          type: 'success',
          message: 'Project created successfully',
          duration: 3000,
        })
      );

      // Close modal and reset
      dispatch(closeModal('createProject'));
      setFormData({ name: '', description: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      dispatch(createProjectFailure(message));
      dispatch(
        addNotification({
          type: 'error',
          message,
          duration: 5000,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => dispatch(closeModal('createProject'))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
            <button
              onClick={() => dispatch(closeModal('createProject'))}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                id="name"
                type="text"
                maxLength={200}
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g., Social Media Campaign"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                maxLength={2000}
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, description: e.target.value }));
                  if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                }}
                placeholder="Describe your project..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => dispatch(closeModal('createProject'))}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition font-medium"
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
