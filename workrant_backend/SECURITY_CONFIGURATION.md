# WorkRant Backend Security Configuration

## Overview
This document outlines the security improvements made to the WorkRant backend to eliminate hardcoded secrets and security vulnerabilities.

## Security Improvements Made

### 1. Environment Variable Security
- **Removed all hardcoded secrets** from `settings.py`
- **Mandatory environment variables** for sensitive configurations
- **Validation** to ensure critical secrets are provided
- **Secure defaults** only for non-sensitive settings

### 2. Secret Key Management
```python
# Before (VULNERABLE):
SECRET_KEY = 'django-insecure-hardcoded-key'

# After (SECURE):
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("DJANGO_SECRET_KEY environment variable is required")
```

### 3. JWT Token Security
- **Separate JWT secret** from Django secret key
- **Minimum length validation** (32+ characters)
- **Environment-based token lifetimes**
- **No fallback to insecure defaults**

### 4. Database Security
- **No default passwords** in production
- **Validation for required credentials**
- **SSL/TLS configuration** based on environment
- **Automatic SSL requirement** in production

### 5. CORS Security
- **No hardcoded origins** in production
- **Explicit origin validation**
- **Environment-based configuration**
- **Secure defaults for development only**

### 6. Security Headers
All security headers are now configurable via environment variables:
- `SECURE_BROWSER_XSS_FILTER`
- `SECURE_CONTENT_TYPE_NOSNIFF`
- `X_FRAME_OPTIONS`
- `SECURE_REFERRER_POLICY`
- `SECURE_SSL_REDIRECT`
- `SECURE_HSTS_SECONDS`

### 7. Production Security Features
The following are automatically enabled in production (DEBUG=False):
- Secure cookies (HTTPS only)
- CSRF protection
- SSL redirection (when configured)
- HSTS headers (when configured)

## Environment Configuration

### Required Variables
These **MUST** be set in production:

```env
# Core Security
DJANGO_SECRET_KEY=your-secure-50-char-minimum-secret
JWT_SECRET=your-secure-64-char-minimum-jwt-secret
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database (for PostgreSQL)
DATABASE_NAME=your_database_name
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_secure_db_password

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### Development vs Production

#### Development (.env)
```env
DEBUG=True
DATABASE_NAME=workrant # postgresSQL
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Production (.env)
```env
DEBUG=False
DATABASE_NAME=workrant_prod    # PostgreSQL
DATABASE_USER=workrant_user
DATABASE_PASSWORD=super_secure_password
CORS_ALLOWED_ORIGINS=https://yourdomain.com
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
```

## Security Validation

### Startup Checks
The application now performs security validation on startup:

1. **Secret Key Validation**: Ensures Django secret key is provided
2. **JWT Secret Validation**: Ensures JWT secret is provided and secure
3. **Database Credentials**: Validates PostgreSQL credentials in production
4. **CORS Origins**: Ensures allowed origins are explicitly set in production

### Error Messages
Clear error messages guide proper configuration:
```
ValueError: DJANGO_SECRET_KEY environment variable is required.
Please set it in your .env file with a secure random string (min 50 characters).
```

## Generating Secure Secrets

### Django Secret Key (50+ characters)
```python
import secrets
django_secret = secrets.token_urlsafe(50)
```

### JWT Secret (64+ characters)
```python
import secrets
jwt_secret = secrets.token_urlsafe(64)
```

### Command Line Generation
```bash
# Django Secret Key
python -c "import secrets; print('DJANGO_SECRET_KEY=' + secrets.token_urlsafe(50))"

# JWT Secret
python -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(64))"
```

## Security Headers Configuration

### Development
```env
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
X_FRAME_OPTIONS=DENY
```

### Production (additional)
```env
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## Database Security

### SQLite (Development)
```env
DATABASE_NAME=workrant
```

### PostgreSQL (Production)
```env
DATABASE_NAME=workrant_prod
DATABASE_USER=workrant_user
DATABASE_PASSWORD=highly_secure_password_here
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

## Logging Security

### Configuration
```env
LOG_LEVEL=INFO          # Don't use DEBUG in production
LOG_FILE=workrant.log   # Secure log file location
```

### What's Logged
- Authentication attempts (success/failure)
- API access patterns
- Security-related events
- **Never logged**: Passwords, JWT tokens, PII

## Rate Limiting

### Configuration
```env
RATELIMIT_ENABLE=True
```

### Current Limits
- Registration: 5 attempts per minute per IP
- Login: 10 attempts per minute per IP
- Password change: 3 attempts per minute per user

## Production Deployment Checklist

### Before Deployment
- [ ] Generate secure `DJANGO_SECRET_KEY` (50+ chars)
- [ ] Generate secure `JWT_SECRET` (64+ chars)
- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Set up PostgreSQL database
- [ ] Configure CORS for your frontend domain
- [ ] Enable SSL/HTTPS security headers
- [ ] Set up secure logging
- [ ] Configure email settings
- [ ] Test all environment variables

### Security Headers for Production
```env
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## Security Best Practices

### Environment Files
1. **Never commit** `.env` files to version control
2. **Use different secrets** for each environment
3. **Rotate secrets regularly** in production
4. **Restrict file permissions** on `.env` files (600)

### Secret Management
1. **Use a secret management service** in production (AWS Secrets Manager, etc.)
2. **Never log or print** secret values
3. **Use minimum required permissions** for database users
4. **Regular security audits** of environment configurations

### Monitoring
1. **Monitor failed authentication attempts**
2. **Set up alerts** for security events
3. **Regular log analysis** for suspicious patterns
4. **Keep dependencies updated** for security patches

## Emergency Response

### If Secrets Are Compromised
1. **Immediately rotate** all affected secrets
2. **Invalidate all JWT tokens** (restart application)
3. **Check logs** for unauthorized access
4. **Update environment variables** in all environments
5. **Notify users** if necessary

### Security Incident Response
1. **Isolate** the affected system
2. **Preserve logs** for analysis
3. **Rotate all secrets** as precaution
4. **Review access patterns**
5. **Implement additional security measures** if needed

This security configuration ensures that WorkRant backend follows industry best practices for secret management and security configuration.
