/**
 * Export controller
 * HTTP handlers for export routes
 */

import { Request, Response } from 'express';
import { ExportService } from '../services/ExportService';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const exportController = {
  request: asyncHandler(async (req: Request, res: Response) => {
    const { designId } = req.params;
    // Inputs pre-validated by Zod middleware (format enum, quality enum, settings structure)
    const { format, quality, settings } = req.body;

    const exportJob = await ExportService.requestExport(
      designId,
      format,
      quality,
      settings
    );

    const estimatedDuration = ExportService.getEstimatedDuration(format, quality);

    logger.info('Export requested', {
      exportId: exportJob.id,
      designId,
      format,
      estimatedDuration,
    });

    res.status(201).json({
      success: true,
      message: 'Export job created',
      data: {
        ...exportJob,
        estimatedDurationSeconds: estimatedDuration,
      },
    });
  }),

  status: asyncHandler(async (req: Request, res: Response) => {
    const { exportId } = req.params;

    const exportJob = await ExportService.getExport(exportId);

    res.status(200).json({
      success: true,
      message: 'Export status retrieved',
      data: exportJob,
    });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { designId } = req.params;

    const exports = await ExportService.listExports(designId);

    res.status(200).json({
      success: true,
      message: 'Exports retrieved',
      data: exports,
      count: exports.length,
    });
  }),

  download: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Download token is required',
      });
    }

    const fileUrl = await ExportService.getDownloadUrl(token as string);

    logger.info('Export downloaded', { token });

    res.status(200).json({
      success: true,
      message: 'Download URL retrieved',
      data: { url: fileUrl },
    });
  }),

  supportedFormats: asyncHandler(async (req: Request, res: Response) => {
    const formats = ExportService.getSupportedFormats();

    res.status(200).json({
      success: true,
      message: 'Supported export formats',
      data: formats,
    });
  }),
};
