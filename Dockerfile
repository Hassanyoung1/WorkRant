# Docker Configuration for Backend (Alternative Deployment)
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY workrant_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY workrant_backend/ .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations (optional, can be done separately)
# RUN python manage.py migrate

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "workrant_backend.wsgi:application"]