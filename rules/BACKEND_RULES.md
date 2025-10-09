

---

# `BACKEND_RULES.md`

## Purpose

Defines **strict backend development rules** for AI agents working on the **WorkRant API**.
The backend must be **Django + Django REST Framework** only.
These rules ensure the system is **anonymous, secure, and legally defensible**.

---

## 1. Core Principles

* **Anonymity is sacred**: no emails, phone numbers, NINs, or real identities.
* **Pseudonym-only**: all user references are UUIDs + pseudonyms.
* **Minimal data retention**: never store IPs or request metadata beyond what’s needed for short-term rate limiting.
* **PII filtering**: all submitted content must pass through regex + filter checks before saving.

---

## 2. Authentication Rules

1. Use **Supabase Auth** when possible, else Django custom auth with JWT.
2. On registration:

   * Generate `uuid` as `user.id`.
   * Require only a `pseudonym` (string).
   * Optionally generate a **one-time recovery token**, hashed before storage.
3. Never expose user IDs or tokens in API responses — only pseudonyms.
4. Session handling:

   * Use **JWT (djangorestframework-simplejwt)**.
   * Expire access tokens quickly, refresh securely.

---

## 3. User Model Rules

* Table: `users`
* Fields:

  * `id (UUID, PK)`
  * `pseudonym (string, unique)`
  * `recovery_token_hash (nullable string)`
  * `created_at (timestamp)`
* Never store IPs, devices, or locations.

---

## 4. Posts API Rules

* **Endpoint:** `POST /api/posts`

* Request body:

  ```json
  {
    "company": "Company Name",
    "content": "text rant",
    "media_url": "optional",
    "tags": ["#harassment", "#salary"]
  }
  ```

* Processing steps:

  1. Validate `company` (create new if not exists).
  2. Pass `content` through **PII filters** (block emails, phone numbers, NIN).
  3. Save post with `user_id` (UUID), `company_id`, and tags.
  4. Inject disclaimer automatically:

     > “This content is anonymous and unverified.”

* Response body:

  ```json
  {
    "id": "uuid",
    "company": "Company Name",
    "content": "text rant",
    "tags": ["#harassment"],
    "created_at": "timestamp"
  }
  ```

---

## 5. Voting & Comments

* **Votes**:

  * `POST /api/posts/:id/vote`
  * Allowed values: `"up"` or `"down"`.
  * A user can only vote once per post (update if repeated).
* **Comments**:

  * `POST /api/posts/:id/comments`
  * Must also pass PII filters.
  * Response must never include `user_id`, only pseudonym.

---

## 6. Reports & Moderation

* **Reports**:

  * `POST /api/reports` → user can flag post or comment.
  * Required: `reason` (string).
* **Moderation**:

  * Mark status: `open`, `reviewed`, `resolved`.
  * Store all reports in DB for audit.
  * Moderation queue must be admin-only, protected with MFA.

---

## 7. Security Rules

* Use **UUID primary keys** across all models.
* All passwords/tokens must be hashed with **Argon2 or bcrypt**.
* No hardcoded secrets — always use `.env`.
* Use **CSRF + HTTPS** everywhere.
* Enforce **rate limiting** on post and comment endpoints (Redis-backed).

---

## 8. Legal Safeguards

* Every API response must include a disclaimer banner string:

  ```json
  {
    "disclaimer": "Opinions expressed are anonymous and unverified."
  }
  ```
* Keep **minimal logs** — store only what is necessary for abuse prevention.
* Implement **soft-delete** for posts/comments (mark deleted but keep for legal defense).

---

## 9. Deployment Rules

* API must be stateless (scales horizontally).
* DB migrations must always be reviewed against `DATABASE_RULES.md`.
* Admin endpoints must be locked behind `is_staff` + MFA.

---

✅ These backend rules guarantee the system remains **secure, anonymous, and legally safe**.

---
