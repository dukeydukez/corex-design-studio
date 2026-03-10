#!/bin/bash
set -euo pipefail

# ── COREX Design Studio — Deployment Script ──
# Run this on your home server to deploy the full stack

DOMAIN="studio.corexcreative.com"
EMAIL="dwayne@corexcreative.com"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "================================================"
echo "  COREX Design Studio — Deployment"
echo "  Domain: $DOMAIN"
echo "================================================"
echo ""

# ── Step 1: Check prerequisites ──
echo "[1/6] Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed."
    echo "Install it: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed."
    exit 1
fi

# Use the right compose command
if docker compose version &> /dev/null; then
    COMPOSE="docker compose"
else
    COMPOSE="docker-compose"
fi

echo "  Docker: $(docker --version | cut -d' ' -f3)"
echo "  Compose: $($COMPOSE version --short 2>/dev/null || echo 'available')"
echo ""

# ── Step 2: Check .env ──
echo "[2/6] Checking environment configuration..."

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "  .env not found. Creating from template..."
    cp "$PROJECT_DIR/.env.production.example" "$PROJECT_DIR/.env"

    # Auto-generate secrets
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    PG_PASSWORD=$(openssl rand -hex 16)
    REDIS_PASSWORD=$(openssl rand -hex 16)

    sed -i.bak "s/CHANGE_ME_GENERATE_WITH_OPENSSL/$JWT_SECRET/" "$PROJECT_DIR/.env"
    sed -i.bak "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" "$PROJECT_DIR/.env"
    sed -i.bak "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$PG_PASSWORD/" "$PROJECT_DIR/.env"
    sed -i.bak "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" "$PROJECT_DIR/.env"
    rm -f "$PROJECT_DIR/.env.bak"

    echo "  Generated .env with secure random secrets."
    echo "  IMPORTANT: Edit .env to add your ANTHROPIC_API_KEY if you want AI features."
    echo ""
fi

source "$PROJECT_DIR/.env"
echo "  Domain: $DOMAIN"
echo ""

# ── Step 3: SSL Certificate ──
echo "[3/6] Setting up SSL certificate..."

# Check if certs already exist
if [ -d "/etc/letsencrypt/live/$DOMAIN" ] || docker volume inspect corex-design-studio_certbot_certs &> /dev/null 2>&1; then
    echo "  SSL certificates found, skipping..."
else
    echo "  Obtaining SSL certificate from Let's Encrypt..."

    # Start nginx temporarily for the ACME challenge
    # First create a temporary nginx config without SSL
    mkdir -p "$PROJECT_DIR/nginx/conf.d"
    cat > "$PROJECT_DIR/nginx/conf.d/temp-certbot.conf" <<NGINX_EOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'COREX Design Studio — SSL setup in progress';
        add_header Content-Type text/plain;
    }
}
NGINX_EOF

    # Temporarily rename the SSL config
    if [ -f "$PROJECT_DIR/nginx/conf.d/studio.conf" ]; then
        mv "$PROJECT_DIR/nginx/conf.d/studio.conf" "$PROJECT_DIR/nginx/conf.d/studio.conf.disabled"
    fi

    # Start nginx for ACME challenge
    $COMPOSE -f docker-compose.prod.yml up -d nginx

    # Request certificate
    $COMPOSE -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN"

    # Restore SSL config
    rm -f "$PROJECT_DIR/nginx/conf.d/temp-certbot.conf"
    if [ -f "$PROJECT_DIR/nginx/conf.d/studio.conf.disabled" ]; then
        mv "$PROJECT_DIR/nginx/conf.d/studio.conf.disabled" "$PROJECT_DIR/nginx/conf.d/studio.conf"
    fi

    $COMPOSE -f docker-compose.prod.yml down

    echo "  SSL certificate obtained successfully."
fi
echo ""

# ── Step 4: Build containers ──
echo "[4/6] Building Docker containers..."
$COMPOSE -f docker-compose.prod.yml build --no-cache
echo "  Build complete."
echo ""

# ── Step 5: Start services ──
echo "[5/6] Starting all services..."
$COMPOSE -f docker-compose.prod.yml up -d
echo "  Services started."
echo ""

# ── Step 6: Health check ──
echo "[6/6] Running health checks..."
sleep 10

# Check each service
SERVICES=("postgres" "redis" "backend" "frontend" "nginx")
ALL_HEALTHY=true

for svc in "${SERVICES[@]}"; do
    STATUS=$($COMPOSE -f docker-compose.prod.yml ps --format json "$svc" 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    if [ "$STATUS" = "running" ]; then
        echo "  $svc: running"
    else
        echo "  $svc: $STATUS (check logs with: docker compose -f docker-compose.prod.yml logs $svc)"
        ALL_HEALTHY=false
    fi
done

echo ""
echo "================================================"
if [ "$ALL_HEALTHY" = true ]; then
    echo "  DEPLOYMENT SUCCESSFUL"
    echo ""
    echo "  https://$DOMAIN"
    echo ""
    echo "  Useful commands:"
    echo "  View logs:    $COMPOSE -f docker-compose.prod.yml logs -f"
    echo "  Stop:         $COMPOSE -f docker-compose.prod.yml down"
    echo "  Restart:      $COMPOSE -f docker-compose.prod.yml restart"
    echo "  Update:       git pull && $COMPOSE -f docker-compose.prod.yml up -d --build"
else
    echo "  DEPLOYMENT COMPLETED WITH WARNINGS"
    echo "  Some services may not be healthy. Check logs above."
fi
echo "================================================"
