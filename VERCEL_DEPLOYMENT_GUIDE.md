# Vercel Deployment Guide for WorkRant Frontend

## Prerequisites
- GitHub account connected to Vercel
- WorkRant repository pushed to GitHub

## Step-by-Step Deployment

### 1. Prepare the Frontend
```bash
cd workrant_frontend
npm run build  # Test that build works
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://workrant.onrender.com/api

vercel env add NEXT_PUBLIC_BACKEND_URL production  
# Enter: https://workrant.onrender.com

vercel env add NEXT_PUBLIC_BACKEND_HOSTNAME production
# Enter: workrant.onrender.com

vercel env add NEXT_PUBLIC_BACKEND_PORT production
# Enter: 443

vercel env add NEXT_PUBLIC_MEDIA_URL production
# Enter: https://workrant.onrender.com/media

vercel env add NEXT_PUBLIC_SECURE_MODE production
# Enter: true

vercel env add NEXT_PUBLIC_DEBUG production
# Enter: false

vercel env add NODE_ENV production
# Enter: production

# Deploy with environment variables
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New" > "Project"
3. Import your WorkRant repository
4. Select the `workrant_frontend` folder as root directory
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: `https://workrant.onrender.com/api`
   - `NEXT_PUBLIC_BACKEND_URL`: `https://workrant.onrender.com`
   - `NEXT_PUBLIC_BACKEND_HOSTNAME`: `workrant.onrender.com`
   - `NEXT_PUBLIC_BACKEND_PORT`: `443`
   - `NEXT_PUBLIC_MEDIA_URL`: `https://workrant.onrender.com/media`
   - `NEXT_PUBLIC_SECURE_MODE`: `true`
   - `NEXT_PUBLIC_DEBUG`: `false`
   - `NODE_ENV`: `production`
6. Click "Deploy"

### 3. Configure Backend CORS
Once you get your Vercel URL (e.g., `https://your-app.vercel.app`), update the backend:

1. Add your Vercel domain to `CORS_ALLOWED_ORIGINS` in Render environment variables
2. Add your Vercel domain to `ALLOWED_HOSTS` in Render environment variables

## Testing the Deployment
After deployment, test these URLs:
- `https://your-app.vercel.app` - Frontend should load
- `https://your-app.vercel.app/login` - Login page should work
- Network tab should show API calls to `https://workrant.onrender.com`

## Troubleshooting
- **CORS errors**: Make sure your Vercel URL is in backend CORS settings
- **API not found**: Check that `NEXT_PUBLIC_API_URL` is correct
- **Build errors**: Run `npm run build` locally first to identify issues