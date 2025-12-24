#!/bin/bash

# Production deployment script
# This script pulls latest changes, pushes to remote, and builds the project

set -e

echo "🚀 Starting production deployment process..."

# Set production environment
export NODE_ENV=production

# Git pull
echo "📥 Pulling latest changes from git..."
git pull

# Git push (if there are local changes)
echo "📤 Pushing changes to remote..."
git push || echo "⚠️  No changes to push or push failed (this is okay)"

# Build project
echo "🔨 Building project for production..."
pnpm run build

echo "✅ Production deployment completed successfully!"

