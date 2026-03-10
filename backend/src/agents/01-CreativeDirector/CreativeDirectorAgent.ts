/**
 * Creative Director Agent
 * Analyzes design requirements and generates creative direction & brand strategy
 * First agent in the multi-agent orchestration pipeline
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const CREATIVE_DIRECTOR_CONFIG: AgentConfig = {
  name: 'Creative Director',
  type: 'CREATIVE_DIRECTOR',
  description: 'Analyzes design requirements and generates creative direction',
  systemPrompt: `You are a world-class Creative Director for COREX Creative Studio.
Your role is to:
1. Analyze design brief and project context
2. Define creative direction (mood, aesthetic, tone)
3. Recommend design elements (colors, fonts, imagery style)
4. Suggest brand positioning and messaging angles
5. Identify target audience insights
6. Provide strategic recommendations for highest impact

You output structured JSON with creative strategy recommendations that will guide all subsequent design generation agents.

Always think strategically about the brand positioning and market context. Consider competitive landscape and brand differentiation.`,
};

export class CreativeDirectorAgent extends Agent {
  constructor() {
    super(CREATIVE_DIRECTOR_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting creative direction analysis', { designId: input.designId });

    try {
      const { brief, projectContext, targetAudience, brandGuide } = input.data;

      // Build the prompt for Claude
      const userPrompt = `
Design Brief: ${brief}

Project Context: ${JSON.stringify(projectContext)}

Target Audience: ${JSON.stringify(targetAudience)}

Brand Guide (if available): ${brandGuide ? JSON.stringify(brandGuide) : 'None provided'}

Please provide a comprehensive creative strategy with:
1. Creative direction (mood, aesthetic, visual tone)
2. Recommended color palette (3-5 colors)
3. Font recommendations (heading, body, accent)
4. Imagery style and content recommendations
5. Key messaging angles (3-5 main points)
6. Brand positioning statement
7. Design elements to emphasize
8. Competitive differentiation strategy

Respond in JSON format with these exact keys:
{
  "creativeDirection": { "mood": "", "aesthetic": "", "tone": "" },
  "colorPalette": ["#color1", "#color2", ...],
  "fonts": { "heading": "", "body": "", "accent": "" },
  "imageryStyle": "",
  "messagingAngles": [],
  "brandPositioning": "",
  "designElements": [],
  "differentiation": ""
}
`;

      // Call Claude to generate creative strategy
      const startTokens = Date.now();
      const response = await this.callClaude([
        {
          role: 'user',
          content: userPrompt,
        },
      ]);

      const durationMs = Date.now() - startTime;

      // Extract the response
      const responseContent = response.content[0];
      if (responseContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse the JSON response
      let creativeStrategy;
      try {
        // Extract JSON from the response (Claude might include explanation text)
        const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        creativeStrategy = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        this.log('error', 'Failed to parse creative strategy JSON', {
          response: responseContent.text,
        });
        throw new Error('Failed to parse creative strategy response');
      }

      // Log execution metrics
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;

      await this.logExecution(
        input.designId,
        input,
        {
          success: true,
          data: creativeStrategy,
        },
        inputTokens,
        outputTokens,
        durationMs
      );

      this.log('info', 'Creative direction analysis completed', {
        designId: input.designId,
        duration: durationMs,
        tokens: { input: inputTokens, output: outputTokens },
      });

      return {
        success: true,
        data: creativeStrategy,
        message: 'Creative strategy generated successfully',
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logExecution(
        input.designId,
        input,
        {
          success: false,
          error: errorMessage,
        },
        0,
        0,
        durationMs
      );

      this.log('error', 'Creative direction analysis failed', {
        designId: input.designId,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
