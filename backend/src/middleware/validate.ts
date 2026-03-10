/**
 * Validation middleware factory
 * Uses Zod schemas to validate request body, params, and query
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationTargets {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Express middleware that validates request data against Zod schemas.
 * Replaces req.body/params/query with the parsed (sanitized) values.
 *
 * Usage:
 *   router.post('/route', validate({ body: mySchema }), handler)
 *   router.get('/route/:id', validate({ params: idSchema, query: pageSchema }), handler)
 */
export function validate(schemas: ValidationTargets) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ location: string; field: string; message: string }> = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (result.success) {
        req.body = result.data;
      } else {
        errors.push(...formatZodErrors(result.error, 'body'));
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (result.success) {
        req.params = result.data as any;
      } else {
        errors.push(...formatZodErrors(result.error, 'params'));
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (result.success) {
        req.query = result.data as any;
      } else {
        errors.push(...formatZodErrors(result.error, 'query'));
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
}

function formatZodErrors(
  error: ZodError,
  location: string
): Array<{ location: string; field: string; message: string }> {
  return error.issues.map((issue) => ({
    location,
    field: issue.path.join('.') || location,
    message: issue.message,
  }));
}
