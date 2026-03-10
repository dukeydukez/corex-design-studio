/**
 * Main server file
 * Express.js application initialization and middleware setup
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import { config, validateConfig } from './config';
import { errorHandler }  from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import logger from './utils/logger';
import { WebSocketManager } from './websocket/WebSocketManager';
import authRoutes from './routes/authRoutes';
import projectDesignRoutes from './routes/projectDesignRoutes';
import exportRoutes from './routes/exportRoutes';
import agentRoutes from './routes/agentRoutes';

// Validate configuration
validateConfig();

// Initialize Express app
const app: Application = express();
const httpServer = http.createServer(app);
const wsManager = new WebSocketManager(httpServer);

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Compression middleware
app.use(compression());

// Request logging
app.use(requestLogger);

// ============================================================================
// HEALTH CHECK ROUTES
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.nodeEnv,
    wsConnected: wsManager.getConnectedCount(),
  });
});

app.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'COREX Design Studio API is running',
    version: '0.2.0',
    features: ['Authentication', 'Projects', 'Designs', 'Exports', 'WebSocket', 'AI Agents'],
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

// Auth routes
app.use('/api/v1/auth', authRoutes);

// Project and Design routes
app.use('/api/v1', projectDesignRoutes);

// Export routes
app.use('/api/v1', exportRoutes);

// Agent routes
app.use('/api/v1', agentRoutes);

// ============================================================================
// 404 HANDLER
// ============================================================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = config.server.port;

const server = httpServer.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT} (${config.server.nodeEnv})`);
  logger.info(`📊 API available at http://localhost:${PORT}/api/v1`);
  logger.info(`💚 Health check at http://localhost:${PORT}/health`);
  logger.info(`🔌 WebSocket server active`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export { app, wsManager };
