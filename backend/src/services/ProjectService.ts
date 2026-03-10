/**
 * Project service
 * Business logic for project operations
 */

import { ProjectRepository } from '../repositories/ProjectRepository';
import { DesignRepository } from '../repositories/DesignRepository';
import { AppError } from '../middleware/errorHandler';

export class ProjectService {
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static async createProject(
    organizationId: string,
    ownerId: string,
    name: string
  ) {
    const slug = this.generateSlug(name);

    // Check if slug already exists
    const existing = await ProjectRepository.findByOrgAndSlug(organizationId, slug);
    if (existing) {
      throw new AppError(409, `Project with name "${name}" already exists`);
    }

    return ProjectRepository.create({
      organizationId,
      ownerId,
      name,
      slug,
    });
  }

  static async getProject(id: string) {
    const project = await ProjectRepository.findById(id);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }
    return project;
  }

  static async listProjects(organizationId: string, limit = 50, offset = 0) {
    const projects = await ProjectRepository.findByOrganization(
      organizationId,
      limit,
      offset
    );
    const total = await ProjectRepository.countByOrganization(organizationId);

    return { projects, total, limit, offset };
  }

  static async updateProject(id: string, data: { name?: string }) {
    const project = await this.getProject(id);

    const updateData: any = {};
    if (data.name && data.name !== project.name) {
      updateData.slug = this.generateSlug(data.name);
      updateData.name = data.name;
    }

    if (Object.keys(updateData).length === 0) {
      return project;
    }

    return ProjectRepository.update(id, updateData);
  }

  static async deleteProject(id: string) {
    await this.getProject(id);
    return ProjectRepository.delete(id);
  }
}
