#!/usr/bin/env python3
"""
Comprehensive test script for WorkRant Authentication API.

Tests all authentication endpoints, JWT functionality, and security features.
"""

import requests
import json
import time
import secrets
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

class AuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_pseudonym = f"TestUser{secrets.randbelow(10000)}"
        self.test_password = "SecureTest123!"
        self.access_token = None
        self.refresh_token = None
        self.recovery_token = None
        
    def log(self, message, success=True):
        """Log test results with timestamp."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        status = "✓" if success else "✗"
        print(f"[{timestamp}] {status} {message}")
    
    def test_anonymous_registration(self):
        """Test anonymous user registration (no password)."""
        print("\n" + "="*60)
        print("Testing Anonymous User Registration")
        print("="*60)
        
        # Test anonymous registration
        data = {
            "pseudonym": f"AnonymousUser{secrets.randbelow(10000)}",
            "persistent": False
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/register/", json=data)
            
            if response.status_code == 201:
                result = response.json()
                self.log("Anonymous registration successful")
                self.log(f"Pseudonym: {result['user']['pseudonym']}")
                self.log(f"Is anonymous: {result['user']['is_anonymous_user']}")
                self.log(f"Received access token: {bool(result['tokens']['access'])}")
                self.log(f"Received refresh token: {bool(result['tokens']['refresh'])}")
                
                if 'recovery_token' in result:
                    self.log("⚠️  Anonymous user received recovery token (unexpected)", False)
                else:
                    self.log("No recovery token for anonymous user (correct)")
                
                return True
            else:
                self.log(f"Registration failed: {response.status_code} - {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Registration error: {e}", False)
            return False
    
    def test_persistent_registration(self):
        """Test persistent user registration (with password)."""
        print("\n" + "="*60)
        print("Testing Persistent User Registration")
        print("="*60)
        
        data = {
            "pseudonym": self.test_pseudonym,
            "persistent": True,
            "password": self.test_password
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/register/", json=data)
            
            if response.status_code == 201:
                result = response.json()
                self.access_token = result['tokens']['access']
                self.refresh_token = result['tokens']['refresh']
                self.recovery_token = result.get('recovery_token')
                
                self.log("Persistent registration successful")
                self.log(f"Pseudonym: {result['user']['pseudonym']}")
                self.log(f"Is anonymous: {result['user']['is_anonymous_user']}")
                self.log(f"Received access token: {bool(self.access_token)}")
                self.log(f"Received refresh token: {bool(self.refresh_token)}")
                
                if self.recovery_token:
                    self.log("Received recovery token (correct)")
                    self.log(f"Recovery token length: {len(self.recovery_token)}")
                else:
                    self.log("No recovery token received (unexpected)", False)
                
                return True
            else:
                self.log(f"Registration failed: {response.status_code} - {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Registration error: {e}", False)
            return False
    
    def test_login_with_password(self):
        """Test login with pseudonym and password."""
        print("\n" + "="*60)
        print("Testing Login with Password")
        print("="*60)
        
        data = {
            "pseudonym": self.test_pseudonym,
            "password": self.test_password
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/login/", json=data)
            
            if response.status_code == 200:
                result = response.json()
                self.access_token = result['tokens']['access']
                self.refresh_token = result['tokens']['refresh']
                
                self.log("Password login successful")
                self.log(f"Pseudonym: {result['user']['pseudonym']}")
                self.log(f"New access token: {bool(self.access_token)}")
                self.log(f"New refresh token: {bool(self.refresh_token)}")
                
                return True
            else:
                self.log(f"Login failed: {response.status_code} - {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Login error: {e}", False)
            return False
    
    def test_login_with_recovery_token(self):
        """Test login with recovery token."""
        print("\n" + "="*60)
        print("Testing Login with Recovery Token")
        print("="*60)
        
        if not self.recovery_token:
            self.log("No recovery token available for testing", False)
            return False
        
        data = {
            "pseudonym": self.test_pseudonym,
            "recovery_token": self.recovery_token
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/login/", json=data)
            
            if response.status_code == 200:
                result = response.json()
                self.log("Recovery token login successful")
                self.log(f"Pseudonym: {result['user']['pseudonym']}")
                
                return True
            else:
                self.log(f"Recovery login failed: {response.status_code} - {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Recovery login error: {e}", False)
            return False
    
    def test_token_refresh(self):
        """Test JWT token refresh."""
        print("\n" + "="*60)
        print("Testing Token Refresh")
        print("="*60)
        
        if not self.refresh_token:
            self.log("No refresh token available for testing", False)
            return False
        
        data = {"refresh": self.refresh_token}
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/refresh/", json=data)
            
            if response.status_code == 200:
                result = response.json()
                old_access = self.access_token
                self.access_token = result['access']
                
                if 'refresh' in result:
                    self.refresh_token = result['refresh']
                    self.log("Token refresh successful with rotation")
                else:
                    self.log("Token refresh successful without rotation")
                
                self.log(f"New access token: {self.access_token[:20]}...")
                self.log(f"Token changed: {old_access != self.access_token}")
                
                return True
            else:
                self.log(f"Token refresh failed: {response.status_code} - {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Token refresh error: {e}", False)
            return False
    
    def test_authenticated_request(self):
        """Test authenticated API requests."""
        print("\n" + "="*60)
        print("Testing Authenticated Requests")
        print("="*60)
        
        if not self.access_token:
            self.log("No access token available for testing", False)
            return False
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        try:
            # Test profile endpoint
            response = self.session.get(f"{BASE_URL}/auth/profile/", headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                self.log("Authenticated profile request successful")
                self.log(f"User ID: {result['id']}")
                self.log(f"Pseudonym: {result['pseudonym']}")
                self.log(f"Post count: {result['post_count']}")
                self.log(f"Comment count: {result['comment_count']}")
                
                return True
            else:
                self.log(f"Profile request failed: {response.status_code} - {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Authenticated request error: {e}", False)
            return False
    
    def test_password_change(self):
        """Test password change functionality."""
        print("\n" + "="*60)
        print("Testing Password Change")
        print("="*60)
        
        if not self.access_token:
            self.log("No access token available for testing", False)
            return False
        
        new_password = "NewSecurePassword456!"
        data = {
            "old_password": self.test_password,
            "new_password": new_password
        }
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        try:
            response = self.session.post(f"{BASE_URL}/auth/password/change/", json=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                self.recovery_token = result.get('recovery_token')
                self.test_password = new_password  # Update for future tests
                
                self.log("Password change successful")
                self.log(f"New recovery token: {bool(self.recovery_token)}")
                
                return True
            else:
                self.log(f"Password change failed: {response.status_code} - {response.text}", False)
                return False
                
        except Exception as e:
            self.log(f"Password change error: {e}", False)
            return False
    
    def test_rate_limiting(self):
        """Test rate limiting on authentication endpoints."""
        print("\n" + "="*60)
        print("Testing Rate Limiting")
        print("="*60)
        
        # Test registration rate limiting
        self.log("Testing registration rate limiting...")
        rate_limited = False
        
        for i in range(7):  # Try 7 registrations (limit is 5/minute)
            data = {
                "pseudonym": f"RateTestUser{i}_{secrets.randbelow(1000)}",
                "persistent": False
            }
            
            response = self.session.post(f"{BASE_URL}/auth/register/", json=data)
            
            if response.status_code == 429:
                rate_limited = True
                self.log(f"Rate limited after {i+1} attempts")
                break
            elif response.status_code == 201:
                self.log(f"Registration {i+1} succeeded")
            else:
                self.log(f"Registration {i+1} failed: {response.status_code}")
        
        if rate_limited:
            self.log("Rate limiting is working correctly")
            return True
        else:
            self.log("Rate limiting may not be working", False)
            return False
    
    def test_invalid_credentials(self):
        """Test invalid login attempts."""
        print("\n" + "="*60)
        print("Testing Invalid Credentials")
        print("="*60)
        
        # Test invalid pseudonym
        data = {
            "pseudonym": "NonExistentUser12345",
            "password": "wrongpassword"
        }
        
        response = self.session.post(f"{BASE_URL}/auth/login/", json=data)
        
        if response.status_code == 400:
            self.log("Invalid pseudonym correctly rejected")
        else:
            self.log(f"Invalid pseudonym test failed: {response.status_code}", False)
        
        # Test invalid password
        data = {
            "pseudonym": self.test_pseudonym,
            "password": "wrongpassword"
        }
        
        response = self.session.post(f"{BASE_URL}/auth/login/", json=data)
        
        if response.status_code == 400:
            self.log("Invalid password correctly rejected")
            return True
        else:
            self.log(f"Invalid password test failed: {response.status_code}", False)
            return False
    
    def test_pseudonym_validation(self):
        """Test pseudonym validation rules."""
        print("\n" + "="*60)
        print("Testing Pseudonym Validation")
        print("="*60)
        
        test_cases = [
            ("ab", False, "Too short"),
            ("user@domain.com", False, "Contains @ symbol"),
            ("admin", False, "Reserved word"),
            ("root", False, "Reserved word"),
            ("ValidPseudonym123", True, "Valid pseudonym"),
            ("user_name", True, "Valid with underscore"),
            ("UserName", True, "Valid with capitals"),
        ]
        
        success_count = 0
        
        for pseudonym, should_succeed, description in test_cases:
            data = {
                "pseudonym": pseudonym,
                "persistent": False
            }
            
            response = self.session.post(f"{BASE_URL}/auth/register/", json=data)
            
            if should_succeed and response.status_code == 201:
                self.log(f"{description}: Correctly accepted")
                success_count += 1
            elif not should_succeed and response.status_code == 400:
                self.log(f"{description}: Correctly rejected")
                success_count += 1
            else:
                self.log(f"{description}: Unexpected result ({response.status_code})", False)
        
        return success_count == len(test_cases)
    
    def run_all_tests(self):
        """Run all authentication tests."""
        print("🚀 Starting WorkRant Authentication Tests")
        print("=" * 80)
        
        tests = [
            ("Anonymous Registration", self.test_anonymous_registration),
            ("Persistent Registration", self.test_persistent_registration),
            ("Password Login", self.test_login_with_password),
            ("Recovery Token Login", self.test_login_with_recovery_token),
            ("Token Refresh", self.test_token_refresh),
            ("Authenticated Requests", self.test_authenticated_request),
            ("Password Change", self.test_password_change),
            ("Rate Limiting", self.test_rate_limiting),
            ("Invalid Credentials", self.test_invalid_credentials),
            ("Pseudonym Validation", self.test_pseudonym_validation),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log(f"{test_name} failed with exception: {e}", False)
        
        print("\n" + "="*80)
        print(f"🎯 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All authentication tests passed!")
        else:
            print(f"⚠️  {total - passed} tests failed")
        
        print("="*80)


def main():
    """Main test runner."""
    tester = AuthTester()
    tester.run_all_tests()


if __name__ == "__main__":
    main()
