/**
 * Copy Writer Agent (Agent 03)
 * Generates marketing copy and messaging for designs
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const COPY_WRITER_CONFIG: AgentConfig = {
  name: 'Copy Writer',
  type: 'COPY_WRITER',
  description: 'Generates persuasive marketing copy and messaging',
  systemPrompt: `You are an expert Copywriter for COREX Creative Studio.
Your role is to:
1. Generate compelling headlines and subheadings
2. Write persuasive body copy
3. Create call-to-action (CTA) text
4. Craft social media captions
5. Generate hashtags and keywords
6. Ensure messaging aligns with brand voice

Output JSON with multiple copy variations for A/B testing.`,
};

export class CopyWriterAgent extends Agent {
  constructor() {
    super(COPY_WRITER_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting copy generation', { designId: input.designId });

    try {
      const {
        messagingAngles,
        targetAudience,
        brandVoice,
        format,
        productBenefit,
      } = input.data;

      const userPrompt = `
Messaging Angles: ${JSON.stringify(messagingAngles)}

Target Audience: ${JSON.stringify(targetAudience)}

Brand Voice: ${JSON.stringify(brandVoice)}

Format: ${format}

Product/Service Benefit: ${productBenefit}

Generate 3 variations of copy with multiple options for A/B testing. Return JSON:
{
  "variations": [
    {
      "variant": 1,
      "headlines": [
        { "option": 1, "text": "", "tone": "direct" },
        { "option": 2, "text": "", "tone": "emotional" }
      ],
      "subheadings": [
        { "text": "" }
      ],
      "bodyCopy": {
        "short": "",
        "medium": "",
        "long": ""
      },
      "cta": [
        { "text": "Get Started", "tone": "urgent" },
        { "text": "Learn More", "tone": "curious" }
      ],
      "hashtags": ["#tag1", "#tag2"],
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}
`;

      const response = await this.callClaude([
        {
          role: 'user',
          content: userPrompt,
        },
      ]);

      const responseContent = response.content[0];
      if (responseContent.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      let copyVariations;
      try {
        const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');
        copyVariations = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        throw new Error('Failed to parse copy JSON');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId,
        input,
        { success: true, data: copyVariations },
        response.usage.input_tokens,
        response.usage.output_tokens,
        durationMs
      );

      return {
        success: true,
        data: copyVariations,
        message: 'Copy variations generated successfully',
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logExecution(
        input.designId,
        input,
        { success: false, error: errorMessage },
        0,
        0,
        durationMs
      );

      return { success: false, error: errorMessage };
    }
  }
}
