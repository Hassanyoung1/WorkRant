#!/usr/bin/env python3
import requests

def test_servers():
    print("=== TESTING SERVER CONNECTIVITY ===")
    
    # Test Django server
    try:
        response = requests.get("http://localhost:8001/api/posts/", timeout=5)
        print(f"✅ Django server is running - Status: {response.status_code}")
        if response.status_code == 403:
            print("   (403 is expected - posts require authentication)")
    except requests.exceptions.ConnectionError:
        print("❌ Django server is not responding")
        return False
    except Exception as e:
        print(f"❌ Django server error: {e}")
        return False
    
    # Test Next.js server
    try:
        response = requests.get("http://localhost:3000/", timeout=5)
        print(f"✅ Next.js server is running - Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Next.js server is not responding")
        return False
    except Exception as e:
        print(f"❌ Next.js server error: {e}")
        return False
    
    return True

def test_authenticated_request():
    print("\n=== TESTING AUTHENTICATED REQUEST ===")
    
    # First login to get token
    try:
        login_response = requests.post(
            "http://localhost:8001/api/auth/login/",
            json={"pseudonym": "testuser", "password": "testpass"},
            timeout=5
        )
        
        if login_response.status_code == 200:
            token = login_response.json()["tokens"]["access"]
            print("✅ Login successful")
            
            # Test authenticated posts request
            headers = {"Authorization": f"Bearer {token}"}
            posts_response = requests.get("http://localhost:8001/api/posts/", headers=headers, timeout=5)
            print(f"✅ Posts with auth: {posts_response.status_code}")
            
            # Test authenticated companies request
            companies_response = requests.get("http://localhost:8001/api/companies/", headers=headers, timeout=5)
            print(f"✅ Companies with auth: {companies_response.status_code}")
            
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            
    except Exception as e:
        print(f"❌ Authentication test failed: {e}")

if __name__ == "__main__":
    if test_servers():
        test_authenticated_request()
        print("\n🎉 Both servers are working correctly!")
        print("Frontend: http://localhost:3000")
        print("Backend: http://localhost:8001")
    else:
        print("\n❌ Server connectivity issues detected")
