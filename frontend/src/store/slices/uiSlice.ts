import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationItem } from '@/types';

export interface UIState {
  notifications: NotificationItem[];
  modals: {
    createProject: boolean;
    createDesign: boolean;
    exportDesign: boolean;
    brandKit: boolean;
    template: boolean;
    confirmDelete: boolean;
  };
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: {
    [key: string]: boolean;
  };
}

const initialState: UIState = {
  notifications: [],
  modals: {
    createProject: false,
    createDesign: false,
    exportDesign: false,
    brandKit: false,
    template: false,
    confirmDelete: false,
  },
  sidebarOpen: true,
  theme: 'light',
  loading: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Notifications
    addNotification: (
      state,
      action: PayloadAction<Omit<NotificationItem, 'id' | 'timestamp'>>
    ) => {
      const notification: NotificationItem = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);

      // Auto-remove notification after duration
      if (notification.duration) {
        setTimeout(() => {
          state.notifications = state.notifications.filter((n) => n.id !== notification.id);
        }, notification.duration);
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modals
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },

    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },

    toggleModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Loading states
    setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },

    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },

    clearAllLoading: (state) => {
      state.loading = {};
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleModal,
  closeAllModals,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  setLoading,
  clearLoading,
  clearAllLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
