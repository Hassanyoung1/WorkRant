# WorkRant Project Structure

## 📁 Directory Organization

### `/workrant_backend/` - Django Backend
- **Purpose**: RESTful API server with JWT authentication
- **Framework**: Django + Django REST Framework
- **Key Features**: User management, posts, companies, moderation
- **Configuration**: Environment-based settings, SQLite/PostgreSQL support

### `/workrant_frontend/` - Next.js Frontend  
- **Purpose**: React-based web application
- **Framework**: Next.js 15 with TypeScript
- **Key Features**: Dark theme UI, responsive design, API integration
- **Configuration**: Environment-based API endpoints

### `/docs/` - Documentation
- **Purpose**: Project documentation, guides, and specifications
- **Contents**:
  - `/docs/specs/` - Technical specifications and audit reports
  - `/docs/guides/` - Implementation guides and tutorials

### `/tests/` - Test Suite
- **Purpose**: Automated testing and validation scripts
- **Contents**: 
  - API integration tests
  - Authentication tests
  - Connectivity tests
  - Comment system tests
  - Protection and security tests

### `/scripts/` - Automation Scripts
- **Purpose**: Utility scripts for development and deployment
- **Contents**: Shell scripts, automation tools, helper utilities

### `/logs/` - Application Logs
- **Purpose**: Server logs and application output
- **Contents**: Development and production log files

### `/rules/` - Project Guidelines
- **Purpose**: Development rules, guidelines, and best practices
- **Contents**: Coding standards, security checklists, contribution guides

### `/venv/` - Python Virtual Environment
- **Purpose**: Isolated Python dependencies for backend development
- **Note**: Excluded from version control

---

## 📋 File Organization Details

### Documentation Structure (`/docs/`)

#### Specifications (`/docs/specs/`)
- `PROJECT_SPEC.md` - Main project specification
- `SECURITY_AUDIT_REPORT.md` - Comprehensive security audit and improvements
- `BACKEND_STATUS.md` - Backend implementation status

#### Guides (`/docs/guides/`)
- **Theme & Design:**
  - `DARK_THEME_GUIDE.md` - Dark theme implementation guide
  - `DARK_THEME_COMPLETE.md` - Complete dark theme documentation
  - `THEME_VISUAL_GUIDE.md` - Visual design guidelines
  - `COLOR_SCHEME_UPDATE.md` - Color scheme updates
  - `COLOR_MIGRATION_REFERENCE.md` - Color migration reference

- **Features & Fixes:**
  - `FILE_UPLOAD_FEATURE.md` - File upload implementation
  - `IMAGE_UPLOAD_IMPLEMENTATION.md` - Image upload guide
  - `IMAGE_DISPLAY_FIX.md` - Image display fixes
  - `COMMENT_SYSTEM_FIX_COMPLETE.md` - Comment system fixes
  - `COMMENT_REPLY_FIX.md` - Comment reply functionality
  - `TEXT_VISIBILITY_FIX.md` - Text visibility improvements

### Test Suite (`/tests/`)
- `test_api_comprehensive.py` - Complete API endpoint testing
- `test_integration.py` - Full integration test suite
- `test_auth.py` - Authentication system tests
- `test_connectivity.py` - Server connectivity validation
- `test_comment_reply.py` - Comment functionality tests
- `test_protection.py` - Security and protection tests
- `test_final_fix.py` - Final validation tests
- `test_backend_python.py` - Backend Python tests
- `quick_test.py` - Quick development tests

### Configuration Files
- `.env.test` - Test environment configuration
- `.gitignore` - Version control exclusions
- `README.md` - Project overview and setup instructions

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd workrant_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure your environment variables
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd workrant_frontend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### 3. Running Tests
```bash
# Run comprehensive API tests
cd tests
python test_api_comprehensive.py

# Run integration tests
python test_integration.py

# Run specific functionality tests
python test_auth.py
python test_connectivity.py
```

---

## 📚 Key Documentation

### Essential Reading
1. **`docs/specs/PROJECT_SPEC.md`** - Start here for project overview
2. **`docs/specs/SECURITY_AUDIT_REPORT.md`** - Security implementation details
3. **`docs/guides/DARK_THEME_GUIDE.md`** - UI/UX implementation guide
4. **`README.md`** - Quick setup and overview

### Development Guides
- **Theme Implementation**: `docs/guides/DARK_THEME_*`
- **Feature Development**: `docs/guides/*_FEATURE.md`
- **Bug Fixes**: `docs/guides/*_FIX.md`
- **Security Guidelines**: `rules/SECURITY_*.md`

---

## 🛠️ Development Workflow

1. **Environment Setup**: Configure `.env` files in both frontend and backend
2. **Development**: Use the guides in `/docs/guides/` for feature implementation
3. **Testing**: Run tests in `/tests/` to validate changes
4. **Documentation**: Update relevant documentation in `/docs/`
5. **Security**: Follow guidelines in `/rules/` and security audit recommendations

---

## 📁 Clean Project Structure Achieved

The WorkRant project now has a well-organized structure that separates:
- **Application code** (`workrant_backend/`, `workrant_frontend/`)
- **Documentation** (`docs/`)
- **Testing** (`tests/`)
- **Utilities** (`scripts/`)
- **Project rules** (`rules/`)
- **Runtime data** (`logs/`, `venv/`)

This organization improves maintainability, makes onboarding easier, and follows industry best practices for project structure.