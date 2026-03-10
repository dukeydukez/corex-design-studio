'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { NotificationContainer } from '@/components/common/NotificationContainer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NotificationContainer />
        {children}
      </AuthProvider>
    </Provider>
  );
}
