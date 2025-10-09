#!/usr/bin/env python3
import requests

def quick_test():
    print("=== QUICK SERVER TEST ===")
    
    # Test Django
    try:
        response = requests.get("http://localhost:8001/api/auth/login/", timeout=2)
        print(f"✅ Django: {response.status_code}")
    except:
        print("❌ Django: Not responding")
    
    # Test Next.js
    try:
        response = requests.get("http://localhost:3001/", timeout=2)
        print(f"✅ Next.js: {response.status_code}")
    except:
        print("❌ Next.js: Not responding")

if __name__ == "__main__":
    quick_test()
