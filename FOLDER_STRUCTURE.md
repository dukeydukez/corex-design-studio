# COREX CREATIVE DESIGN STUDIO - Folder Structure

```
corex-design-studio/
│
├── .github/
│   ├── workflows/
│   │   ├── ci-backend.yml
│   │   ├── ci-frontend.yml
│   │   └── deploy-production.yml
│   └── ISSUE_TEMPLATE/
│
├── docs/
│   ├── ARCHITECTURE.md (System architecture overview)
│   ├── DATABASE.md (Database schema)
│   ├── API_SPEC.md (Complete API specification)
│   ├── AGENTS.md (Agent specifications)
│   ├── SETUP.md (Setup instructions)
│   ├── DEPLOYMENT.md (Production deployment)
│   ├── CONTRIBUTING.md
│   └── guides/
│       ├── brand-kit-system.md
│       ├── canvas-editor-guide.md
│       ├── export-engine.md
│       └── agent-development.md
│
├── backend/
│   ├── src/
│   │   ├── index.ts (Entry point)
│   │   ├── server.ts (Express server setup)
│   │   ├── config/
│   │   │   ├── env.ts (Environment variables)
│   │   │   ├── database.ts (Database connection)
│   │   │   ├── redis.ts (Redis connection)
│   │   │   └── constants.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error-handler.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── cors.middleware.ts
│   │   │   └── logger.middleware.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── index.ts (Route aggregator)
│   │   │   ├── auth.routes.ts
│   │   │   ├── organizations.routes.ts
│   │   │   ├── projects.routes.ts
│   │   │   ├── designs.routes.ts
│   │   │   ├── canvas.routes.ts
│   │   │   ├── exports.routes.ts
│   │   │   ├── brands.routes.ts
│   │   │   ├── templates.routes.ts
│   │   │   ├── assets.routes.ts
│   │   │   └── health.routes.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── organizations.controller.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── designs.controller.ts
│   │   │   ├── canvas.controller.ts
│   │   │   ├── exports.controller.ts
│   │   │   ├── brands.controller.ts
│   │   │   ├── templates.controller.ts
│   │   │   └── assets.controller.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── organization.service.ts
│   │   │   ├── project.service.ts
│   │   │   ├── design.service.ts
│   │   │   ├── canvas.service.ts
│   │   │   ├── export.service.ts
│   │   │   ├── brand.service.ts
│   │   │   ├── template.service.ts
│   │   │   ├── asset.service.ts
│   │   │   ├── storage.service.ts (S3/Cloud)
│   │   │   └── encryption.service.ts
│   │   │
│   │   ├── repositories/
│   │   │   ├── base.repository.ts (Abstract base)
│   │   │   ├── user.repository.ts
│   │   │   ├── organization.repository.ts
│   │   │   ├── project.repository.ts
│   │   │   ├── design.repository.ts
│   │   │   ├── brand.repository.ts
│   │   │   ├── template.repository.ts
│   │   │   ├── asset.repository.ts
│   │   │   ├── export.repository.ts
│   │   │   └── agent-execution.repository.ts
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.ts
│   │   │   ├── design.validator.ts
│   │   │   ├── canvas.validator.ts
│   │   │   ├── export.validator.ts
│   │   │   ├── brand.validator.ts
│   │   │   └── custom.validators.ts
│   │   │
│   │   ├── types/
│   │   │   ├── index.ts (Type exports)
│   │   │   ├── user.types.ts
│   │   │   ├── design.types.ts
│   │   │   ├── canvas.types.ts
│   │   │   ├── brand.types.ts
│   │   │   ├── export.types.ts
│   │   │   ├── agent.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.util.ts
│   │   │   ├── hash.util.ts
│   │   │   ├── logger.util.ts
│   │   │   ├── error.util.ts
│   │   │   ├── response.util.ts
│   │   │   ├── validation.util.ts
│   │   │   └── date.util.ts
│   │   │
│   │   ├── exceptions/
│   │   │   ├── http.exception.ts (Base)
│   │   │   ├── auth.exceptions.ts
│   │   │   ├── validation.exceptions.ts
│   │   │   ├── not-found.exception.ts
│   │   │   └── conflict.exception.ts
│   │   │
│   │   ├── queues/
│   │   │   ├── export.queue.ts
│   │   │   ├── design-generation.queue.ts
│   │   │   ├── image-upload.queue.ts
│   │   │   └── base.queue.ts
│   │   │
│   │   ├── websocket/
│   │   │   ├── socket.ts (Socket.io setup)
│   │   │   ├── namespaces/
│   │   │   │   ├── design.namespace.ts
│   │   │   │   ├── export.namespace.ts
│   │   │   │   └── notification.namespace.ts
│   │   │   └── events/
│   │   │       ├── design.events.ts
│   │   │       ├── export.events.ts
│   │   │       └── generation.events.ts
│   │   │
│   │   └── agents/
│   │       ├── README.md (Agent system overview)
│   │       ├── base-agent.ts (Abstract base class)
│   │       ├── agent-types.ts
│   │       ├── agent-registry.ts (Agent discovery/management)
│   │       ├── agent-orchestrator.ts (Coordinates agents)
│   │       ├── agent-executor.ts (Executes agent operations)
│   │       │
│   │       ├── agents/
│   │       │   ├── 01-orchestrator/
│   │       │   │   ├── orchestrator.agent.ts
│   │       │   │   └── orchestrator.types.ts
│   │       │   │
│   │       │   ├── 02-creative-director/
│   │       │   │   ├── creative-director.agent.ts
│   │       │   │   ├── prompt-templates.ts
│   │       │   │   └── types.ts
│   │       │   │
│   │       │   ├── 03-brand-strategist/
│   │       │   │   ├── brand-strategist.agent.ts
│   │       │   │   ├── guideline-applicator.ts
│   │       │   │   └── types.ts
│   │       │   │
│   │       │   ├── 04-copywriting/
│   │       │   │   ├── copywriting.agent.ts
│   │       │   │   ├── copy-generator.ts
│   │       │   │   └── types.ts
│   │       │   │
│   │       │   ├── 05-design-architect/
│   │       │   │   ├── design-architect.agent.ts
│   │       │   │   ├── layout-generator.ts
│   │       │   │   └── types.ts
│   │       │   │
│   │       │   ├── 06-visual-generation/
│   │       │   │   ├── visual-generation.agent.ts
│   │       │   │   ├── image-generator.ts
│   │       │   │   ├── image-apis/ (DALL-E, Midjourney, etc.)
│   │       │   │   └── types.ts
│   │       │   │
│   │       │   ├── 07-layout-builder/
│   │       │   │   ├── layout-builder.agent.ts
│   │       │   │   ├── canvas-builder.ts
│   │       │   │   └── types.ts
│   │       │   │
│   │       │   ├── 08-editor/
│   │       │   │   ├── editor.agent.ts
│   │       │   │   ├── edit-handler.ts
│   │       │   │   └── types.ts
│   │       │   │
│   │       │   ├── 09-export/
│   │       │   │   ├── export.agent.ts
│   │       │   │   ├── render-engine.ts
│   │       │   │   ├── format-handlers/
│   │       │   │   │   ├── png-handler.ts
│   │       │   │   │   ├── jpg-handler.ts
│   │       │   │   │   ├── pdf-handler.ts
│   │       │   │   │   ├── svg-handler.ts
│   │       │   │   │   └── mp4-handler.ts
│   │       │   │   └── types.ts
│   │       │   │
│   │       │   ├── 10-social-platform/
│   │       │   │   ├── social-platform.agent.ts
│   │       │   │   ├── platform-specs.ts
│   │       │   │   ├── formatter.ts
│   │       │   │   └── types.ts
│   │       │   │
│   │       │   ├── 11-asset-manager/
│   │       │   │   ├── asset-manager.agent.ts
│   │       │   │   ├── asset-handler.ts
│   │       │   │   └── types.ts
│   │       │   │
│   │       │   └── 12-template/
│   │       │       ├── template.agent.ts
│   │       │       ├── template-handler.ts
│   │       │       └── types.ts
│   │       │
│   │       └── utils/
│   │           ├── llm-client.ts (Claude API wrapper)
│   │           ├── prompt-builder.ts
│   │           ├── token-counter.ts
│   │           └── agent-logger.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma (Database schema)
│   │   ├── migrations/
│   │   │   ├── migration_001_initial_schema/
│   │   │   │   └── migration.sql
│   │   │   └── .gitkeep
│   │   └── seed.ts (Database seeding)
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── validators/
│   │   │   └── utils/
│   │   ├── integration/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── database/
│   │   ├── e2e/
│   │   │   ├── design-workflow.e2e.ts
│   │   │   ├── export-workflow.e2e.ts
│   │   │   └── brand-system.e2e.ts
│   │   └── fixtures/
│   │       ├── users.fixture.ts
│   │       ├── designs.fixture.ts
│   │       └── brands.fixture.ts
│   │
│   ├── .env.example
│   ├── .env.local (local development)
│   ├── .env.production (production secrets in deployment)
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx (Root layout)
│   │   ├── page.tsx (Home page)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── callback/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx (Project list)
│   │   │   │   ├── [project_id]/layout.tsx
│   │   │   │   ├── [project_id]/page.tsx (Project detail)
│   │   │   │   └── [project_id]/designs/ ...
│   │   │   ├── brands/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [brand_id]/page.tsx
│   │   │   ├── templates/
│   │   │   │   └── page.tsx
│   │   │   ├── assets/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── profile/page.tsx
│   │   │       ├── organization/page.tsx
│   │   │       └── billing/page.tsx
│   │   ├── design/
│   │   │   └── [design_id]/
│   │   │       └── editor/page.tsx (Canvas editor)
│   │   └── api/ (Next.js API routes for auth callbacks)
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   │
│   │   │   ├── editor/
│   │   │   │   ├── Canvas.tsx (Main canvas component)
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   ├── Layers.tsx
│   │   │   │   ├── Properties.tsx
│   │   │   │   ├── ColorPicker.tsx
│   │   │   │   ├── TextEditor.tsx
│   │   │   │   ├── ElementSelector.tsx
│   │   │   │   ├── HistoryPanel.tsx
│   │   │   │   └── ExportDialog.tsx
│   │   │   │
│   │   │   ├── design/
│   │   │   │   ├── DesignCard.tsx
│   │   │   │   ├── DesignGrid.tsx
│   │   │   │   ├── DesignPromptForm.tsx
│   │   │   │   ├── GenerationProgress.tsx
│   │   │   │   └── DesignPreview.tsx
│   │   │   │
│   │   │   ├── brand/
│   │   │   │   ├── BrandKitCard.tsx
│   │   │   │   ├── BrandKitForm.tsx
│   │   │   │   ├── ColorPaletteEditor.tsx
│   │   │   │   ├── FontSelector.tsx
│   │   │   │   └── GuidelineViewer.tsx
│   │   │   │
│   │   │   ├── project/
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectGrid.tsx
│   │   │   │   ├── CreateProjectForm.tsx
│   │   │   │   └── ProjectSettings.tsx
│   │   │   │
│   │   │   ├── template/
│   │   │   │   ├── TemplateCard.tsx
│   │   │   │   ├── TemplateGrid.tsx
│   │   │   │   ├── TemplatePreview.tsx
│   │   │   │   └── TemplateSelector.tsx
│   │   │   │
│   │   │   └── asset/
│   │   │       ├── AssetCard.tsx
│   │   │       ├── AssetGrid.tsx
│   │   │       ├── AssetUploader.tsx
│   │   │       └── AssetLibrary.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useDesign.ts
│   │   │   ├── useCanvas.ts
│   │   │   ├── useProject.ts
│   │   │   ├── useBrand.ts
│   │   │   ├── useExport.ts
│   │   │   ├── useTemplate.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useAsync.ts
│   │   │
│   │   ├── store/
│   │   │   ├── index.ts (Redux store setup)
│   │   │   ├── slices/
│   │   │   │   ├── auth.slice.ts
│   │   │   │   ├── design.slice.ts
│   │   │   │   ├── canvas.slice.ts
│   │   │   │   ├── project.slice.ts
│   │   │   │   ├── brand.slice.ts
│   │   │   │   ├── export.slice.ts
│   │   │   │   ├── notification.slice.ts
│   │   │   │   └── ui.slice.ts
│   │   │   └── thunks/
│   │   │       ├── auth.thunk.ts
│   │   │       ├── design.thunk.ts
│   │   │       ├── canvas.thunk.ts
│   │   │       └── export.thunk.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── client.ts (Axios instance)
│   │   │   │   ├── auth-api.ts
│   │   │   │   ├── design-api.ts
│   │   │   │   ├── canvas-api.ts
│   │   │   │   ├── export-api.ts
│   │   │   │   ├── project-api.ts
│   │   │   │   ├── brand-api.ts
│   │   │   │   ├── template-api.ts
│   │   │   │   └── asset-api.ts
│   │   │   ├── canvas/
│   │   │   │   ├── canvas-engine.ts (Konva.js wrapper)
│   │   │   │   ├── canvas-renderer.ts
│   │   │   │   ├── canvas-history.ts (Undo/redo)
│   │   │   │   ├── drag-drop-handler.ts
│   │   │   │   ├── text-editor.ts
│   │   │   │   └── selection-handler.ts
│   │   │   ├── export/
│   │   │   │   ├── export-handler.ts
│   │   │   │   └── download-handler.ts
│   │   │   ├── storage/
│   │   │   │   ├── local-storage.ts
│   │   │   │   ├── session-storage.ts
│   │   │   │   └── indexed-db.ts
│   │   │   └── websocket/
│   │   │       ├── socket-client.ts
│   │   │       └── event-listeners.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── api-utils.ts
│   │   │   ├── canvas-utils.ts
│   │   │   ├── color-utils.ts
│   │   │   ├── date-utils.ts
│   │   │   ├── validation.ts
│   │   │   ├── format-utils.ts
│   │   │   ├── image-utils.ts
│   │   │   └── responsive.ts
│   │   │
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   ├── api.types.ts
│   │   │   ├── canvas.types.ts
│   │   │   ├── design.types.ts
│   │   │   ├── brand.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── ui.types.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── variables.css
│   │   │   ├── components.css
│   │   │   ├── editor.css
│   │   │   └── canvas.css
│   │   │
│   │   ├── config/
│   │   │   ├── api-config.ts
│   │   │   └── canvas-config.ts
│   │   │
│   │   └── constants/
│   │       ├── platform-specs.ts (Instagram, LinkedIn, TikTok, etc.)
│   │       ├── colors.ts
│   │       └── messages.ts
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── integration/
│   │   ├── e2e/
│   │   │   └── design-workflow.e2e.ts
│   │   └── __fixtures__/
│   │
│   ├── .env.example
│   ├── .env.local
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── jest.config.js
│   ├── Dockerfile
│   └── .dockerignore
│
├── shared/
│   ├── types/
│   │   ├── api.types.ts (Shared API types)
│   │   ├── design.types.ts
│   │   ├── brand.types.ts
│   │   ├── agent.types.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── errors.ts
│   │   ├── messages.ts
│   │   ├── platform-specs.ts
│   │   └── design-formats.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── format-utils.ts
│   │   └── error-utils.ts
│   └── package.json
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── docker-compose.prod.yml
│   ├── kubernetes/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── configmap.yaml
│   │   └── secrets.yaml
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── networking.tf
│   │   ├── database.tf
│   │   ├── storage.tf
│   │   └── monitoring.tf
│   └── scripts/
│       ├── setup-dev.sh
│       ├── setup-prod.sh
│       ├── migrate-db.sh
│       ├── seed-db.sh
│       └── backup-db.sh
│
├── .dockerignore
├── .gitignore
├── docker-compose.yml (Development)
├── package.json (Monorepo root)
├── tsconfig.json (Root tsconfig)
├── pnpm-workspace.yaml (Or use npm/yarn workspaces)
├── ARCHITECTURE.md
├── DATABASE.md
├── API_SPEC.md
├── SETUP.md (Quick start guide)
├── DEPLOYMENT.md (Production deployment)
├── CONTRIBUTING.md
└── README.md
```

---

## Folder Organization Principles

### Backend (`/backend`)
- **Layered architecture**: Routes → Controllers → Services → Repositories → Database
- **Single responsibility**: Each file has one clear purpose
- **Dependency injection**: Services injected into controllers
- **Error handling**: Centralized exception handling
- **Testing**: Unit, integration, and E2E tests
- **Agents**: Modular, self-contained agent implementations

### Frontend (`/frontend`)
- **Next.js App Router**: Modern React with server components
- **Component organization**: By feature/domain, not type
- **Hooks for logic**: Custom hooks in `/hooks`
- **Redux store**: Centralized state management
- **Services layer**: API calls isolated from components
- **Canvas engine**: Abstracts Konva.js complexity

### Shared (`/shared`)
- **Monorepo shared code**: Types, constants, utilities
- **Reusable between frontend and backend**
- **Version independently**

### Infrastructure (`/infrastructure`)
- **Docker**: Containerization for backend and frontend
- **Kubernetes**: Production orchestration
- **Terraform**: IaC for AWS/GCP/Azure
- **Scripts**: Automation and deployment

---

## Key Points

### Agent Organization
- **Numbered folders** (01-orchestrator, 02-creative-director, etc.)
- **Self-contained**: Each agent has its own types and logic
- **Discoverable**: Registry pattern for finding agents
- **Extensible**: Easy to add new agents

### Database
- **Prisma ORM**: Type-safe database access
- **Migrations**: Version control for schema
- **Seeds**: Development data population

### API Routes
- **Versioned**: `/api/v1` for future compatibility
- **RESTful**: Standard HTTP methods
- **WebSocket**: Real-time updates via Socket.io

### Testing
- **Unit tests**: Function and service level
- **Integration tests**: API and database level
- **E2E tests**: Complete user workflows

### Configuration
- **Environment variables**: `.env` files
- **Secrets management**: Production secrets in deployment
- **Local development**: `docker-compose.yml`

---

## Next Steps

1. ✅ Architecture documentation
2. ✅ Database schema
3. ✅ API specification
4. ✅ Folder structure plan
5. **Create actual folder structure** ← Next
6. **Initialize monorepo** ← Next
7. **Backend core setup** ← Next
8. **Frontend scaffolding** ← Next
9. **Agent system** ← Next
10. **Implement core features** ← Next
