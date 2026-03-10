/**
 * Social Content Adapter Agent (Agent 08)
 * Adapts designs for multiple social media platforms
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const SOCIAL_CONTENT_ADAPTER_CONFIG: AgentConfig = {
  name: 'Social Content Adapter',
  type: 'SOCIAL_CONTENT_ADAPTER',
  description: 'Adapts designs for social media with platform-specific guidance',
  systemPrompt: `You are a social media marketing and content strategy expert.
Your role is to:
1. Adapt designs for platform-specific dimensions and formats
2. Create platform-tailored content strategies
3. Recommend hashtag and engagement strategies
4. Plan cross-platform content calendars
5. Optimize for each platform's algorithm
6. Maintain brand consistency across platforms

Output structured JSON with platform-specific adaptation strategies.`,
};

export class SocialContentAdapterAgent extends Agent {
  constructor() {
    super(SOCIAL_CONTENT_ADAPTER_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting social content adaptation', { designId: input.designId });

    try {
      const { designBriefing, canvasConfig, brandVoice } = input.data;

      const userPrompt = `Create platform-specific social media adaptations for this design:

**Design Briefing:**
${designBriefing || 'No briefing provided'}

**Canvas Configuration:**
${JSON.stringify(canvasConfig, null, 2)}

**Brand Voice:**
${JSON.stringify(brandVoice, null, 2)}

Provide social adaptation in JSON format:
{
  "platformStrategies": [
    {
      "platform": "Instagram/LinkedIn/Twitter/TikTok/Facebook",
      "dimensions": "Recommended dimensions",
      "adaptations": ["Platform-specific adjustments"],
      "hashtags": ["Relevant hashtags"],
      "postingGuidance": "When and how to post"
    }
  ],
  "contentCalendarSuggestions": ["Multi-week content strategy"],
  "engagementStrategy": "How to maximize engagement",
  "crossPlatformConsistency": "Maintaining brand consistency"
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
        throw new Error('Failed to parse social adaptation response');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId, input,
        { success: true, data: result },
        response.usage.input_tokens, response.usage.output_tokens, durationMs
      );

      return { success: true, data: result, message: 'Social content adaptation completed' };
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
