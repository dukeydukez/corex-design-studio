# COREX CREATIVE DESIGN STUDIO - Agent System Specifications

## Agent System Overview

The agent system is the **intelligent backbone** of COREX. Twelve specialized agents work in coordinated sequence to interpret user requests, apply brand guidelines, generate copy, design layouts, create visuals, and assemble editable designs.

**Key Principles**:
- **Modularity**: Each agent is independent and testable
- **Composability**: Agents can be combined for complex workflows
- **Observability**: All agent operations logged and tracked
- **Error Recovery**: Graceful fallbacks and retry mechanisms
- **Cost Monitoring**: Token usage tracked for billing

---

## Agent Communication Protocol

### Inter-Agent Communication
```
┌─────────────────────────────────────────┐
│  Agent Orchestrator (Coordinator)       │
│  Manages execution queue and sequencing │
└────────────┬────────────────────────────┘
             │
    ┌────────┴─────────┐
    │                  │
    ▼                  ▼
  Agent A  ────state────>  Agent B
  (Output)                (Input)
    │
    └──────query────> Shared State Store
```

### State Structure
```typescript
{
  jobId: string,
  userId: string,
  projectId: string,
  designId?: string,
  stage: 'creative_direction' | 'branding' | 'copywriting' | 'design' | 'visual' | 'layout' | 'ready',
  
  // Data flowing through agents
  userPrompt: string,
  creativeBrief: CreativeBrief,
  brandContext: BrandContext,
  copy: CopyVariations,
  layoutBlueprint: LayoutBlueprint,
  generatedImages: ImageAsset[],
  canvasConfig: KonvaConfig,
  
  // Metadata
  startedAt: timestamp,
  agentsExecuted: AgentLog[],
  costs: CostBreakdown
}
```

---

## Agent 1: Orchestrator Agent

**Role**: Workflow coordinator and state manager

**Responsibilities**:
- Receive user design request
- Initialize design generation job
- Sequence agent execution
- Route data between agents
- Handle errors and retries
- Report progress to frontend
- Manage timeout and resource limits
- Collect final design

**Inputs**:
```typescript
{
  userId: string,
  projectId: string,
  prompt: string,
  format: 'instagram_feed' | 'email' | 'linkedin' | 'custom',
  brandKitId?: string,
  templateId?: string,
  stylePreferences: StylePreferences
}
```

**Outputs**:
```typescript
{
  jobId: string,
  designId: string,
  status: 'completed' | 'failed',
  canvasConfig: KonvaConfig,
  estimatedTime: number,
  costBreakdown: CostBreakdown
}
```

**Execution Flow**:
```
1. Validate input
2. Create job record
3. Execute Creative Director → captures creative_brief
4. Execute Brand Strategist → captures brand_context
5. Execute Copywriting → captures copy
6. Execute Design Architect → captures layout_blueprint
7. Execute Visual Generation → captures images
8. Execute Layout Builder → creates canvas_config
9. Return to user with full design
```

**Key Methods**:
```typescript
- initializeJob()
- executeAgent(agentType)
- broadcastProgress()
- handleAgentError()
- collectResults()
- saveDesign()
```

---

## Agent 2: Creative Director Agent

**Role**: Design interpretation and creative vision

**Responsibilities**:
- Parse user natural language request
- Extract design requirements
- Identify design style (modern, minimal, bold, playful, etc.)
- Determine color mood
- Define target audience context
- Create structured creative brief
- Suggest imagery direction

**Inputs**:
```typescript
{
  prompt: string,
  format: string,
  projectHistory?: Design[],
  previousBriefs?: CreativeBrief[]
}
```

**Outputs**:
```typescript
{
  creativeBrief: {
    designStyle: string, // 'modern', 'minimal', 'bold', etc.
    colorMood: string, // 'vibrant', 'calm', 'energetic'
    targetAudience: string,
    keyMessages: string[],
    visualDirection: string,
    emotionalTone: string,
    requiredElements: string[],
    restrictedElements: string[],
    inspirationKeywords: string[]
  },
  confidence: number // 0-1 confidence in interpretation
}
```

**Implementation**:
```typescript
class CreativeDirectorAgent extends BaseAgent {
  async execute(input: CreativeDirectorInput): Promise<CreativeDirectorOutput> {
    const prompt = this.buildSystemPrompt();
    const userMessage = `Analyze this design request: "${input.prompt}"`;
    
    const response = await this.llmClient.call(prompt, userMessage);
    const brief = this.parseResponse(response);
    
    return {
      creativeBrief: brief,
      confidence: this.calculateConfidence(brief)
    };
  }
}
```

---

## Agent 3: Brand Strategist Agent

**Role**: Brand guideline enforcement

**Responsibilities**:
- Load client brand kit
- Extract brand colors and fonts
- Parse brand voice and personality
- Validate design adherence to brand
- Create brand context for other agents
- Flag brand guideline violations
- Apply brand overrides to design

**Inputs**:
```typescript
{
  creativeBrief: CreativeBrief,
  brandKitId: string,
  format: string
}
```

**Outputs**:
```typescript
{
  brandContext: {
    colorPalette: {
      primary: string,
      secondary: string,
      accent: string,
      neutrals: string[]
    },
    typography: {
      headingFont: string,
      bodyFont: string,
      scales: FontScale
    },
    brandVoice: BrandVoice,
    imageryStyle: string,
    allowedElements: string[],
    requiredElements: string[],
    designRules: DesignRule[]
  },
  brandComplianceRulesApplied: string[]
}
```

**Key Features**:
- Loads brand kit from database
- Applies style rules based on design format
- Creates constraint set for downstream agents
- Ensures all brand assets are available

---

## Agent 4: Copywriting Agent

**Role**: Marketing copy generation

**Responsibilities**:
- Generate compelling headlines
- Create subheadings and body copy
- Write calls-to-action
- Generate multiple copy variations
- Apply brand voice and tone
- Optimize copy for platform
- Ensure brand message consistency

**Inputs**:
```typescript
{
  creativeBrief: CreativeBrief,
  brandContext: BrandContext,
  format: string,
  targetAudience: string
}
```

**Outputs**:
```typescript
{
  copy: {
    headlines: string[],
    subheadings: string[],
    bodyCopy: string[],
    callToActions: string[],
    captions: string[]
  },
  selectedVariations: {
    headline: string,
    subheading: string,
    bodyText: string,
    cta: string
  }
}
```

**Implementation Details**:
- Generates 3-5 variations of each copy element
- Ranks by relevance to target audience
- Applies character limits per format
- Integrates brand voice seamlessly

---

## Agent 5: Design Architect Agent

**Role**: Layout and visual hierarchy

**Responsibilities**:
- Create layout composition structure
- Define grid system
- Plan element placement
- Design visual hierarchy
- Determine spacing and balance
- Create layout blueprint
- Ensure mobile/web responsiveness

**Inputs**:
```typescript
{
  creativeBrief: CreativeBrief,
  brandContext: BrandContext,
  copyData: CopyOutput,
  format: string,
  width: number,
  height: number
}
```

**Outputs**:
```typescript
{
  layoutBlueprint: {
    gridSystem: GridConfig,
    sections: LayoutSection[],
    elementPlacements: ElementPlacement[],
    hierarchy: VisualhierarchyConfig,
    spacing: SpacingGuide,
    alignmentRules: AlignmentRule[]
  }
}
```

**Key Calculations**:
- Golden ratio application
- Grid system generation (12-column or custom)
- Whitespace optimization
- Visual balance scoring

---

## Agent 6: Visual Generation Agent

**Role**: Image and graphic creation

**Responsibilities**:
- Generate images based on creative direction
- Call image generation APIs (DALL-E 3, Midjourney, etc.)
- Create graphics and illustrations
- Apply color scheme to generated images
- Manage image variants and selections
- Optimize images for web
- Handle image fallbacks

**Inputs**:
```typescript
{
  creativeBrief: CreativeBrief,
  layoutBlueprint: LayoutBlueprint,
  brandContext: BrandContext,
  imageCount: number,
  widthPx: number,
  heightPx: number
}
```

**Outputs**:
```typescript
{
  images: ImageAsset[],
  selectedImage: {
    url: string,
    width: number,
    height: number,
    dominantColors: string[]
  }
}

interface ImageAsset {
  id: string,
  url: string,
  source: 'dalle3' | 'midjourney' | 'stock' | 'uploaded',
  prompt: string,
  width: number,
  height: number,
  dominantColors: string[],
  quality_score: number
}
```

**Image Generation Flow**:
```
1. Build prompt from creative brief
2. Call external image API with retry logic
3. Receive image(s)
4. Analyze dominant colors
5. Apply color corrections if needed
6. Optimize for web
7. Cache result
8. Return with metadata
```

**API Integration**:
- DALL-E 3: High quality, detailed control
- Midjourney: Artistic, high quality
- Pexels/Unsplash: Fallback stock images

---

## Agent 7: Layout Builder Agent

**Role**: Assemble final editable design

**Responsibilities**:
- Create Konva.js canvas configuration
- Build layer hierarchy
- Position all elements
- Apply all styling (colors, fonts, sizes)
- Create group structures for easy editing
- Generate layer metadata
- Set up text editing capabilities
- Create final design object

**Inputs**:
```typescript
{
  layoutBlueprint: LayoutBlueprint,
  copyData: CopyOutput,
  brandContext: BrandContext,
  images: ImageAsset[],
  format: string,
  width: number,
  height: number
}
```

**Outputs**:
```typescript
{
  canvasConfig: {
    stage: StageConfig,
    layers: KonvaLayer[],
    groups: KonvaGroup[],
    metadata: DesignMetadata
  }
}

interface KonvaLayer {
  id: string,
  name: string,
  type: 'image' | 'text' | 'shape' | 'group',
  locked: boolean,
  visible: boolean,
  zIndex: number,
  properties: LayerProperties
}
```

**Implementation**:
- Translates blueprint to Konva config
- Creates groups for complex elements
- Generates layer IDs for editing
- Sets up text editing capabilities
- Ensures accessibility (names, descriptions)

---

## Agent 8: Editor Agent

**Role**: Handles live editing operations

**Responsibilities**:
- Process user edit commands
- Apply changes to canvas state
- Validate edits against constraints
- Update layer properties
- Handle text editing
- Manage drag-and-drop operations
- Apply grid snapping
- Track change history

**Inputs** (From Frontend):
```typescript
{
  designId: string,
  action: 'move' | 'resize' | 'text_edit' | 'color_change' | 'delete' | 'add_layer',
  layerId?: string,
  properties?: any
}
```

**Outputs**:
```typescript
{
  success: boolean,
  updatedLayerState: KonvaLayer,
  version: number,
  changesSummary: string
}
```

**Key Features**:
- Real-time validation
- Constraint checking
- Undo/redo support
- WebSocket broadcast to collaborators
- Optimistic updates

---

## Agent 9: Export Agent

**Role**: Render and export designs

**Responsibilities**:
- Render canvas to target format
- Generate PNG, JPG, PDF, SVG, MP4
- Apply export quality settings
- Handle complex rendering (transparency, effects)
- Manage async rendering queues
- Upload to S3/cloud storage
- Generate download URLs
- Track export metrics

**Inputs**:
```typescript
{
  designId: string,
  canvasConfig: KonvaConfig,
  format: 'png' | 'jpg' | 'pdf' | 'svg' | 'mp4',
  quality: 'low' | 'medium' | 'high' | 'ultra',
  width?: number,
  height?: number
}
```

**Outputs**:
```typescript
{
  exportId: string,
  fileUrl: string,
  downloadToken: string,
  fileSizeKb: number,
  format: string,
  dimensions: { width: number, height: number },
  processingTimeMs: number
}
```

**Rendering Pipeline**:
```
1. Validate canvas config
2. Create render context
3. Render layers to target format
4. Apply quality/compression settings
5. Generate file
6. Upload to S3
7. Create signed download URL
8. Save export record
9. Return to user
```

**Format-Specific Handlers**:
- **PNG**: Transparent background capable
- **JPG**: compression optimization
- **PDF**: Vector format, multi-page
- **SVG**: Vector format, editablecapable
- **MP4**: Animated design with transitions

---

## Agent 10: Social Platform Agent

**Role**: Platform-specific formatting

**Responsibilities**:
- Know exact dimensions for all platforms
- Auto-resize designs for target platform
- Apply platform-specific conventions
- Create optimized variations
- Handle safe zones and text placement
- Generate platform metadata
- Optimize for platform algorithms

**Inputs**:
```typescript
{
  canvasConfig: KonvaConfig,
  targetPlatforms: PlatformName[],
  copyData: CopyOutput,
  images: ImageAsset[]
}

type PlatformName = 'instagram_feed' | 'instagram_story' | 'instagram_reel' | 
  'tiktok' | 'tiktok_vertical' | 'linkedin_feed' | 'linkedin_carousel' |
  'twitter' | 'twitter_video' | 'facebook' | 'youtube_thumbnail' |
  'email' | 'web_banner' | 'custom'
```

**Outputs**:
```typescript
{
  platformVariations: {
    [platform: string]: {
      width: number,
      height: number,
      canvasConfig: KonvaConfig,
      optimizations: string[],
      safeZones: SafeZone
    }
  }
}

const PLATFORM_SPECS = {
  instagram_feed: { width: 1080, height: 1080, aspectRatio: 1 },
  instagram_story: { width: 1080, height: 1920, aspectRatio: 9/16 },
  tiktok: { width: 1080, height: 1920, aspectRatio: 9/16 },
  linkedin_feed: { width: 1200, height: 628, aspectRatio: 1.91 },
  twitter: { width: 1024, height: 512, aspectRatio: 2 },
  email: { width: 600, height: null, maxHeight: 900 },
  youtube_thumbnail: { width: 1280, height: 720, aspectRatio: 16/9 }
}
```

---

## Agent 11: Asset Manager Agent

**Role**: Asset library and management

**Responsibilities**:
- Store and retrieve logos, images, fonts
- Manage asset caching
- Organize asset library by category
- Track asset modifications
- Handle versioning
- Optimize assets for use
- Provide asset recommendations

**Inputs**:
```typescript
{
  action: 'store' | 'retrieve' | 'list' | 'search' | 'optimize',
  assetType: 'logo' | 'image' | 'font' | 'pattern',
  query?: string,
  assetData?: any
}
```

**Outputs**:
```typescript
{
  assets: Asset[],
  totalCount: number,
  cached: boolean
}

interface Asset {
  id: string,
  name: string,
  type: string,
  url: string,
  width?: number,
  height?: number,
  category: string,
  usageCount: number,
  lastUsedAt: timestamp,
  metadata: any
}
```

**Asset Categories**:
- Logos (primary, secondary, icon, favicon)
- Images (photos, illustrations, graphics)
- Fonts (heading, body, accent)
- Patterns (backgrounds, textures)
- Icons (social, UI, feature)

---

## Agent 12: Template Agent

**Role**: Reusable template management

**Responsibilities**:
- Create templates from designs
- Store in template library
- Apply templates to new designs
- Handle template variables
- Generate template variations
- Track template usage
- Manage template categories

**Inputs**:
```typescript
{
  action: 'create' | 'apply' | 'list' | 'search',
  designId?: string,
  templateId?: string,
  templateData?: TemplateData,
  variables?: TemplateVariables
}
```

**Outputs**:
```typescript
{
  templateId: string,
  name: string,
  description: string,
  thumbnail: string,
  variables: TemplateVariable[],
  useCount: number,
  appliedDesignId: string
}

interface TemplateVariable {
  name: string,
  type: 'text' | 'image' | 'color' | 'number',
  defaultValue: any,
  constraints?: any
}
```

**Template Workflow**:
```
1. User creates design and marks as template
2. Template Agent extracts base config
3. Identifies variable fields
4. Stores with category and tags
5. Generates thumbnail
6. Makes available in template library
7. When applied: creates design instance with variables replaced
```

---

## Agent Base Class

```typescript
abstract class BaseAgent {
  agentId: string;
  agentType: string;
  logger: Logger;
  llmClient: LLMClient;
  
  async execute(input: any): Promise<any> {
    throw new Error('Must implement execute()');
  }
  
  protected buildSystemPrompt(): string {
    throw new Error('Must implement buildSystemPrompt()');
  }
  
  protected parseResponse(response: string): any {
    throw new Error('Must implement parseResponse()');
  }
  
  protected logExecution(result: any, duration: number): void {
    // Standard logging
  }
}
```

---

## Agent Orchestration Engine

```typescript
class AgentOrchestrator {
  private agents: Map<string, BaseAgent>;
  private executionQueue: ExecutionTask[];
  private sharedState: SharedState;
  
  async execute(request: DesignRequest): Promise<Design> {
    const jobId = generateJobId();
    this.sharedState.initialize(jobId, request);
    
    try {
      // Sequential execution with data flow
      const creativeBrief = await this.execute('creative_director');
      this.shareState('creative_brief', creativeBrief);
      
      const brandContext = await this.execute('brand_strategist');
      this.shareState('brand_context', brandContext);
      
      // ... continue for all agents
      
      const design = await this.assembleDesign();
      return design;
    } catch (error) {
      this.handleError(error, jobId);
    }
  }
}
```

---

## Error Handling & Retry Logic

```typescript
interface AgentExecutionError {
  agentType: string,
  stage: string,
  error: Error,
  timestamp: timestamp,
  retryable: boolean,
  retryCount: number
}

// Retry strategy
- API failures: Exponential backoff with max 3 retries
- LLM failures: Fallback to simpler prompt, then manual template
- Image generation: Use stock images as fallback
- Layout failures: Use simple centered layout
```

---

## Agent Execution Metrics

```typescript
interface AgentMetrics {
  agentType: string,
  executionTimeMs: number,
  inputTokens: number,
  outputTokens: number,
  estimatedCostUsd: number,
  successRate: number,
  averageRetries: number,
  errorRate: number
}
```

---

## Prompt Engineering Strategy

Each agent uses carefully engineered prompts optimized for:
- **Clarity**: Unambiguous instructions
- **Examples**: Few-shot learning examples
- **Constraints**: Hard rules and soft preferences
- **Format**: Structured output format
- **Context**: Relevant background information

Example Creative Director Prompt:
```
You are a world-class creative director at a top agency.
Your job is to interpret design briefs and create structured creative directions.

You will receive a user's design request and must output a JSON object with:
- designStyle: one of [modern, minimal, bold, playful, corporate, creative]
- colorMood: emotional color direction
- visualDirection: what type of imagery
- keyMessages: 2-3 core messages to communicate

Always be specific and actionable, not generic.
Output valid JSON only, no markdown formatting.

User request: "{prompt}"
```

---

## Implementation Priority

1. **Phase 1**: Orchestrator + Creative Director (core flow)
2. **Phase 2**: Brand Strategist + Copywriting (content generation)
3. **Phase 3**: Design Architect + Layout Builder (design logic)
4. **Phase 4**: Visual Generation + Export (execution)
5. **Phase 5**: Social Platform + Asset Manager + Template (optimization)
6. **Phase 6**: Editor Agent (live editing)

---

## Testing Agents

```typescript
// Unit tests for each agent
describe('CreativeDirectorAgent', () => {
  it('parses design prompt correctly', async () => {
    const agent = new CreativeDirectorAgent();
    const output = await agent.execute({
      prompt: 'Bold Instagram ad for real estate'
    });
    expect(output.creativeBrief.designStyle).toBeDefined();
    expect(output.confidence).toBeGreaterThan(0.7);
  });
});

// Integration tests
describe('Agent Orchestrator', () => {
  it('completes full design workflow', async () => {
    const orchestrator = new AgentOrchestrator();
    const design = await orchestrator.execute({
      prompt: 'test prompt',
      format: 'instagram_feed'
    });
    expect(design.canvasConfig).toBeDefined();
    expect(design.status).toBe('ready');
  });
});
```

---

## Monitoring & Observability

All agent executions tracked:
- Execution time
- Token usage and costs
- Error rates and types
- Success metrics
- Performance trends
- Cost per agent type

Dashboard shows real-time agent health and workload.
