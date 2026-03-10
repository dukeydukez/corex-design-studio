import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectWithStats } from '@/types';

export interface ProjectsState {
  projects: ProjectWithStats[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  filter: {
    searchTerm: string;
    sortBy: 'name' | 'date' | 'modified';
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  filter: {
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc',
  },
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Fetch projects
    fetchProjectsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (state, action: PayloadAction<ProjectWithStats[]>) => {
      state.isLoading = false;
      state.projects = action.payload;
    },
    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Create project
    createProjectStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createProjectSuccess: (state, action: PayloadAction<ProjectWithStats>) => {
      state.isLoading = false;
      state.projects.unshift(action.payload);
    },
    createProjectFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get single project
    getProjectStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.isLoading = false;
      state.currentProject = action.payload;
    },
    getProjectFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update project
    updateProjectSuccess: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...action.payload };
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload;
      }
    },

    // Delete project
    deleteProjectSuccess: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    },

    // Set current project
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },

    // Update filters
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filter.searchTerm = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'name' | 'date' | 'modified'>) => {
      state.filter.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filter.sortOrder = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  getProjectStart,
  getProjectSuccess,
  getProjectFailure,
  updateProjectSuccess,
  deleteProjectSuccess,
  setCurrentProject,
  setSearchTerm,
  setSortBy,
  setSortOrder,
  clearError,
} = projectsSlice.actions;

export default projectsSlice.reducer;
