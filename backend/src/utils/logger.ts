/**
 * Winston logger configuration
 * Structured logging for backend services
 */

import winston from 'winston';
import { config } from '../config';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message} ${
        Object.keys(info).length > 3
          ? JSON.stringify(Object.assign({}, info, { timestamp: undefined, level: undefined, message: undefined }))
          : ''
      }`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

const logger = winston.createLogger({
  level: config.logging.level,
  format,
  transports,
});

export default logger;
