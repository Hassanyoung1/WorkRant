# WorkRant

**Tagline:** *Speak truth to work — anonymous, fearless, local-first.*

WorkRant is a privacy-first, anonymous platform for workers to share uncensored experiences about employers, workplace culture, pay, harassment, and other on-the-job issues — starting with Nigeria and built to scale globally. This repository contains the code, docs, and agent-facing files that ensure safety, anonymity, and operational clarity.

---

## Table of contents

* Vision
* MVP (what we’ll build first)
* Tech stack (decided)
* Privacy & anonymity principles (non-negotiable)
* Quick start (dev commands)
* Project layout (files you asked for)
* Contributing & AI agent note
* Legal / contact placeholder

---

## Vision

Workers deserve a safe place to speak their truth without fear of reprisal. WorkRant gives them that place: anonymous, moderated, and structured so job-seekers get real cultural insight while the platform minimizes legal exposure and protects identities.

---

## MVP (minimum for V1)

1. Anonymous pseudonymous accounts (no email/phone required).
2. Create/read posts (text + optional images), tag with a company name.
3. Company profile pages aggregating posts & ratings.
4. Upvote / downvote system to surface trending posts.
5. Simple 1–5 ratings (Fairness, Work–Life, Management Toxicity).
6. Comment threads (basic).
7. Search and tag filters.
8. Reporting endpoint + moderation queue.
9. PII detection (regex + basic ML rules) to block or flag doxxing attempts.
10. Clear site disclaimer: *“Opinions are those of anonymous posters, not verified facts.”*

---

## Tech stack (chosen — do not substitute unless a critical flaw exists)

* **Frontend:** Next.js (React) + TypeScript
* **Backend:** Django + Django REST Framework
* **Database:** PostgreSQL
* **Auth & Storage:** Supabase (preferred) or custom auth with opaque tokens — must preserve anonymity
* **Cache/Rate limit:** Redis
* **Object storage / media:** S3 / Supabase Storage (with CDN)
* **Hosting:** Frontend on Vercel, Backend on Render/Heroku, DB on Supabase/RDS

---

## Privacy & anonymity principles (non-negotiable)

* **Collect the minimum**: no email/phone required for basic use.
* **Pseudonyms only**: public posts reference a `user_id` (UUID) + `pseudonym` — never an email.
* **PII detection at ingestion**: block or redact emails, phone numbers, NIN, addresses before posting.
* **No raw IP retention**: store only salted/hashed short lived IP tokens for rate limits (TTL ≤ 24h).
* **Encrypted audit vault**: any mapping or sensitive data is stored in an encrypted audit table (keys in KMS). Access requires a legal/operations process.
* **Transparent takedown & reports**: public reporting button; moderation queue; defined legal request playbook.
* **Recovery tokens only if opted in**: show recovery token once; no plain text secrets stored.
* **Admin audit logs & MFA for admins**.

---

## Quick start — development (starter commands)

**Prereqs**

* Node 18+ / npm or pnpm
* Python 3.10+
* Docker & Docker Compose (recommended for DB/Redis)

**Frontend (Next.js + TypeScript skeleton)**

```bash
# create frontend (run from your workspace root)
npx create-next-app@latest workrant-frontend --typescript
cd workrant-frontend

# install extras (tailwind etc. as desired)
npm install
npm run dev
```

**Backend (Django + DRF skeleton)**

```bash
# from workspace root
python3 -m venv venv
source venv/bin/activate
pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary python-dotenv cryptography celery redis

django-admin startproject workrant_backend
cd workrant_backend
python manage.py startapp accounts
python manage.py startapp posts
python manage.py startapp companies
python manage.py startapp moderation

# run migrations (after configuring DATABASE_URL)
python manage.py migrate
python manage.py runserver
```

**Docker Compose (example services)**

```yaml
# docker-compose.yml (example)
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: workrant
      POSTGRES_USER: workrant_user
      POSTGRES_PASSWORD: changeme
    volumes:
      - db_data:/var/lib/postgresql/data
  redis:
    image: redis:7
volumes:
  db_data:
```

Then:

```bash
docker-compose up -d
```

**Environment variables (.env.example)** — *never commit secrets*

```
# backend
DJANGO_SECRET_KEY=replace_me
DATABASE_URL=postgres://workrant_user:changeme@db:5432/workrant
JWT_SECRET=replace_with_secure_value
AUDIT_FERNET_KEY=generate_and_place_here
REDIS_URL=redis://redis:6379/0

# frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Project layout (high level)

```
/workrant
├─ README.md
├─ PROJECT_SPEC.md
├─ AI_RULES.md        # agent instructions (we'll write these next, per your process)
├─ SECURITY.md
├─ CODE_OF_CONDUCT.md
├─ CONTRIBUTING.md
├─ docker-compose.yml
├─ workrant-frontend/  (Next.js + TypeScript)
└─ workrant_backend/   (Django + DRF)
```

Files we will create (in later steps): `AI_RULES.md`, `AGENT_TASKS.md`, `PII_FILTERS.md`, `MODERATION_RULES.md`, `API.md`, `DB_SCHEMA.md`, `AGENT_LOGS.md`.

---

## Contributing & AI agent note

* All contributors (human or AI agent) **must** read `AI_RULES.md` and `SECURITY.md` before making changes.
* PRs must include tests for new behavior, a privacy impact note (if relevant), and reference to `CHECKLIST.md` in `/ai/`.
* Agents are allowed only the capabilities explicitly listed in `AGENT_TASKS.md`; they must never add features that collect PII or enable deanonymization.

---

## Legal / takedown contact (placeholder)

* Designated agent email: `hhassanhakeem@gmail.com ` *(replace with real address before launch)*
* Short site disclaimer (show on post form):

  > “WorkRant is an anonymous forum hosted to share opinions and experiences. Posts are user-generated and unverified. If you believe a post contains illegal content or doxxing, use the Report button.”

