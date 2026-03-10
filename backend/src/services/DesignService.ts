/**
 * Design service
 * Business logic for design operations
 */

import { DesignRepository } from '../repositories/DesignRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class DesignService {
  static async createDesign(
    projectId: string,
    name: string,
    format = 'instagram_feed',
    brandKitId?: string
  ) {
    // Verify project exists
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Get format dimensions
    const dimensions = this.getFormatDimensions(format);

    return DesignRepository.create({
      projectId,
      name,
      format,
      width: dimensions.width,
      height: dimensions.height,
      brandKitId,
      canvasConfig: {
        layers: [],
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      },
    });
  }

  static async getDesign(id: string) {
    const design = await DesignRepository.findById(id);
    if (!design) {
      throw new AppError(404, 'Design not found');
    }
    return design;
  }

  static async listDesigns(projectId: string, limit = 100, offset = 0) {
    // Verify project exists
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    const designs = await DesignRepository.findByProject(
      projectId,
      limit,
      offset
    );
    const total = await DesignRepository.countByProject(projectId);

    return { designs, total, limit, offset };
  }

  static async updateDesign(
    id: string,
    data: {
      name?: string;
      format?: string;
      brandKitId?: string;
      status?: string;
    }
  ) {
    await this.getDesign(id);

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.format) {
      const dimensions = this.getFormatDimensions(data.format);
      updateData.format = data.format;
      updateData.width = dimensions.width;
      updateData.height = dimensions.height;
    }
    if (data.brandKitId) updateData.brandKitId = data.brandKitId;
    if (data.status) updateData.status = data.status;

    return DesignRepository.update(id, updateData);
  }

  static async updateCanvas(id: string, canvasConfig: any) {
    await this.getDesign(id);
    logger.info('Canvas updated', { designId: id, layers: canvasConfig.layers?.length || 0 });
    return DesignRepository.updateCanvas(id, canvasConfig);
  }

  static async duplicateDesign(id: string, newName: string) {
    await this.getDesign(id);
    return DesignRepository.duplicate(id, newName);
  }

  static async deleteDesign(id: string) {
    await this.getDesign(id);
    return DesignRepository.delete(id);
  }

  static getFormatDimensions(format: string): { width: number; height: number } {
    const dimensions: Record<string, { width: number; height: number }> = {
      instagram_feed: { width: 1080, height: 1080 },
      instagram_story: { width: 1080, height: 1920 },
      tiktok_video: { width: 1080, height: 1920 },
      tiktok_cover: { width: 1080, height: 1440 },
      linkedin_post: { width: 1200, height: 628 },
      twitter_post: { width: 1024, height: 512 },
      youtube_thumbnail: { width: 1280, height: 720 },
      youtube_banner: { width: 2560, height: 1440 },
      facebook_post: { width: 1200, height: 628 },
      pinterest_pin: { width: 1000, height: 1500 },
      email_banner: { width: 600, height: 300 },
      web_hero: { width: 1920, height: 600 },
      ad_square: { width: 600, height: 600 },
      ad_vertical: { width: 1200, height: 1500 },
    };

    return dimensions[format] || { width: 1080, height: 1080 };
  }
}
