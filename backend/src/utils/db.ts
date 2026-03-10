/**
 * Prisma client initialization and utilities
 */

import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});

prisma.$on('query', (e: any) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Query: ${e.query}`, { duration: `${e.duration}ms` });
  }
});

prisma.$connect()
  .then(() => logger.info('✅ Prisma connected to database'))
  .catch((error: unknown) => {
    logger.error('❌ Failed to connect to database', { error });
    process.exit(1);
  });

export default prisma;
