/**
 * Analytics Insights Agent (Agent 10)
 * Analyzes design performance data and provides optimization recommendations
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const ANALYTICS_INSIGHTS_CONFIG: AgentConfig = {
  name: 'Analytics Insights',
  type: 'ANALYTICS_INSIGHTS',
  description: 'Analyzes performance data and derives actionable insights',
  systemPrompt: `You are a data analyst and growth strategist.
Your role is to:
1. Analyze design performance against industry benchmarks
2. Identify performance gaps and root causes
3. Recommend quick wins and long-term improvements
4. Assess statistical significance of findings
5. Provide design-specific optimization strategies
6. Create actionable next steps based on data

Output structured JSON with analytics insights and recommendations.`,
};

export class AnalyticsInsightsAgent extends Agent {
  constructor() {
    super(ANALYTICS_INSIGHTS_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting analytics insights analysis', { designId: input.designId });

    try {
      const { designBriefing, canvasConfig, metrics } = input.data;

      const userPrompt = `Analyze the design performance and provide insights:

**Design Briefing:**
${designBriefing || 'No briefing provided'}

**Canvas Configuration:**
${JSON.stringify(canvasConfig, null, 2)}

**Performance Metrics:**
${JSON.stringify(metrics || {}, null, 2)}

Provide analytics insights in JSON format:
{
  "overallHealthScore": "Score out of 100 with reasoning",
  "performanceGaps": [
    {
      "metric": "Metric name (e.g., CTR, engagement)",
      "currentPerformance": "Current value",
      "benchmarks": "Industry benchmarks",
      "recommendations": ["Improvement strategies"],
      "priority": "high|medium|low"
    }
  ],
  "opportunitiesForImprovement": ["Key opportunities identified"],
  "designImpactOnMetrics": "How design affects performance",
  "recommendedOptimizations": ["Specific design tweaks"],
  "nextSteps": "Action plan based on data"
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
        throw new Error('Failed to parse analytics insights response');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId, input,
        { success: true, data: result },
        response.usage.input_tokens, response.usage.output_tokens, durationMs
      );

      return { success: true, data: result, message: 'Analytics insights completed' };
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
