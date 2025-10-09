#!/bin/bash

echo "Testing backend connection..."
echo ""

# Test health endpoint
echo "1. Testing health endpoint:"
curl -s http://localhost:8000/api/ || echo "Failed to connect"
echo ""
echo ""

# Test posts endpoint
echo "2. Testing posts endpoint:"
curl -s http://localhost:8000/api/posts/ || echo "Failed to connect"
echo ""
echo ""

# Test with CORS headers
echo "3. Testing with CORS headers (from frontend origin):"
curl -i -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     http://localhost:8000/api/posts/
echo ""
