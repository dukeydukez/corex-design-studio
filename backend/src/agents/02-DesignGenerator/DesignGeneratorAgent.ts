/**
 * Design Generator Agent (Agent 02)
 * Takes creative direction and generates design elements & layout
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const DESIGN_GENERATOR_CONFIG: AgentConfig = {
  name: 'Design Generator',
  type: 'DESIGN_GENERATOR',
  description: 'Generates design elements, layout, and Konva canvas configuration',
  systemPrompt: `You are an expert Design Generator for COREX Creative Studio.
Your role is to:
1. Take creative direction and generate design elements
2. Create layout recommendations (grid, sections, hierarchy)
3. Generate Konva.js canvas layer structure
4. Suggest image placements and text boxes
5. Define typography hierarchy
6. Generate responsive design variations

Output a JSON with:
- Canvas layer structure (Konva-compatible)
- Element positioning and sizing
- Typography specifications
- Color applications
- Suggested assets and placeholder positions`,
};

export class DesignGeneratorAgent extends Agent {
  constructor() {
    super(DESIGN_GENERATOR_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting design generation', { designId: input.designId });

    try {
      const {
        creativeDirection,
        format,
        brandKit,
        contentType,
        keyMessages,
      } = input.data;

      const userPrompt = `
Creative Direction: ${JSON.stringify(creativeDirection)}

Design Format: ${format}

Brand Kit: ${JSON.stringify(brandKit)}

Content Type: ${contentType}

Key Messages: ${JSON.stringify(keyMessages)}

Generate a complete design layout with Konva.js canvas structure. Return JSON with:
{
  "layers": [
    { "id": "layer_bg", "type": "Image", "x": 0, "y": 0, "width": 1080, "height": 1080, "properties": { "src": "{placeholder}" } },
    { "id": "layer_text", "type": "Text", "x": 50, "y": 100, "width": 980, "height": 200, "text": "", "fontSize": 48, "fill": "{color}", "fontFamily": "{font}" }
  ],
  "sections": [
    { "name": "Background", "purpose": "Visual foundation" },
    { "name": "Content", "purpose": "Main message" },
    { "name": "CTA", "purpose": "Call to action" }
  ],
  "spacing": { "margin": 40, "padding": 20 },
  "typography": {
    "headline": { "size": 48, "font": "", "weight": 700 },
    "body": { "size": 24, "font": "", "weight": 400 }
  }
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

      let designLayout;
      try {
        const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');
        designLayout = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        throw new Error('Failed to parse design layout JSON');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId,
        input,
        { success: true, data: designLayout },
        response.usage.input_tokens,
        response.usage.output_tokens,
        durationMs
      );

      return {
        success: true,
        data: designLayout,
        message: 'Design layout generated successfully',
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
