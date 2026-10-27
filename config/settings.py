"""
Django settings for the Military Information Site project.
"""
from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DJANGO_DEBUG=(bool, False),
)
environ.Env.read_env(BASE_DIR / '.env')

# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------
SECRET_KEY = env('DJANGO_SECRET_KEY')
DEBUG = env.bool('DJANGO_DEBUG', default=False)
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'django_celery_results',

    # Admin panel 2FA -- only guards /admin/ (session-based Django auth).
    'django_otp',
    'django_otp.plugins.otp_static',
    'django_otp.plugins.otp_totp',
    'two_factor',

    # Military-info site apps
    'core',
    'articles',
    'catalog',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django_otp.middleware.OTPMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
# DATABASE_URL is set by docker-compose (Postgres). If it's absent (e.g. a
# quick local run without Docker), fall back to sqlite so `runserver` still
# works out of the box.
DATABASES = {
    'default': env.db('DATABASE_URL', default=f'sqlite:///{BASE_DIR / "db.sqlite3"}'),
}
# Reuse connections across requests instead of opening a fresh TCP+auth
# handshake to Postgres on every single request -- cheap win under load.
# 100 max_connections on the DB comfortably covers our worker count even
# with connections held open for a minute.
DATABASES['default']['CONN_MAX_AGE'] = 60

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
# Where django-two-factor-auth's login lives -- /admin/ redirects here when
# an unauthenticated (or not-yet-2FA-verified) staff user hits it.
LOGIN_URL = 'two_factor:login'
# Post-login default (Django's own fallback is /accounts/profile/, which
# doesn't exist here). Once logged in with no OTP device yet, this sends
# them straight to the QR-code setup page instead of a dead end.
LOGIN_REDIRECT_URL = '/account/two_factor/setup/'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'config.password_validators.UserAttributeSimilarityValidator'},
    {'NAME': 'config.password_validators.MinimumLengthValidator'},
    {'NAME': 'config.password_validators.CommonPasswordValidator'},
    {'NAME': 'config.password_validators.NumericPasswordValidator'},
]

# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------
LANGUAGE_CODE = 'uz'
TIME_ZONE = 'Asia/Tashkent'
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------
# Defaults to printing emails to the console -- no SMTP account needed for
# local dev. Point EMAIL_BACKEND/EMAIL_HOST/etc at a real provider in .env
# for production.
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='localhost')
EMAIL_PORT = env.int('EMAIL_PORT', default=25)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='no-reply@filmplatform.uz')

# ---------------------------------------------------------------------------
# Static & media
# ---------------------------------------------------------------------------
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# An absolute URL here (set via env in production) makes DRF's FileField
# serialization emit the real public URL regardless of which internal
# hostname the request came in on -- Server Components fetch the Django API
# over the container-internal network (e.g. http://web:8000), and without
# this, file URLs sent to the browser would say "web:8000" instead of the
# actual public domain.
MEDIA_URL = env('MEDIA_URL', default='/media/')
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DATETIME_FORMAT': 'iso-8601',
    # No global anonymous throttle: the Next.js server fetches every public
    # page's data from one container IP on behalf of all visitors (and bots
    # probing random URLs), so a per-IP "anon" bucket was exhausted within
    # minutes and blanked the site. Only the brute-forceable login endpoint
    # is throttled (scope "login", see core.views.LoginView).
    'DEFAULT_THROTTLE_RATES': {
        'login': '20/hour',
    },
    # nginx is the single proxy in front of Django: take the client IP from
    # the last X-Forwarded-For entry it appends (not spoofable by the client).
    'NUM_PROXIES': 1,
}

# Longer-lived than simplejwt's defaults since the only client is the
# Next.js admin CMS (a handful of internal users), and the access token is
# stored server-side in an httpOnly cookie rather than in browser JS --
# trading a bit of revocation granularity for not having to implement
# transparent token refresh during page renders.
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Harbiy ma\'lumot sayti API',
    'DESCRIPTION': 'Harbiy texnika, qurol-yarog\', urushlar tarixi va atamalar katalogi.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['http://localhost:3000'])

# ---------------------------------------------------------------------------
# Celery
# ---------------------------------------------------------------------------
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'django-cache'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True

# ---------------------------------------------------------------------------
# Channels (WebSockets)
# ---------------------------------------------------------------------------
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [env('REDIS_URL', default='redis://127.0.0.1:6379/1')],
        },
    },
}

# Anything larger than this streams to a temp file instead of being buffered
# in RAM.
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
# Guards non-file POST bodies (JSON, form fields) separately from uploads.
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{asctime} [{levelname}] {name}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR / 'django.log',
            'maxBytes': 5 * 1024 * 1024,
            'backupCount': 3,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# ---------------------------------------------------------------------------
# Production security (only when DEBUG is off)
# ---------------------------------------------------------------------------
if not DEBUG:
    # Off by default so the first HTTP-only deploy (before a domain + TLS
    # cert exist) doesn't redirect-loop. Flip to True once Nginx serves
    # HTTPS -- see nginx.conf / certbot setup in HANDOFF.md.
    SECURE_SSL_REDIRECT = env.bool('DJANGO_SECURE_SSL_REDIRECT', default=False)
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
