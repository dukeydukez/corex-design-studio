/**
 * Zod validation schemas for all API inputs
 * Centralized input sanitization and validation
 */

import { z } from 'zod';

// ─── Shared Primitives ───────────────────────────────────────────────

const sanitizedString = (maxLength: number = 500) =>
  z.string().trim().min(1).max(maxLength);

const uuidParam = z.string().uuid('Invalid ID format');

const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ─── Auth Schemas ────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .max(255, 'Email must be under 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be under 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  firstName: sanitizedString(100),
  lastName: sanitizedString(100),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .max(255),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Project Schemas ─────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: sanitizedString(200),
  description: z.string().trim().max(2000).optional(),
});

export const updateProjectSchema = z.object({
  name: sanitizedString(200).optional(),
  description: z.string().trim().max(2000).optional(),
});

export const projectParamsSchema = z.object({
  projectId: uuidParam,
});

export const orgParamsSchema = z.object({
  orgId: uuidParam,
});

// ─── Design Schemas ──────────────────────────────────────────────────

const VALID_DESIGN_FORMATS = [
  'instagram-feed', 'instagram-story', 'tiktok',
  'linkedin', 'twitter', 'youtube-thumbnail',
  'pinterest', 'facebook', 'email',
  'web-hero', 'ad-square', 'ad-vertical',
] as const;

const VALID_DESIGN_STATUSES = [
  'draft', 'saved', 'published', 'archived',
] as const;

export const createDesignSchema = z.object({
  name: sanitizedString(200),
  format: z.enum(VALID_DESIGN_FORMATS).default('instagram-feed'),
  brandKitId: uuidParam.optional().nullable(),
});

export const updateDesignSchema = z.object({
  name: sanitizedString(200).optional(),
  format: z.enum(VALID_DESIGN_FORMATS).optional(),
  brandKitId: uuidParam.optional().nullable(),
  status: z.enum(VALID_DESIGN_STATUSES).optional(),
});

export const duplicateDesignSchema = z.object({
  name: sanitizedString(200),
});

// Canvas config: structured validation for the nested object
const canvasElementSchema = z.object({
  id: z.string().max(100),
  type: z.enum(['text', 'rect', 'image', 'group', 'circle', 'line']),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().min(0).max(10000).optional(),
  height: z.number().finite().min(0).max(10000).optional(),
  rotation: z.number().finite().min(-360).max(360).optional(),
  opacity: z.number().min(0).max(1).optional(),
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
  content: z.string().max(10000).optional(),
  fontSize: z.number().int().min(1).max(1000).optional(),
  fontFamily: z.string().max(200).optional(),
  fill: z.string().max(50).optional(),
  stroke: z.string().max(50).optional(),
  strokeWidth: z.number().min(0).max(100).optional(),
  cornerRadius: z.number().min(0).max(1000).optional(),
  src: z.string().url().max(2000).optional(),
});

const canvasLayerSchema = z.object({
  id: z.string().max(100),
  name: z.string().max(200).optional(),
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
  elements: z.array(canvasElementSchema).max(500).optional(),
});

export const updateCanvasSchema = z.object({
  canvasConfig: z.object({
    width: z.number().int().min(1).max(10000).optional(),
    height: z.number().int().min(1).max(10000).optional(),
    zoom: z.number().min(0.1).max(10).optional(),
    offsetX: z.number().finite().optional(),
    offsetY: z.number().finite().optional(),
    layers: z.array(canvasLayerSchema).max(100).optional(),
    background: z.string().max(50).optional(),
  }).passthrough(),
});

export const designParamsSchema = z.object({
  designId: uuidParam,
});

export const projectDesignParamsSchema = z.object({
  projectId: uuidParam,
});

// ─── Export Schemas ──────────────────────────────────────────────────

const VALID_EXPORT_FORMATS = [
  'png', 'jpg', 'pdf', 'svg', 'mp4', 'webm',
] as const;

const VALID_EXPORT_QUALITIES = [
  'low', 'medium', 'high', 'ultra',
] as const;

export const requestExportSchema = z.object({
  format: z.enum(VALID_EXPORT_FORMATS),
  quality: z.enum(VALID_EXPORT_QUALITIES).default('high'),
  settings: z.object({
    dpi: z.number().int().min(72).max(600).optional(),
    transparent: z.boolean().optional(),
    compression: z.number().min(0).max(100).optional(),
  }).optional(),
});

export const exportParamsSchema = z.object({
  exportId: uuidParam,
});

export const downloadQuerySchema = z.object({
  token: z.string().min(1, 'Download token is required').max(500),
});

// ─── Agent Schemas ───────────────────────────────────────────────────

const VALID_AGENT_IDS = [
  '01-creative-director',
  '02-design-generator',
  '03-copy-writer',
  '04-layout-optimizer',
  '05-design-refiner',
  '06-video-adapter',
  '07-blog-adapter',
  '08-social-adapter',
  '09-ab-testing',
  '10-analytics',
  '11-accessibility',
  '12-seo',
] as const;

export const executeAgentSchema = z.object({
  prompt: z
    .string()
    .trim()
    .max(5000, 'Prompt must be under 5000 characters')
    .optional(),
});

export const agentParamsSchema = z.object({
  designId: uuidParam,
  agentId: z.enum(VALID_AGENT_IDS),
});

export const batchExecuteSchema = z.object({
  agentIds: z
    .array(z.enum(VALID_AGENT_IDS))
    .min(1, 'At least one agent ID is required')
    .max(12, 'Maximum 12 agents per batch'),
});

// ─── WebSocket Schemas ───────────────────────────────────────────────

export const socketAuthSchema = z.object({
  userId: uuidParam,
  designId: uuidParam.optional(),
  projectId: uuidParam.optional(),
  organizationId: uuidParam.optional(),
});

// ─── Pagination ──────────────────────────────────────────────────────

export { paginationQuery };

// ─── Type Exports ────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateDesignInput = z.infer<typeof createDesignSchema>;
export type UpdateDesignInput = z.infer<typeof updateDesignSchema>;
export type RequestExportInput = z.infer<typeof requestExportSchema>;
export type ExecuteAgentInput = z.infer<typeof executeAgentSchema>;
export type BatchExecuteInput = z.infer<typeof batchExecuteSchema>;
export type SocketAuthInput = z.infer<typeof socketAuthSchema>;
