/**
 * Blog Content Adapter Agent (Agent 07)
 * Adapts designs for blog and long-form content formats
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const BLOG_CONTENT_ADAPTER_CONFIG: AgentConfig = {
  name: 'Blog Content Adapter',
  type: 'BLOG_CONTENT_ADAPTER',
  description: 'Adapts designs for blog and long-form content',
  systemPrompt: `You are a content marketing and blog optimization specialist.
Your role is to:
1. Adapt designs for blog headers, inline images, and featured images
2. Create content outlines that complement the visual design
3. Suggest blog post structure and formatting
4. Optimize images for web performance
5. Recommend content distribution strategy
6. Ensure visual-content alignment

Output structured JSON with blog content adaptation strategy.`,
};

export class BlogContentAdapterAgent extends Agent {
  constructor() {
    super(BLOG_CONTENT_ADAPTER_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting blog content adaptation', { designId: input.designId });

    try {
      const { designBriefing, canvasConfig, brandVoice } = input.data;

      const userPrompt = `Create a blog content adaptation strategy for this design:

**Design Briefing:**
${designBriefing || 'No briefing provided'}

**Canvas Configuration:**
${JSON.stringify(canvasConfig, null, 2)}

**Brand Voice:**
${JSON.stringify(brandVoice, null, 2)}

Provide blog adaptation in JSON format:
{
  "blogPostStrategy": {
    "headline": "Recommended blog post headline",
    "subheadline": "Supporting subheadline",
    "contentOutline": ["Section 1", "Section 2"],
    "estimatedReadTime": "Minutes"
  },
  "imageAdaptations": {
    "featuredImage": "Featured image specifications",
    "inlineImages": ["Inline image recommendations"],
    "thumbnailSpecs": "Thumbnail specifications"
  },
  "contentGuidance": {
    "tone": "Writing tone aligned with brand",
    "keyMessages": ["Key messages to convey"],
    "callToAction": "Primary CTA"
  },
  "seoIntegration": {
    "targetKeywords": ["Keywords to target"],
    "metaDescription": "Suggested meta description"
  },
  "distributionStrategy": ["Distribution channel recommendations"]
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
        throw new Error('Failed to parse blog adaptation response');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId, input,
        { success: true, data: result },
        response.usage.input_tokens, response.usage.output_tokens, durationMs
      );

      return { success: true, data: result, message: 'Blog content adaptation completed' };
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
