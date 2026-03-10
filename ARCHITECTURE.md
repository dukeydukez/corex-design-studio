# COREX CREATIVE DESIGN STUDIO - System Architecture

## Executive Overview

COREX is a production-grade, AI-powered design platform that provides Canva-like functionality with multi-agent AI coordination. Users describe designs in natural language, and a specialized agent team collaborates to generate, edit, and export professional marketing assets.

**Target Users**: Agencies, solopreneurs, marketing teams
**Scale**: 100K+ concurrent users at launch
**Performance**: <2s design generation, <500ms editor interactions

---

## 1. SYSTEM ARCHITECTURE LAYERS

```
┌─────────────────────────────────────────────────────────┐
│                        CDN / Static                       │
├─────────────────────────────────────────────────────────┤
│                     Next.js Frontend                      │
│         (React, Tailwind, Konva Canvas Engine)           │
├─────────────────────────────────────────────────────────┤
│                  API Gateway / Load Balancer             │
├─────────────────────────────────────────────────────────┤
│                 Express Backend (Node.js)                │
│   (Auth, Routes, Middleware, Agent Orchestration)        │
├─────────────────────────────────────────────────────────┤
│     Agent System (12 Specialized AI Agents)              │
│   (Orchestration, LLM Calls, Image Generation, etc.)     │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  S3/Cloud Storage  │  Vector DB │
└─────────────────────────────────────────────────────────┘
```

---

## 2. MULTI-AGENT SYSTEM ARCHITECTURE

### Agent Hierarchical Design

```
┌──────────────────────────┐
│  Orchestrator Agent      │ (Workflow Controller)
└────────────┬─────────────┘
             │
    ┌────────┼────────┬──────────┬────────────┐
    │        │        │          │            │
    ▼        ▼        ▼          ▼            ▼
[Creative] [Brand]  [Copy]   [Design]    [Visual]
[Director] [Strat]  [Writer] [Architect] [Gen]
    │        │        │          │            │
    └────────┼────────┴──────────┴────────────┘
             │
    ┌────────┴─────────┬──────────┬──────────┐
    │                  │          │          │
    ▼                  ▼          ▼          ▼
[Layout]          [Social]    [Asset]    [Export]
[Builder]         [Platform]  [Manager]  [Agent]
    │
    └──────┬──────────┬──────────┐
           │          │          │
           ▼          ▼          ▼
        [Editor]  [Template]  [Analytics]
        [Agent]   [Agent]     [Agent]
```

### 12 Agent Specifications

#### 1. **Orchestrator Agent**
- **Purpose**: Coordinates entire workflow
- **Responsibilities**:
  - Route requests to appropriate agents
  - Manage agent execution queue
  - Handle state transitions
  - Error handling and fallbacks
  - Progress reporting to frontend
- **Inputs**: User request, project context
- **Outputs**: Design generation job ID, progress updates

#### 2. **Creative Director Agent**
- **Purpose**: Interprets design briefs
- **Responsibilities**:
  - Analyze user natural language request
  - Determine creative direction (style, tone, mood)
  - Extract key requirements
  - Identify target audience
  - Create design brief document
- **Inputs**: User description, project history
- **Outputs**: Creative brief JSON

#### 3. **Brand Strategist Agent**
- **Purpose**: Applies brand guidelines
- **Responsibilities**:
  - Load client brand kit
  - Validate brand guideline adherence
  - Apply brand colors, fonts, logos
  - Ensure design consistency
  - Store brand context for other agents
- **Inputs**: Brand kit ID, design brief
- **Outputs**: Brand context, validated guidelines

#### 4. **Copywriting Agent**
- **Purpose**: Creates marketing copy
- **Responsibilities**:
  - Generate headlines
  - Create taglines and captions
  - Write calls-to-action
  - Apply tone of voice
  - Create multiple variations
  - Integrate brand voice
- **Inputs**: Creative brief, brand context
- **Outputs**: Copy variations (3-5 options)

#### 5. **Design Architect Agent**
- **Purpose**: Creates layout structure
- **Responsibilities**:
  - Define grid system
  - Create visual hierarchy
  - Plan component placement
  - Design composition
  - Consider balance and flow
  - Generate layout specification
- **Inputs**: Creative brief, format specs
- **Outputs**: Layout blueprint JSON

#### 6. **Visual Generation Agent**
- **Purpose**: Generates graphics and images
- **Responsibilities**:
  - Call image generation APIs (DALL-E, Midjourney, etc.)
  - Generate background images
  - Create graphics and illustrations
  - Apply art direction
  - Manage image variants
  - Optimize images for web
- **Inputs**: Visual requirements, style guide
- **Outputs**: Generated images, asset URLs

#### 7. **Layout Builder Agent**
- **Purpose**: Constructs editable canvas design
- **Responsibilities**:
  - Assemble components into final layout
  - Create layer structure
  - Position elements
  - Apply sizing and spacing
  - Generate Konva.js canvas configuration
  - Create editable design object
- **Inputs**: Layout blueprint, copy, images, brand assets
- **Outputs**: Canvas configuration JSON

#### 8. **Editor Agent**
- **Purpose**: Controls editing behavior
- **Responsibilities**:
  - Manage drag-and-drop events
  - Handle resize operations
  - Control text editing
  - Apply constraints and snapping
  - Validate edits
  - Sync with database
- **Inputs**: Edit commands from frontend
- **Outputs**: Updated canvas state

#### 9. **Export Agent**
- **Purpose**: Renders and exports designs
- **Responsibilities**:
  - Generate PNG, JPG, PDF, SVG, MP4
  - Manage export quality settings
  - Apply platform-specific optimizations
  - Handle async rendering
  - Store exports in cloud storage
  - Generate download URLs
- **Inputs**: Canvas configuration, export format, settings
- **Outputs**: Download URL, file metadata

#### 10. **Social Platform Agent**
- **Purpose**: Formats for platform specs
- **Responsibilities**:
  - Know dimensions for each platform
  - Auto-resize designs
  - Apply platform conventions
  - Generate platform-specific variations
  - Handle safe zones and text placement
- **Inputs**: Canvas configuration, target platform
- **Outputs**: Platform-specific design variants

#### 11. **Asset Manager Agent**
- **Purpose**: Manages design assets
- **Responsibilities**:
  - Store and retrieve logos
  - Manage image library
  - Handle font management
  - Cache frequently used assets
  - Organize asset library
  - Track asset usage
- **Inputs**: Asset requests, asset data
- **Outputs**: Asset URLs, cached assets

#### 12. **Template Agent**
- **Purpose**: Creates reusable templates
- **Responsibilities**:
  - Create templates from designs
  - Store template library
  - Support template variables
  - Generate template variations
  - Manage template categories
  - Track template performance
- **Inputs**: Canvas configuration, template metadata
- **Outputs**: Template IDs, template instances

---

## 3. DATA MODEL OVERVIEW

### Core Entities
- **Users**: Account, subscription, preferences
- **Organizations**: Multi-team support, billing
- **Projects**: Design projects, versions
- **Designs**: Actual design documents with canvas state
- **BrandKits**: Brand guidelines per client
- **Assets**: Images, fonts, logos
- **Templates**: Reusable template library
- **Exports**: Generated files with metadata
- **Agents**: Agent execution logs and state

---

## 4. REQUEST FLOW

### Design Generation Flow

```
1. User submits design prompt
   ↓
2. Orchestrator Agent receives request
   ↓
3. Creative Director interprets prompt
   ↓
4. Brand Strategist loads brand kit
   ↓
5. Copywriting Agent creates headlines/copy
   ↓
6. Design Architect creates layout blueprint
   ↓
7. Visual Generation Agent creates images
   ↓
8. Asset Manager retrieves/caches assets
   ↓
9. Layout Builder assembles final design
   ↓
10. Export Agent prepares preview
   ↓
11. Design sent to frontend with full editability
```

### Editing Flow

```
1. User drags/edits element in canvas
   ↓
2. Frontend captures edit event
   ↓
3. Edit sent to Editor Agent via API
   ↓
4. Editor Agent validates and applies changes
   ↓
5. Updated canvas state saved to DB
   ↓
6. WebSocket sends update back to frontend
   ↓
7. Canvas re-renders with changes
```

### Export Flow

```
1. User clicks export and selects format
   ↓
2. Frontend sends export request
   ↓
3. Export Agent receives request
   ↓
4. Prepares render pipeline
   ↓
5. Renders to target format
   ↓
6. Uploads to S3/cloud storage
   ↓
7. Generates download URL
   ↓
8. Returns URL to frontend
```

---

## 5. DATABASE ARCHITECTURE

### schema Overview

**Core Tables**:
- users
- organizations
- projects
- designs
- design_versions
- brand_kits
- brand_guidelines
- assets
- templates
- exports
- agent_logs

**See DATABASE.md for complete schema**

---

## 6. API ARCHITECTURE

### API Layers

**Public API** (for frontend):
- `/api/v1/auth/*` - Authentication
- `/api/v1/projects/*` - Project management
- `/api/v1/designs/*` - Design operations
- `/api/v1/designs/{id}/canvas/*` - Canvas editing
- `/api/v1/exports/*` - Export operations
- `/api/v1/brands/*` - Brand kit management
- `/api/v1/templates/*` - Template operations
- `/api/v1/assets/*` - Asset management

**WebSocket API**:
- Real-time canvas updates
- Collaborative editing
- Progress notifications

**Internal API** (agents):
- Agent-to-agent communication
- Orchestrator commands
- State synchronization

---

## 7. TECHNOLOGY STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 | Framework |
| | React 18 | UI Library |
| | Tailwind CSS 3 | Styling |
| | Konva.js | Canvas engine |
| | Redux Toolkit | State management |
| | WebSocket (Socket.io) | Real-time |
| **Backend** | Node.js 20 | Runtime |
| | Express.js | Framework |
| | TypeScript | Type safety |
| | PostgreSQL 15 | Database |
| | Prisma ORM | Database access |
| | RedisRedis | Caching/Sessions |
| **AI/ML** | Claude API | LLM for copy & prompts |
| | DALL-E 3 | Image generation |
| | Custom agents | Orchestration |
| **Storage** | AWS S3 | Asset storage |
| | Cloud CDN | Asset delivery |
| **DevOps** | Docker | Containerization |
| | Docker Compose | Local dev |
| | GitHub Actions | CI/CD |
| | Vercel | Frontend hosting |
| | Railway/Heroku | Backend hosting |

---

## 8. SCALABILITY CONSIDERATIONS

### Horizontal Scaling
- Stateless Express servers behind load balancer
- Agent system runs on queue (Bull/RabbitMQ ready)
- Database replication and read replicas
- Redis for session/cache distribution

### Performance
- CDN for frontend and assets
- Database query optimization and indexing
- Agent execution parallelization
- Canvas rendering optimization (Web Workers)
- Virtual scrolling for large design lists

### Monitoring & Analytics
- Centralized logging (ELK stack)
- Performance monitoring (New Relic/DataDog)
- Agent execution tracking
- Design generation metrics

---

## 9. Security Architecture

### Authentication
- JWT tokens with refresh
- OAuth 2.0 for social login
- Session management via Redis

### Authorization
- Role-based access control (RBAC)
- Org-scoped data
- Design sharing permissions

### Data Protection
- End-to-end encryption for sensitive data
- Secure asset storage with signed URLs
- Input validation on all endpoints
- Rate limiting and DDoS protection

---

## 10. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────┐
│        GitHub / Git Repository          │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
[Frontend CI/CD]      [Backend CI/CD]
(GitHub Actions)      (GitHub Actions)
    │                         │
    ▼                         ▼
[Vercel]                [Docker Registry]
[Deployment]                 │
                              ▼
                      [Kubernetes Cluster]
                      [Production Pods]
                              │  
                              ▼
              [PostgreSQL] [Redis] [S3]
```

---

## 11. FOLDER STRUCTURE

See FOLDER_STRUCTURE.md for complete breakdown including:
- Frontend organization
- Backend organization
- Agent system modules
- Database migrations
- Documentation

---

## Next Steps

1. ✅ Complete this architecture document
2. Design complete database schema (DATABASE.md)
3. Design all API endpoints (API_SPEC.md)
4. Create folder structure and initialize project
5. Implement backend core system
6. Implement 12-agent system
7. Implement frontend and canvas editor
8. Implement brand system and export engine
