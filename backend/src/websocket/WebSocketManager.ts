/**
 * WebSocket setup for real-time updates
 * Handles Socket.io connections and events
 */

import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import logger from '../utils/logger';
import { socketAuthSchema } from '../validation/schemas';

export type SocketEventType =
  | 'design:updated'
  | 'design:created'
  | 'export:progress'
  | 'export:completed'
  | 'agent:progress'
  | 'agent:completed'
  | 'error';

export interface SocketData {
  userId: string;
  designId?: string;
  projectId?: string;
  organizationId?: string;
}

export class WebSocketManager {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info('Client connected', { socketId: socket.id });

      // User authentication and room joining (with input validation)
      socket.on('authenticate', (data: unknown) => {
        const parsed = socketAuthSchema.safeParse(data);

        if (!parsed.success) {
          logger.warn('Invalid socket auth data', {
            socketId: socket.id,
            errors: parsed.error.issues,
          });
          socket.emit('error', {
            message: 'Invalid authentication data',
            errors: parsed.error.issues.map((i) => i.message),
          });
          socket.disconnect();
          return;
        }

        const validData = parsed.data;

        // Track user sockets
        if (!this.userSockets.has(validData.userId)) {
          this.userSockets.set(validData.userId, new Set());
        }
        this.userSockets.get(validData.userId)!.add(socket.id);

        // Join design-specific room
        if (validData.designId) {
          socket.join(`design:${validData.designId}`);
          logger.debug('Socket joined design room', {
            socketId: socket.id,
            designId: validData.designId,
          });
        }

        // Join project-specific room
        if (validData.projectId) {
          socket.join(`project:${validData.projectId}`);
        }

        // Join org-specific room for notifications
        if (validData.organizationId) {
          socket.join(`org:${validData.organizationId}`);
        }

        socket.emit('authenticated', {
          success: true,
          message: 'Connected to real-time updates',
        });
      });

      socket.on('disconnect', () => {
        // Clean up user socket tracking
        this.userSockets.forEach((sockets) => {
          sockets.delete(socket.id);
        });

        logger.info('Client disconnected', { socketId: socket.id });
      });

      socket.on('error', (error) => {
        logger.error('Socket error', { socketId: socket.id, error });
      });
    });
  }

  /**
   * Emit design update to all users viewing this design
   */
  emitDesignUpdate(
    designId: string,
    data: {
      name?: string;
      canvasConfig?: any;
      status?: string;
      updatedBy?: string;
      timestamp?: Date;
    }
  ) {
    this.io.to(`design:${designId}`).emit('design:updated', {
      designId,
      ...data,
      timestamp: data.timestamp || new Date(),
    });

    logger.debug('Design update emitted', { designId });
  }

  /**
   * Emit export progress updates
   */
  emitExportProgress(
    designId: string,
    exportId: string,
    progress: number
  ) {
    this.io.to(`design:${designId}`).emit('export:progress', {
      exportId,
      designId,
      progress,
      timestamp: new Date(),
    });
  }

  /**
   * Emit export completion
   */
  emitExportCompleted(
    designId: string,
    exportId: string,
    fileUrl: string,
    format: string
  ) {
    this.io.to(`design:${designId}`).emit('export:completed', {
      exportId,
      designId,
      fileUrl,
      format,
      timestamp: new Date(),
    });

    logger.debug('Export completion emitted', { designId, exportId, format });
  }

  /**
   * Emit agent execution progress
   */
  emitAgentProgress(
    designId: string,
    agentName: string,
    progress: number
  ) {
    this.io.to(`design:${designId}`).emit('agent:progress', {
      designId,
      agentName,
      progress,
      timestamp: new Date(),
    });
  }

  /**
   * Emit agent execution completion
   */
  emitAgentCompleted(
    designId: string,
    agentName: string,
    result: any
  ) {
    this.io.to(`design:${designId}`).emit('agent:completed', {
      designId,
      agentName,
      result,
      timestamp: new Date(),
    });

    logger.debug('Agent completion emitted', { designId, agentName });
  }

  /**
   * Broadcast error to specific design room
   */
  emitError(designId: string, message: string, code?: string) {
    this.io.to(`design:${designId}`).emit('error', {
      designId,
      message,
      code: code || 'UNKNOWN_ERROR',
      timestamp: new Date(),
    });
  }

  /**
   * Get connected socket count for monitoring
   */
  getConnectedCount(): number {
    return this.io.engine.clientsCount;
  }

  /**
   * Get the Socket.io instance
   */
  getInstance(): Server {
    return this.io;
  }
}
