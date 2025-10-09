#!/usr/bin/env python3
import requests
import json

def test_backend():
    base_url = "http://localhost:8000/api"
    
    print("Testing Backend API Connection...")
    print("=" * 50)
    
    # Test 1: Check if backend is responding
    try:
        print("\n1. Testing root API endpoint...")
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
    except requests.exceptions.ConnectionError:
        print("   ERROR: Cannot connect to backend on port 8000")
        print("   Make sure Django server is running")
        return False
    except Exception as e:
        print(f"   ERROR: {e}")
        return False
    
    # Test 2: Check posts endpoint
    try:
        print("\n2. Testing posts endpoint...")
        response = requests.get(f"{base_url}/posts/", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict):
                print(f"   Posts count: {data.get('count', 0)}")
            elif isinstance(data, list):
                print(f"   Posts count: {len(data)}")
            else:
                print(f"   Response type: {type(data)}")
        else:
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    # Test 3: Check CORS headers
    try:
        print("\n3. Testing CORS headers...")
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'GET'
        }
        response = requests.options(f"{base_url}/posts/", headers=headers, timeout=5)
        print(f"   Status: {response.status_code}")
        cors_header = response.headers.get('Access-Control-Allow-Origin', 'Not set')
        print(f"   CORS Allow Origin: {cors_header}")
        print(f"   CORS Allow Credentials: {response.headers.get('Access-Control-Allow-Credentials', 'Not set')}")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    print("\n" + "=" * 50)
    print("Backend connection test complete!")
    return True

if __name__ == "__main__":
    test_backend()
