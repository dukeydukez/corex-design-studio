/**
 * Project controller
 * HTTP handlers for project routes
 */

import { Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const projectController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    // Inputs pre-validated and sanitized by Zod middleware
    const { name, description } = req.body;
    const organizationId = req.params.orgId;
    const userId = req.user!.id;

    const project = await ProjectService.createProject(organizationId, userId, name);

    logger.info('Project created', { projectId: project.id, organizationId, name });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.params.orgId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await ProjectService.listProjects(organizationId, limit, offset);

    res.status(200).json({
      success: true,
      message: 'Projects retrieved',
      data: result.projects,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const project = await ProjectService.getProject(projectId);

    res.status(200).json({
      success: true,
      message: 'Project retrieved',
      data: project,
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { name } = req.body;

    const project = await ProjectService.updateProject(projectId, { name });

    logger.info('Project updated', { projectId, name });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    await ProjectService.deleteProject(projectId);

    logger.info('Project deleted', { projectId });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  }),
};
