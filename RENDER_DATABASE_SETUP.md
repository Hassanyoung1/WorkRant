# Render Free Tier Database Setup Guide
## The Issue with Migrations

You're encountering this because Render's free tier has limitations:
- **No shell access** without paying
- **Limited database options** on free tier
- **PostgreSQL requires paid plan**

## Solution Options

### Option 1: Use Render's Database (Requires Payment)
1. Go to your Render dashboard
2. Create a PostgreSQL database (starts at $7/month)
3. Copy the database URL
4. Add it to your web service environment variables as `DATABASE_URL`

### Option 2: Use Free External Database
1. **Supabase** (free tier includes PostgreSQL):
   - Go to https://supabase.com
   - Create a new project
   - Get the database URL from Settings > Database
   - Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

2. **Neon** (free PostgreSQL):
   - Go to https://neon.tech
   - Create a project
   - Copy the connection string

3. **ElephantSQL** (free PostgreSQL):
   - Go to https://www.elephantsql.com
   - Create a free "Tiny Turtle" instance
   - Copy the database URL

### Option 3: Use SQLite (Temporary Solution)
Since the backend is configured to fall back to SQLite when no DATABASE_URL is provided, we can:

1. **Modify the deployment to use SQLite initially**:
   - Remove DATABASE_URL from environment variables
   - The app will use SQLite (not ideal for production but works)

2. **Test with SQLite first, then migrate to proper database**

## Current Status
Your backend is deployed and healthy, but the database isn't properly configured. The API endpoints work but user creation fails due to database issues.

## Recommended Next Steps

1. **Immediate**: Set up a free database from Supabase or Neon
2. **Add DATABASE_URL** to your Render environment variables
3. **Redeploy** to trigger the automatic migrations
4. **Test** user registration

Would you like me to help you with any of these options?