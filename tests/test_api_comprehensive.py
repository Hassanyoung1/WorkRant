#!/usr/bin/env python3
"""
Comprehensive backend API test to verify all public endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoint(name, url, method="GET", data=None):
    """Test a single endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print(f"Method: {method}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS")
            try:
                data = response.json()
                if isinstance(data, list):
                    print(f"   Returned {len(data)} items")
                elif isinstance(data, dict):
                    print(f"   Keys: {list(data.keys())[:5]}")
            except:
                pass
        else:
            print(f"❌ FAILED: {response.text[:200]}")
            
        return response.status_code == 200
        
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def main():
    print("="*60)
    print("WORKRANT BACKEND API TEST SUITE")
    print("="*60)
    
    results = []
    
    # Test public endpoints (should work without auth)
    print("\n\n📋 TESTING PUBLIC ENDPOINTS (No Auth Required)")
    results.append(("API Root", test_endpoint("API Root", f"{BASE_URL}/")))
    results.append(("Posts List", test_endpoint("Posts List", f"{BASE_URL}/posts/")))
    results.append(("Companies List", test_endpoint("Companies List", f"{BASE_URL}/companies/")))
    
    # Test endpoints that should require auth for creation
    print("\n\n🔒 TESTING AUTHENTICATED ENDPOINTS")
    print("(These should return 401/403 without authentication)")
    
    test_data = {
        "content": "Test post",
        "company_name": "Test Company"
    }
    response = requests.post(f"{BASE_URL}/posts/create/", json=test_data, timeout=5)
    print(f"\nPost Creation (no auth): Status {response.status_code}")
    if response.status_code in [401, 403]:
        print("✅ Correctly requires authentication")
        results.append(("Post Creation Auth", True))
    else:
        print("❌ Should require authentication")
        results.append(("Post Creation Auth", False))
    
    # Summary
    print("\n\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\n{'='*60}")
    print(f"Results: {passed}/{total} tests passed")
    print(f"{'='*60}")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
