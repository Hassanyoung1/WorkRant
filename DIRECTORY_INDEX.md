# WorkRant Directory Index

## 📁 Complete Project Organization

### Root Level
```
WorkRant/
├── PROJECT_STRUCTURE.md     # This file - complete directory guide
├── README.md               # Project overview and quick start
├── .env.test              # Test environment configuration
├── .gitignore             # Version control exclusions
└── (organized subdirectories below)
```

---

## 🏗️ Main Application Directories

### `/workrant_backend/` - Django REST API
```
workrant_backend/
├── .env                   # Backend environment configuration
├── .env.example          # Backend environment template
├── requirements.txt      # Python dependencies
├── manage.py            # Django management script
├── workrant_dev.db      # SQLite development database
├── accounts/            # User management app
├── posts/               # Posts and content app
├── companies/           # Company profiles app
├── moderation/          # Content moderation app
└── workrant_backend/    # Django project settings
```

### `/workrant_frontend/` - Next.js React Application
```
workrant_frontend/
├── .env                 # Frontend environment configuration
├── .env.example        # Frontend environment template
├── package.json        # Node.js dependencies
├── next.config.js      # Next.js configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── src/                # Source code
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility libraries
│   └── types/         # TypeScript type definitions
└── public/            # Static assets
```

---

## 📚 Documentation Structure

### `/docs/specs/` - Technical Specifications
- **`PROJECT_SPEC.md`** - Complete project specification and requirements
- **`SECURITY_AUDIT_REPORT.md`** - Comprehensive security audit and improvements
- **`BACKEND_STATUS.md`** - Backend implementation status and progress

### `/docs/guides/` - Implementation Guides

#### Theme & Design Documentation
- **`DARK_THEME_GUIDE.md`** - Complete dark theme implementation guide
- **`DARK_THEME_COMPLETE.md`** - Dark theme completion documentation
- **`THEME_VISUAL_GUIDE.md`** - Visual design guidelines and standards
- **`COLOR_SCHEME_UPDATE.md`** - Color scheme updates and changes
- **`COLOR_MIGRATION_REFERENCE.md`** - Color migration reference guide
- **`COMMENT_DARK_THEME.md`** - Comment component dark theme implementation
- **`POSTS_PAGE_DARK_THEME.md`** - Posts page dark theme implementation
- **`TEXT_VISIBILITY_FIX.md`** - Text visibility improvements

#### Feature Implementation Guides
- **`FILE_UPLOAD_FEATURE.md`** - File upload feature implementation
- **`IMAGE_UPLOAD_IMPLEMENTATION.md`** - Image upload implementation guide
- **`IMAGE_DISPLAY_FIX.md`** - Image display fixes and improvements
- **`IMAGE_DISPLAY_FIX_OLD.md`** - Legacy image display fix documentation

#### Bug Fixes & System Improvements
- **`COMMENT_SYSTEM_FIX_COMPLETE.md`** - Complete comment system fixes
- **`COMMENT_REPLY_FIX.md`** - Comment reply functionality fixes

---

## 🧪 Testing Infrastructure

### `/tests/` - Complete Test Suite
- **`test_api_comprehensive.py`** - Comprehensive API endpoint testing
- **`test_integration.py`** - Full application integration tests
- **`test_auth.py`** - Authentication system validation
- **`test_connectivity.py`** - Server connectivity and health checks
- **`test_comment_reply.py`** - Comment functionality testing
- **`test_protection.py`** - Security and protection validation
- **`test_final_fix.py`** - Final validation and regression testing
- **`test_backend_python.py`** - Backend Python code testing
- **`quick_test.py`** - Quick development validation tests

---

## 🔧 Development Utilities

### `/scripts/` - Automation & Utilities
- **`test_backend_connection.sh`** - Backend connectivity test script

### `/logs/` - Application Logs
- **`server.log`** - Development server logs and output

### `/rules/` - Project Guidelines
- **`AI_AGENT_RULES.md`** - AI agent interaction guidelines
- **`BACKEND_RULES.md`** - Backend development rules
- **`CONTRIBUTION_RULES.md`** - Contribution guidelines
- **`DATABASE_RULES.md`** - Database management rules
- **`FRONTEND_GUIDE.md`** - Frontend development guide
- **`FRONTEND_RULES.md`** - Frontend development rules
- **`MODERATION_RULES.md`** - Content moderation guidelines
- **`RULES.md`** - General project rules
- **`SECURITY_CHECKLIST.md`** - Security validation checklist
- **`SECURITY_RULES.md`** - Security implementation rules

### `/venv/` - Python Virtual Environment
- Python virtual environment for backend development (excluded from git)

---

## 🎯 Quick Navigation Guide

### For New Developers
1. **Start Here**: `README.md` → `docs/specs/PROJECT_SPEC.md`
2. **Setup**: Follow quick start in `README.md`
3. **Environment**: Copy `.env.example` files and configure
4. **Guidelines**: Read relevant files in `/rules/`

### For Feature Development
1. **Existing Features**: Check `/docs/guides/` for implementation details
2. **Testing**: Use `/tests/` for validation
3. **Documentation**: Update relevant guides after changes

### For Security & Compliance
1. **Security Audit**: `docs/specs/SECURITY_AUDIT_REPORT.md`
2. **Security Rules**: `rules/SECURITY_*.md`
3. **Environment Security**: `.env.example` files for proper setup

### For Testing & Validation
1. **Comprehensive Testing**: `tests/test_api_comprehensive.py`
2. **Integration Testing**: `tests/test_integration.py`
3. **Quick Validation**: `tests/quick_test.py`

---

## ✅ Organization Benefits

### ✅ Improved Maintainability
- Clear separation of concerns
- Easy to find relevant documentation
- Logical grouping of related files

### ✅ Better Developer Experience
- Quick navigation to needed resources
- Clear setup instructions
- Comprehensive testing infrastructure

### ✅ Enhanced Security
- Environment configurations properly organized
- Security documentation centralized
- Testing infrastructure validates security

### ✅ Scalable Structure
- Easy to add new features and documentation
- Clear patterns for file organization
- Maintains clean root directory

This organized structure makes WorkRant more professional, maintainable, and easier to work with for both current and future developers.