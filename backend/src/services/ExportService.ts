/**
 * Export service
 * Handles design export requests and job management
 */

import prisma from '../utils/db';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class ExportService {
  static async requestExport(
    designId: string,
    format: 'png' | 'jpg' | 'pdf' | 'svg' | 'mp4' | 'webm',
    quality: 'low' | 'medium' | 'high' | 'ultra' = 'high',
    settings: any = {}
  ) {
    // Verify design exists
    const design = await prisma.design.findUnique({
      where: { id: designId },
    });

    if (!design) {
      throw new AppError(404, 'Design not found');
    }

    // Create export job
    const exportJob = await prisma.export.create({
      data: {
        designId,
        format,
        quality,
        settings,
        status: 'pending',
        progress: 0,
      },
    });

    logger.info('Export job created', {
      jobId: exportJob.id,
      designId,
      format,
      quality,
    });

    return exportJob;
  }

  static async getExport(id: string) {
    const exportJob = await prisma.export.findUnique({
      where: { id },
      include: { design: { select: { id: true, name: true, format: true } } },
    });

    if (!exportJob) {
      throw new AppError(404, 'Export not found');
    }

    return exportJob;
  }

  static async listExports(designId: string) {
    const exports = await prisma.export.findMany({
      where: { designId },
      orderBy: { createdAt: 'desc' },
    });

    return exports;
  }

  static async updateExportStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    progress = 0,
    fileUrl?: string,
    fileSize?: number,
    errorMessage?: string
  ) {
    const updateData: any = {
      status,
      progress,
    };

    if (fileUrl) updateData.fileUrl = fileUrl;
    if (fileSize) updateData.fileSize = fileSize;
    if (errorMessage) updateData.errorMessage = errorMessage;
    if (status === 'completed') {
      updateData.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      updateData.downloadToken = this.generateDownloadToken();
    }

    return prisma.export.update({
      where: { id },
      data: updateData,
    });
  }

  static async getDownloadUrl(token: string) {
    const exportJob = await prisma.export.findFirst({
      where: {
        downloadToken: token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!exportJob) {
      throw new AppError(404, 'Download link expired or invalid');
    }

    return exportJob.fileUrl;
  }

  static generateDownloadToken(): string {
    return require('crypto')
      .randomBytes(32)
      .toString('hex');
  }

  static getEstimatedDuration(format: string, quality: string): number {
    const baseDuration: Record<string, number> = {
      png: 5,
      jpg: 5,
      pdf: 10,
      svg: 3,
      mp4: 60,
      webm: 60,
    };

    const qualityMultiplier: Record<string, number> = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      ultra: 2,
    };

    return (baseDuration[format] || 30) * (qualityMultiplier[quality] || 1);
  }

  static getSupportedFormats(): Array<{ format: string; mime: string; description: string }> {
    return [
      { format: 'png', mime: 'image/png', description: 'PNG (Lossless, best quality)' },
      { format: 'jpg', mime: 'image/jpeg', description: 'JPG (Smaller file size)' },
      { format: 'pdf', mime: 'application/pdf', description: 'PDF (Print-ready)' },
      { format: 'svg', mime: 'image/svg+xml', description: 'SVG (Scalable vector)' },
      { format: 'mp4', mime: 'video/mp4', description: 'MP4 video (H.264)' },
      { format: 'webm', mime: 'video/webm', description: 'WebM video (Modern web)' },
    ];
  }
}
