#!/bin/bash
set -e

echo "🚀 Setting up COREX Design Studio development environment..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ is required"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment files
echo "⚙️  Setting up environment files..."
if [ ! -f backend/.env.local ]; then
    cp backend/.env.example backend/.env.local
    echo "✅ Created backend/.env.local (update with your API keys)"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend/.env.local"
fi

echo ""
echo "✅ Development setup complete!"
echo ""
echo "To start the development environment:"
echo "  1. Using Docker: docker-compose up"
echo "  2. Or locally: npm run dev"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo ""
