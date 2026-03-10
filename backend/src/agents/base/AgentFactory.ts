/**
 * Agent Factory
 * Provides access to all available agents
 */

import { Agent } from './Agent';

// Import all agents
import { CreativeDirectorAgent } from '../01-CreativeDirector/CreativeDirectorAgent';
import { DesignGeneratorAgent } from '../02-DesignGenerator/DesignGeneratorAgent';
import { CopyWriterAgent } from '../03-CopyWriter/CopyWriterAgent';
import { LayoutOptimizerAgent } from '../04-LayoutOptimizer/LayoutOptimizerAgent';
import { DesignRefinerAgent } from '../05-DesignRefiner/DesignRefinerAgent';
import { VideoContentAdapterAgent } from '../06-VideoContentAdapter/VideoContentAdapterAgent';
import { BlogContentAdapterAgent } from '../07-BlogContentAdapter/BlogContentAdapterAgent';
import { SocialContentAdapterAgent } from '../08-SocialContentAdapter/SocialContentAdapterAgent';
import { ABTestingGeneratorAgent } from '../09-ABTestingGenerator/ABTestingGeneratorAgent';
import { AnalyticsInsightsAgent } from '../10-AnalyticsInsights/AnalyticsInsightsAgent';
import { AccessibilityAuditorAgent } from '../11-AccessibilityAuditor/AccessibilityAuditorAgent';
import { SEOOptimizerAgent } from '../12-SEOOptimizer/SEOOptimizerAgent';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  category: 'strategy' | 'generation' | 'adaptation' | 'optimization' | 'analysis';
  instance: Agent;
}

export class AgentFactory {
  private static agents: Map<string, AgentDefinition> = new Map();
  private static initialized = false;

  /**
   * Initialize all available agents
   */
  static initialize(): void {
    if (this.initialized) {
      return;
    }

    this.agents = new Map([
      [
        '01-creative-director',
        {
          id: '01-creative-director',
          name: 'Creative Director',
          description: 'Develops creative vision and brand strategy',
          category: 'strategy',
          instance: new CreativeDirectorAgent(),
        },
      ],
      [
        '02-design-generator',
        {
          id: '02-design-generator',
          name: 'Design Generator',
          description: 'Generates design concepts and layouts',
          category: 'generation',
          instance: new DesignGeneratorAgent(),
        },
      ],
      [
        '03-copy-writer',
        {
          id: '03-copy-writer',
          name: 'Copy Writer',
          description: 'Creates persuasive and on-brand copy variations',
          category: 'generation',
          instance: new CopyWriterAgent(),
        },
      ],
      [
        '04-layout-optimizer',
        {
          id: '04-layout-optimizer',
          name: 'Layout Optimizer',
          description: 'Optimizes layout composition and visual hierarchy',
          category: 'optimization',
          instance: new LayoutOptimizerAgent(),
        },
      ],
      [
        '05-design-refiner',
        {
          id: '05-design-refiner',
          name: 'Design Refiner',
          description: 'Refines visual aesthetics and polish',
          category: 'optimization',
          instance: new DesignRefinerAgent(),
        },
      ],
      [
        '06-video-adapter',
        {
          id: '06-video-adapter',
          name: 'Video Content Adapter',
          description: 'Adapts designs for video content and animations',
          category: 'adaptation',
          instance: new VideoContentAdapterAgent(),
        },
      ],
      [
        '07-blog-adapter',
        {
          id: '07-blog-adapter',
          name: 'Blog Content Adapter',
          description: 'Adapts designs for blog and article content',
          category: 'adaptation',
          instance: new BlogContentAdapterAgent(),
        },
      ],
      [
        '08-social-adapter',
        {
          id: '08-social-adapter',
          name: 'Social Content Adapter',
          description: 'Adapts designs for social media platforms',
          category: 'adaptation',
          instance: new SocialContentAdapterAgent(),
        },
      ],
      [
        '09-ab-testing',
        {
          id: '09-ab-testing',
          name: 'A/B Testing Generator',
          description: 'Generates design variations for A/B testing',
          category: 'generation',
          instance: new ABTestingGeneratorAgent(),
        },
      ],
      [
        '10-analytics',
        {
          id: '10-analytics',
          name: 'Analytics Insights',
          description: 'Analyzes performance data and provides insights',
          category: 'analysis',
          instance: new AnalyticsInsightsAgent(),
        },
      ],
      [
        '11-accessibility',
        {
          id: '11-accessibility',
          name: 'Accessibility Auditor',
          description: 'Audits designs for WCAG compliance',
          category: 'analysis',
          instance: new AccessibilityAuditorAgent(),
        },
      ],
      [
        '12-seo',
        {
          id: '12-seo',
          name: 'SEO Optimizer',
          description: 'Optimizes designs for search engine visibility',
          category: 'analysis',
          instance: new SEOOptimizerAgent(),
        },
      ],
    ]);

    this.initialized = true;
  }

  /**
   * Get a specific agent by ID
   */
  static getAgent(id: string): Agent | null {
    this.initialize();
    const definition = this.agents.get(id);
    return definition ? definition.instance : null;
  }

  /**
   * Get all available agents
   */
  static getAllAgents(): AgentDefinition[] {
    this.initialize();
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by category
   */
  static getAgentsByCategory(category: string): AgentDefinition[] {
    this.initialize();
    return Array.from(this.agents.values()).filter((a) => a.category === category);
  }

  /**
   * Get agent list for API response
   */
  static getAgentList() {
    this.initialize();
    return Array.from(this.agents.values()).map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      category: a.category,
    }));
  }
}

export default AgentFactory;
