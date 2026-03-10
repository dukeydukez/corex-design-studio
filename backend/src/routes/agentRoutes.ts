import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { AgentFactory } from '../agents/base/AgentFactory';
import {
  executeAgentSchema,
  agentParamsSchema,
  batchExecuteSchema,
  designParamsSchema,
} from '../validation/schemas';
import logger from '../utils/logger';
import prisma from '../utils/db';

const router = Router();

/**
 * GET /agents
 * List all available agents
 */
router.get('/agents', authenticate, (req: Request, res: Response) => {
  try {
    const agents = AgentFactory.getAgentList();

    res.json({
      success: true,
      data: agents,
      total: agents.length,
    });
  } catch (error) {
    logger.error('Failed to list agents', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to list agents',
      code: 'LIST_AGENTS_ERROR',
    });
  }
});

/**
 * GET /agents/:agentId
 * Get agent details
 */
router.get('/agents/:agentId', authenticate, (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const agents = AgentFactory.getAgentList();
    const agent = agents.find((a) => a.id === agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
        code: 'AGENT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    logger.error('Failed to get agent', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get agent',
      code: 'GET_AGENT_ERROR',
    });
  }
});

/**
 * POST /designs/:designId/agents/:agentId/execute
 * Execute an agent on a design (validated inputs)
 */
router.post(
  '/designs/:designId/agents/:agentId/execute',
  authenticate,
  validate({ params: agentParamsSchema, body: executeAgentSchema }),
  async (req: Request, res: Response) => {
    try {
      const { designId, agentId } = req.params;
      const { prompt } = req.body;
      const userId = (req as any).user?.id;

      // Verify design exists and user has access
      const design = await prisma.design.findUnique({
        where: { id: designId },
        include: {
          project: {
            include: {
              organization: {
                include: {
                  members: {
                    where: { userId },
                  },
                },
              },
            },
          },
        },
      });

      if (!design || !design.project.organization.members.length) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          code: 'ACCESS_DENIED',
        });
      }

      // Get agent (already validated by schema)
      const agent = AgentFactory.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found',
          code: 'AGENT_NOT_FOUND',
        });
      }

      // Build agent input matching AgentInput interface
      const agentInput = {
        designId,
        projectId: design.projectId,
        data: {
          designBriefing: design.briefing || '',
          canvasConfig: design.canvasConfig || {},
          brandVoice: design.project.organization.brandVoice || {},
          brandKit: design.project.organization.brandKit || {},
          metrics: design.metrics || {},
          userPrompt: prompt || '',
        },
      };

      // Execute agent
      const result = await agent.execute(agentInput);

      // Store execution record
      const execution = await prisma.agentExecution.create({
        data: {
          agentName: agentId,
          agentType: agentId,
          designId,
          input: agentInput as any,
          output: result as any,
          status: result.success ? 'completed' : 'failed',
          error: result.error,
          inputTokens: 0,
          outputTokens: 0,
          totalCost: 0,
          durationMs: 0,
        },
      });

      logger.info('Agent execution completed', { designId, agentId, executionId: execution.id });

      res.json({
        success: true,
        data: {
          executionId: execution.id,
          agentId,
          designId,
          result,
        },
      });
    } catch (error) {
      logger.error('Agent execution failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to execute agent',
        code: 'AGENT_EXECUTION_ERROR',
      });
    }
  }
);

/**
 * GET /designs/:designId/agent-executions
 * Get agent execution history for a design
 */
router.get(
  '/designs/:designId/agent-executions',
  authenticate,
  validate({ params: designParamsSchema }),
  async (req: Request, res: Response) => {
    try {
      const { designId } = req.params;
      const userId = (req as any).user?.id;

      // Verify design exists and user has access
      const design = await prisma.design.findUnique({
        where: { id: designId },
        include: {
          project: {
            include: {
              organization: {
                include: {
                  members: {
                    where: { userId },
                  },
                },
              },
            },
          },
        },
      });

      if (!design || !design.project.organization.members.length) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          code: 'ACCESS_DENIED',
        });
      }

      // Get execution history
      const executions = await prisma.agentExecution.findMany({
        where: { designId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({
        success: true,
        data: executions,
        total: executions.length,
      });
    } catch (error) {
      logger.error('Failed to fetch agent executions', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch agent executions',
        code: 'FETCH_EXECUTIONS_ERROR',
      });
    }
  }
);

/**
 * POST /designs/:designId/agents/batch-execute
 * Execute multiple agents in sequence (validated inputs)
 */
router.post(
  '/designs/:designId/agents/batch-execute',
  authenticate,
  validate({ params: designParamsSchema, body: batchExecuteSchema }),
  async (req: Request, res: Response) => {
    try {
      const { designId } = req.params;
      const { agentIds } = req.body;
      const userId = (req as any).user?.id;

      // Verify design exists and user has access
      const design = await prisma.design.findUnique({
        where: { id: designId },
        include: {
          project: {
            include: {
              organization: {
                include: {
                  members: {
                    where: { userId },
                  },
                },
              },
            },
          },
        },
      });

      if (!design || !design.project.organization.members.length) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          code: 'ACCESS_DENIED',
        });
      }

      // Build agent input matching AgentInput interface
      const agentInput = {
        designId,
        projectId: design.projectId,
        data: {
          designBriefing: design.briefing || '',
          canvasConfig: design.canvasConfig || {},
          brandVoice: design.project.organization.brandVoice || {},
          brandKit: design.project.organization.brandKit || {},
          metrics: design.metrics || {},
        },
      };

      const results: Record<string, any> = {};

      // Execute agents in sequence (agentIds already validated by schema)
      for (const agentId of agentIds) {
        try {
          const agent = AgentFactory.getAgent(agentId);
          if (!agent) {
            results[agentId] = { success: false, error: 'Agent not found' };
            continue;
          }

          const result = await agent.execute(agentInput);

          // Store execution record
          await prisma.agentExecution.create({
            data: {
              agentName: agentId,
              agentType: agentId,
              designId,
              input: agentInput as any,
              output: result as any,
              status: result.success ? 'completed' : 'failed',
              error: result.error,
              inputTokens: 0,
              outputTokens: 0,
              totalCost: 0,
              durationMs: 0,
            },
          });

          results[agentId] = { success: true, result };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          results[agentId] = { success: false, error: message };
        }
      }

      logger.info('Batch agent execution completed', { designId, agentCount: agentIds.length });

      res.json({
        success: true,
        data: {
          designId,
          executions: results,
          total: agentIds.length,
          successful: Object.values(results).filter((r) => r.success).length,
        },
      });
    } catch (error) {
      logger.error('Batch agent execution failed', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to execute batch',
        code: 'BATCH_EXECUTION_ERROR',
      });
    }
  }
);

export default router;
