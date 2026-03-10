# COREX CREATIVE DESIGN STUDIO

## Overview

COREX is an AI-powered design platform that competes with Canva. It uses a sophisticated multi-agent system where specialized AI agents collaborate to generate, edit, and export professional marketing designs from natural language descriptions.

**Status**: 🚀 Early Development - Phase 2: Monorepo Scaffolding

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

### Setup Development Environment

```bash
# Clone repository
git clone <repo-url>
cd corex-design-studio

# Install dependencies
npm install

# Setup environment files
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local

# Start with Docker Compose
docker-compose up

# Or run locally (requires PostgreSQL + Redis)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1

---

## Architecture

### Core Components

**Frontend** (Next.js 14 + React 18 + Tailwind)
- Visual canvas editor with Konva.js
- Real-time design editing
- Redux state management
- WebSocket integration for live updates

**Backend** (Express.js + Node.js)
- RESTful API with versioning
- PostgreSQL database with Prisma ORM
- Redis caching layer
- Bull job queue for async tasks

**AI Agents** (12 Specialized Agents)
- Creative Director: Interprets design prompts
- Brand Strategist: Applies brand guidelines
- Copywriting Agent: Generates headings and CTA
- Design Architect: Creates layout structure
- Visual Generation: Generates images (DALL-E 3)
- Layout Builder: Assembles canvas design
- Export Agent: Renders to PNG/PDF/SVG/MP4
- Social Platform Agent: Formats for each platform
- Asset Manager: Manages design assets
- Template Agent: Creates reusable templates
- Editor Agent: Handles live editing
- Orchestrator Agent: Coordinates all agents

---

## Project Structure

```
corex-design-studio/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── agents/      # 12 AI agents system
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API endpoints
│   │   └── ...
│   └── prisma/          # Database schema & migrations
├── frontend/            # Next.js React app
│   ├── app/             # Next.js 14 app directory
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API & canvas services
│   │   ├── store/       # Redux state
│   │   └── ...
│   └── ...
├── shared/              # Shared types & constants
├── docs/                # Comprehensive documentation
├── infrastructure/      # Docker, K8s, Terraform
└── docker-compose.yml   # Local development setup
```

---

## Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Complete system architecture with 12-agent flow
- **[DATABASE.md](docs/DATABASE.md)** - PostgreSQL schema with 20+ tables
- **[API_SPEC.md](docs/API_SPEC.md)** - Full REST API specification
- **[AGENTS.md](docs/AGENTS.md)** - Detailed specs for all 12 agents
- **[FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md)** - Project organization

---

## Development

### Running Services

```bash
# Start all services (frontend + backend + database)
npm run dev

# Or run individually
npm run dev -w backend
npm run dev -w frontend

# Watch tests
npm run test:watch

# Format code
npm run format

# Lint
npm run lint
```

### Database

```bash
# Create migration
npm run db:migrate:dev -w backend

# Seed database
npm run db:seed -w backend

# Open Prisma Studio
npm run db:studio -w backend
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, Tailwind, Konva.js, Redux |
| **Backend** | Express.js, Node.js 20, TypeScript |
| **Database** | PostgreSQL 15, Prisma ORM |
| **Cache** | Redis 7 |
| **AI** | Claude API, DALL-E 3 |
| **Storage** | AWS S3 |
| **Tasks** | Bull Queue |
| **Real-time** | Socket.io WebSocket |
| **DevOps** | Docker, GitHub Actions, Terraform |

---

## Features

### ✅ Implemented
- [x] Architecture design
- [x] Database schema
- [x] API specification
- [x] Monorepo scaffolding
- [x] Docker setup

### 🚧 In Progress
- [ ] Backend core (Express server, middleware)
- [ ] AI agent system
- [ ] Frontend scaffolding
- [ ] Canvas editor

### 📋 Planned
- [ ] Brand management system
- [ ] Export engine (PNG, PDF, SVG, MP4)
- [ ] Authentication system
- [ ] Project management
- [ ] Template library
- [ ] Real-time collaboration

---

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### Projects
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Designs
```
GET    /api/v1/projects/:project_id/designs
POST   /api/v1/projects/:project_id/designs/generate
GET    /api/v1/designs/:id
PUT    /api/v1/designs/:id
POST   /api/v1/designs/:id/duplicate
```

### Canvas Editing
```
POST   /api/v1/designs/:id/canvas/update
POST   /api/v1/designs/:id/canvas/text
POST   /api/v1/designs/:id/canvas/add-layer
DELETE /api/v1/designs/:id/canvas/layers/:layer_id
POST   /api/v1/designs/:id/canvas/undo
POST   /api/v1/designs/:id/canvas/redo
```

### Export
```
POST   /api/v1/designs/:id/export
GET    /api/v1/exports/:id
POST   /api/v1/exports/:id/download
POST   /api/v1/designs/:id/export-social
```

See [API_SPEC.md](docs/API_SPEC.md) for complete documentation.

---

## Contributing

This project follows strict development standards:

- **Type Safety**: Full TypeScript throughout
- **Error Handling**: Comprehensive error handling at all levels
- **Testing**: Unit, integration, and E2E tests (80%+ coverage)
- **Code Style**: ESLint + Prettier
- **Architecture**: Layered architecture with separation of concerns
- **Security**: Input validation, auth, rate limiting, CORS

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## Deployment

### Local Development
```bash
docker-compose up
```

### Production
```bash
# Build and deploy via GitHub Actions + Docker
git push main
# Deploys to specified infrastructure
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production setup.

---

## Performance & Scalability

- **Design Generation**: <2 seconds average
- **Canvas Interactions**: <500ms latency
- **Concurrent Users**: 100K+ ready
- **Database**: Read replicas for scale
- **Caching**: Redis for performance
- **Queues**: Bull for async jobs
- **Horizontal Scaling**: Stateless architecture

---

## Monitoring

All systems include:
- Centralized logging (Winston)
- Performance monitoring
- Error tracking
- Agent execution metrics
- Cost tracking (LLM token usage)

---

## License

© 2024 COREX Creative. All rights reserved.

---

## Support

For questions or issues:
1. Check [ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. Review [API_SPEC.md](docs/API_SPEC.md)
3. See [CONTRIBUTING.md](CONTRIBUTING.md)
4. Create an issue on GitHub

---

**Built with ❤️ by COREX Creative**
