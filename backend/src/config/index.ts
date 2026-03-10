/**
 * Configuration loader for backend services
 * Centralizes all environment variables and configuration
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/corex',
    pool: {
      min: 2,
      max: 20,
    },
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // AI/LLM configuration
  ai: {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
    },
  },

  // AWS/Storage configuration
  storage: {
    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'corex-designs',
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // Rate limiting
  rateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    maxExports: 500,
    maxGenerations: 50,
  },
};

// Validate required configuration
export const validateConfig = () => {
  const requiredKeys = ['ANTHROPIC_API_KEY'];
  const missing = requiredKeys.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  }
};
