/**
 * Agent orchestrator
 * Coordinates execution of multiple agents in sequence
 */

import { Agent, AgentInput, AgentOutput } from './Agent';
import logger from '../../utils/logger';
import prisma from '../../utils/db';

export interface OrchestrationStep {
  agentName: string;
  agent: Agent;
  input: (previousOutput: AgentOutput) => AgentInput;
}

export class AgentOrchestrator {
  private steps: OrchestrationStep[] = [];

  /**
   * Add an agent to the orchestration pipeline
   */
  addStep(
    agentName: string,
    agent: Agent,
    inputBuilder: (previousOutput: AgentOutput) => AgentInput
  ): AgentOrchestrator {
    this.steps.push({
      agentName,
      agent,
      input: inputBuilder,
    });
    return this;
  }

  /**
   * Execute the orchestration pipeline
   */
  async execute(initialInput: AgentInput): Promise<AgentOutput> {
    logger.info('Starting agent orchestration', {
      steps: this.steps.length,
      designId: initialInput.designId,
    });

    let currentOutput: AgentOutput = {
      success: true,
      data: initialInput.data,
    };

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      logger.info(`Executing step ${i + 1}/${this.steps.length}`, { agent: step.agentName });

      try {
        // Build input for this step
        const stepInput = step.input(currentOutput);

        // Execute agent
        currentOutput = await step.agent.execute(stepInput);

        if (!currentOutput.success) {
          logger.error(`Agent ${step.agentName} failed`, { output: currentOutput });
          throw new Error(`Agent ${step.agentName} failed: ${currentOutput.error}`);
        }

        logger.info(`Agent ${step.agentName} completed successfully`);
      } catch (error) {
        logger.error(`Orchestration failed at step ${i + 1}`, { error, agent: step.agentName });
        return {
          success: false,
          error: `Orchestration failed at ${step.agentName}: ${error}`,
        };
      }
    }

    logger.info('Agent orchestration completed successfully');
    return currentOutput;
  }

  /**
   * Get pipeline summary
   */
  getSummary(): string {
    return this.steps.map((s) => s.agentName).join(' -> ');
  }
}
