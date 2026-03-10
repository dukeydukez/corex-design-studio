import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { loginSuccess, loginFailure, registerSuccess, registerFailure } from '@/store/slices/authSlice';
import { apiClient } from '@/services/api';

// Authentication hooks
export const useAuthLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await apiClient.login(email, password);
        dispatch(loginSuccess(response.data));
        dispatch(
          addNotification({
            type: 'success',
            message: 'Logged in successfully',
            duration: 3000,
          })
        );
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        dispatch(loginFailure(message));
        dispatch(
          addNotification({
            type: 'error',
            message,
            duration: 5000,
          })
        );
        return false;
      }
    },
    [dispatch]
  );

  return { login, isLoading };
};

export const useAuthRegister = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      try {
        const response = await apiClient.register(email, password, firstName, lastName);
        dispatch(registerSuccess(response.data));
        dispatch(
          addNotification({
            type: 'success',
            message: 'Account created successfully',
            duration: 3000,
          })
        );
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        dispatch(registerFailure(message));
        dispatch(
          addNotification({
            type: 'error',
            message,
            duration: 5000,
          })
        );
        return false;
      }
    },
    [dispatch]
  );

  return { register, isLoading };
};

export const useAuthLogout = () => {
  const dispatch = useDispatch<AppDispatch>();

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      dispatch({ type: 'auth/logout' });
      dispatch(
        addNotification({
          type: 'success',
          message: 'Logged out successfully',
          duration: 2000,
        })
      );
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      dispatch(
        addNotification({
          type: 'error',
          message,
          duration: 5000,
        })
      );
      return false;
    }
  }, [dispatch]);

  return { logout };
};

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const error = useSelector((state: RootState) => state.auth.error);

  return { auth, user, isAuthenticated, isLoading, error };
};

// Project hooks
export const useProjects = () => {
  const projects = useSelector((state: RootState) => state.projects.projects);
  const isLoading = useSelector((state: RootState) => state.projects.isLoading);
  const error = useSelector((state: RootState) => state.projects.error);

  return { projects, isLoading, error };
};

export const useCurrentProject = () => {
  const project = useSelector((state: RootState) => state.projects.currentProject);
  return { project };
};

// Design hooks
export const useDesigns = () => {
  const designs = useSelector((state: RootState) => state.designs.designs);
  const isLoading = useSelector((state: RootState) => state.designs.isLoading);
  const error = useSelector((state: RootState) => state.designs.error);
  const filter = useSelector((state: RootState) => state.designs.filter);
  const searchQuery = useSelector((state: RootState) => state.designs.searchQuery);
  const sortBy = useSelector((state: RootState) => state.designs.sortBy);

  return { designs, isLoading, error, filter, searchQuery, sortBy };
};

export const useCurrentDesign = () => {
  const design = useSelector((state: RootState) => state.designs.currentDesign);
  return { design };
};

// Editor hooks
export const useEditor = () => {
  const canvasConfig = useSelector((state: RootState) => state.editor.canvasConfig);
  const selection = useSelector((state: RootState) => state.editor.selection);
  const tool = useSelector((state: RootState) => state.editor.tool);
  const zoom = useSelector((state: RootState) => state.editor.zoom);
  const isDirty = useSelector((state: RootState) => state.editor.isDirty);
  const showGrid = useSelector((state: RootState) => state.editor.showGrid);
  const showRulers = useSelector((state: RootState) => state.editor.showRulers);

  return { canvasConfig, selection, tool, zoom, isDirty, showGrid, showRulers };
};

export const useEditorHistory = () => {
  const history = useSelector((state: RootState) => state.editor.history);
  const historyIndex = useSelector((state: RootState) => state.editor.historyIndex);

  return { history, historyIndex };
};

// UI hooks
export const useNotifications = () => {
  const notifications = useSelector((state: RootState) => state.ui.notifications);
  return { notifications };
};

export const useUI = () => {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const modals = useSelector((state: RootState) => state.ui.modals);
  const loading = useSelector((state: RootState) => state.ui.loading);

  return { theme, sidebarOpen, modals, loading };
};
