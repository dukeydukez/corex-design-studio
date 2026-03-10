/**
 * Design Refiner Agent (Agent 05)
 * Refines and polishes design outputs with attention to detail
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const DESIGN_REFINER_CONFIG: AgentConfig = {
  name: 'Design Refiner',
  type: 'DESIGN_REFINER',
  description: 'Refines and polishes design outputs for production quality',
  systemPrompt: `You are a senior design refinement specialist focused on pixel-perfect production quality.
Your role is to:
1. Review and critique design outputs for quality issues
2. Suggest micro-adjustments for visual polish
3. Ensure consistency across all design elements
4. Optimize for the target medium and format
5. Apply finishing touches (shadows, gradients, spacing)
6. Validate brand guideline adherence

Output structured JSON with refinement recommendations and specific adjustments.`,
};

export class DesignRefinerAgent extends Agent {
  constructor() {
    super(DESIGN_REFINER_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting design refinement', { designId: input.designId });

    try {
      const { designBriefing, canvasConfig, brandVoice } = input.data;

      const userPrompt = `Review and refine this design for production quality:

**Design Briefing:**
${designBriefing || 'No briefing provided'}

**Canvas Configuration:**
${JSON.stringify(canvasConfig, null, 2)}

**Brand Voice:**
${JSON.stringify(brandVoice, null, 2)}

Provide refinement recommendations in JSON format:
{
  "overallQualityScore": "Score out of 100",
  "refinements": [
    {
      "element": "Element being refined",
      "issue": "Current issue",
      "recommendation": "Specific fix",
      "priority": "high|medium|low"
    }
  ],
  "consistencyChecks": ["Brand consistency observations"],
  "polishSuggestions": ["Final polish and finishing touches"],
  "productionReadiness": "Assessment of production readiness"
}`;

      const response = await this.callClaude([{ role: 'user', content: userPrompt }]);

      const responseContent = response.content[0];
      if (responseContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      let result;
      try {
        const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');
        result = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error('Failed to parse design refinement response');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId, input,
        { success: true, data: result },
        response.usage.input_tokens, response.usage.output_tokens, durationMs
      );

      return { success: true, data: result, message: 'Design refinement completed' };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logExecution(
        input.designId, input,
        { success: false, error: errorMessage },
        0, 0, durationMs
      );

      return { success: false, error: errorMessage };
    }
  }
}
