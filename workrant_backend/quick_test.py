#!/usr/bin/env python3
"""
Quick test script for WorkRant backend API.
Tests core functionality with timeouts to avoid hanging.
"""

import requests
import json
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "http://localhost:8000/api"

# Setup session with timeout
session = requests.Session()
session.timeout = 5  # 5 second timeout

def test_endpoints():
    """Test core API endpoints quickly."""
    results = {
        "health": False,
        "registration": False,
        "login": False,
        "posts": False
    }
    
    print("🚀 Quick WorkRant API Test")
    print("=" * 40)
    
    # Test 1: Health check
    try:
        response = session.get(f"{BASE_URL}/health/")
        if response.status_code == 200:
            results["health"] = True
            print("✅ Health endpoint: WORKING")
        else:
            print(f"❌ Health endpoint: FAILED ({response.status_code})")
    except Exception as e:
        print(f"❌ Health endpoint: ERROR - {str(e)[:50]}...")
    
    # Test 2: User registration
    try:
        reg_data = {
            "pseudonym": f"TestUser{int(time.time())}",
            "password": "testpass123",
            "password_confirm": "testpass123",
            "account_type": "persistent"
        }
        response = session.post(f"{BASE_URL}/auth/register/", json=reg_data)
        if response.status_code in [200, 201]:
            results["registration"] = True
            print("✅ Registration: WORKING")
            # Save token for further tests
            global access_token
            data = response.json()
            access_token = data.get('tokens', {}).get('access', '')
        else:
            print(f"❌ Registration: FAILED ({response.status_code})")
            print(f"   Response: {response.text[:100]}...")
    except Exception as e:
        print(f"❌ Registration: ERROR - {str(e)[:50]}...")
    
    # Test 3: Login (if registration worked)
    if results["registration"]:
        try:
            login_data = {
                "pseudonym": reg_data["pseudonym"],
                "password": "testpass123"
            }
            response = session.post(f"{BASE_URL}/auth/login/", json=login_data)
            if response.status_code == 200:
                results["login"] = True
                print("✅ Login: WORKING")
            else:
                print(f"❌ Login: FAILED ({response.status_code})")
        except Exception as e:
            print(f"❌ Login: ERROR - {str(e)[:50]}...")
    
    # Test 4: Posts endpoint (if we have token)
    if access_token:
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = session.get(f"{BASE_URL}/posts/", headers=headers)
            if response.status_code == 200:
                results["posts"] = True
                print("✅ Posts endpoint: WORKING")
            else:
                print(f"❌ Posts endpoint: FAILED ({response.status_code})")
        except Exception as e:
            print(f"❌ Posts endpoint: ERROR - {str(e)[:50]}...")
    
    # Summary
    print("\n📊 Test Summary:")
    working = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"   {working}/{total} endpoints working")
    
    if working == total:
        print("🎉 ALL TESTS PASSED!")
        return True
    else:
        print("⚠️  Some tests failed")
        return False

if __name__ == "__main__":
    access_token = ""
    test_endpoints()
