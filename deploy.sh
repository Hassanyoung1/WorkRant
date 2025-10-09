#!/bin/bash

# WorkRant Deployment Script
# This script helps you deploy WorkRant to Render (backend) and Vercel (frontend)

set -e  # Exit on any error

echo "🚀 WorkRant Deployment Helper"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 Step $1:${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "workrant_backend/manage.py" ] || [ ! -f "workrant_frontend/package.json" ]; then
    print_error "Please run this script from the WorkRant root directory"
    exit 1
fi

print_step "1" "Preparing Backend for Deployment"

# Update requirements.txt if needed
if ! grep -q "dj-database-url" workrant_backend/requirements.txt; then
    echo "dj-database-url>=2.1.0" >> workrant_backend/requirements.txt
    print_success "Added dj-database-url to requirements.txt"
fi

if ! grep -q "whitenoise" workrant_backend/requirements.txt; then
    echo "whitenoise>=6.5.0" >> workrant_backend/requirements.txt
    print_success "Added whitenoise to requirements.txt"
fi

if ! grep -q "gunicorn" workrant_backend/requirements.txt; then
    echo "gunicorn>=21.2.0" >> workrant_backend/requirements.txt
    print_success "Added gunicorn to requirements.txt"
fi

print_success "Backend dependencies ready"

print_step "2" "Preparing Frontend for Deployment"

# Check if build works
cd workrant_frontend
echo "Testing frontend build..."
if npm run build > /dev/null 2>&1; then
    print_success "Frontend build test passed"
else
    print_warning "Frontend build test failed - please check for errors"
fi
cd ..

print_step "3" "Generating Environment Files"

# Generate random secrets
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(64))")
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(64))")

# Create backend environment template
cat > workrant_backend/.env.render << EOF
# Backend Environment Variables for Render
# Copy these values to your Render service environment variables

SECRET_KEY=${SECRET_KEY}
DEBUG=False
ALLOWED_HOSTS=your-backend-app.onrender.com

# JWT Authentication
JWT_SECRET=${JWT_SECRET}

# CORS Settings (update with your actual Vercel URL)
CORS_ALLOWED_ORIGINS=https://your-frontend-app.vercel.app

# Database (Render provides this automatically)
# DATABASE_URL will be set by Render PostgreSQL

# Logging
LOG_LEVEL=INFO
EOF

# Create frontend environment template
cat > workrant_frontend/.env.production << EOF
# Frontend Environment Variables for Vercel
# Add these to your Vercel project settings

NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com/api
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
EOF

print_success "Environment files generated"

print_step "4" "Commit Changes to Git"

git add .
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    git commit -m "feat: Add deployment configuration for Render and Vercel

- Add Procfile for Render deployment
- Update requirements.txt with production dependencies
- Add WhiteNoise middleware for static file serving
- Add DATABASE_URL support for Render PostgreSQL
- Create environment file templates
- Prepare frontend for Vercel deployment"
    print_success "Changes committed"
fi

git push origin monty
print_success "Changes pushed to GitHub"

echo ""
echo "🎯 Next Steps:"
echo "==============="

echo ""
echo "📱 BACKEND DEPLOYMENT (Render):"
echo "1. Go to https://render.com and sign up/login with GitHub"
echo "2. Click 'New' → 'Web Service'"
echo "3. Connect your GitHub repository: Hassanyoung1/WorkRant"
echo "4. Configure:"
echo "   - Name: workrant-backend"
echo "   - Branch: monty"
echo "   - Root Directory: workrant_backend"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: gunicorn workrant_backend.wsgi:application"
echo "5. Add PostgreSQL database: 'New' → 'PostgreSQL'"
echo "6. Copy environment variables from: workrant_backend/.env.render"
echo "7. Deploy and wait for completion"

echo ""
echo "🌐 FRONTEND DEPLOYMENT (Vercel):"
echo "1. Go to https://vercel.com and sign up/login with GitHub"
echo "2. Click 'New Project'"
echo "3. Import: Hassanyoung1/WorkRant"
echo "4. Configure:"
echo "   - Framework: Next.js"
echo "   - Root Directory: workrant_frontend"
echo "5. Add environment variables from: workrant_frontend/.env.production"
echo "6. Update NEXT_PUBLIC_API_URL with your Render backend URL"
echo "7. Deploy"

echo ""
echo "🔧 FINAL CONFIGURATION:"
echo "1. Update Render backend CORS_ALLOWED_ORIGINS with your Vercel URL"
echo "2. Update Vercel frontend NEXT_PUBLIC_API_URL with your Render URL"
echo "3. Test the full application"

echo ""
print_success "Deployment preparation complete!"
echo "Your environment files are ready in:"
echo "  - workrant_backend/.env.render"
echo "  - workrant_frontend/.env.production"