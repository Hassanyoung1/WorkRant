# WorkRant Backend API Documentation

## Overview
The WorkRant backend is a Django REST API that provides anonymous workplace transparency features with strict privacy protections.

## Server Status
✅ **Server Running**: http://localhost:8000
✅ **Database**: Postgresql (development) - `workrant`
✅ **Migrations**: Applied successfully
✅ **Admin Interface**: http://localhost:8000/admin/

## Authentication
The API uses JWT (JSON Web Tokens) for authentication with support for both:
- **Persistent accounts**: With passwords for returning users
- **Ephemeral accounts**: Password-less for anonymous posting

## API Endpoints

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/password/change/` - Change password
- `DELETE /api/auth/delete/` - Delete account
- `GET /api/auth/check-auth/` - Check authentication status

### Posts (`/api/posts/`)
- `GET /api/posts/` - List all posts
- `POST /api/posts/` - Create a new post
- `GET /api/posts/{id}/` - Get specific post
- `PUT /api/posts/{id}/` - Update post (author only)
- `DELETE /api/posts/{id}/` - Soft delete post
- `POST /api/posts/{id}/vote/` - Vote on post (upvote/downvote)
- `POST /api/posts/{id}/comments/` - Add comment to post

### Companies (`/api/companies/`)
- `GET /api/companies/` - List all companies
- `POST /api/companies/` - Create/register a company
- `GET /api/companies/{slug}/` - Get company details
- `POST /api/companies/{slug}/rate/` - Rate a company
- `GET /api/companies/{slug}/posts/` - Get posts about company

### Moderation (`/api/moderation/`)
- `POST /api/moderation/report/` - Report content
- `GET /api/moderation/reports/` - List reports (admin only)
- `POST /api/moderation/reports/{id}/action/` - Take moderation action

## Security Features

### Privacy Protection
- **No PII Storage**: Names, emails, phone numbers automatically filtered
- **UUID Identifiers**: All records use UUIDs instead of sequential IDs
- **Pseudonym Only**: Users identified only by chosen pseudonyms
- **Content Sanitization**: Automatic removal of potentially identifying information

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Secure password storage using Django's built-in hashers
- **Optional Persistence**: Users can choose anonymous or persistent accounts

### Content Moderation
- **Soft Deletion**: Content marked as deleted but preserved for audit
- **Anonymous Reporting**: Users can report inappropriate content
- **Admin Audit Trail**: All moderation actions logged immutably

## Database Schema

### Core Models
1. **User** (`accounts.User`)
   - UUID primary key
   - Pseudonym (unique identifier)
   - Optional password (for persistent accounts)
   - Recovery tokens (hashed)

2. **Company** (`companies.Company`)
   - UUID primary key  
   - Name and auto-generated slug
   - Industry classification
   - Moderation flags

3. **Post** (`posts.Post`)
   - UUID primary key
   - Content with PII validation
   - Company association (optional)
   - Voting score calculation
   - Soft delete support

4. **CompanyRating** (`companies.CompanyRating`)
   - Fairness rating (1-5)
   - Work-life balance rating (1-5)
   - Management toxicity rating (1-5)

## Development Setup

### Prerequisites
- Python 3.12+
- Virtual environment activated at `/home/hassanyoung1/WorkRant/venv/`

### Running the Server
```bash
cd /home/hassanyoung1/WorkRant/workrant_backend
/home/hassanyoung1/WorkRant/venv/bin/python manage.py runserver 0.0.0.0:8000
```

### Admin Access
- **Username**: admin
- **Password**: admin123
- **URL**: http://localhost:8000/admin/

### Sample API Calls

#### Register a User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"pseudonym": "TestUser", "persistent": true, "password": "testpass123"}'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"pseudonym": "TestUser", "password": "testpass123"}'
```

#### Create a Post
```bash
curl -X POST http://localhost:8000/api/posts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content": "Great company culture here!", "post_type": "experience"}'
```

## Next Steps

### Immediate Tasks
1. **Frontend Integration**: Connect with Next.js frontend
2. **API Testing**: Comprehensive test suite
3. **Performance**: Add caching and rate limiting
4. **Documentation**: OpenAPI/Swagger documentation

### Production Readiness
1. **PostgreSQL**: Switch to PostgreSQL for production
2. **Redis**: Configure Redis for caching and sessions
3. **Environment**: Production environment configuration
4. **Monitoring**: Logging and error tracking
5. **Deployment**: Docker containerization and deployment scripts

## File Structure
```
workrant_backend/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── .env                     # Environment configuration
├── workrant        # postgresql database (development)
├── test_api.py              # API testing script
├── accounts/                # User management app
├── companies/               # Company profiles and ratings
├── posts/                   # Posts, comments, votes
├── moderation/              # Content moderation system
└── workrant_backend/        # Main Django project settings
```

The backend is now fully functional and ready for frontend integration!
