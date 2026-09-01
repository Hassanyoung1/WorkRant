# WorkRant Technical Documentation

## 1. Document Control

- Project: WorkRant
- Type: Anonymous workplace review and discussion platform
- Stack: Next.js frontend, Django REST API, SQLite for local development, PostgreSQL-ready for production
- Status: Active development
- Last reviewed: 2026-09-01

## 2. Purpose and Scope

WorkRant is a platform for employees and job seekers to share anonymous, experience-based feedback about employers, workplace culture, leadership, and day-to-day work conditions. The product is designed to support honest discussion while preserving user privacy through pseudonymous identity and controlled account security.

This documentation covers:

- System overview and architecture
- Frontend and backend responsibilities
- Security and privacy model
- Configuration and environment management
- Development and testing workflows
- Deployment constraints and operational considerations

This document is intended for developers, maintainers, and operators who need to understand the production characteristics of the application and make safe changes.

## 3. System Architecture

WorkRant follows a decoupled client-server architecture:

- Frontend: Next.js 15 app using React, TypeScript, and Tailwind CSS
- Backend: Django + Django REST Framework + SimpleJWT
- API layer: REST endpoints for authentication, posts, companies, comments, and moderation
- Data layer: SQLite in development; relational database compatible with production deployment requirements
- Media handling: local media storage in development with support for file uploads at the API layer

### High-Level Flow

1. The user interacts with the Next.js frontend.
2. The frontend calls the backend through the API gateway layer in `src/lib/api.ts`.
3. Django validates requests, applies business logic, and returns structured JSON responses.
4. JWT tokens are issued for authentication and refreshed via dedicated refresh endpoints.
5. Content is stored in Django models and exposed through REST serializers and API views.

## 4. Repository Structure

```text
WorkRant/
├── src/                          # Next.js frontend source
│   ├── app/                     # App Router pages and route-level layouts
│   ├── components/              # Reusable React components
│   ├── contexts/                # Authentication and shared app state
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # Shared libraries and API client logic
│   └── types/                   # TypeScript domain types
├── workrant_backend/            # Django backend project
│   ├── accounts/                # Authentication and user accounts
│   ├── companies/               # Company records and search logic
│   ├── moderation/              # Reporting and moderation functions
│   ├── posts/                   # Posts, comments, votes, and content feeds
│   ├── workrant_backend/        # Django project settings and root URLs
│   ├── manage.py                # Django management entry point
│   └── requirements*.txt        # Python dependencies
├── docs/                        # Product and technical documentation
├── rules/                       # Engineering and security standards
├── tests/                       # End-to-end and API validation scripts
├── public/                      # Static assets
├── package.json                 # Frontend package manifest
├── next.config.js               # Next.js runtime configuration
├── tailwind.config.ts           # Tailwind configuration
├── README.md                    # Project entry point
├── .env.example                 # Environment template
├── .env.test                    # Test config
└── Dockerfile                   # Container runtime definition
```

## 5. Frontend Architecture

### 5.1 Framework and Runtime

The frontend uses:

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS

### 5.2 Core Frontend Responsibilities

- Server-rendered application shell and route structure
- Auth state management and persistence in browser storage
- REST requests through a centralized API service
- Page-level composition of data and UI widgets
- Concern separation between presentation and API interaction

### 5.3 Detailed module-by-module frontend map

#### Application shell and styling

- [src/app/layout.tsx](../src/app/layout.tsx)
  - Defines the global application shell.
  - Applies the DM Sans font and the root HTML/body structure.
  - Wraps the app in the auth provider so all pages can read current user state.
  - Uses a CSP metadata hook to define the content security policy for the app shell.

- [src/app/globals.css](../src/app/globals.css)
  - Contains design tokens such as color palette, spacing, button styles, input styling, and typography defaults.
  - Sets the overall light warm aesthetic used across the application.
  - Standardizes base selectors such as button, input, and text colors.

- [src/app/page.tsx](../src/app/page.tsx)
  - Defines the landing page shown to unauthenticated users and the authenticated home dashboard.
  - Uses the auth context to change the page experience depending on whether a user is logged in.
  - Displays marketing content, stats, and a feed entry point for anonymous community content.

#### Authentication flow

- [src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx)
  - Central React context for auth state.
  - Maintains the current user object, loading state, and error messages.
  - Provides `login`, `register`, and `logout` functions that interact with the API layer.
  - Persists important values such as `user`, `access_token`, and `refresh_token` in browser storage.
  - Dispatches logout events when the session expires.

- [src/components/LoginForm.tsx](../src/components/LoginForm.tsx)
  - Renders the login form UI.
  - Validates pseudonym and password before sending the request.
  - Calls the auth context to authenticate the user and then redirects to the home page on success.

- [src/components/RegisterForm.tsx](../src/components/RegisterForm.tsx)
  - Renders the registration form.
  - Validates the pseudonym, password policy, and confirmation logic.
  - Uses privacy detection to warn users when their chosen pseudonym looks like personal data.
  - Sends the register request and converts backend duplicate-name errors into a readable user-facing message.

- [src/app/login/page.tsx](../src/app/login/page.tsx)
  - Route-level login screen.
  - Redirects logged-in users away from the page.
  - Displays the login form within the branded auth layout.

- [src/app/register/page.tsx](../src/app/register/page.tsx)
  - Route-level registration screen.
  - Redirects logged-in users away from the page.
  - Hosts the registration card and image/branding layout.

#### API client layer

- [src/lib/api.ts](../src/lib/api.ts)
  - Central fetch wrapper for all frontend API calls.
  - Builds URLs from the configured backend base URL.
  - Adds Authorization headers to protected endpoints when access tokens exist.
  - Detects 401 responses and triggers a refresh flow automatically.
  - Normalizes backend validation payloads into human-readable error text.
  - Exposes structured helpers for auth, posts, comments, companies, and moderation activities.

- [src/lib/pii-detector.ts](../src/lib/pii-detector.ts)
  - Lightweight privacy scanner for user-entered content.
  - Detects patterns such as emails, phone numbers, full names, SSNs, and card numbers.
  - Can sanitize detected text or block submission when high-risk PII is found.
  - This is a client-side protective mechanism aimed at helping users avoid accidentally posting identifying information.

#### Feed and content display

- [src/components/PostFeed.tsx](../src/components/PostFeed.tsx)
  - Loads the list of posts from the backend.
  - Handles filters, loading state, empty states, and pagination.
  - Lets authenticated users open a composer and create new posts from the main feed.
  - Updates local post state after new posts or votes are created.

- [src/components/PostCard.tsx](../src/components/PostCard.tsx)
  - renders a single post item in the feed.
  - shows author pseudonym, type badge, date, company link, voting controls, and media attachments.
  - supports optimistic vote updates and reverts them if the backend request fails.
  - includes a report action for moderation.

- [src/components/CommentSection.tsx](../src/components/CommentSection.tsx)
  - Loads and renders comments for a post.
  - Supports nested discussion and display of visible thread content.

- [src/components/PostForm.tsx](../src/components/PostForm.tsx)
  - Handles creation of a new post.
  - Validates length and content rules before submit.
  - Supports optional image upload and tag selection.

- [src/components/ReportModal.tsx](../src/components/ReportModal.tsx)
  - Modal that allows a user to report suspicious or inappropriate content.
  - Collects a report reason and submits it to the moderation API.

- [src/components/Header.tsx](../src/components/Header.tsx)
  - Main navigation surface for the app.
  - Changes its state depending on whether the user is logged in.
  - Includes primary actions such as login, register, profile, and logout.

- [src/components/Disclaimer.tsx](../src/components/Disclaimer.tsx)
  - Provides the legal and trust disclaimer shown with user-generated content.
  - Keeps the content warning consistent across the UI.

- [src/components/ErrorBoundary.tsx](../src/components/ErrorBoundary.tsx)
  - Catches render-time React failures and prevents the entire app from crashing.

#### Domain data model

- [src/types/index.ts](../src/types/index.ts)
  - Defines the TypeScript interfaces used across the frontend.
  - Centralizes shapes for `User`, `Post`, `Comment`, `Company`, auth payloads, and forms.
  - Keeps client-side state strongly typed and reduces silent API contract mismatches.

### 5.4 Frontend Security Considerations

- Access tokens are stored in browser storage and refreshed using a client-side token flow.
- Protected endpoints are identified at the API service layer.
- Sensitive user inputs are checked through the PII detector before submission.
- The app should not treat client storage as the sole security boundary; backend validation remains authoritative.

## 6. Backend Architecture

### 6.1 Framework and Runtime

The backend uses:

- Django
- Django REST Framework
- Django REST Framework SimpleJWT
- SQLite for local development

### 6.2 Core Backend Components

- `accounts/`: user account lifecycle, auth endpoints, password handling, pseudonym validation, and profile APIs
- `posts/`: post creation, feed retrieval, votes, comments, and moderation interaction
- `companies/`: company profiles and company-related content queries
- `moderation/`: reporting and moderation actions
- `workrant_backend/`: root project config, global URL routing, and API bootstrap

### 6.3 Detailed module-by-module backend map

#### Routing and bootstrap

- [workrant_backend/workrant_backend/urls.py](../workrant_backend/workrant_backend/urls.py)
  - Root Django URL configuration for the project.
  - Exposes `/api/` endpoints and includes the app-level URL modules for accounts, posts, companies, and moderation.
  - Adds the admin route and health route.
  - Sets up media and static file serving in debug mode.

- [workrant_backend/accounts/urls.py](../workrant_backend/accounts/urls.py)
  - Maps auth-related API routes to their view classes.
  - Provides endpoints for register, login, refresh, profile, password change, and account deletion.

- [workrant_backend/posts/urls.py](../workrant_backend/posts/urls.py)
  - Maps post-related routes for retrieving feeds, creating posts, voting, and commenting.
  - Includes listing, single-item retrieval, and user-scoped queries.

#### Authentication and identity

- [workrant_backend/accounts/models.py](../workrant_backend/accounts/models.py)
  - Defines the custom `User` model.
  - Uses pseudonym-based identity instead of email-based usernames.
  - Stores `pseudonym_normalized` so lookups are case-insensitive.
  - Stores a hashed recovery token for persistent accounts.
  - Adds helper methods for setting, validating, and displaying recovery data.

- [workrant_backend/accounts/serializers.py](../workrant_backend/accounts/serializers.py)
  - Validates registration, login, password changes, and profile data.
  - Enforces pseudonym constraints and uniqueness rules.
  - Performs the actual duplicate-check logic using normalized pseudonym values.
  - Creates the new user object while keeping password hashing and recovery token logic within the backend rules.

- [workrant_backend/accounts/views.py](../workrant_backend/accounts/views.py)
  - Implements authentication endpoints for registration, login, refresh, profile, password change, and deletion.
  - Uses `RefreshToken` from SimpleJWT to issue tokens.
  - Sets httpOnly cookies through `set_auth_cookies` so the browser can keep session state secure.
  - Implements custom refresh logic that accepts either payload or cookie refresh tokens.

#### Content creation and discussion

- [workrant_backend/posts/models.py](../workrant_backend/posts/models.py)
  - Defines `Post`, `Comment`, and `Vote` models.
  - Stores post body, metadata, moderation flags, and vote counts.
  - Uses validators to reject obvious PII in content.
  - Keeps records soft-deletable for compliance and moderation operations.

- [workrant_backend/posts/serializers.py](../workrant_backend/posts/serializers.py)
  - Serializes post and comment data for API responses.
  - Converts model records into API-safe JSON payloads for frontend consumption.
  - Allows nested post detail responses, including public user pseudonyms and company info.

- [workrant_backend/posts/views.py](../workrant_backend/posts/views.py)
  - Implements listing, creation, retrieval, voting, and commenting logic.
  - Applies permission checks for public read endpoints and authenticated write endpoints.
  - Enforces moderation filters to hide deleted or hidden posts.

#### Company and moderation domain

- [workrant_backend/companies/models.py](../workrant_backend/companies/models.py)
  - Defines the company entity and rating structure used by the review platform.
  - Creates a unique slug for each company name.
  - Stores user rating dimensions for fairness, work-life balance, and management toxicity.

- [workrant_backend/moderation/models.py](../workrant_backend/moderation/models.py)
  - Tracks reported content and moderation actions.
  - Permits administrators or review workflows to assess and manage suspicious activity.

### 6.3 Auth Model

Authentication is built around JWT tokens with httpOnly cookies and access/refresh token issuance. The refresh flow is implemented in `CustomTokenRefreshView` and accepts a refresh token either from JSON payload or cookie storage to support multiple client behaviors.

This makes the backend compatible with both:

- browser-based API use with cookie state,
- client-managed token flows with JSON payloads.

### 6.4 Key Security Controls

- Minimum pseudonym length validation
- Reserved-name filtering
- Duplicate pseudonym rejection
- PII detection rules at the app and validation layers
- httpOnly cookie support for auth transport
- Recovery token handling for persistent accounts
- Account bans and authentication checks enforced in serializer and view logic

## 7. Data Model Overview

The project uses relational models for users, posts, comments, companies, and moderation data.

### 7.1 Users

- `User` stores pseudonym, persistent account status, password hash, and related metadata.
- Pseudonyms are normalized for uniqueness checks to prevent case-only duplicate accounts.
- Recovery tokens are generated for persistent users and must be handled with care.

### 7.2 Posts

- Posts are authored by users and include content, optional company references, tags, and media.
- Posts can be queried by user, trending status, and company association.
- Votes and comment threads are supported as relationship-based content interactions.

### 7.3 Companies and Moderation

- Company records provide structured business references for review content.
- Moderation components allow content reporting and review workflows.

## 8. API Layer

The project exposes a REST API under `/api/` with routes such as:

- `/api/auth/register/`
- `/api/auth/login/`
- `/api/auth/refresh/`
- `/api/auth/profile/`
- `/api/posts/`
- `/api/posts/create/`
- `/api/posts/<uuid>/comments/`
- `/api/companies/`
- `/api/moderation/report/`

### API Design Principles

- Use clear resource nouns and predictable route patterns.
- Keep auth and public routes explicit.
- Return JSON with consistent error semantics.
- Validate at both serializer and view boundaries.
- Maintain server-side authority over every privileged action.

## 9. Configuration and Environment

### Frontend Environment

The frontend relies on environment variables such as:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_BACKEND_URL`

These values determine which backend instance the web app targets.

### Backend Environment

The Django backend expects environment configuration for:

- database connection settings
- secret key configuration
- allowed hosts and CORS settings
- media storage settings
- production deployment variables

The project contains `.env.example` and `.env.test` files to guide local configuration.

## 10. Development Workflow

### Frontend

```bash
cd /home/hassanyoung1/WorkRant
npm install
npm run dev
```

### Backend

```bash
cd /home/hassanyoung1/WorkRant/workrant_backend
. .venv/bin/activate
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Verification Commands

```bash
cd /home/hassanyoung1/WorkRant/workrant_backend
.venv/bin/python manage.py test accounts.tests --verbosity 2

cd /home/hassanyoung1/WorkRant
npm run build
```

## 11. Testing Strategy

The project includes a mix of backend tests and project-level smoke checks.

### Backend

Use Django test cases for endpoint behavior and regression validation, especially around:

- authentication flows
- JWT refresh behavior
- registration validation
- root API routing

### Frontend

Run Next.js build verification for integration correctness and static route generation.

### Recommended Testing Practices

- Add regression tests for authentication and validation changes.
- Validate key user flows end-to-end for auth, posts, comments, and company lookup.
- Keep API contract expectations versioned and testable.

## 12. Deployment Considerations

### 12.1 Local Development

- Frontend: local dev server on port 3000 or configured equivalent
- Backend: Django local server on port 8000

### 12.2 Production Deployment Pattern

The project is structured to support a common decoupled deployment model:

- Frontend deployed to a static or edge-capable host
- Backend deployed as a Django application service
- Media and database resources managed through environment-specific configuration

### 12.3 Operational Notes

- Use secure secret management for production environment variables.
- Restrict CORS and trusted origins.
- Treat JWT and recovery tokens as sensitive credentials.
- Do not expose internal errors in production responses.
- Make logs and monitoring available for auth and API failures.

## 13. Security Model

The application should be operated under the assumption that all user data is sensitive and should be protected by default.

### Required Security Behaviors

- Validate all incoming data at the API layer.
- Normalize and enforce pseudonym uniqueness.
- Reject PII in sensitive fields when policy requires it.
- Use secure transport and secure secret storage for production.
- Ensure tokens are rotated and refreshed correctly.
- Limit account recovery flows to trusted channels.

## 14. Maintainability and Code Quality

The codebase is organized to support maintainability through:

- separation of frontend and backend concerns,
- centralized API handling,
- reusable serializers and view layers,
- domain-specific app organization,
- documentation in `docs/` and `rules/`.

### Recommended Maintenance Practices

- Keep docs in sync with code changes.
- Prefer explicit validation over implicit behavior.
- Add tests for auth and route changes before release.
- Review token handling and privacy-sensitive flows in every release.

## 15. Known Operational Risks

- Client-side token persistence can expose refresh credentials if browser security is compromised.
- Recovery tokens are highly sensitive and should never be treated as disposable.
- Duplicate pseudonym checks must remain strict to avoid identity collisions.
- Production config should not rely on SQLite without proper operational review.

## 16. Conclusion

WorkRant is a privacy-aware, anonymous workplace review platform built on a modern full-stack architecture. The system is intentionally split between a Next.js frontend and Django backend to promote maintainability, secure auth flows, and scalable API behavior.

The project is most robust when:

- environment configuration is managed carefully,
- auth and privacy rules remain centralized,
- API behavior is covered by regression tests,
- and deployment configuration is reviewed before production rollout.

This documentation should be used as the baseline reference for future development, testing, and operational maintenance.
