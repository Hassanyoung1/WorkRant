#!/usr/bin/env python3
"""
Simple test script to verify WorkRant backend API functionality.
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_api_endpoints():
    """Test basic API endpoints."""
    print("Testing WorkRant Backend API...")
    print("=" * 50)
    
    # Test 1: Root API endpoint
    print("1. Testing root API endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✓ Root API endpoint is accessible")
        else:
            print(f"   ✗ Unexpected status code: {response.status_code}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 2: User registration
    print("\n2. Testing user registration...")
    registration_data = {
        "pseudonym": "TestUser123",
        "persistent": True,
        "password": "testpass123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register/", 
            json=registration_data
        )
        print(f"   Status: {response.status_code}")
        if response.status_code in [200, 201]:
            print("   ✓ User registration successful")
            user_data = response.json()
            print(f"   User ID: {user_data.get('id', 'N/A')}")
            print(f"   Pseudonym: {user_data.get('pseudonym', 'N/A')}")
        else:
            print(f"   ✗ Registration failed: {response.text}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 3: User login
    print("\n3. Testing user login...")
    login_data = {
        "pseudonym": "TestUser123",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login/", 
            json=login_data
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✓ User login successful")
            token_data = response.json()
            access_token = token_data.get('access')
            if access_token:
                print("   ✓ JWT token received")
                return access_token
            else:
                print("   ✗ No access token in response")
        else:
            print(f"   ✗ Login failed: {response.text}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    return None

def test_authenticated_endpoints(token):
    """Test endpoints that require authentication."""
    if not token:
        print("\n⚠️ Skipping authenticated endpoint tests (no token)")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 4: Companies list
    print("\n4. Testing companies endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/companies/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            companies = response.json()
            print(f"   ✓ Companies endpoint accessible")
            print(f"   Companies count: {len(companies.get('results', companies)) if isinstance(companies, dict) else len(companies)}")
        else:
            print(f"   ✗ Failed to access companies: {response.text}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 5: Posts list
    print("\n5. Testing posts endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/posts/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            posts = response.json()
            print(f"   ✓ Posts endpoint accessible")
            print(f"   Posts count: {len(posts.get('results', posts)) if isinstance(posts, dict) else len(posts)}")
        else:
            print(f"   ✗ Failed to access posts: {response.text}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 6: Create a company
    print("\n6. Testing company creation...")
    company_data = {
        "name": "Test Company Inc",
        "industry": "Technology"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/companies/", 
            json=company_data,
            headers=headers
        )
        print(f"   Status: {response.status_code}")
        if response.status_code in [200, 201]:
            company = response.json()
            print("   ✓ Company created successfully")
            print(f"   Company slug: {company.get('slug', 'N/A')}")
            return company.get('id')
        else:
            print(f"   ✗ Company creation failed: {response.text}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    return None

def main():
    """Main test function."""
    try:
        # Test basic endpoints and authentication
        token = test_api_endpoints()
        
        # Test authenticated endpoints
        test_authenticated_endpoints(token)
        
        print("\n" + "=" * 50)
        print("API testing completed!")
        
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\nUnexpected error: {e}")

if __name__ == "__main__":
    main()
