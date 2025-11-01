"""
Django settings for WorkRant Backend.

WorkRant Backend - Anonymous workplace transparency platform
Security and privacy are paramount - no PII collection allowed.

SECURITY NOTE: All sensitive configurations are loaded from environment variables.
Never hardcode secrets in this file!
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY CRITICAL: Secret key must be loaded from environment
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ValueError(
        "DJANGO_SECRET_KEY environment variable is required. "
        "Please set it in your .env file with a secure random string (min 50 characters)."
    )

# Debug mode - NEVER enable in production
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Allowed hosts - restrict in production
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',') if os.getenv('ALLOWED_HOSTS') else []
if not ALLOWED_HOSTS and DEBUG:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1']
elif not ALLOWED_HOSTS:
    raise ValueError(
        "ALLOWED_HOSTS environment variable is required for production. "
        "Please set it in your .env file with your domain names."
    )

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    # 'django_ratelimit',  # Disabled for development - requires Redis
    
    # WorkRant apps
    'accounts',
    'posts',
    'companies',
    'moderation',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # For static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'workrant_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'workrant_backend.wsgi.application'

# Database Configuration
# Support SQLite (development), PostgreSQL (production), and DATABASE_URL (Render)
DATABASE_URL = os.getenv('DATABASE_URL')
USE_POSTGRES = os.getenv('USE_POSTGRES', 'False').lower() == 'true'

if DATABASE_URL:
    # Render/Heroku style DATABASE_URL (priority)
    try:
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
        }
        print("✓ Using DATABASE_URL for database connection")
    except ImportError:
        raise ImportError(
            "dj-database-url is required for DATABASE_URL support. "
            "Install it with: pip install dj-database-url"
        )
elif USE_POSTGRES:
    # PostgreSQL configuration with individual variables
    DATABASE_NAME = os.getenv('DATABASE_NAME')
    DATABASE_USER = os.getenv('DATABASE_USER')
    DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')
    DATABASE_HOST = os.getenv('DATABASE_HOST', 'localhost')
    DATABASE_PORT = os.getenv('DATABASE_PORT', '5432')
    
    # Validate required PostgreSQL credentials
    if not all([DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD]):
        raise ValueError(
            "When USE_POSTGRES=true and DATABASE_URL is not provided, "
            "DATABASE_NAME, DATABASE_USER, and DATABASE_PASSWORD environment variables are required."
        )
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': DATABASE_NAME,
            'USER': DATABASE_USER,
            'PASSWORD': DATABASE_PASSWORD,
            'HOST': DATABASE_HOST,
            'PORT': DATABASE_PORT,
            'OPTIONS': {
                'sslmode': 'require' if not DEBUG else 'prefer',
            },
        }
    }
    print("✓ Using PostgreSQL with individual credentials")
else:
    # SQLite configuration (development)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'workrant_dev.db',
        }
    }
    print("✓ Using SQLite database")

# Rest Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Configuration - Secure token handling
from datetime import timedelta

# JWT secret must be different from Django secret and loaded from environment
JWT_SECRET = os.getenv('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError(
        "JWT_SECRET environment variable is required. "
        "Please set it in your .env file with a secure random string (min 64 characters)."
    )

# Validate JWT secret strength
if len(JWT_SECRET) < 32:
    raise ValueError(
        "JWT_SECRET must be at least 32 characters long for security."
    )

# JWT token lifetimes from environment with secure defaults
ACCESS_TOKEN_HOURS = int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME_HOURS', '1'))
REFRESH_TOKEN_DAYS = int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME_DAYS', '7'))

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=ACCESS_TOKEN_HOURS),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=REFRESH_TOKEN_DAYS),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': JWT_SECRET,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# CORS Configuration - Secure cross-origin requests
CORS_ALLOWED_ORIGINS = []
cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
if cors_origins:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins.split(',')]
elif DEBUG:
    CORS_ALLOWED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
else:
    # In production, CORS origins must be explicitly set
    raise ValueError(
        "CORS_ALLOWED_ORIGINS environment variable is required for production. "
        "Please set it in your .env file with your frontend domain(s)."
    )

CORS_ALLOW_CREDENTIALS = os.getenv('CORS_ALLOW_CREDENTIALS', 'True').lower() == 'true'

# Additional CORS settings for development
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOWED_HEADERS = [
        'accept',
        'accept-encoding',
        'authorization',
        'content-type',
        'dnt',
        'origin',
        'user-agent',
        'x-csrftoken',
        'x-requested-with',
    ]

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Rate Limiting Configuration
RATELIMIT_ENABLE = os.getenv('RATELIMIT_ENABLE', 'False').lower() == 'true'  # Disabled by default
RATELIMIT_USE_CACHE = 'default'
RATELIMIT_VIEW = 'django_ratelimit.views.ratelimited'

# Cache Configuration - Environment based
CACHE_BACKEND = os.getenv('CACHE_BACKEND', 'django.core.cache.backends.locmem.LocMemCache')
CACHE_LOCATION = os.getenv('CACHE_LOCATION', 'workrant-cache')

if 'redis' in CACHE_BACKEND.lower():
    # Redis cache configuration
    REDIS_URL = os.getenv('REDIS_URL')
    if not REDIS_URL:
        raise ValueError(
            "REDIS_URL environment variable is required when using Redis cache backend."
        )
    CACHES = {
        'default': {
            'BACKEND': CACHE_BACKEND,
            'LOCATION': REDIS_URL,
        }
    }
else:
    # Local memory cache (development)
    CACHES = {
        'default': {
            'BACKEND': CACHE_BACKEND,
            'LOCATION': CACHE_LOCATION,
        }
    }

# Security Headers - All configurable via environment
SECURE_BROWSER_XSS_FILTER = os.getenv('SECURE_BROWSER_XSS_FILTER', 'True').lower() == 'true'
SECURE_CONTENT_TYPE_NOSNIFF = os.getenv('SECURE_CONTENT_TYPE_NOSNIFF', 'True').lower() == 'true'
X_FRAME_OPTIONS = os.getenv('X_FRAME_OPTIONS', 'DENY')
SECURE_REFERRER_POLICY = os.getenv('SECURE_REFERRER_POLICY', 'same-origin')

# HTTPS/SSL Security (production)
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False').lower() == 'true'
SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '0'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv('SECURE_HSTS_INCLUDE_SUBDOMAINS', 'False').lower() == 'true'
SECURE_HSTS_PRELOAD = os.getenv('SECURE_HSTS_PRELOAD', 'False').lower() == 'true'

# Secure cookies (production)
SESSION_COOKIE_SECURE = not DEBUG and os.getenv('SESSION_COOKIE_SECURE', 'True').lower() == 'true'
CSRF_COOKIE_SECURE = not DEBUG and os.getenv('CSRF_COOKIE_SECURE', 'True').lower() == 'true'

# Proxy settings (if behind reverse proxy)
if os.getenv('SECURE_PROXY_SSL_HEADER'):
    SECURE_PROXY_SSL_HEADER = tuple(os.getenv('SECURE_PROXY_SSL_HEADER').split(','))

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static and Media files - Configurable paths
STATIC_URL = os.getenv('STATIC_URL', '/static/')
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = os.getenv('MEDIA_URL', '/media/')
MEDIA_ROOT = BASE_DIR / 'media'

# Email Configuration (from environment)
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', '')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'workrant.log')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': LOG_LEVEL,
            'class': 'logging.FileHandler',
            'filename': LOG_FILE,
            'formatter': 'verbose',
        },
        'console': {
            'level': LOG_LEVEL,
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'] if not DEBUG else ['console'],
        'level': LOG_LEVEL,
    },
}

APPEND_SLASH = True

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
