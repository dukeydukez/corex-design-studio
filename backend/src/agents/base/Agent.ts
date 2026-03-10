/**
 * Agent base class
 * Defines the interface and common functionality for all agents
 */

import Anthropic from '@anthropic-ai/sdk';
import prisma from '../../utils/db';
import logger from '../../utils/logger';

export interface AgentConfig {
  name: string;
  type: string;
  description: string;
  systemPrompt: string;
}

export interface AgentInput {
  designId: string;
  projectId?: string;
  data: Record<string, any>;
}

export interface AgentOutput {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  message?: string;
}

export abstract class Agent {
  protected config: AgentConfig;
  protected client: Anthropic;

  constructor(config: AgentConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Main execution method
   * To be implemented by subclasses
   */
  abstract execute(input: AgentInput): Promise<AgentOutput>;

  /**
   * Call Claude API
   * Handles token counting and cost tracking
   */
  protected async callClaude(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    options?: Record<string, any>
  ) {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: this.config.systemPrompt,
        messages,
        ...options,
      });

      return response;
    } catch (error) {
      logger.error(`Agent ${this.config.name} API call failed`, { error });
      throw error;
    }
  }

  /**
   * Log agent execution to database
   */
  protected async logExecution(
    designId: string,
    input: AgentInput,
    output: AgentOutput,
    inputTokens: number,
    outputTokens: number,
    durationMs: number
  ) {
    try {
      // Calculate cost (rough estimate: $3 per 1M input tokens, $15 per 1M output tokens)
      const inputCost = (inputTokens / 1000000) * 3;
      const outputCost = (outputTokens / 1000000) * 15;
      const totalCost = inputCost + outputCost;

      await prisma.agentExecution.create({
        data: {
          agentName: this.config.name,
          agentType: this.config.type,
          designId,
          input,
          output,
          status: output.success ? 'completed' : 'failed',
          error: output.error,
          inputTokens,
          outputTokens,
          totalCost,
          durationMs,
        },
      });
    } catch (error) {
      logger.error(`Failed to log agent execution for ${this.config.name}`, { error });
    }
  }

  /**
   * Log agent activity
   */
  protected async log(level: 'info' | 'warn' | 'error' | 'debug', message: string, metadata?: any) {
    logger[level](`[${this.config.name}] ${message}`, metadata);

    try {
      await prisma.agentLog.create({
        data: {
          agentName: this.config.name,
          agentType: this.config.type,
          level,
          message,
          metadata: metadata || {},
        },
      });
    } catch (error) {
      logger.error(`Failed to log agent activity`, { error });
    }
  }
}
