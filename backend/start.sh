#!/bin/bash
# Django Backend Startup Script

set -e

echo "🚀 Starting Healthcare Portal Django Backend..."

# Initialize sample doctors
echo "👨‍⚕️  Initializing sample doctors..."
python database/init_doctors.py

# Start Django development server
echo "✅ Starting Django development server on 0.0.0.0:8000..."
python manage.py runserver 0.0.0.0:8000