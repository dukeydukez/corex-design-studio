import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasConfig, CanvasLayer, EditorSelection } from '@/types';

// Element type used by canvas components
export interface CanvasElement {
  id: string;
  type: 'text' | 'rect' | 'image' | 'group';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  src?: string;
}

export interface EditorState {
  canvasConfig: CanvasConfig | null;
  elements: CanvasElement[];
  selectedElementId: string | null;
  selection: EditorSelection;
  history: CanvasElement[][];
  historyIndex: number;
  historyStep: number;
  isDrawing: boolean;
  tool: 'pointer' | 'text' | 'rectangle' | 'circle' | 'image' | 'pen';
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  isDirty: boolean;
  lastSaved: string | null;
}

const initialState: EditorState = {
  canvasConfig: null,
  elements: [],
  selectedElementId: null,
  selection: {},
  history: [],
  historyIndex: -1,
  historyStep: 0,
  isDrawing: false,
  tool: 'pointer',
  zoom: 1,
  showGrid: true,
  showRulers: true,
  isDirty: false,
  lastSaved: null,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    initializeCanvas: (state, action: PayloadAction<CanvasConfig>) => {
      state.canvasConfig = action.payload;
      state.elements = [];
      state.history = [];
      state.historyIndex = -1;
      state.historyStep = 0;
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },

    // Element operations (used by canvas components)
    addElement: (state, action: PayloadAction<CanvasElement>) => {
      state.elements = [...state.elements, action.payload];
      state.isDirty = true;
      state.history = state.history.slice(0, state.historyStep + 1);
      state.history.push([...state.elements]);
      state.historyStep = state.history.length - 1;
      state.historyIndex = state.historyStep;
    },

    updateElementPosition: (
      state,
      action: PayloadAction<{ elementId: string; x: number; y: number }>
    ) => {
      state.elements = state.elements.map((el) =>
        el.id === action.payload.elementId
          ? { ...el, x: action.payload.x, y: action.payload.y }
          : el
      );
      state.isDirty = true;
    },

    updateElementSize: (
      state,
      action: PayloadAction<{ elementId: string; width: number; height: number }>
    ) => {
      state.elements = state.elements.map((el) =>
        el.id === action.payload.elementId
          ? { ...el, width: action.payload.width, height: action.payload.height }
          : el
      );
      state.isDirty = true;
    },

    updateElement: (
      state,
      action: PayloadAction<{ elementId: string; updates: Partial<CanvasElement> }>
    ) => {
      state.elements = state.elements.map((el) =>
        el.id === action.payload.elementId
          ? { ...el, ...action.payload.updates }
          : el
      );
      state.isDirty = true;
    },

    deleteElement: (state, action: PayloadAction<string>) => {
      state.elements = state.elements.filter((el) => el.id !== action.payload);
      if (state.selectedElementId === action.payload) {
        state.selectedElementId = null;
      }
      state.isDirty = true;
    },

    setSelectedElementId: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
      state.selection = action.payload ? { layerId: action.payload } : {};
    },

    // Layer operations (formal API)
    addLayer: (state, action: PayloadAction<CanvasLayer>) => {
      if (state.canvasConfig) {
        state.canvasConfig = {
          ...state.canvasConfig,
          layers: [...state.canvasConfig.layers, action.payload],
        };
        state.isDirty = true;
      }
    },

    updateLayer: (
      state,
      action: PayloadAction<{ layerId: string; updates: Partial<CanvasLayer> }>
    ) => {
      if (state.canvasConfig) {
        state.canvasConfig = {
          ...state.canvasConfig,
          layers: state.canvasConfig.layers.map((l) =>
            l.id === action.payload.layerId
              ? { ...l, ...action.payload.updates }
              : l
          ),
        };
        state.isDirty = true;
      }
    },

    deleteLayer: (state, action: PayloadAction<string>) => {
      if (state.canvasConfig) {
        state.canvasConfig = {
          ...state.canvasConfig,
          layers: state.canvasConfig.layers.filter((l) => l.id !== action.payload),
        };
        state.isDirty = true;
        if (state.selection.layerId === action.payload) {
          state.selection = {};
        }
      }
    },

    reorderLayers: (
      state,
      action: PayloadAction<{ oldIndex: number; newIndex: number }>
    ) => {
      if (state.canvasConfig) {
        const layers = [...state.canvasConfig.layers];
        const [layer] = layers.splice(action.payload.oldIndex, 1);
        layers.splice(action.payload.newIndex, 0, layer);
        state.canvasConfig = { ...state.canvasConfig, layers };
        state.isDirty = true;
      }
    },

    selectLayer: (state, action: PayloadAction<string | undefined>) => {
      state.selection = action.payload ? { layerId: action.payload } : {};
      state.selectedElementId = action.payload ?? null;
    },

    selectMultipleLayers: (state, action: PayloadAction<string[]>) => {
      state.selection = { layerIds: action.payload };
    },

    updateCanvasZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(0.1, Math.min(5, action.payload));
    },

    updateCanvasOffset: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      if (state.canvasConfig) {
        state.canvasConfig = {
          ...state.canvasConfig,
          offsetX: action.payload.x,
          offsetY: action.payload.y,
        };
      }
    },

    setIsDrawing: (state, action: PayloadAction<boolean>) => {
      state.isDrawing = action.payload;
    },

    setTool: (state, action: PayloadAction<EditorState['tool']>) => {
      state.tool = action.payload;
    },

    toggleGrid: (state) => {
      state.showGrid = !state.showGrid;
    },

    toggleRulers: (state) => {
      state.showRulers = !state.showRulers;
    },

    undo: (state) => {
      if (state.historyStep > 0) {
        state.historyStep -= 1;
        state.historyIndex = state.historyStep;
        state.elements = [...state.history[state.historyStep]];
        state.isDirty = true;
      }
    },

    redo: (state) => {
      if (state.historyStep < state.history.length - 1) {
        state.historyStep += 1;
        state.historyIndex = state.historyStep;
        state.elements = [...state.history[state.historyStep]];
        state.isDirty = true;
      }
    },

    pushToHistory: (state) => {
      state.history = state.history.slice(0, state.historyStep + 1);
      state.history.push([...state.elements]);
      state.historyStep = state.history.length - 1;
      state.historyIndex = state.historyStep;
      state.isDirty = true;
    },

    markAsSaved: (state) => {
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },

    resetEditor: () => {
      return initialState;
    },
  },
});

export const {
  initializeCanvas,
  addElement,
  updateElementPosition,
  updateElementSize,
  updateElement,
  deleteElement,
  setSelectedElementId,
  addLayer,
  updateLayer,
  deleteLayer,
  reorderLayers,
  selectLayer,
  selectMultipleLayers,
  updateCanvasZoom,
  updateCanvasOffset,
  setIsDrawing,
  setTool,
  toggleGrid,
  toggleRulers,
  undo,
  redo,
  pushToHistory,
  markAsSaved,
  resetEditor,
} = editorSlice.actions;

export default editorSlice.reducer;
