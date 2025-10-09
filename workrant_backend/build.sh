#!/bin/bash
# Build script for Render deployment
echo "Starting build process..."

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run collectstatic (migrations will be handled by release command)
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build process completed successfully!"