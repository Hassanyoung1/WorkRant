# WorkRant Deployment Guide: Render + Vercel

## 🚀 Complete Deployment Steps

### Part 1: Backend Deployment on Render

#### Step 1: Prepare Backend for Production
```bash
# 1. Navigate to backend directory
cd /home/hassanyoung1/WorkRant/workrant_backend

# 2. Create production requirements file (if not exists)
echo "django>=5.2.6
djangorestframework>=3.15.2
django-cors-headers>=4.3.1
djangorestframework-simplejwt>=5.3.0
django-rest-auth>=0.9.5
gunicorn>=21.2.0
psycopg2-binary>=2.9.7
whitenoise>=6.5.0
pillow>=10.0.0
python-decouple>=3.8" > requirements.txt

# 3. Create Procfile for Render
echo "web: gunicorn workrant_backend.wsgi:application" > Procfile

# 4. Create render.yaml (optional but recommended)
```

#### Step 2: Update Django Settings for Production
```python
# Add to workrant_backend/settings.py (if not already there)

import os
from decouple import config

# Production database (PostgreSQL)
if 'DATABASE_URL' in os.environ:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
    }

# Static files (WhiteNoise)
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
```

#### Step 3: Deploy Backend on Render

1. **Go to Render Dashboard**
   - Visit: https://render.com
   - Sign up/Login with GitHub account

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `Hassanyoung1/WorkRant`
   - Select branch: `monty`

3. **Configure Service Settings**
   ```
   Name: workrant-backend
   Region: Choose closest to your users
   Branch: monty
   Root Directory: workrant_backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn workrant_backend.wsgi:application
   ```

4. **Add Environment Variables**
   ```
   SECRET_KEY=your-super-secret-django-key-64-chars-long
   DEBUG=False
   ALLOWED_HOSTS=workrant-backend.onrender.com,localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   DATABASE_URL=postgresql://... (Render will provide this)
   DJANGO_SETTINGS_MODULE=workrant_backend.settings
   ```

5. **Create PostgreSQL Database**
   - In Render dashboard: "New" → "PostgreSQL"
   - Name: `workrant-database`
   - Copy the "Internal Database URL"
   - Add it as `DATABASE_URL` environment variable in your web service

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://workrant-backend.onrender.com`

#### Step 4: Run Initial Database Setup
```bash
# After deployment, run these commands in Render shell:
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser  # Optional: create admin user
```

---

### Part 2: Frontend Deployment on Vercel

#### Step 1: Prepare Frontend for Production
```bash
# 1. Navigate to frontend directory
cd /home/hassanyoung1/WorkRant/workrant_frontend

# 2. Update environment variables
echo "NEXT_PUBLIC_API_URL=https://workrant-backend.onrender.com/api
NEXT_PUBLIC_ENVIRONMENT=production" > .env.production

# 3. Test production build locally
npm run build
npm start
```

#### Step 2: Update Frontend Configuration
```javascript
// Update next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['workrant-backend.onrender.com'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
```

#### Step 3: Deploy Frontend on Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Sign up/Login with GitHub account

2. **Import Project**
   - Click "New Project"
   - Import from GitHub: `Hassanyoung1/WorkRant`
   - Select branch: `monty`

3. **Configure Project Settings**
   ```
   Framework Preset: Next.js
   Root Directory: workrant_frontend
   Build Command: npm run build
   Output Directory: .next (leave default)
   Install Command: npm install
   Development Command: npm run dev
   ```

4. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://workrant-backend.onrender.com/api
   NEXT_PUBLIC_ENVIRONMENT=production
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (3-5 minutes)
   - Note your frontend URL: `https://workrant-frontend-xyz.vercel.app`

#### Step 4: Update Backend CORS Settings
```bash
# Update your Render backend environment variables:
CORS_ALLOWED_ORIGINS=https://your-actual-vercel-domain.vercel.app,http://localhost:3000
ALLOWED_HOSTS=workrant-backend.onrender.com,localhost,127.0.0.1
```

---

### Part 3: Post-Deployment Configuration

#### Step 1: Update Backend URLs
1. **In Render dashboard:**
   - Go to your backend service
   - Environment tab
   - Update `CORS_ALLOWED_ORIGINS` with your actual Vercel URL

#### Step 2: Test Full Application
1. **Visit your Vercel frontend URL**
2. **Test user registration and login**
3. **Test post creation and interaction**
4. **Check browser console for any CORS errors**

#### Step 3: Set Up Domain (Optional)
1. **Custom Domain on Vercel:**
   - Project Settings → Domains
   - Add your custom domain
   - Configure DNS records

2. **Custom Domain on Render:**
   - Service Settings → Custom Domains
   - Add your custom API domain

---

### Part 4: Monitoring and Maintenance

#### Step 1: Enable Logging
1. **Render Logs:**
   - Service → Logs tab
   - Monitor for errors

2. **Vercel Analytics:**
   - Project → Analytics tab
   - Monitor performance

#### Step 2: Database Backups
1. **Render PostgreSQL:**
   - Database → Backups tab
   - Enable automatic backups

#### Step 3: Environment Management
```bash
# For updates, push to GitHub:
git add .
git commit -m "deployment: Update for production"
git push origin monty

# Both Render and Vercel will auto-deploy
```

---

### 🎯 Quick Deployment Checklist

**Backend (Render):**
- [ ] Create requirements.txt
- [ ] Create Procfile
- [ ] Set environment variables
- [ ] Create PostgreSQL database
- [ ] Deploy and migrate

**Frontend (Vercel):**
- [ ] Update .env.production
- [ ] Configure next.config.js
- [ ] Set environment variables
- [ ] Deploy

**Post-Deployment:**
- [ ] Update CORS settings
- [ ] Test full application
- [ ] Set up monitoring
- [ ] Configure backups

**Your URLs will be:**
- Backend: `https://workrant-backend.onrender.com`
- Frontend: `https://workrant-frontend-xyz.vercel.app`

🚀 **Ready for production!**