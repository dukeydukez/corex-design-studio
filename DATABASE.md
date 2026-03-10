# COREX CREATIVE DESIGN STUDIO - Database Schema

## Overview

PostgreSQL database with the following core entity groups:
- User Management (users, organizations, subscriptions)
- Project & Design Management (projects, designs, versions)
- Brand Management (brand_kits, guidelines, rules)
- Asset Management (assets, asset_tags, favorites)
- Template System (templates, template_variables)
- Export Management (exports, export_formats)
- Agent System (agent_executions, agent_logs)
- Analytics (design_metrics, export_metrics)

---

## USER & ORGANIZATION TABLES

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'admin', 'member', 'viewer'
    
    -- Settings
    preferences JSONB DEFAULT '{}', -- theme, language, etc.
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'deleted'
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
```

### organizations
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    
    -- Subscription
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Settings
    settings JSONB DEFAULT '{}',
    
    -- Limits
    max_projects INTEGER DEFAULT 10,
    max_daily_exports INTEGER DEFAULT 50,
    storage_quota_gb INTEGER DEFAULT 20,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
```

### organization_invites
```sql
CREATE TABLE organization_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    token VARCHAR(255) UNIQUE NOT NULL,
    
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    expires_at TIMESTAMP NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMP
);

CREATE INDEX idx_org_invites_org_id ON organization_invites(organization_id);
CREATE INDEX idx_org_invites_token ON organization_invites(token);
```

---

## PROJECT & DESIGN TABLES

### projects
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    
    -- Project status
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'archived'
    
    -- Flags
    is_favorite BOOLEAN DEFAULT FALSE,
    is_template_project BOOLEAN DEFAULT FALSE,
    
    -- Access
    collaborator_ids UUID[] DEFAULT '{}', -- Array of collaborator user IDs
    permissions JSONB DEFAULT '{}', -- Fine-grained permissions
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_projects_org_id ON projects(organization_id);
CREATE INDEX idx_projects_created_by ON projects(created_by_id);
CREATE INDEX idx_projects_status ON projects(status);
```

### designs
```sql
CREATE TABLE designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    
    -- Design metadata
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Format and dimensions
    format VARCHAR(50) NOT NULL, -- 'instagram_feed', 'tiktok_vertical', 'email', 'custom', etc.
    width_px INTEGER NOT NULL,
    height_px INTEGER NOT NULL,
    
    -- Generation metadata
    generation_prompt TEXT, -- Original user prompt
    creative_brief JSONB, -- From Creative Director Agent
    brand_context JSONB, -- From Brand Strategist Agent
    
    -- Canvas data
    canvas_config JSONB NOT NULL, -- Konva.js configuration
    layers JSONB NOT NULL DEFAULT '[]', -- Layer hierarchy
    
    -- Generation status
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'generating', 'ready', 'editing', 'exported'
    generation_job_id VARCHAR(255), -- For tracking async jobs
    
    -- Agent tracking
    agents_used TEXT[] DEFAULT '{}', -- Which agents were used
    generation_metadata JSONB DEFAULT '{}', -- Performance, costs, etc.
    
    -- Flags
    is_favorite BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_designs_project_id ON designs(project_id);
CREATE INDEX idx_designs_status ON designs(status);
CREATE INDEX idx_designs_format ON designs(format);
```

### design_versions
```sql
CREATE TABLE design_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID NOT NULL REFERENCES designs(id),
    
    -- Version tracking
    version_number INTEGER NOT NULL,
    change_summary TEXT,
    
    -- Canvas data snapshot
    canvas_config JSONB NOT NULL,
    layers JSONB NOT NULL,
    
    -- Who made the change
    changed_by_id UUID NOT NULL REFERENCES users(id),
    
    -- Was this from agent or manual edit
    change_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual', 'agent_regen', 'auto_apply_brand'
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_design_versions_design_id ON design_versions(design_id);
CREATE INDEX idx_design_versions_version_number ON design_versions(design_id, version_number);
```

---

## BRAND MANAGEMENT TABLES

### brand_kits
```sql
CREATE TABLE brand_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_name VARCHAR(255),
    
    -- Brand guidelines
    logo_url TEXT,
    logo_dark_url TEXT,
    brand_colors JSONB NOT NULL DEFAULT '{}', -- { "primary": "#FF0000", "secondary": "#00FF00", ... }
    
    -- Typography
    fonts JSONB NOT NULL DEFAULT '{}', -- { "heading": "Montserrat", "body": "Open Sans", ... }
    font_scale JSONB DEFAULT '{}', -- { "h1": 48, "h2": 36, "body": 16 }
    
    -- Tone of voice
    brand_voice JSONB DEFAULT '{}', -- { "tone": "professional", "personality": [...], "examples": [...] }
    brand_story TEXT, -- Short brand narrative
    tagline VARCHAR(255),
    mission_statement TEXT,
    
    -- Style guidelines
    style_guidelines JSONB DEFAULT '{}', -- Design rules, patterns, etc.
    
    -- Brand kit status
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_brand_kits_org_id ON brand_kits(organization_id);
```

### brand_rules
```sql
CREATE TABLE brand_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_kit_id UUID NOT NULL REFERENCES brand_kits(id),
    
    -- Rule definition
    rule_type VARCHAR(50) NOT NULL, -- 'color_usage', 'typography', 'imagery_style', 'layout_grid', etc.
    rule_name VARCHAR(255) NOT NULL,
    rule_description TEXT,
    
    -- Rule configuration
    condition JSONB, -- When to apply (e.g., {"design_type": "instagram_feed"})
    action JSONB NOT NULL, -- What to do (e.g., {"apply_color": "primary", "text_align": "center"})
    priority INTEGER DEFAULT 100,
    
    -- Rule status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brand_rules_brand_kit_id ON brand_rules(brand_kit_id);
```

---

## ASSET MANAGEMENT TABLES

### assets
```sql
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    uploaded_by_id UUID NOT NULL REFERENCES users(id),
    
    -- Asset info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type VARCHAR(50) NOT NULL, -- 'image', 'logo', 'icon', 'font', 'pattern', 'illustration'
    
    -- File info
    file_url TEXT NOT NULL, -- S3 URL
    file_size_kb INTEGER,
    mime_type VARCHAR(100),
    
    -- Image-specific
    width_px INTEGER,
    height_px INTEGER,
    dominant_color VARCHAR(7),
    
    -- Categorization
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_assets_org_id ON assets(organization_id);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_tags ON assets USING GIN(tags);
```

### system_assets
```sql
CREATE TABLE system_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Asset info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type VARCHAR(50) NOT NULL,
    
    file_url TEXT NOT NULL,
    file_size_kb INTEGER,
    mime_type VARCHAR(100),
    
    -- Categorization
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    
    -- System-wide
    is_premium BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_assets_type ON system_assets(asset_type);
CREATE INDEX idx_system_assets_category ON system_assets(category);
```

---

## TEMPLATE TABLES

### templates
```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID, -- NULL for system templates
    created_by_id UUID REFERENCES users(id),
    
    -- Template info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    
    -- Template design
    format VARCHAR(50) NOT NULL, -- 'instagram_feed', 'email', etc.
    width_px INTEGER NOT NULL,
    height_px INTEGER NOT NULL,
    
    -- Canvas baseline
    base_canvas_config JSONB NOT NULL,
    base_layers JSONB NOT NULL DEFAULT '[]',
    
    -- Template variables
    variables JSONB DEFAULT '{}', -- { "headline": { "type": "text", "default": "..." }, ... }
    
    -- Categorization
    category VARCHAR(100),
    platform VARCHAR(50),
    use_case VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    
    -- Availability
    is_system_template BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    favorites_count INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_templates_format ON templates(format);
CREATE INDEX idx_templates_platform ON templates(platform);
CREATE INDEX idx_templates_category ON templates(category);
```

---

## EXPORT MANAGEMENT TABLES

### exports
```sql
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID NOT NULL REFERENCES designs(id),
    requested_by_id UUID NOT NULL REFERENCES users(id),
    
    -- Export specification
    export_format VARCHAR(50) NOT NULL, -- 'png', 'jpg', 'pdf', 'svg', 'mp4'
    export_quality VARCHAR(50) DEFAULT 'high', -- 'low', 'medium', 'high', 'ultra'
    
    -- Export dimensions (may differ from design)
    width_px INTEGER,
    height_px INTEGER,
    
    -- For social platform exports
    platform_name VARCHAR(50),
    
    -- File result
    file_url TEXT,
    file_size_kb INTEGER,
    download_token VARCHAR(255) UNIQUE,
    
    -- Export status
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- 'queued', 'processing', 'ready', 'failed'
    error_message TEXT,
    
    -- Performance
    processing_time_ms INTEGER,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    expires_at TIMESTAMP -- For temporary exports
);

CREATE INDEX idx_exports_design_id ON exports(design_id);
CREATE INDEX idx_exports_status ON exports(status);
CREATE INDEX idx_exports_created_at ON exports(created_at);
```

---

## AGENT SYSTEM TABLES

### agent_executions
```sql
CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES designs(id), -- NULL for non-design operations
    
    -- Execution info
    agent_type VARCHAR(100) NOT NULL, -- 'creative_director', 'copywriting', etc.
    agent_version VARCHAR(50),
    
    -- Job info
    job_id VARCHAR(255) UNIQUE,
    parent_job_id VARCHAR(255), -- For coordinated operations
    
    -- Inputs
    input_data JSONB NOT NULL,
    
    -- Outputs
    output_data JSONB,
    error_details JSONB,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed'
    
    -- Performance
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    
    -- Costs
    token_usage JSONB DEFAULT '{}', -- { "input": 150, "output": 280 }
    estimated_cost_cents INTEGER,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_executions_agent_type ON agent_executions(agent_type);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_design_id ON agent_executions(design_id);
CREATE INDEX idx_agent_executions_job_id ON agent_executions(job_id);
```

### agent_logs
```sql
CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_execution_id UUID NOT NULL REFERENCES agent_executions(id),
    
    -- Log entry
    level VARCHAR(20) NOT NULL, -- 'debug', 'info', 'warning', 'error'
    message TEXT NOT NULL,
    metadata JSONB,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_execution_id ON agent_logs(agent_execution_id);
CREATE INDEX idx_agent_logs_level ON agent_logs(level);
```

---

## ANALYTICS TABLES

### design_metrics
```sql
CREATE TABLE design_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID NOT NULL REFERENCES designs(id),
    
    -- Engagement
    views INTEGER DEFAULT 0,
    exports_count INTEGER DEFAULT 0,
    
    -- Performance
    generation_time_ms INTEGER,
    editing_time_ms INTEGER,
    
    -- Quality scores
    brand_compliance_score DECIMAL(3,2),
    design_quality_score DECIMAL(3,2),
    
    date DATE NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_design_metrics_design_id ON design_metrics(design_id);
CREATE INDEX idx_design_metrics_date ON design_metrics(date);
```

### export_metrics
```sql
CREATE TABLE export_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Tracking
    design_id UUID REFERENCES designs(id),
    export_format VARCHAR(50),
    platform_name VARCHAR(50),
    
    -- Counts
    count INTEGER DEFAULT 1,
    
    date DATE NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_export_metrics_org_date ON export_metrics(organization_id, date);
```

---

## COLLABORATION TABLES

### design_comments
```sql
CREATE TABLE design_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID NOT NULL REFERENCES designs(id),
    author_id UUID NOT NULL REFERENCES users(id),
    
    -- Comment
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    
    -- Location on canvas (optional)
    x_position INTEGER,
    y_position INTEGER,
    associated_layer_id VARCHAR(255),
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_design_comments_design_id ON design_comments(design_id);
```

---

## Prisma Schema

Below is the corresponding Prisma schema that will be generated from these tables:

```prisma
// Full Prisma schema file to be created
// Will include: data source, generator, all models with relations
```

---

## Key Constraints & Rules

1. **Organizational Isolation**: All data queries filtered by organization_id
2. **Soft Deletes**: deleted_at for audit trail
3. **Timestamps**: created_at, updated_at on all major entities
4. **JSON Storage**: For flexible, semi-structured data (brand colors, canvas config, etc.)
5. **Indexes**: Strategic indexing on foreign keys and common queries
6. **UUID Primary Keys**: For distributed system scalability

---

## Migration Strategy

1. Initialize database with all tables
2. Create indexes
3. Set up RLS (Row Level Security) policies
4. Configure backup and replication
