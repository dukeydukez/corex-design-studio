# COREX CREATIVE DESIGN STUDIO - API Specification

## API Overview

RESTful API with WebSocket support for real-time updates. All responses wrapped in standard envelope. Authentication via JWT. Rate limiting on all endpoints.

**Base URL**: `https://api.corexcreative.studio/api/v1`

---

## STANDARD RESPONSE FORMAT

### Success Response
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "User-facing error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_EMAIL"
    }
  ],
  "requestId": "req_123abc"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

---

## AUTHENTICATION ENDPOINTS

### POST /auth/register
Register new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "organization_name": "My Agency"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "access_token": "jwt_token",
    "refresh_token": "refresh_jwt",
    "organization_id": "uuid",
    "expires_in": 3600
  }
}
```

### POST /auth/login
Authenticate user.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "access_token": "jwt_token",
    "refresh_token": "refresh_jwt",
    "expires_in": 3600
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request**:
```json
{
  "refresh_token": "refresh_jwt"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "access_token": "new_jwt_token",
    "expires_in": 3600
  }
}
```

### POST /auth/logout
Logout user (invalidates tokens).

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## ORGANIZATION ENDPOINTS

### GET /organizations/me
Get current user's organization.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Agency",
    "slug": "my-agency",
    "subscription_tier": "pro",
    "max_projects": 50,
    "storage_used_gb": 15.2,
    "storage_quota_gb": 100,
    "team_members_count": 5
  }
}
```

### GET /organizations/me/members
List organization team members.

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "email": "member@example.com",
      "full_name": "Jane Smith",
      "role": "member",
      "avatar_url": "https://...",
      "joined_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

### POST /organizations/me/invite
Invite user to organization.

**Request**:
```json
{
  "email": "newuser@example.com",
  "role": "member"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "invite_id": "uuid",
    "email": "newuser@example.com",
    "role": "member",
    "invite_url": "https://corexcreative.studio/join/token_123"
  }
}
```

---

## PROJECT ENDPOINTS

### GET /projects
List all projects in organization.

**Query Parameters**:
- `page` (integer)
- `limit` (integer)
- `status` (string): 'draft', 'active', 'archived'
- `search` (string): Search by project name
- `sort_by` (string): 'created_at', 'updated_at', 'name'

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Q1 Social Campaign",
      "description": "Instagram and LinkedIn assets",
      "status": "active",
      "created_at": "2024-01-20T10:00:00Z",
      "updated_at": "2024-01-22T15:30:00Z",
      "thumbnail_url": "https://...",
      "design_count": 8,
      "collaborator_count": 2
    }
  ],
  "pagination": { /* ... */ }
}
```

### POST /projects
Create new project.

**Request**:
```json
{
  "name": "Q1 Social Campaign",
  "description": "Instagram and LinkedIn assets",
  "brand_kit_id": "uuid" (optional)
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Q1 Social Campaign",
    "status": "draft",
    "created_at": "2024-01-20T10:00:00Z"
  }
}
```

### GET /projects/:project_id
Get project details.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Q1 Social Campaign",
    "description": "...",
    "status": "active",
    "created_by": { /* user info */ },
    "collaborators": [ /* array of users */ ],
    "brand_kit": { /* brand kit details */ },
    "designs": [ /* array of designs */ ],
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-22T15:30:00Z"
  }
}
```

### PUT /projects/:project_id
Update project.

**Request**:
```json
{
  "name": "Updated name",
  "description": "Updated description",
  "status": "archived"
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* updated project */ }
}
```

### DELETE /projects/:project_id
Delete project (soft delete).

**Response** (200):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## DESIGN ENDPOINTS

### POST /projects/:project_id/designs/generate
Generate design from natural language prompt.

**Request**:
```json
{
  "prompt": "Create a bold Instagram ad for a real estate investing brand targeting young entrepreneurs",
  "format": "instagram_feed",
  "brand_kit_id": "uuid" (optional),
  "template_id": "uuid" (optional),
  "style_preferences": {
    "color_scheme": "vibrant",
    "typography_style": "modern",
    "imagery_style": "photographic"
  }
}
```

**Response** (202 - Accepted):
```json
{
  "success": true,
  "data": {
    "design_id": "uuid",
    "job_id": "job_123abc",
    "status": "generating",
    "estimated_time_seconds": 45,
    "progress_url": "/designs/uuid/progress"
  }
}
```

### GET /designs/:design_id/progress
Check design generation progress.

**Response**:
```json
{
  "success": true,
  "data": {
    "job_id": "job_123abc",
    "status": "generating",
    "current_step": "generating_images",
    "steps_completed": 4,
    "total_steps": 7,
    "progress_percent": 57,
    "agents_active": ["visual_generation", "copywriting"]
  }
}
```

### GET /designs/:design_id
Get design details (includes canvas configuration).

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "project_id": "uuid",
    "name": "Instagram Ad - Real Estate",
    "format": "instagram_feed",
    "width_px": 1080,
    "height_px": 1080,
    "status": "ready",
    "generation_prompt": "Create a bold Instagram ad...",
    "canvas_config": {
      "width": 1080,
      "height": 1080,
      "background": "#FFFFFF",
      "layers": [ /* Konva layer configuration */ ]
    },
    "layers": [
      {
        "id": "layer_1",
        "name": "Background Image",
        "type": "image",
        "locked": false,
        "opacity": 1,
        "properties": { /* ... */ }
      },
      {
        "id": "layer_2",
        "name": "Main Headline",
        "type": "text",
        "locked": false,
        "content": "Bold Real Estate Opportunity",
        "properties": { /* ... */ }
      }
    ],
    "created_at": "2024-01-22T10:15:00Z",
    "updated_at": "2024-01-22T10:45:00Z"
  }
}
```

### PUT /designs/:design_id
Update design metadata.

**Request**:
```json
{
  "name": "New design name",
  "is_favorite": true
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* updated design */ }
}
```

### POST /designs/:design_id/duplicate
Create a copy of design.

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "new_uuid",
    "name": "Instagram Ad - Real Estate (Copy)",
    "status": "draft"
  }
}
```

---

## CANVAS EDITING ENDPOINTS

### POST /designs/:design_id/canvas/update
Update specific layer in canvas.

**Request**:
```json
{
  "action": "update_layer",
  "layer_id": "layer_1",
  "updates": {
    "x": 100,
    "y": 150,
    "width": 500,
    "height": 300,
    "opacity": 0.8
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "layer_id": "layer_1",
    "updated_properties": { /* ... */ },
    "version": 5
  }
}
```

### POST /designs/:design_id/canvas/text
Update text content.

**Request**:
```json
{
  "layer_id": "layer_2",
  "content": "New headline text",
  "font_family": "Montserrat",
  "font_size": 48,
  "color": "#FF0000",
  "text_align": "center"
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* updated layer */ }
}
```

### POST /designs/:design_id/canvas/add-layer
Add new layer to design.

**Request**:
```json
{
  "layer_type": "text",
  "name": "New Text",
  "content": "Click to edit",
  "x": 100,
  "y": 100,
  "width": 300,
  "height": 100
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "layer_id": "new_layer_id",
    "name": "New Text",
    "type": "text"
  }
}
```

### DELETE /designs/:design_id/canvas/layers/:layer_id
Delete layer from canvas.

**Response**:
```json
{
  "success": true,
  "message": "Layer deleted"
}
```

### POST /designs/:design_id/canvas/undo
Undo last change.

**Response**:
```json
{
  "success": true,
  "data": {
    "version": 4,
    "canvas_state": { /* ... */ }
  }
}
```

### POST /designs/:design_id/canvas/redo
Redo last undone change.

**Response**:
```json
{
  "success": true,
  "data": {
    "version": 5,
    "canvas_state": { /* ... */ }
  }
}
```

---

## EXPORT ENDPOINTS

### POST /designs/:design_id/export
Request design export.

**Request**:
```json
{
  "format": "png",
  "quality": "high",
  "width_px": 1080,
  "height_px": 1080
}
```

**Response** (202 - Accepted):
```json
{
  "success": true,
  "data": {
    "export_id": "uuid",
    "status": "processing",
    "estimated_time_seconds": 10,
    "progress_url": "/exports/uuid/progress"
  }
}
```

### GET /exports/:export_id
Get export details and download URL.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "design_id": "uuid",
    "format": "png",
    "status": "ready",
    "file_url": "https://s3.amazonaws.com/...",
    "download_token": "token_123",
    "file_size_kb": 250,
    "created_at": "2024-01-22T11:00:00Z",
    "completed_at": "2024-01-22T11:00:15Z"
  }
}
```

### POST /exports/:export_id/download
Generate time-limited download URL.

**Response**:
```json
{
  "success": true,
  "data": {
    "download_url": "https://download.corexcreative.studio/file_123?token=...",
    "expires_in_seconds": 3600
  }
}
```

### POST /designs/:design_id/export-social
Export for multiple social platforms.

**Request**:
```json
{
  "platforms": ["instagram_feed", "instagram_story", "twitter", "linkedin"],
  "format": "png",
  "quality": "high"
}
```

**Response** (202):
```json
{
  "success": true,
  "data": {
    "job_id": "job_123",
    "exports": [
      {
        "platform": "instagram_feed",
        "export_id": "uuid",
        "dimensions": "1080x1080"
      }
    ]
  }
}
```

---

## BRAND KIT ENDPOINTS

### GET /brands
List all brand kits in organization.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Main Brand",
      "client_name": "Acme Corp",
      "is_default": true,
      "logo_url": "https://...",
      "colors_count": 5,
      "fonts_count": 2,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /brands
Create new brand kit.

**Request**:
```json
{
  "name": "New Brand Kit",
  "client_name": "Client Name",
  "description": "Brand guidelines for Client",
  "colors": {
    "primary": "#FF0000",
    "secondary": "#00FF00",
    "accent": "#0000FF"
  },
  "fonts": {
    "heading": "Montserrat",
    "body": "Open Sans"
  },
  "brand_voice": {
    "tone": "professional",
    "personality": ["confident", "innovative", "trustworthy"]
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Brand Kit",
    "created_at": "2024-01-22T12:00:00Z"
  }
}
```

### GET /brands/:brand_id
Get brand kit details.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Main Brand",
    "client_name": "Acme Corp",
    "colors": {
      "primary": "#FF0000",
      "secondary": "#00FF00"
    },
    "fonts": {
      "heading": "Montserrat",
      "body": "Open Sans"
    },
    "brand_story": "Our brand story...",
    "tagline": "Innovation meets excellence",
    "brand_voice": { /* ... */ },
    "style_guidelines": { /* ... */ },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /brands/:brand_id
Update brand kit.

**Request**:
```json
{
  "name": "Updated name",
  "colors": { /* updated colors */ }
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* updated brand kit */ }
}
```

---

## TEMPLATE ENDPOINTS

### GET /templates
List available templates.

**Query Parameters**:
- `page` (integer)
- `limit` (integer)
- `category` (string): 'social_media', 'email', 'marketing', etc.
- `platform` (string): 'instagram', 'linkedin', 'twitter'
- `search` (string)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Instagram Feed Post",
      "category": "social_media",
      "platform": "instagram",
      "format": "instagram_feed",
      "thumbnail_url": "https://...",
      "favorites_count": 523,
      "used_count": 1200
    }
  ],
  "pagination": { /* ... */ }
}
```

### POST /templates/:template_id/use
Create design from template.

**Request**:
```json
{
  "project_id": "uuid",
  "template_variables": {
    "headline": "Special Offer",
    "cta_text": "Learn More"
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "design_id": "uuid",
    "name": "Instagram Feed Post (Customized)",
    "status": "ready"
  }
}
```

---

## ASSET ENDPOINTS

### GET /assets
List organization assets.

**Query Parameters**:
- `page` (integer)
- `limit` (integer)
- `asset_type` (string): 'image', 'logo', 'icon', 'font'
- `category` (string)
- `search` (string)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Logo - Primary",
      "asset_type": "logo",
      "file_url": "https://...",
      "width_px": 500,
      "height_px": 200,
      "usage_count": 45,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

### POST /assets/upload
Upload new asset.

**Request** (multipart/form-data):
- `file`: (binary) Asset file
- `name`: (string) Asset name
- `asset_type`: (string) 'image', 'logo', 'icon', 'pattern'
- `category`: (string) Optional category

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Logo - Primary",
    "file_url": "https://...",
    "asset_type": "logo"
  }
}
```

---

## WEBSOCKET API

### Connection
```
wss://api.corexcreative.studio/socket.io
```

### Authentication
Send JWT token on connection:
```javascript
const socket = io('wss://api.corexcreative.studio', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Events

#### Subscribe to Design Updates
```javascript
socket.emit('subscribe', {
  type: 'design',
  design_id: 'uuid'
});
```

#### Design Updated (broadcast)
```javascript
socket.on('design:updated', {
  design_id: 'uuid',
  changes: {
    layer_id: 'layer_1',
    properties: { /* updates */ }
  },
  updated_by: 'user_id',
  timestamp: '2024-01-22T12:00:00Z'
});
```

#### Generation Progress
```javascript
socket.on('generation:progress', {
  design_id: 'uuid',
  job_id: 'job_123',
  current_step: 'generating_images',
  progress_percent: 57,
  eta_seconds: 20
});
```

---

## ERROR CODES

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_REQUEST | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily down |

---

## Rate Limiting

- **Default**: 1000 requests per hour per user
- **Uploads**: 100 files per hour
- **Exports**: 500 exports per hour
- **Design Generation**: 50 per hour (costs credits)

Headers returned:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 754
X-RateLimit-Reset: 1705948800
```

---

## Versioning

Current version: `v1`

Future versions will be available at `/api/v2`, etc.

Old versions supported for 6 months after new major version release.
