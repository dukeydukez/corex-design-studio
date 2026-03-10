'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { closeModal, addNotification } from '@/store/slices/uiSlice';
import { apiClient } from '@/services/api';
import { createDesignSuccess, createDesignFailure } from '@/store/slices/designsSlice';
import { DesignFormat } from '@/types';

const DESIGN_FORMATS = [
  { value: 'instagram-feed', label: 'Instagram Feed (1080x1080)' },
  { value: 'instagram-story', label: 'Instagram Story (1080x1920)' },
  { value: 'tiktok', label: 'TikTok (1080x1920)' },
  { value: 'linkedin', label: 'LinkedIn (1200x628)' },
  { value: 'twitter', label: 'Twitter (1024x512)' },
  { value: 'youtube-thumbnail', label: 'YouTube Thumbnail (1280x720)' },
  { value: 'pinterest', label: 'Pinterest (1000x1500)' },
  { value: 'facebook', label: 'Facebook (1200x628)' },
  { value: 'email', label: 'Email Banner (600x300)' },
  { value: 'web-hero', label: 'Web Hero (1920x600)' },
  { value: 'ad-square', label: 'Ad Square (600x600)' },
  { value: 'ad-vertical', label: 'Ad Vertical (1200x1500)' },
];

interface CreateDesignModalProps {
  open: boolean;
  projectId: string;
}

export function CreateDesignModal({ open, projectId }: CreateDesignModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({ name: '', format: 'instagram-feed' as DesignFormat });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Design name is required';
    } else if (trimmedName.length > 200) {
      newErrors.name = 'Design name must be under 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.createDesign(
        projectId,
        formData.name,
        formData.format
      );

      dispatch(createDesignSuccess(response.data));
      dispatch(
        addNotification({
          type: 'success',
          message: 'Design created successfully',
          duration: 3000,
        })
      );

      dispatch(closeModal('createDesign'));
      setFormData({ name: '', format: 'instagram-feed' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create design';
      dispatch(createDesignFailure(message));
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
        onClick={() => dispatch(closeModal('createDesign'))}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Create New Design</h2>
            <button
              onClick={() => dispatch(closeModal('createDesign'))}
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
            {/* Design Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Design Name
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
                placeholder="e.g., Instagram Post"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Format Select */}
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                Design Format
              </label>
              <select
                id="format"
                value={formData.format}
                onChange={(e) => setFormData((prev) => ({ ...prev, format: e.target.value as DesignFormat }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DESIGN_FORMATS.map((fmt) => (
                  <option key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => dispatch(closeModal('createDesign'))}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition font-medium"
              >
                {isLoading ? 'Creating...' : 'Create Design'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
