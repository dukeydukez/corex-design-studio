/**
 * Project and Design routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { projectController } from '../controllers/projectController';
import { designController } from '../controllers/designController';
import {
  createProjectSchema,
  updateProjectSchema,
  orgParamsSchema,
  projectParamsSchema,
  createDesignSchema,
  updateDesignSchema,
  updateCanvasSchema,
  duplicateDesignSchema,
  designParamsSchema,
  projectDesignParamsSchema,
  paginationQuery,
} from '../validation/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Project routes
router.post(
  '/orgs/:orgId/projects',
  validate({ params: orgParamsSchema, body: createProjectSchema }),
  projectController.create
);
router.get(
  '/orgs/:orgId/projects',
  validate({ params: orgParamsSchema, query: paginationQuery }),
  projectController.list
);
router.get(
  '/projects/:projectId',
  validate({ params: projectParamsSchema }),
  projectController.get
);
router.put(
  '/projects/:projectId',
  validate({ params: projectParamsSchema, body: updateProjectSchema }),
  projectController.update
);
router.delete(
  '/projects/:projectId',
  validate({ params: projectParamsSchema }),
  projectController.delete
);

// Design routes
router.post(
  '/projects/:projectId/designs',
  validate({ params: projectDesignParamsSchema, body: createDesignSchema }),
  designController.create
);
router.get(
  '/projects/:projectId/designs',
  validate({ params: projectDesignParamsSchema, query: paginationQuery }),
  designController.list
);
router.get(
  '/designs/:designId',
  validate({ params: designParamsSchema }),
  designController.get
);
router.put(
  '/designs/:designId',
  validate({ params: designParamsSchema, body: updateDesignSchema }),
  designController.update
);
router.put(
  '/designs/:designId/canvas',
  validate({ params: designParamsSchema, body: updateCanvasSchema }),
  designController.updateCanvas
);
router.post(
  '/designs/:designId/duplicate',
  validate({ params: designParamsSchema, body: duplicateDesignSchema }),
  designController.duplicate
);
router.delete(
  '/designs/:designId',
  validate({ params: designParamsSchema }),
  designController.delete
);

export default router;
