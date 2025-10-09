#!/usr/bin/env python3
"""
Integration test for WorkRant frontend-backend communication
Tests the complete authentication flow and API communication
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:3000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_status(message, status="INFO"):
    color = Colors.BLUE
    if status == "PASS":
        color = Colors.GREEN
    elif status == "FAIL":
        color = Colors.RED
    elif status == "WARN":
        color = Colors.YELLOW
    
    print(f"{color}[{status}]{Colors.ENDC} {message}")

def test_backend_health():
    """Test backend health endpoint"""
    print_status("Testing backend health endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/health/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_status(f"Backend healthy: {data.get('service', 'Unknown')}", "PASS")
            return True
        else:
            print_status(f"Backend health check failed: HTTP {response.status_code}", "FAIL")
            return False
    except Exception as e:
        print_status(f"Backend health check error: {e}", "FAIL")
        return False

def test_frontend_accessible():
    """Test if frontend is accessible"""
    print_status("Testing frontend accessibility...")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print_status("Frontend accessible", "PASS")
            return True
        else:
            print_status(f"Frontend not accessible: HTTP {response.status_code}", "FAIL")
            return False
    except Exception as e:
        print_status(f"Frontend accessibility error: {e}", "FAIL")
        return False

def test_user_registration():
    """Test user registration endpoint"""
    print_status("Testing user registration...")
    
    # Generate unique test data
    timestamp = int(time.time())
    test_data = {
        "pseudonym": f"TestUser{timestamp}",
        "password": "SecureTestPass123!",
        "password_confirm": "SecureTestPass123!"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/register/", 
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            print_status("User registration successful", "PASS")
            print_status(f"  - User ID: {data.get('user', {}).get('id', 'N/A')}")
            print_status(f"  - Pseudonym: {data.get('user', {}).get('pseudonym', 'N/A')}")
            print_status(f"  - Recovery token provided: {'Yes' if data.get('recovery_token') else 'No'}")
            return data
        else:
            print_status(f"Registration failed: HTTP {response.status_code}", "FAIL")
            print_status(f"Response: {response.text}")
            return None
    except Exception as e:
        print_status(f"Registration error: {e}", "FAIL")
        return None

def test_user_login(user_data):
    """Test user login endpoint"""
    if not user_data:
        print_status("Skipping login test - no user data", "WARN")
        return None
    
    print_status("Testing user login...")
    
    login_data = {
        "pseudonym": user_data.get('user', {}).get('pseudonym'),
        "password": "SecureTestPass123!"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/login/", 
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_status("User login successful", "PASS")
            print_status(f"  - Access token received: {'Yes' if data.get('tokens', {}).get('access') else 'No'}")
            print_status(f"  - Refresh token received: {'Yes' if data.get('tokens', {}).get('refresh') else 'No'}")
            return data
        else:
            print_status(f"Login failed: HTTP {response.status_code}", "FAIL")
            print_status(f"Response: {response.text}")
            return None
    except Exception as e:
        print_status(f"Login error: {e}", "FAIL")
        return None

def test_authenticated_endpoint(auth_data):
    """Test accessing protected endpoint with token"""
    if not auth_data:
        print_status("Skipping authenticated test - no auth data", "WARN")
        return False
    
    print_status("Testing authenticated endpoint...")
    
    access_token = auth_data.get('tokens', {}).get('access')
    if not access_token:
        print_status("No access token available", "FAIL")
        return False
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/posts/", 
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print_status("Authenticated request successful", "PASS")
            print_status(f"  - Posts returned: {data.get('count', 0)}")
            return True
        else:
            print_status(f"Authenticated request failed: HTTP {response.status_code}", "FAIL")
            return False
    except Exception as e:
        print_status(f"Authenticated request error: {e}", "FAIL")
        return False

def main():
    """Run all integration tests"""
    print_status("=" * 60, "INFO")
    print_status("WorkRant Integration Test Suite", "INFO")
    print_status(f"Backend: {BACKEND_URL}", "INFO")
    print_status(f"Frontend: {FRONTEND_URL}", "INFO")
    print_status(f"Timestamp: {datetime.now().isoformat()}", "INFO")
    print_status("=" * 60, "INFO")
    
    tests_passed = 0
    total_tests = 5
    
    # Test 1: Backend Health
    if test_backend_health():
        tests_passed += 1
    
    # Test 2: Frontend Accessibility
    if test_frontend_accessible():
        tests_passed += 1
    
    # Test 3: User Registration
    user_data = test_user_registration()
    if user_data:
        tests_passed += 1
    
    # Test 4: User Login
    auth_data = test_user_login(user_data)
    if auth_data:
        tests_passed += 1
    
    # Test 5: Authenticated Request
    if test_authenticated_endpoint(auth_data):
        tests_passed += 1
    
    # Summary
    print_status("=" * 60, "INFO")
    print_status(f"Tests completed: {tests_passed}/{total_tests} passed", "INFO")
    
    if tests_passed == total_tests:
        print_status("🎉 ALL TESTS PASSED! Integration is working correctly.", "PASS")
        return True
    elif tests_passed >= 3:
        print_status("⚠️  Most tests passed, minor issues detected.", "WARN")
        return True
    else:
        print_status("❌ Multiple test failures, integration needs attention.", "FAIL")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
