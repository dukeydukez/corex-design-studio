/**
 * Design repository
 * Data access for design operations
 */

import prisma from '../utils/db';

export class DesignRepository {
  static async create(data: {
    projectId: string;
    name: string;
    format?: string;
    width?: number;
    height?: number;
    canvasConfig?: any;
    brandKitId?: string;
  }) {
    return prisma.design.create({
      data,
      include: {
        project: { select: { id: true, name: true } },
        brandKit: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.design.findUnique({
      where: { id },
      include: {
        project: true,
        brandKit: { include: { colors: true, fonts: true } },
        versions: true,
        exports: true,
        metrics: true,
        agentExecutions: true,
      },
    });
  }

  static async findByProject(projectId: string, limit = 100, offset = 0) {
    return prisma.design.findMany({
      where: { projectId, deletedAt: null },
      include: {
        project: { select: { id: true, name: true } },
        brandKit: true,
        metrics: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async update(id: string, data: any) {
    return prisma.design.update({
      where: { id },
      data,
      include: { project: true, brandKit: true, metrics: true },
    });
  }

  static async updateCanvas(id: string, canvasConfig: any) {
    return prisma.design.update({
      where: { id },
      data: { canvasConfig },
    });
  }

  static async delete(id: string) {
    return prisma.design.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async duplicate(id: string, newName: string) {
    const original = await this.findById(id);
    if (!original) throw new Error('Design not found');

    return prisma.design.create({
      data: {
        projectId: original.projectId,
        name: newName,
        format: original.format,
        width: original.width,
        height: original.height,
        canvasConfig: original.canvasConfig,
        brandKitId: original.brandKitId,
      },
      include: { project: true, brandKit: true },
    });
  }

  static async countByProject(projectId: string) {
    return prisma.design.count({
      where: { projectId, deletedAt: null },
    });
  }

  static async getByStatus(projectId: string, status: string) {
    return prisma.design.findMany({
      where: { projectId, status, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
