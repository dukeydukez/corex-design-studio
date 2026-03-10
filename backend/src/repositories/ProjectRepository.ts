/**
 * Project repository
 * Data access for project operations
 */

import prisma from '../utils/db';

export class ProjectRepository {
  static async create(data: {
    organizationId: string;
    ownerId: string;
    name: string;
    slug: string;
  }) {
    return prisma.project.create({
      data,
      include: { owner: { select: { id: true, email: true } } },
    });
  }

  static async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, email: true } },
        designs: { select: { id: true, name: true, status: true } },
      },
    });
  }

  static async findByOrgAndSlug(organizationId: string, slug: string) {
    return prisma.project.findUnique({
      where: { organizationId_slug: { organizationId, slug } },
      include: { designs: true },
    });
  }

  static async findByOrganization(organizationId: string, limit = 50, offset = 0) {
    return prisma.project.findMany({
      where: { organizationId, deletedAt: null },
      include: { owner: { select: { id: true, email: true } } },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async update(id: string, data: any) {
    return prisma.project.update({
      where: { id },
      data,
      include: { owner: { select: { id: true, email: true } } },
    });
  }

  static async delete(id: string) {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async countByOrganization(organizationId: string) {
    return prisma.project.count({
      where: { organizationId, deletedAt: null },
    });
  }
}
