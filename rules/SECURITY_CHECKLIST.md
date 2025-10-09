
---

# `SECURITY_CHECKLIST.md`

## Purpose

This file provides a **practical, step-by-step checklist** to ensure **WorkRant** is secure before each deployment.
It complements `SECURITY_RULES.md` by acting as a **ready-to-use audit list**.

---

## 1. Authentication & Authorization

* [ ] All API endpoints require **JWT or session tokens**.
* [ ] Token secrets stored securely in `.env`, not code.
* [ ] Role-based access control (RBAC) enforced (`admin`, `moderator`, `user`).
* [ ] No endpoint exposes raw user IDs (only UUIDs or pseudonyms).

---

## 2. Database Security

* [ ] PostgreSQL only accepts SSL connections.
* [ ] Use **parameterized queries** (no string concatenation).
* [ ] No PII stored (real names, emails, IPs, NIN, phone numbers).
* [ ] Daily backups encrypted (AES-256) and tested for recovery.
* [ ] User content retention policy enforced (see `DATABASE_RULES.md`).

---

## 3. Frontend Security

* [ ] HTTPS enforced everywhere.
* [ ] No `dangerouslySetInnerHTML` in React components.
* [ ] CSP (Content Security Policy) headers configured.
* [ ] API calls only through `lib/api.ts`.
* [ ] No secrets exposed in `NEXT_PUBLIC_*` env vars.

---

## 4. Input & Upload Validation

* [ ] All text inputs sanitized to strip XSS/HTML.
* [ ] File uploads restricted:

  * [ ] Max size: **5MB**.
  * [ ] MIME type check (images only).
  * [ ] Stored in safe bucket (not public root).
* [ ] AI moderation layer runs before saving posts/comments.

---

## 5. Logging & Monitoring

* [ ] No sensitive data logged (tokens, IPs, emails, PII).
* [ ] Error logs aggregated in secure service (e.g. Sentry, ELK).
* [ ] Suspicious activity alerts enabled.
* [ ] Rate limiting applied to prevent brute-force attacks.

---

## 6. Dependency & Build Security

* [ ] Run `npm audit` (frontend) and `pip-audit` (backend) weekly.
* [ ] Lockfiles (`package-lock.json`, `poetry.lock/requirements.txt`) committed.
* [ ] Docker images use non-root users.
* [ ] CI/CD pipeline enforces tests + lint + security scan before deploy.

---

## 7. Content & Legal Safety

* [ ] Every post/comment includes disclaimer:

  > “Opinions expressed are anonymous and unverified.”
* [ ] PII filter runs before saving user content.
* [ ] Moderation rules (`MODERATION_RULES.md`) enforced.
* [ ] GDPR-like right to delete: users can delete their data anytime.

---

## 8. Final Deployment Gate

Before pushing to production:

* [ ] ✅ All above checks are completed.
* [ ] ✅ Maintainer signs off.
* [ ] ✅ Security officer (or assigned reviewer) signs off.

---

✅ With this checklist, **WorkRant** ships only when security is airtight.

---
