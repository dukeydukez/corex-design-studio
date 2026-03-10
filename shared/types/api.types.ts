# Design Format Types

export type DesignFormat =
  | 'instagram_feed'
  | 'instagram_story'
  | 'instagram_reel'
  | 'tiktok'
  | 'tiktok_vertical'
  | 'linkedin_feed'
  | 'linkedin_carousel'
  | 'twitter'
  | 'twitter_video'
  | 'facebook'
  | 'facebook_story'
  | 'youtube_thumbnail'
  | 'email'
  | 'web_banner'
  | 'custom';

# User Types

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  organizationId: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

# Design Types

export interface Design {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  format: DesignFormat;
  widthPx: number;
  heightPx: number;
  status: 'draft' | 'generating' | 'ready' | 'editing' | 'exported';
  generationPrompt?: string;
  canvasConfig: KonvaConfig;
  createdAt: Date;
  updatedAt: Date;
}

# Canvas Types

export interface KonvaConfig {
  width: number;
  height: number;
  background?: string;
  layers: KonvaLayer[];
}

export interface KonvaLayer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'group';
  locked: boolean;
  visible: boolean;
  zIndex: number;
  properties: Record<string, any>;
}

# Brand Types

export interface BrandKit {
  id: string;
  organizationId: string;
  name: string;
  clientName?: string;
  colors: ColorPalette;
  fonts: FontSet;
  brandVoice?: BrandVoice;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorPalette {
  primary: string;
  secondary?: string;
  accent?: string;
  neutrals?: string[];
  [key: string]: string | string[] | undefined;
}

export interface FontSet {
  heading: string;
  body: string;
  accent?: string;
}

export interface BrandVoice {
  tone: string;
  personality: string[];
  examples?: string[];
}

# API Response Types

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
  code: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
