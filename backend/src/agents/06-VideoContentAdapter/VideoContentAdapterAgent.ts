/**
 * Video Content Adapter Agent (Agent 06)
 * Adapts designs for video content formats and motion graphics
 */

import { Agent, AgentConfig, AgentInput, AgentOutput } from '../base/Agent';

const VIDEO_CONTENT_ADAPTER_CONFIG: AgentConfig = {
  name: 'Video Content Adapter',
  type: 'VIDEO_CONTENT_ADAPTER',
  description: 'Adapts designs for video content and motion graphics',
  systemPrompt: `You are a video content and motion graphics specialist.
Your role is to:
1. Adapt static designs for video formats (reels, stories, YouTube)
2. Suggest motion graphics and animation sequences
3. Plan scene transitions and timing
4. Recommend audio/music pairing
5. Optimize for platform-specific video specs
6. Create storyboard recommendations

Output structured JSON with video adaptation strategy and scene breakdowns.`,
};

export class VideoContentAdapterAgent extends Agent {
  constructor() {
    super(VIDEO_CONTENT_ADAPTER_CONFIG);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.log('info', 'Starting video content adaptation', { designId: input.designId });

    try {
      const { designBriefing, canvasConfig, brandVoice } = input.data;

      const userPrompt = `Create a video content adaptation strategy for this design:

**Design Briefing:**
${designBriefing || 'No briefing provided'}

**Canvas Configuration:**
${JSON.stringify(canvasConfig, null, 2)}

**Brand Voice:**
${JSON.stringify(brandVoice, null, 2)}

Provide video adaptation in JSON format:
{
  "videoStrategy": {
    "format": "Recommended video format (reel, story, YouTube, etc.)",
    "duration": "Recommended duration",
    "aspectRatio": "Aspect ratio"
  },
  "sceneBreakdown": [
    {
      "scene": "Scene number",
      "duration": "Scene duration",
      "visualElements": ["Elements to animate"],
      "animation": "Animation type/style",
      "transition": "Transition to next scene"
    }
  ],
  "motionGraphics": ["Motion graphics recommendations"],
  "audioRecommendations": {
    "musicStyle": "Recommended music style",
    "soundEffects": ["Sound effect suggestions"],
    "voiceoverGuidance": "Voiceover recommendations"
  },
  "platformOptimizations": ["Platform-specific optimizations"]
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
        throw new Error('Failed to parse video adaptation response');
      }

      const durationMs = Date.now() - startTime;
      await this.logExecution(
        input.designId, input,
        { success: true, data: result },
        response.usage.input_tokens, response.usage.output_tokens, durationMs
      );

      return { success: true, data: result, message: 'Video content adaptation completed' };
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
