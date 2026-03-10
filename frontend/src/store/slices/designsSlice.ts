import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Design, DesignWithRelations, DesignStatus } from '@/types';

export interface DesignsState {
  designs: Design[];
  currentDesign: DesignWithRelations | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: 'date-newest' | 'date-oldest' | 'name';
  filter: DesignStatus | 'all';
}

const initialState: DesignsState = {
  designs: [],
  currentDesign: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  sortBy: 'date-newest',
  filter: 'all',
};

const designsSlice = createSlice({
  name: 'designs',
  initialState,
  reducers: {
    fetchDesignsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchDesignsSuccess: (state, action: PayloadAction<Design[]>) => {
      state.isLoading = false;
      state.designs = action.payload;
    },
    fetchDesignsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    createDesignStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createDesignSuccess: (state, action: PayloadAction<Design>) => {
      state.isLoading = false;
      state.designs = [action.payload, ...state.designs];
    },
    createDesignFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    getDesignStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getDesignSuccess: (state, action: PayloadAction<DesignWithRelations>) => {
      state.isLoading = false;
      state.currentDesign = action.payload;
    },
    getDesignFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    updateDesignSuccess: (state, action: PayloadAction<Partial<Design>>) => {
      state.designs = state.designs.map((d) =>
        d.id === action.payload.id ? { ...d, ...action.payload } : d
      );
      if (state.currentDesign && state.currentDesign.id === action.payload.id) {
        state.currentDesign = { ...state.currentDesign, ...action.payload } as typeof state.currentDesign;
      }
    },

    updateDesignStatus: (
      state,
      action: PayloadAction<{ designId: string; status: DesignStatus }>
    ) => {
      state.designs = state.designs.map((d) =>
        d.id === action.payload.designId
          ? { ...d, status: action.payload.status }
          : d
      );
      if (state.currentDesign?.id === action.payload.designId) {
        state.currentDesign = {
          ...state.currentDesign,
          status: action.payload.status,
        };
      }
    },

    duplicateDesignSuccess: (state, action: PayloadAction<Design>) => {
      state.designs = [...state.designs, action.payload];
    },

    deleteDesignSuccess: (state, action: PayloadAction<string>) => {
      state.designs = state.designs.filter((d) => d.id !== action.payload);
      if (state.currentDesign?.id === action.payload) {
        state.currentDesign = null;
      }
    },
    deleteDesignFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    setCurrentDesign: (
      state,
      action: PayloadAction<DesignWithRelations | null>
    ) => {
      state.currentDesign = action.payload;
    },

    // Filter and sort actions
    setFilter: (state, action: PayloadAction<DesignStatus | 'all'>) => {
      state.filter = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<'date-newest' | 'date-oldest' | 'name'>
    ) => {
      state.sortBy = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchDesignsStart,
  fetchDesignsSuccess,
  fetchDesignsFailure,
  createDesignStart,
  createDesignSuccess,
  createDesignFailure,
  getDesignStart,
  getDesignSuccess,
  getDesignFailure,
  updateDesignSuccess,
  updateDesignStatus,
  duplicateDesignSuccess,
  deleteDesignSuccess,
  deleteDesignFailure,
  setCurrentDesign,
  setFilter,
  setSortBy,
  setSearchQuery,
  setSearchTerm,
  clearError,
} = designsSlice.actions;

export default designsSlice.reducer;
