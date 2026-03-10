/**
 * Accessibility Auditor Agent (Agent 11)
 * Audits designs for WCAG compliance and accessibility issues
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const ACCESSIBILITY_AUDITOR_CONFIG: AgentConfig = {
  name: 'Accessibility Auditor',
  type: 'ACCESSIBILITY_AUDITOR',
  description: 'Audits designs for WCAG compliance and accessibility',
  systemPrompt: `You are an accessibility specialist and WCAG compliance expert.
Your role is to:
1. Audit designs for WCAG 2.1 AA compliance (minimum standard)
2. Analyze color contrast ratios (4.5:1 for normal text)
3. Evaluate font readability for visual impairments
4. Review keyboard navigation support
5. Assess screen reader compatibility
6. Check semantic structure and motion safety

Output structured JSON with accessibility audit findings and remediation steps.`,
};

export class AccessibilityAuditorAgent extends Agent {
  constructor() {
    super(ACCESSIBILITY_AUDITOR_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting accessibility audit', { designId: input.designId });

    try {
      const { designBriefing, canvasConfig, brandVoice } = input.data;

      const userPrompt = `Audit this design for accessibility compliance:

**Design Briefing:**
${designBriefing || 'No briefing provided'}

**Canvas Configuration:**
${JSON.stringify(canvasConfig, null, 2)}

**Brand Voice:**
${JSON.stringify(brandVoice, null, 2)}

Provide accessibility audit in JSON format:
{
  "overallComplianceScore": "Percentage out of 100",
  "wcagLevel": "A|AA|AAA",
  "issues": [
    {
      "issue": "Specific accessibility issue",
      "wcagLevel": "A|AA|AAA",
      "severity": "critical|major|minor",
      "location": "Where in design",
      "fixStrategy": "How to fix it"
    }
  ],
  "colorContrastAnalysis": {
    "passes": ["Text/element combinations with good contrast"],
    "failures": ["Text/element combinations failing WCAG"]
  },
  "readabilityGuidance": "Font size, line height, spacing for dyslexia-friendly design",
  "keyboardNavigationReview": "How design functions for keyboard-only users",
  "screenReaderOptimization": "Alt text, semantic structure, labels",
  "remedialActions": ["Priority fixes for compliance"]
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
        throw new Error('Failed to parse accessibility audit response');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId, input,
        { success: true, data: result },
        response.usage.input_tokens, response.usage.output_tokens, durationMs
      );

      return { success: true, data: result, message: 'Accessibility audit completed' };
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
