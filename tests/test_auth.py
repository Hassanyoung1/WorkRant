#!/usr/bin/env python3
import requests
import json

def test_login():
    url = "http://localhost:8001/api/auth/login/"
    data = {
        "pseudonym": "testuser",
        "password": "testpass"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ LOGIN SUCCESS")
        else:
            print("❌ LOGIN FAILED")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR - Server not running")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_register():
    url = "http://localhost:8001/api/auth/register/"
    data = {
        "pseudonym": "testuser2",
        "password": "testpass123",
        "persistent": True
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"\n--- REGISTER TEST ---")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ REGISTER SUCCESS")
        else:
            print("❌ REGISTER FAILED")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR - Server not running")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    print("=== TESTING AUTHENTICATION ENDPOINTS ===")
    test_login()
    test_register()
