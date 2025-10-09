# WorkRant Authentication API Documentation

## Overview

WorkRant implements a fully self-hosted, secure, and anonymous JWT-based authentication system. The system supports both ephemeral (passwordless) and persistent (password-protected) accounts while maintaining strict privacy protections.

## Security Features

### Privacy Protection
- **No PII Storage**: No emails, phone numbers, or real names are stored
- **UUID Identification**: All users identified by UUIDs, not sequential IDs
- **Pseudonym-Only**: Users identified only by chosen pseudonyms
- **Recovery Tokens**: Secure hashed recovery tokens for account recovery

### Rate Limiting
- **Registration**: 5 registrations per minute per IP
- **Login**: 10 login attempts per minute per IP
- **Password Change**: 3 password changes per minute per user

### Token Security
- **JWT Tokens**: HS256 algorithm with secure signing keys
- **Token Rotation**: Refresh tokens automatically rotated
- **Token Expiration**: Access tokens expire in 1 hour, refresh tokens in 7 days
- **Blacklist Support**: Used tokens are blacklisted after rotation

## Authentication Flow

### Anonymous Users (Ephemeral Accounts)
1. Register with pseudonym only (no password)
2. Receive JWT tokens immediately
3. Account exists only as long as tokens are valid
4. Can upgrade to persistent account later

### Persistent Users (Password-Protected)
1. Register with pseudonym and password
2. Receive JWT tokens and recovery token
3. Can login with pseudonym/password or recovery token
4. Recovery token shown only once during registration

## API Endpoints

### POST /api/auth/register/
Create a new user account (anonymous or persistent).

**Rate Limit**: 5 requests per minute per IP

**Request Body**:
```json
{
  "pseudonym": "string (3-64 chars, required)",
  "persistent": "boolean (optional, default: false)",
  "password": "string (required if persistent=true)"
}
```

**Response (Success - 201)**:
```json
{
  "user": {
    "pseudonym": "TestUser123",
    "created_at": "2025-09-10T12:00:00Z",
    "is_anonymous_user": false
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "recovery_token": "abc123def456...",
  "recovery_warning": "Save this recovery token securely. It will not be shown again.",
  "disclaimer": "Opinions expressed are anonymous and unverified."
}
```

**Response (Error - 400)**:
```json
{
  "pseudonym": ["This pseudonym is already taken"],
  "password": ["Password is required for persistent accounts"]
}
```

### POST /api/auth/login/
Authenticate existing user with pseudonym and password or recovery token.

**Rate Limit**: 10 requests per minute per IP

**Request Body**:
```json
{
  "pseudonym": "string (required)",
  "password": "string (optional)",
  "recovery_token": "string (optional)"
}
```

**Note**: Either `password` or `recovery_token` must be provided.

**Response (Success - 200)**:
```json
{
  "user": {
    "pseudonym": "TestUser123",
    "created_at": "2025-09-10T12:00:00Z",
    "is_anonymous_user": false
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "disclaimer": "Opinions expressed are anonymous and unverified."
}
```

**Response (Error - 400)**:
```json
{
  "non_field_errors": ["Invalid credentials"]
}
```

### POST /api/auth/refresh/
Refresh JWT access token using refresh token.

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (Success - 200)**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "disclaimer": "Opinions expressed are anonymous and unverified."
}
```

### GET /api/auth/profile/
Get current user profile information.

**Authentication**: Required (Bearer token)

**Response (Success - 200)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "pseudonym": "TestUser123",
  "persistent": true,
  "created_at": "2025-09-10T12:00:00Z",
  "last_login": "2025-09-10T12:30:00Z",
  "is_banned": false,
  "post_count": 5,
  "comment_count": 12
}
```

### POST /api/auth/password/change/
Change or set user password.

**Authentication**: Required (Bearer token)
**Rate Limit**: 3 requests per minute per user

**Request Body**:
```json
{
  "old_password": "string (optional, required for persistent accounts)",
  "new_password": "string (required)",
  "recovery_token": "string (optional, alternative to old_password)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Password updated successfully",
  "recovery_token": "new-recovery-token-here",
  "recovery_warning": "Save this recovery token securely. It will not be shown again.",
  "disclaimer": "Opinions expressed are anonymous and unverified."
}
```

### DELETE /api/auth/delete/
Delete user account (soft delete).

**Authentication**: Required (Bearer token)

**Response (Success - 200)**:
```json
{
  "message": "Account deleted successfully",
  "disclaimer": "Your posts and comments remain but are now fully anonymous."
}
```

### GET /api/auth/check-auth/
Check current authentication status.

**Authentication**: Required (Bearer token)

**Response (Success - 200)**:
```json
{
  "authenticated": true,
  "user": {
    "pseudonym": "TestUser123",
    "created_at": "2025-09-10T12:00:00Z",
    "is_anonymous_user": false
  },
  "disclaimer": "Opinions expressed are anonymous and unverified."
}
```

### GET /api/auth/user/{pseudonym}/
Get public profile of user by pseudonym.

**Authentication**: Not required

**Response (Success - 200)**:
```json
{
  "pseudonym": "TestUser123",
  "created_at": "2025-09-10T12:00:00Z",
  "is_anonymous_user": false
}
```

## JWT Token Usage

### Authorization Header
Include the access token in the Authorization header for authenticated requests:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Token Payload
Access tokens contain:
- `user_id`: User's UUID
- `pseudonym`: User's pseudonym
- `exp`: Token expiration timestamp
- `iat`: Token issued at timestamp
- `jti`: JWT ID for blacklisting

### Token Refresh
- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days
- Use `/api/auth/refresh/` to get new tokens
- Refresh tokens are rotated on each refresh

## Error Handling

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Successful registration
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or missing authentication
- `403 Forbidden`: Account banned or insufficient permissions
- `404 Not Found`: User not found
- `429 Too Many Requests`: Rate limit exceeded

### Rate Limit Headers
When rate limited, responses include:
```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1694347200
```

## Security Best Practices

### For Frontend Developers
1. **Store Tokens Securely**: Use secure, httpOnly cookies or secure storage
2. **Handle Token Expiration**: Implement automatic token refresh
3. **Validate Responses**: Always check for error responses
4. **Rate Limit Awareness**: Handle 429 responses gracefully
5. **Recovery Token Storage**: Prompt users to save recovery tokens securely

### Pseudonym Guidelines
- Must be 3-64 characters long
- Cannot contain @ symbol
- Cannot be reserved words (admin, root, moderator, workrant)
- Must be unique across all users
- Case-insensitive uniqueness check

## Example Implementation

### JavaScript/TypeScript Frontend Example

```javascript
class WorkRantAuth {
  constructor(baseURL = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  async register(pseudonym, persistent = false, password = null) {
    const response = await fetch(`${this.baseURL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pseudonym, persistent, password }),
    });

    if (response.status === 429) {
      throw new Error('Too many registration attempts. Please try again later.');
    }

    const data = await response.json();
    
    if (response.ok) {
      this.setTokens(data.tokens.access, data.tokens.refresh);
      if (data.recovery_token) {
        // Prompt user to save recovery token
        alert(`IMPORTANT: Save this recovery token: ${data.recovery_token}`);
      }
      return data;
    } else {
      throw new Error(data.detail || 'Registration failed');
    }
  }

  async login(pseudonym, password = null, recoveryToken = null) {
    const response = await fetch(`${this.baseURL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pseudonym,
        password,
        recovery_token: recoveryToken,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      this.setTokens(data.tokens.access, data.tokens.refresh);
      return data;
    } else {
      throw new Error(data.detail || 'Login failed');
    }
  }

  async refreshTokens() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: this.refreshToken }),
    });

    const data = await response.json();
    
    if (response.ok) {
      this.setTokens(data.access, data.refresh);
      return data;
    } else {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }
  }

  async authenticatedRequest(url, options = {}) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (response.status === 401) {
      // Try to refresh token
      try {
        await this.refreshTokens();
        // Retry the original request
        return await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });
      } catch (error) {
        this.clearTokens();
        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated() {
    return !!this.accessToken;
  }
}
```

## Migration from Supabase

### Database Schema Compatibility
The current User model is already compatible with the requirements:
- UUID primary keys ✓
- Pseudonym-based identification ✓
- Optional password storage ✓
- Recovery token support ✓
- No PII storage ✓

### Existing Data Preservation
All existing posts, comments, and votes remain linked to user UUIDs. No data migration is required as the system was already designed with privacy in mind.

### Frontend Migration Steps
1. Replace Supabase auth client with WorkRant auth client
2. Update authentication flow to use new endpoints
3. Update token storage and refresh logic
4. Update error handling for new response format
5. Test all authentication scenarios

This authentication system provides enterprise-grade security while maintaining the privacy-first approach that WorkRant requires.
