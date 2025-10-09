# 🚀 WorkRant Deployment Tutorial
## Step-by-Step Guide to Deploy Backend + Frontend

**Target Stack**: Railway (Backend) + Vercel (Frontend)  
**Cost**: Free to start, $40/month for production  
**Time**: 30 minutes setup

---

## 📋 **PREREQUISITES**

- [x] GitHub account with WorkRant repository
- [x] Railway account ([railway.app](https://railway.app))
- [x] Vercel account ([vercel.com](https://vercel.com))
- [x] Domain name (optional, can use subdomains)

---

## 🏗️ **PART 1: BACKEND DEPLOYMENT (Railway)**

### **Step 1: Prepare Backend for Production**

1. **Update requirements.txt**:
   ```bash
   cd workrant_backend
   cp requirements-prod.txt requirements.txt
   ```

2. **Update settings.py** (add these lines):
   ```python
   # Add to workrant_backend/settings.py
   import dj_database_url
   
   # Database for production
   if 'DATABASE_URL' in os.environ:
       DATABASES['default'] = dj_database_url.parse(os.environ['DATABASE_URL'])
   
   # Static files for production
   STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
   STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
   ```

3. **Add whitenoise middleware**:
   ```python
   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',
       'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this line
       'django.middleware.security.SecurityMiddleware',
       # ... rest of middleware
   ]
   ```

### **Step 2: Deploy to Railway**

1. **Visit** [railway.app](https://railway.app) and sign up
2. **Click "Start a New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose** your WorkRant repository
5. **Select** `workrant_backend` folder as root
6. **Add PostgreSQL service**:
   - Click "Add Service" → "PostgreSQL"
   - Railway automatically connects it

### **Step 3: Configure Environment Variables**

In Railway dashboard, go to **Variables** tab and add:

```bash
DJANGO_SECRET_KEY=your-64-character-secret-key
JWT_SECRET=your-64-character-jwt-secret
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app
USE_POSTGRES=True
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### **Step 4: Deploy and Test**

1. **Railway auto-deploys** your backend
2. **Get your URL**: `https://your-app.railway.app`
3. **Test API**: Visit `https://your-app.railway.app/api/`
4. **Check logs** in Railway dashboard for any errors

---

## 🌐 **PART 2: FRONTEND DEPLOYMENT (Vercel)**

### **Step 1: Prepare Frontend for Production**

1. **Update API URLs** in `workrant_frontend/.env`:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   NODE_ENV=production
   ```

2. **Update next.config.js** for production:
   ```javascript
   // Remove localhost URLs, use environment variables only
   const nextConfig = {
     images: {
       remotePatterns: [
         {
           protocol: 'https',
           hostname: process.env.NEXT_PUBLIC_BACKEND_HOSTNAME,
           pathname: '/media/**',
         },
       ],
     },
     // Remove rewrites for production
   };
   ```

### **Step 2: Deploy to Vercel**

1. **Visit** [vercel.com](https://vercel.com) and sign up
2. **Click "Add New Project"**
3. **Import** your WorkRant repository
4. **Configure build settings**:
   - Framework Preset: **Next.js**
   - Root Directory: **workrant_frontend**
   - Build Command: `npm run build`
   - Output Directory: `.next`

### **Step 3: Configure Environment Variables**

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_BACKEND_HOSTNAME=your-backend.railway.app
NEXT_PUBLIC_BACKEND_PORT=443
NODE_ENV=production
NEXT_PUBLIC_SECURE_MODE=true
```

### **Step 4: Deploy and Test**

1. **Click "Deploy"** - Vercel builds and deploys
2. **Get your URL**: `https://your-app.vercel.app`
3. **Test frontend**: Visit your Vercel URL
4. **Check integration**: Login, create posts, test API calls

---

## 🔄 **PART 3: CONNECT FRONTEND & BACKEND**

### **Step 1: Update CORS Settings**

1. **In Railway** (Backend), update environment variables:
   ```bash
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
   ```

2. **Redeploy backend** (Railway auto-redeploys on env changes)

### **Step 2: Update Frontend API URLs**

1. **In Vercel** (Frontend), update:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```

2. **Redeploy frontend** (Vercel auto-redeploys on env changes)

### **Step 3: Test Integration**

1. **Visit frontend URL**
2. **Test user registration**
3. **Test login functionality**
4. **Create a test post**
5. **Verify API communication**

---

## 🌟 **PART 4: CUSTOM DOMAINS (Optional)**

### **Backend Custom Domain (Railway)**

1. **Go to Railway dashboard** → **Settings** → **Domains**
2. **Add custom domain**: `api.yourdomain.com`
3. **Update DNS**: Add CNAME record pointing to Railway
4. **Update frontend env**: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api`

### **Frontend Custom Domain (Vercel)**

1. **Go to Vercel dashboard** → **Settings** → **Domains**
2. **Add custom domain**: `yourdomain.com`
3. **Update DNS**: Add A/CNAME records as instructed
4. **Update backend CORS**: Include your custom domain

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Checks**

1. **Create health endpoint** in Django:
   ```python
   # In workrant_backend/urls.py
   path('api/health/', views.health_check, name='health'),
   ```

2. **Monitor with Railway dashboard**
3. **Set up Vercel analytics** (free tier available)

### **Database Backups**

1. **Railway auto-backups** PostgreSQL (paid plans)
2. **Manual backups**: Use Railway CLI
3. **Database monitoring**: Check Railway metrics

### **Performance Optimization**

1. **Enable caching** in Django
2. **Use Vercel Edge Functions** for API optimization
3. **Optimize images** with Next.js Image component
4. **Monitor page load times**

---

## 🎯 **COST BREAKDOWN**

### **Free Tier (Development)**
- Railway: Free tier with limits
- Vercel: Free tier (100GB bandwidth)
- **Total**: $0/month

### **Production Ready**
- Railway Pro: $20/month (includes PostgreSQL)
- Vercel Pro: $20/month (unlimited bandwidth)
- **Total**: $40/month

### **Enterprise Scale**
- Railway Team: $20/month per service
- Vercel Enterprise: Custom pricing
- Additional services (monitoring, CDN, etc.)

---

## ✅ **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**
- [ ] Update production requirements
- [ ] Configure environment variables
- [ ] Set DEBUG=False
- [ ] Update ALLOWED_HOSTS
- [ ] Configure CORS settings
- [ ] Test locally with production settings

### **Post-Deployment**
- [ ] Verify API endpoints work
- [ ] Test user registration/login
- [ ] Check database connectivity
- [ ] Verify static files serve correctly
- [ ] Test form submissions
- [ ] Validate HTTPS/SSL certificates

### **Go-Live**
- [ ] Set up custom domains
- [ ] Configure monitoring
- [ ] Set up database backups
- [ ] Test from multiple devices/browsers
- [ ] Update DNS records
- [ ] Announce to users!

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues**

1. **CORS Errors**: Update `CORS_ALLOWED_ORIGINS` in backend
2. **Database Connection**: Check `DATABASE_URL` in Railway
3. **Static Files**: Ensure `whitenoise` is configured
4. **Environment Variables**: Verify all required vars are set
5. **Build Failures**: Check build logs in platform dashboards

### **Getting Help**

- **Railway**: [railway.app/help](https://railway.app/help)
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Django**: [docs.djangoproject.com](https://docs.djangoproject.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

**Congratulations! Your WorkRant platform is now live! 🎉**