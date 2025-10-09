#!/bin/bash
# Deployment verification script for WorkRant backend
echo "=== WorkRant Backend Deployment Status ==="
echo ""

echo "1. Testing API Health Endpoint..."
curl -s https://workrant.onrender.com/api/health/ | jq . 2>/dev/null || echo "Health endpoint failed"
echo ""

echo "2. Testing API Root Endpoint..."
curl -s https://workrant.onrender.com/api/ | head -5
echo ""

echo "3. Testing Authentication Endpoint (should return 405 for GET)..."
curl -s -o /dev/null -w "Status: %{http_code}" https://workrant.onrender.com/api/auth/register/
echo ""
echo ""

echo "4. Checking Available Endpoints..."
curl -s https://workrant.onrender.com/api/ | grep -o '"[^"]*": "http[^"]*"' | head -10
echo ""

echo "=== End of Status Check ==="