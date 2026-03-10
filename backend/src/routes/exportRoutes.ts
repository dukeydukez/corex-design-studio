/**
 * Export routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { exportController } from '../controllers/exportController';
import {
  requestExportSchema,
  designParamsSchema,
  exportParamsSchema,
  downloadQuerySchema,
} from '../validation/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Export routes
router.post(
  '/designs/:designId/exports',
  validate({ params: designParamsSchema, body: requestExportSchema }),
  exportController.request
);
router.get(
  '/exports/:exportId',
  validate({ params: exportParamsSchema }),
  exportController.status
);
router.get(
  '/designs/:designId/exports',
  validate({ params: designParamsSchema }),
  exportController.list
);
router.get(
  '/exports/download/:token',
  exportController.download
);
router.get('/exports/formats/supported', exportController.supportedFormats);

export default router;
