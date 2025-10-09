#!/usr/bin/env python3
import requests
import json

def test_protected_endpoints():
    print("=== TESTING PROTECTED ENDPOINTS ===")
    
    # Test that posts require authentication
    print("\n--- Testing Posts (should be 401 without auth) ---")
    response = requests.get("http://localhost:8001/api/posts/")
    print(f"Posts without auth: {response.status_code}")
    if response.status_code == 401:
        print("✅ Posts properly protected")
    else:
        print("❌ Posts not protected properly")
    
    # Test that companies require authentication  
    print("\n--- Testing Companies (should be 401 without auth) ---")
    response = requests.get("http://localhost:8001/api/companies/")
    print(f"Companies without auth: {response.status_code}")
    if response.status_code == 401:
        print("✅ Companies properly protected")
    else:
        print("❌ Companies not protected properly")
    
    # Login to get a token
    print("\n--- Logging in to get access token ---")
    login_response = requests.post(
        "http://localhost:8001/api/auth/login/",
        json={"pseudonym": "testuser", "password": "testpass"},
        headers={"Content-Type": "application/json"}
    )
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        access_token = token_data["tokens"]["access"]
        print("✅ Login successful, got access token")
        
        # Test posts with authentication
        print("\n--- Testing Posts with auth token ---")
        auth_headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get("http://localhost:8001/api/posts/", headers=auth_headers)
        print(f"Posts with auth: {response.status_code}")
        if response.status_code == 200:
            print("✅ Posts accessible with valid token")
        else:
            print(f"❌ Posts failed with token: {response.text}")
        
        # Test companies with authentication
        print("\n--- Testing Companies with auth token ---")
        response = requests.get("http://localhost:8001/api/companies/", headers=auth_headers)
        print(f"Companies with auth: {response.status_code}")
        if response.status_code == 200:
            print("✅ Companies accessible with valid token")
        else:
            print(f"❌ Companies failed with token: {response.text}")
            
    else:
        print(f"❌ Login failed: {login_response.text}")

if __name__ == "__main__":
    test_protected_endpoints()
