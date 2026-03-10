#!/bin/bash

# Setup script for production environment

echo "🚀 Setting up production environment..."

# Check environment variables
required_env_vars=("DATABASE_URL" "REDIS_URL" "JWT_SECRET" "CLAUDE_API_KEY")
for var in "${required_env_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

echo "✅ All required environment variables are set"

# Build
echo "📦 Building backend..."
npm run build -w backend

echo "📦 Building frontend..."
npm run build -w frontend

# Run migrations
echo "🗄️  Running database migrations..."
npm run db:migrate -w backend

echo "✅ Production setup complete!"
