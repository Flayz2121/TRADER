
from pathlib import Path
import os
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-brh%m9j*gi3zeg6bf@pwae+czh+jzvzsj2gs4g(=9rb3i(vd&q'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'chat',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

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

WSGI_APPLICATION = 'backend.wsgi.application'

FINAM_API_KEY = "eyJraWQiOiI5OGJlNDg2OC0zMzhiLTQxNDItODkyYy03N2RhODRkNGUzMTAiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhcmVhIjoidHQiLCJwYXJlbnQiOiI0YjIxNzdkMy0xOWQ4LTQ5NzYtYjE3OS05YTRlNmQxYzBiZTgiLCJhcGlUb2tlblByb3BlcnRpZXMiOiJINHNJQUFBQUFBQUFfeldUTzVMVU1CQ0daMGNlZG1ySU9pUmNzcTJpaW1XaGdGQ1dKWTkyTGRzanlUTTJpWk9OSWVBc1hBQU9RRUhDOGFBZkl2bi1sdFI2dFB2M192ZmZYMzktM01OMnIxNzhyUGJibTgzdDlXSDNNdGF4a2NEVWtZUEx4WXkzenc2VkR2UEFHczFNV3V1Y1dNX0JrZHA1REtUZXppMnJzNVBveEhuQko5NDNETm13amxHelpsTVhEVVZQcEtQdlRWRmZ0Q3ZLNTR5cDVmeVk1ZHc0aWM0NkpORmtpOHA4UFFUUk9JbE9zbTVxVnpTTFdpTWFaTjNteU9ya3ZYT3JKZV80NklweXZYUFg5S0psWDFmdTZ3YVpEN3BoN2JXOHI1ZDY1NzR0NF9MdWZpbnppNHhITGZlbm95MHE5NldMMUpVZkV6VnFyWHRqT0RDMTV4MnJ3Yzd3UkZ4R0R1d1VhdzVDcUQ5eDBJLVJ1N29tNDI5M0I3VW15VXhqU1VqajB4MEhPZHIwNW1yel9XcDcyTHo0VnUwVktHMW5STEtFRXdHSGFBdkVpVUFMLUpHaHFyOThmb0lkOFNzb19Od0VUREJIandpV2dEdk4yY0oxOC1EN2hvNjEwd3pzS2JoMkxxd2gza0hsZktfaFFBeHJNLVVGZG03QTlvTnllTlhXNGE3V1JsQkhoMGRpVjBCNU95RW16T2pNZ3FDN09ub1c5Z0poY0VmQXk2b1FORDRseERNbzdBNGlFSkluQkFKV2gyMGhjSlNBYlF4cVNCcll3Y3pBeEF4c0diQ0JtWjdaTWZHeThUSGRNZS1aYnpFZG44Ui1CaFVOZnBpWWE5akZDZjlBVUVrUENKc0l1SlJhUEFIeENzUGpFZUZ4VThwWUNOb0JWRzZ3NnR5ZG9jcFlFNFlESHBFWFBHTFN1SHloMm1mY1VwRmJRRHhEZy15WVdOZHFxQXl5RG9oeFFHeURjMjJqUWF3RFloQVFWOXhzX3Z2aTV2bkhENl9mM2ItUEQ4dHBfQWVSZHZVdllnUUFBQSIsInNjb250ZXh0IjoiQ2hBSUJ4SU1kSEpoWkdWZllYQnBYM0oxQ2lnSUF4SWtObUkyWkROak5XVXRaVGhpTUMwME0yWTNMV0ptTkRZdFpqY3lOalptWldSallXSmlDZ1FJQlJJQUNna0lBQklGYUhSdGJEVUtLQWdDRWlRNE1UaGlNamRqTUMwNVl6SmpMVEV4WmpBdFltVTFOUzFqWmpVd1pXWm1ZbU5tWW1FS0JRZ0lFZ0V6Q2dRSUNSSUFDZ2tJQ2hJRk1TNDJMalFLS0FnRUVpUTVPR0psTkRnMk9DMHpNemhpTFRReE5ESXRPRGt5WXkwM04yUmhPRFJrTkdVek1UQXlUUW9WVkZKQlJFVkJVRWxmUzFKQlZFOVRYMVJQUzBWT0VBRVlBU0FCS2dkRlJFOVlYMFJDT2dJSUEwb1RDZ01JaHdjU0JRaUhvWjRCR2dVSWg1YkRBVmdCWUFGb0FYSUdWSGhCZFhSbyIsInppcHBlZCI6dHJ1ZSwiY3JlYXRlZCI6IjE3NTk1MzgyMDMiLCJyZW5ld0V4cCI6IjE3NjE4NTgwNjAiLCJzZXNzIjoiSDRzSUFBQUFBQUFBLzFPcTVGSkpOVEZMc1V5MU1OWTFNRE5JMURWSk1yVFF0VXd4VE5JMVREUXhTN05NTlRJMU1MTVE0cmd3NDhLbUN4c3U3SlhpdWJEK3dxNkx6UmNiTCt5NHNFdEpPQzBuc2JMS3lOREkwQ0U5TnpFelJ5ODVQemRKeGNuRjBkVEUxTlJJMTlqUzBFblh4TVhTUmRmU3lkQlIxOGpBMEJ3b2JtRG1ZdXlZd0xpTGtaZUxOZDR2SU1oZmlNWGZ5VDhDQUVSVFNQS05BQUFBIiwiaXNzIjoidHhzZXJ2ZXIiLCJrZXlJZCI6Ijk4YmU0ODY4LTMzOGItNDE0Mi04OTJjLTc3ZGE4NGQ0ZTMxMCIsInR5cGUiOiJBcGlUb2tlbiIsInNlY3JldHMiOiJpRmhuYjVNVGdTWEpFcW5mMlBKcEJBPT0iLCJzY29wZSI6IkdBRSIsInRzdGVwIjoiZmFsc2UiLCJzcGluUmVxIjpmYWxzZSwiZXhwIjoxNzYxODU4MDAwLCJzcGluRXhwIjoiMTc2MTg1ODA2MCIsImp0aSI6IjZiNmQzYzVlLWU4YjAtNDNmNy1iZjQ2LWY3MjY2ZmVkY2FiYiJ9.OnHSY4ycSGzhkLEVxXri_VJSS9Ay2LhNMvN6NnVBS5T7ke-qtGWKgb7m3c1wvjgEPe6y0ALHKLFCKlW6w3CIRA"

# Ключ LLM (например, OpenAI)
LLM_API_KEY = "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"

DATABASES = {}  # без БД



# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
