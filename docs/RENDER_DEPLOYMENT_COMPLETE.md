# Complete Render Deployment Guide for WorkRant Backend

## Prerequisites
- GitHub account with WorkRant repository
- Render account (free tier works)
- Database provider account (Supabase/Neon recommended)

---

## Part 1: Set Up Your Database (Choose One)

### Option A: Supabase (Recommended - Free Forever)

1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Fill in:
   - **Name**: WorkRant
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to Oregon US West
4. Wait 2-3 minutes for database creation
5. Go to **Settings** → **Database**
6. Copy the **Connection string** (URI format)
7. It should look like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

### Option B: Neon (Also Free)

1. Go to https://neon.tech and sign up
2. Create a new project: **WorkRant**
3. Copy the connection string from the dashboard
4. Format:
   ```
   postgresql://[username]:[password]@[host]/[database]?sslmode=require
   ```

---

## Part 2: Deploy Backend on Render

### Step 1: Create Web Service

From your Render dashboard screenshot, fill in:

1. **Source Code**: 
   - Repository: `Hassanyoung1/WorkRant`
   - Branch: `monty`

2. **Name**: `WorkRant` (or `workrant-backend`)

3. **Project**: Select `codexia` (or create new)

4. **Language**: **Docker** (if you have Dockerfile) OR **Python 3**

5. **Region**: **Oregon (US West)** ✓ (already selected)

6. **Root Directory**: 
   ```
   workrant_backend
   ```
   ⚠️ **IMPORTANT**: This tells Render to look in the workrant_backend folder

7. **Build Command**:
   ```bash
   chmod +x build.sh && ./build.sh
   ```

8. **Start Command**:
   ```bash
   gunicorn workrant_backend.wsgi:application --bind 0.0.0.0:$PORT
   ```

9. **Instance Type**: **Free** (selected)

10. Click **"Create Web Service"**

---

## Part 3: Configure Environment Variables

After the service is created, go to **Environment** tab and add these variables:

### Required Variables:

```bash
# Django Secret Key (generate a new one for production)
DJANGO_SECRET_KEY=your-super-secret-key-here-make-it-long-and-random-123456789

# JWT Secret (different from Django secret)
JWT_SECRET=another-different-secret-key-for-jwt-tokens-987654321

# Debug Mode (set to False for production)
DEBUG=False

# Allowed Hosts
ALLOWED_HOSTS=workrant.onrender.com,api.workrant.app

# Database Configuration
USE_POSTGRES=true
DATABASE_URL=postgresql://[your-database-url-from-step-1]

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://workrant.app,https://workrant.netlify.app,https://api.workrant.app
CORS_ALLOW_CREDENTIALS=True

# Optional: JWT Token Lifetimes
JWT_ACCESS_TOKEN_LIFETIME_HOURS=1
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Python Version (add to buildpack)
PYTHON_VERSION=3.12.0
```

### How to Generate Secret Keys:

Run this in your terminal:
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```
Do this **twice** - once for `DJANGO_SECRET_KEY` and once for `JWT_SECRET`

---

## Part 4: Custom Domain Setup (Optional)

If you want to use `api.workrant.app` instead of `workrant.onrender.com`:

1. In Render dashboard, go to **Settings** → **Custom Domain**
2. Add: `api.workrant.app`
3. Render will provide DNS records
4. Go to your domain provider (where you bought workrant.app)
5. Add the CNAME record:
   ```
   Type: CNAME
   Name: api
   Value: [your-service].onrender.com
   ```
6. Wait 10-60 minutes for DNS propagation

---

## Part 5: Verify Deployment

### Check if Backend is Running:

1. **Health Check**:
   ```bash
   curl https://[your-service].onrender.com/api/health/
   ```
   Should return: `{"status": "healthy"}`

2. **API Root**:
   ```bash
   curl https://[your-service].onrender.com/api/
   ```
   Should return API endpoints list

3. **Admin Panel**:
   Visit: `https://[your-service].onrender.com/admin/`

### Common Issues:

#### Issue 1: Build Fails
- Check the **Logs** tab
- Ensure `requirements.txt` has all dependencies
- Verify `build.sh` has execute permissions

#### Issue 2: Database Connection Error
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Render's IP
- For Supabase: Enable "Pool Mode" and use pooler URL

#### Issue 3: Static Files Not Loading
- Ensure `whitenoise` is in requirements.txt
- Check `build.sh` runs `collectstatic`
- Verify `STATIC_ROOT` in settings.py

---

## Part 6: Update Frontend Environment Variables

Update your `netlify.toml` or Netlify dashboard with:

```bash
NEXT_PUBLIC_API_URL=https://[your-service].onrender.com/api
NEXT_PUBLIC_BACKEND_URL=https://[your-service].onrender.com
NEXT_PUBLIC_MEDIA_URL=https://[your-service].onrender.com/media
```

Or if using custom domain:
```bash
NEXT_PUBLIC_API_URL=https://api.workrant.app/api
NEXT_PUBLIC_BACKEND_URL=https://api.workrant.app
NEXT_PUBLIC_MEDIA_URL=https://api.workrant.app/media
```

---

## Part 7: Database Migrations

Render automatically runs migrations during deployment if you have a `build.sh`.

To manually run migrations:
1. Go to **Shell** tab in Render dashboard (requires paid plan)
2. OR use the release command in `render.yaml`

Create a `render.yaml` file in your repo root:
```yaml
services:
  - type: web
    name: workrant-backend
    env: python
    region: oregon
    plan: free
    branch: monty
    buildCommand: chmod +x workrant_backend/build.sh && ./workrant_backend/build.sh
    startCommand: cd workrant_backend && gunicorn workrant_backend.wsgi:application --bind 0.0.0.0:$PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.12.0
```

---

## Part 8: Test Your Deployment

### Test Registration:
```bash
curl -X POST https://[your-service].onrender.com/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "company": "Test Company"
  }'
```

### Test Login:
```bash
curl -X POST https://[your-service].onrender.com/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPassword123!"
  }'
```

---

## Troubleshooting

### View Logs:
- Go to **Logs** tab in Render dashboard
- Real-time logs show all requests and errors

### Database Issues:
```bash
# Check if migrations ran
# Look for "Running migrations..." in logs

# Check database connection
# Should see "PostgreSQL database connected" in startup logs
```

### CORS Errors:
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check `ALLOWED_HOSTS` includes your backend domain
- Ensure URLs have `https://` and no trailing slashes

---

## Success Checklist

- [ ] Database created and URL copied
- [ ] Web service created on Render
- [ ] All environment variables added
- [ ] Build completed successfully
- [ ] Service is running (green status)
- [ ] Health check endpoint works
- [ ] Database migrations completed
- [ ] Frontend environment variables updated
- [ ] API calls from frontend work
- [ ] User registration works
- [ ] User login works

---

## Next Steps After Deployment

1. **Create Superuser** (requires shell access or migration):
   ```python
   # Add to a migration file
   from django.contrib.auth import get_user_model
   User = get_user_model()
   User.objects.create_superuser('admin', 'admin@workrant.app', 'your-admin-password')
   ```

2. **Set Up Monitoring**:
   - Render provides basic monitoring
   - Consider adding Sentry for error tracking

3. **Backup Database**:
   - Supabase/Neon provide automatic backups
   - Download manual backups periodically

4. **Performance**:
   - Free tier sleeps after 15 min inactivity
   - First request after sleep takes 30-60 seconds
   - Consider upgrading for production

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/stable/howto/deployment/

---

**Created**: November 1, 2025
**Last Updated**: November 1, 2025
