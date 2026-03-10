/**
 * Layout Optimizer Agent (Agent 04)
 * Analyzes design layouts and provides optimization recommendations
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const LAYOUT_OPTIMIZER_CONFIG: AgentConfig = {
  name: 'Layout Optimizer',
  type: 'LAYOUT_OPTIMIZER',
  description: 'Analyzes and optimizes design layouts for better composition',
  systemPrompt: `You are an expert layout and composition designer specializing in digital design optimization.
Your role is to:
1. Analyze visual balance and symmetry
2. Optimize white space usage
3. Improve visual hierarchy and focal points
4. Ensure alignment and consistency
5. Apply grid-based composition principles
6. Enhance contrast and emphasis

Output structured JSON with layout optimization recommendations.`,
};

export class LayoutOptimizerAgent extends Agent {
  constructor() {
    super(LAYOUT_OPTIMIZER_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting layout optimization', { designId: input.designId });

    try {
      const { designBriefing, canvasConfig, brandVoice } = input.data;

      const userPrompt = `Analyze the following design context and provide comprehensive layout optimization recommendations:

**Design Briefing:**
${designBriefing || 'No briefing provided'}

**Canvas Configuration:**
${JSON.stringify(canvasConfig, null, 2)}

**Brand Voice:**
${JSON.stringify(brandVoice, null, 2)}

Provide recommendations in the following JSON format:
{
  "recommendations": ["Specific, actionable recommendations for layout improvement"],
  "layoutAdjustments": {
    "gridSystem": "Recommended grid system",
    "alignment": "How elements should be aligned",
    "spacing": "Recommended spacing and padding strategies",
    "hierarchy": "Visual hierarchy improvements"
  },
  "compositionalPrinciples": ["Key compositional principles to apply"]
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
        throw new Error('Failed to parse layout optimization response');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId, input,
        { success: true, data: result },
        response.usage.input_tokens, response.usage.output_tokens, durationMs
      );

      return { success: true, data: result, message: 'Layout optimization completed' };
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
