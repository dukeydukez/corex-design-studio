'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useApi';
import { apiClient } from '@/services/api';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { restoreSession } from '@/store/slices/authSlice';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  // Restore session on mount
  useEffect(() => {
    const restoreAuthSession = async () => {
      const storedUser = apiClient.getStoredUser();
      if (storedUser && apiClient.isAuthenticated()) {
        try {
          const response = await apiClient.getCurrentUser();
          dispatch(
            restoreSession({
              user: response.data,
              accessToken: localStorage.getItem('accessToken') || '',
              refreshToken: localStorage.getItem('refreshToken') || '',
            })
          );
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Session invalid, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    };

    restoreAuthSession();
  }, [dispatch]);

  return <>{children}</>;
}
