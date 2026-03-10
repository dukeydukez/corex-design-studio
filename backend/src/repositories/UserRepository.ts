/**
 * User repository
 * Data access layer for user operations
 */

import prisma from '../utils/db';

export class UserRepository {
  static async create(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    organizationId?: string;
  }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationId: true,
        createdAt: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationId: true,
        createdAt: true,
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        organizationId: true,
      },
    });
  }

  static async findByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        organizationId: true,
      },
    });
  }

  static async update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationId: true,
        updatedAt: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
