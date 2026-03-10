/**
 * Design controller
 * HTTP handlers for design routes
 */

import { Request, Response } from 'express';
import { DesignService } from '../services/DesignService';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const designController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    // Inputs pre-validated and sanitized by Zod middleware
    const { name, format, brandKitId } = req.body;

    const design = await DesignService.createDesign(
      projectId,
      name,
      format,
      brandKitId
    );

    logger.info('Design created', { designId: design.id, projectId, format });

    res.status(201).json({
      success: true,
      message: 'Design created successfully',
      data: design,
    });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await DesignService.listDesigns(projectId, limit, offset);

    res.status(200).json({
      success: true,
      message: 'Designs retrieved',
      data: result.designs,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const { designId } = req.params;

    const design = await DesignService.getDesign(designId);

    res.status(200).json({
      success: true,
      message: 'Design retrieved',
      data: design,
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { designId } = req.params;
    const { name, format, brandKitId, status } = req.body;

    const design = await DesignService.updateDesign(designId, {
      name,
      format,
      brandKitId,
      status,
    });

    logger.info('Design updated', { designId, name });

    res.status(200).json({
      success: true,
      message: 'Design updated successfully',
      data: design,
    });
  }),

  updateCanvas: asyncHandler(async (req: Request, res: Response) => {
    const { designId } = req.params;
    // canvasConfig pre-validated with structured schema by Zod middleware
    const { canvasConfig } = req.body;

    const design = await DesignService.updateCanvas(designId, canvasConfig);

    res.status(200).json({
      success: true,
      message: 'Canvas updated successfully',
      data: design,
    });
  }),

  duplicate: asyncHandler(async (req: Request, res: Response) => {
    const { designId } = req.params;
    // name pre-validated by Zod middleware
    const { name } = req.body;

    const design = await DesignService.duplicateDesign(designId, name);

    logger.info('Design duplicated', { originalId: designId, newId: design.id, name });

    res.status(201).json({
      success: true,
      message: 'Design duplicated successfully',
      data: design,
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { designId } = req.params;

    await DesignService.deleteDesign(designId);

    logger.info('Design deleted', { designId });

    res.status(200).json({
      success: true,
      message: 'Design deleted successfully',
    });
  }),
};
