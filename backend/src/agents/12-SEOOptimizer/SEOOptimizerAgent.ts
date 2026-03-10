/**
 * SEO Optimizer Agent (Agent 12)
 * Optimizes designs for search engine visibility and content discoverability
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const SEO_OPTIMIZER_CONFIG: AgentConfig = {
  name: 'SEO Optimizer',
  type: 'SEO_OPTIMIZER',
  description: 'Optimizes designs for SEO and search engine visibility',
  systemPrompt: `You are an SEO specialist and content optimization expert.
Your role is to:
1. Develop keyword strategies for design content
2. Optimize on-page SEO factors (title, meta, headings)
3. Recommend visual search optimization
4. Create structured data/schema markup
5. Ensure semantic HTML best practices
6. Consider page speed and mobile-first indexing

Output structured JSON with SEO optimization strategy and recommendations.`,
};

export class SEOOptimizerAgent extends Agent {
  constructor() {
    super(SEO_OPTIMIZER_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting SEO optimization', { designId: input.designId });

    try {
      const { designBriefing, canvasConfig, brandVoice } = input.data;

      const userPrompt = `Create an SEO optimization strategy for this design:

**Design Briefing:**
${designBriefing || 'No briefing provided'}

**Canvas Configuration:**
${JSON.stringify(canvasConfig, null, 2)}

**Brand Voice:**
${JSON.stringify(brandVoice, null, 2)}

Provide SEO optimization in JSON format:
{
  "keywordStrategy": {
    "primaryKeywords": ["Target keywords (3-5)"],
    "longTailKeywords": ["Long-tail keywords (5-7)"],
    "searchIntent": "What users are searching for"
  },
  "onPageOptimization": {
    "metaTitle": "Optimized meta title (60 chars)",
    "metaDescription": "Optimized meta description (160 chars)",
    "headingStructure": ["H1: Main", "H2: Section", "H3: Sub-section"],
    "imageAltTexts": ["Descriptive alt text for images"]
  },
  "contentStructure": {
    "schema": "Schema markup type (Article, Product, etc.)",
    "semanticMarkup": ["Semantic HTML recommendations"],
    "structuredData": { "field": "JSON-LD structured data" }
  },
  "visualSEO": {
    "imageOptimization": "Image naming, compression, sizing",
    "diagramUsage": "How diagrams support SEO",
    "infographicStrategy": "Infographic creation recommendations"
  },
  "recommendations": ["Specific SEO improvements"],
  "expectedImpact": "Projected SERP position improvement"
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
        throw new Error('Failed to parse SEO optimization response');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId, input,
        { success: true, data: result },
        response.usage.input_tokens, response.usage.output_tokens, durationMs
      );

      return { success: true, data: result, message: 'SEO optimization completed' };
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
