/**
 * A/B Testing Generator Agent (Agent 09)
 * Generates design variations for A/B testing and multivariate experiments
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const AB_TESTING_GENERATOR_CONFIG: AgentConfig = {
  name: 'A/B Testing Generator',
  type: 'AB_TESTING_GENERATOR',
  description: 'Generates design variations for A/B testing and experimentation',
  systemPrompt: `You are a conversion rate optimization (CRO) and A/B testing specialist.
Your role is to:
1. Generate statistically meaningful design variations
2. Define clear hypotheses for each variation
3. Recommend testing strategy and duration
4. Identify key metrics to track
5. Apply psychological principles (contrast, urgency, social proof)
6. Maintain brand consistency across variations

Output structured JSON with test variations and testing strategy.`,
};

export class ABTestingGeneratorAgent extends Agent {
  constructor() {
    super(AB_TESTING_GENERATOR_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting A/B test generation', { designId: input.designId });

    try {
      const { designBriefing, canvasConfig, brandVoice } = input.data;

      const userPrompt = `Generate 3-4 design variations for rigorous A/B testing:

**Design Briefing:**
${designBriefing || 'No briefing provided'}

**Canvas Configuration:**
${JSON.stringify(canvasConfig, null, 2)}

**Brand Voice:**
${JSON.stringify(brandVoice, null, 2)}

Provide A/B testing variations in JSON format:
{
  "variations": [
    {
      "name": "Variation Name (e.g., 'Control', 'Bold CTA')",
      "description": "Clear description of variant",
      "changes": ["Specific design changes"],
      "hypothesis": "What we're testing and why",
      "expectedOutcome": "Expected performance improvement"
    }
  ],
  "testingStrategy": {
    "duration": "Recommended test duration",
    "sampleSize": "Minimum sample size needed",
    "metrics": ["Metrics to track (CTR, conversion rate, etc.)"]
  },
  "controlVsVariant": "How variants differ from control",
  "successCriteria": "What constitutes a successful test"
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
        throw new Error('Failed to parse A/B testing response');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId, input,
        { success: true, data: result },
        response.usage.input_tokens, response.usage.output_tokens, durationMs
      );

      return { success: true, data: result, message: 'A/B test generation completed' };
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
