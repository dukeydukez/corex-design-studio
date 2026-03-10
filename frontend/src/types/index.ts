// User & Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

// Project Types
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organizationId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ProjectWithStats extends Project {
  designCount: number;
  lastModified: string;
}

// Design Types
export type DesignFormat =
  | "instagram-feed"
  | "instagram-story"
  | "tiktok"
  | "linkedin"
  | "twitter"
  | "youtube-thumbnail"
  | "pinterest"
  | "facebook"
  | "email"
  | "web-hero"
  | "ad-square"
  | "ad-vertical";

export type DesignStatus = "draft" | "saved" | "published" | "archived";

export interface CanvasConfig {
  layers: CanvasLayer[];
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface CanvasLayer {
  id: string;
  type: "text" | "image" | "shape" | "group";
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  align?: "left" | "center" | "right";
  // Image properties
  src?: string;
  // Shape properties
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  // Group properties
  children?: CanvasLayer[];
}

export interface Design {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  format: DesignFormat;
  width: number;
  height: number;
  canvasConfig: CanvasConfig;
  status: DesignStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DesignWithRelations extends Design {
  project: Project;
  versions: DesignVersion[];
  exports: Export[];
}

export interface DesignVersion {
  id: string;
  designId: string;
  canvasConfig: CanvasConfig;
  versionNumber: number;
  createdBy: string;
  createdAt: string;
}

// Export Types
export type ExportFormat = "png" | "jpg" | "pdf" | "svg" | "mp4" | "webm";
export type ExportStatus = "pending" | "processing" | "completed" | "failed";

export interface Export {
  id: string;
  designId: string;
  format: ExportFormat;
  quality: "low" | "medium" | "high";
  status: ExportStatus;
  progress: number;
  fileSize?: number;
  downloadUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Brand Kit Types
export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  isPrimary: boolean;
}

export interface FontSet {
  id: string;
  name: string;
  fontFamily: string;
  weights: number[];
  isPrimary: boolean;
}

export interface BrandKit {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  colorPalettes: ColorPalette[];
  fontSets: FontSet[];
  brandVoice?: {
    tone: string[];
    personality: string[];
  };
  guidelines?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Template Types
export interface Template {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  format: DesignFormat;
  thumbnail: string;
  canvasConfig: CanvasConfig;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

// Agent Execution Types
export type AgentType =
  | "CREATIVE_DIRECTOR"
  | "DESIGN_GENERATOR"
  | "COPY_WRITER"
  | "IMAGE_CURATOR"
  | "COLOR_EXPERT"
  | "FONT_EXPERT"
  | "LAYOUT_OPTIMIZER"
  | "BRAND_ALIGNMENT"
  | "A_B_TEST_PLANNER"
  | "PERFORMANCE_ANALYZER"
  | "EXPORT_FORMATTER"
  | "QUALITY_ASSURANCE";

export interface AgentExecution {
  id: string;
  designId: string;
  agentType: AgentType;
  status: "pending" | "processing" | "completed" | "failed";
  input: Record<string, any>;
  output?: Record<string, any>;
  tokensUsed: number;
  cost: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// UI State Types
export interface EditorSelection {
  layerId?: string;
  layerIds?: string[];
}

export interface EditorHistory {
  canvasConfig: CanvasConfig;
  timestamp: number;
}

export interface NotificationItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: number;
  duration?: number;
}
