
---

# `DATABASE_RULES.md` — WorkRant Database Rules

**Purpose:** enforce database-level guarantees for anonymity, safety, and maintainability. These rules are mandatory for any agent or human authoring schema changes, migrations, or queries.

---

## 1. High-level principles (must-follow)

* **No PII in public tables.** Public tables (posts, comments, companies, votes, ratings) must never contain emails, phone numbers, NIN, IP addresses, or device identifiers.
* **Separation of concerns.** Sensitive/identifying material (if ever required) must be stored only in a dedicated `audit_links` table with encrypted payloads and tight access control.
* **UUID primary keys.** Use UUIDv4 (`gen_random_uuid()` or equivalent) for all primary keys. No serial integers for public-facing entities.
* **Soft-delete only.** Posts/comments must use `is_deleted` (or `deleted_at`) boolean/timestamp rather than hard delete for legal defense/audit.
* **Schema-first migrations.** All schema changes must be applied via reviewed migration files (Django migrations). No direct DB edits on production.
* **Encryption at rest & in transit.** DB must be encrypted at rest by provider; use TLS for connections.

---

## 2. Tables & column rules (required shape & constraints)

### Users

* Table name: `users`
* Columns:

  * `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `pseudonym VARCHAR(64) NOT NULL UNIQUE`
  * `pseudonym_normalized VARCHAR(64) GENERATED ALWAYS AS (lower(pseudonym)) STORED`
  * `persistent BOOLEAN DEFAULT FALSE` — indicates user opted for persistent account
  * `recovery_token_hash TEXT NULL` — store only hashed recovery tokens (argon2/bcrypt)
  * `created_at TIMESTAMPTZ DEFAULT now()`
  * `is_banned BOOLEAN DEFAULT FALSE`
* **Prohibitions:** No email, phone, IP, device columns.

### Companies

* Table name: `companies`
* Columns:

  * `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `name TEXT NOT NULL`
  * `slug TEXT NOT NULL UNIQUE`
  * `industry TEXT NULL`
  * `created_at TIMESTAMPTZ DEFAULT now()`
  * `is_suspect BOOLEAN DEFAULT FALSE` — flagged for abuse patterns
* Index `CREATE INDEX idx_companies_name ON companies USING gin (to_tsvector('english', name));`

### Posts

* Table name: `posts`
* Columns:

  * `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `user_id UUID REFERENCES users(id) ON DELETE SET NULL`
  * `company_id UUID REFERENCES companies(id) ON DELETE SET NULL`
  * `title TEXT NULL`
  * `body TEXT NOT NULL`
  * `media_urls TEXT[] NULL`
  * `tags TEXT[] NULL`
  * `score INT DEFAULT 0`
  * `is_hidden BOOLEAN DEFAULT FALSE`  -- moderators hide
  * `is_deleted BOOLEAN DEFAULT FALSE` -- soft-delete
  * `created_at TIMESTAMPTZ DEFAULT now()`
  * `updated_at TIMESTAMPTZ DEFAULT now()`
* **Important constraints:**

  * Add `CHECK (array_length(media_urls, 1) IS NULL OR array_length(media_urls,1) <= 5)` to limit number of media items.
  * Full-text index: `CREATE INDEX idx_posts_fts ON posts USING GIN (to_tsvector('english', coalesce(title,'' ) || ' ' || body));`

### Comments

* Table name: `comments`
* Columns:

  * `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `post_id UUID REFERENCES posts(id) ON DELETE CASCADE`
  * `user_id UUID REFERENCES users(id) ON DELETE SET NULL`
  * `parent_id UUID NULL REFERENCES comments(id) ON DELETE CASCADE`
  * `body TEXT NOT NULL`
  * `is_hidden BOOLEAN DEFAULT FALSE`
  * `is_deleted BOOLEAN DEFAULT FALSE`
  * `created_at TIMESTAMPTZ DEFAULT now()`

### Votes

* Table name: `votes`
* Columns:

  * `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `user_id UUID REFERENCES users(id) ON DELETE SET NULL`
  * `post_id UUID REFERENCES posts(id) ON DELETE CASCADE`
  * `vote SMALLINT NOT NULL CHECK (vote IN (1,-1))`
  * `created_at TIMESTAMPTZ DEFAULT now()`
  * `UNIQUE (user_id, post_id)`

### Company Ratings

* Table name: `company_ratings`
* Columns:

  * `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `company_id UUID REFERENCES companies(id) ON DELETE CASCADE`
  * `user_id UUID REFERENCES users(id) ON DELETE SET NULL`
  * `fairness SMALLINT CHECK (fairness BETWEEN 1 AND 5)`
  * `work_life_balance SMALLINT CHECK (work_life_balance BETWEEN 1 AND 5)`
  * `management_toxicity SMALLINT CHECK (management_toxicity BETWEEN 1 AND 5)`
  * `created_at TIMESTAMPTZ DEFAULT now()`
  * `UNIQUE (company_id, user_id)`

### Reports

* Table name: `reports`
* Columns:

  * `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `reporter_user_id UUID REFERENCES users(id) ON DELETE SET NULL`
  * `target_type TEXT CHECK (target_type IN ('post','comment','user'))`
  * `target_id UUID NOT NULL`
  * `reason TEXT`
  * `metadata JSONB`  -- sanitized, never raw PII
  * `status TEXT DEFAULT 'open' CHECK (status IN ('open','reviewed','resolved'))`
  * `created_at TIMESTAMPTZ DEFAULT now()`
  * `handled_by UUID NULL REFERENCES users(id)`

### Audit links (sensitive mapping)

* Table name: `audit_links`
* Purpose: store encrypted payloads (never to be read without dual-control)
* Columns:

  * `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  * `reference_type TEXT NOT NULL`
  * `reference_id UUID NOT NULL` -- e.g., post id
  * `encrypted_payload BYTEA NOT NULL` -- encrypted JSON (libsodium/AEAD/Fernet)
  * `created_at TIMESTAMPTZ DEFAULT now()`
* **Access:** application query to this table must require `ADMIN_AUDIT` scoped credentials; decryption only in secure environment using KMS.

---

## 3. PII detection & DB triggers

* **PII detection at app-level** is primary. Additionally add a **DB trigger** that refuses insert/update when body contains obvious PII patterns (defense-in-depth).
* Example trigger (Postgres plpgsql pseudo):

```sql
CREATE FUNCTION block_pii_in_posts() RETURNS trigger AS $$
BEGIN
  IF NEW.body ~* '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b' THEN
    RAISE EXCEPTION 'PII detected: email address';
  END IF;
  IF NEW.body ~* '\b(?:0|\+?234)[0-9]{10,}\b' THEN
    RAISE EXCEPTION 'PII detected: phone number';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_pii_posts BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE PROCEDURE block_pii_in_posts();
```

* **Rule:** Triggers must be conservative — false positives are acceptable because the app will surface an explanation and allow edited resubmission.

---

## 4. Indexing & performance

* Use **GIN indexes** for full-text search on posts and companies.
* Use composite indexes for commonly filtered queries, e.g., `(company_id, created_at DESC)`.
* Cache aggregates (company rating averages, post score) in columns updated via safe DB-side transactions or background worker to avoid heavy aggregation queries.
* For high write volume, consider partitioning posts by date (monthly) in later stages.

---

## 5. Migration & deploy rules

* **All migrations must be authored via Django migrations** (or equivalent) and reviewed in PRs; include a migration description that explains changes and rollback path.
* **No destructive migrations without backup snapshot.** If removing columns/tables, mark them deprecated first and keep for 90 days before drop.
* **Rollback policy:** each migration must be reversible or have a documented manual rollback procedure.
* **Migration naming convention:** `XXXX_app_action_description` (e.g., `0005_posts_add_is_hidden`).

---

## 6. Backups, retention & retention policy

* **Daily backups** with point-in-time recovery (PITR). Retain backups for a minimum of 30 days.
* **Retention policies for derived data:**

  * IP hash tokens / rate-limit tokens: TTL ≤ 24 hours; purge automated.
  * Deleted posts/comments: `is_deleted = true`, retained for 365 days (legal retention window) before archival.
* **Audit data retention:** `audit_links` entries require legal hold before deletion. Default retention: 7 years, unless cleared earlier by legal.
* **Backup security:** backups must be encrypted and access-controlled. Access logs for backup retrieval must be kept.

---

## 7. Access control & privileges

* Principle of least privilege:

  * App services have DB role with minimal CRUD rights for required tables.
  * Admins have a separate DB role with `SELECT` on audit tables; decryption requires KMS.
  * No one person has both credentials and KMS key (dual control).
* Rotate DB credentials periodically and on any staff/role change.

---

## 8. Logging & monitoring

* **Audit logs**: log schema changes, admin actions (hide/delete), and report actions in a separate `admin_audit_logs` table with `actor_id`, `action`, `target`, `timestamp`, and `reason`. Do not include PII in logs.
* **Slow query logging** enabled; alerts for queries > 1s on critical endpoints.
* **Metrics:** track posts/sec, reports/sec, avg moderation latency, database replication lag.

---

## 9. Encryption & keys

* **Application-level encryption**: use libsodium/AEAD or Fernet for encrypting audit payloads before insert.
* **KMS for keys**: keys kept in AWS KMS / GCP KMS / HashiCorp Vault. Keys are never stored in code or `.env` plain text.
* **Rotate keys** annually or immediately after any suspected compromise. Maintain key-rotation procedure for re-encrypting `audit_links`.

---

## 10. Querying & data export rules

* **Data exports** (for research or legal): redact pseudonyms and any possible identifiers unless a court order requires more. All exports must be logged and approved.
* **Aggregations only** for public dashboards; never export raw posts without moderation check.
* **Rate-limit** data export endpoints.

---

## 11. Test data & local development

* Provide sanitized seed fixtures for local development — never use production data locally.
* `.pgpass` and credentials for local dev must be in `.env` and ignored by git.

---

## 12. Emergency & legal hold

* **Legal hold procedure**: upon receiving a valid legal request, freeze `audit_links` and `is_deleted=false` records related to subject; snapshot DB; escalate to counsel. Document all steps in `LEGAL_REQUESTS.md`.
* **Breach plan**: have documented plan in `SECOPS.md` to rotate keys, notify stakeholders, and perform forensics.

---

## 13. Example SQL snippets (reference)

Create posts table (example):

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  title TEXT,
  body TEXT NOT NULL,
  media_urls TEXT[],
  tags TEXT[],
  score INT DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_posts_company_created ON posts (company_id, created_at DESC);
```

Add soft-delete update function (reference):

```sql
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMPTZ NULL;
CREATE OR REPLACE FUNCTION soft_delete_post() RETURNS TRIGGER AS $$
BEGIN
  NEW.is_deleted := TRUE;
  NEW.deleted_at := now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
```

---

## 14. Review & sign-off

* Any database schema change touching public tables must include:

  * Security & privacy impact statement.
  * Migration performance notes (expected downtime, lock behavior).
  * Rollback plan.
* The change must be approved by at least one human reviewer and the security lead (or the designated owner) before merge.

---

