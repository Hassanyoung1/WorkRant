
---

# `SECURITY_RULES.md` — WorkRant Security Rules

**Purpose:** define mandatory security controls for backend, frontend, database, infrastructure, and developer operations. These rules are binding for all contributors and AI agents.

---

## 1. Guiding Principles

* **Anonymity First:** No feature is worth shipping if it risks deanonymizing a user.
* **Least Privilege:** Every system, role, or process must have the minimum access required.
* **Defense-in-Depth:** Multiple independent safeguards (app-level, DB-level, infra-level).
* **Audit Everything Sensitive:** Admin/moderator actions must be logged immutably.
* **Fail Safe, Not Open:** In case of error or breach, systems must lock down rather than expose.

---

## 2. Authentication & Identity

* **No Real Identity Collection:** Never require email, phone, NIN, or real name for posting.
* **Anonymous Pseudonyms:** Only pseudonym + hashed recovery tokens are stored.
* **Supabase Auth (preferred):**

  * Configure **anonymous sign-in** (no email verification).
  * Store only pseudonym + hashed recovery secret.
  * No IP logging at auth layer.
* **Custom Auth (if Supabase not used):**

  * Generate unique `anon_user_id` UUIDv4.
  * Issue short-lived JWT signed with `HS256` or `RS256`.
  * JWT payload must not contain IP, device, or geolocation.

---

## 3. API Security

* **Rate Limiting:**

  * Per-IP request limits (but store IP only as salted+hashed, TTL ≤ 24h).
  * Limit post submissions to mitigate spam.
* **Input Validation:**

  * All text inputs passed through profanity/PII filter.
  * Reject posts containing phone numbers, emails, or NIN.
* **Transport Security:**

  * Enforce HTTPS only, HSTS enabled.
  * TLS 1.2+ for all endpoints.
* **CORS Rules:**

  * Restrict to trusted frontend domain(s).
  * No wildcard `*` in production.

---

## 4. Database & Data Security

* **No PII in Core Tables:** Email/phone/IP must *never* enter `users`, `posts`, `comments`.
* **Audit Links Table (special case):**

  * Encrypted with AES-256-GCM or libsodium AEAD.
  * Keys stored in KMS (AWS KMS, GCP KMS, or Vault).
  * Dual control: no single operator can decrypt.
* **Backups:**

  * Encrypted at rest (AES-256).
  * Access logs reviewed weekly.
* **Triggers:**

  * Block insertion of obvious PII (regex for email, phone, etc).

---

## 5. File & Media Security

* **Uploads:**

  * Only allow image uploads (PNG, JPG, GIF).
  * Strip EXIF metadata (remove GPS, device info).
  * Store on S3-compatible storage with signed URLs.
* **Virus Scanning:**

  * All uploads scanned using ClamAV or equivalent.
  * Reject suspicious files.

---

## 6. Logging & Monitoring

* **Do Not Log:**

  * IP addresses, User-Agents, device IDs, or raw JWTs.
* **Log Only:**

  * Request method, endpoint, timestamp, pseudonym ID.
* **Admin Action Logging:**

  * Every post hide, ban, or delete must be logged in immutable `admin_audit_logs`.
* **Monitoring:**

  * Enable WAF (Web Application Firewall).
  * Alert on abnormal spikes (posts, reports).

---

## 7. Infrastructure Security

* **Secrets Management:**

  * All secrets in `.env` files managed via Vault or AWS Secrets Manager.
  * No secrets committed to git.
* **Deployment:**

  * Backend: Render/Heroku → locked with firewall & private networking to DB.
  * DB: Supabase/Amazon RDS, private subnet only.
  * Frontend: Vercel with strict CORS + CSP headers.
* **Containerization:**

  * Use Docker images with minimal base (Debian slim or Alpine).
  * Regular security patch updates.
* **Access Control:**

  * Developers: SSH via keypair only (no password).
  * Rotate keys quarterly.

---

## 8. Incident Response

* **Detection:**

  * Alerts for failed logins, DB anomalies, WAF triggers.
* **Containment:**

  * Immediately revoke affected API keys/secrets.
  * Block suspicious users/IPs (temporarily, hashed storage only).
* **Recovery:**

  * Restore from encrypted backups if corruption/breach.
* **Disclosure:**

  * If data is compromised, notify legal counsel first, then users (via public blog, since users are anonymous).

---

## 9. Legal & Compliance

* **Disclaimer on Every Post:**

  > “All posts are user opinions. WorkRant does not verify authenticity.”
* **Content Moderation:**

  * Automated PII stripping + community flagging.
  * Manual moderator review queue.
* **Data Retention:**

  * Posts/comments: retained until user deletes (soft delete → purge after 365 days).
  * Reports: retained for 2 years.
  * Audit logs: retained for 7 years.

---

## 10. Developer & AI Agent Rules

* **AI Agents:**

  * May only use documented endpoints.
  * Must respect all rules in `DATABASE_RULES.md` and `BACKEND_RULES.md`.
  * Forbidden from writing queries that expose `user_id` alongside content.
* **Developers:**

  * Must use PR reviews for all security-sensitive code.
  * Run `npm audit` / `pip-audit` before deploy.
  * Security checklist (`SECURITY_CHECKLIST.md`) must be cleared before every release.

---

## 11. Security Headers (Frontend)

* **CSP:** default-src 'self'; img-src 'self' blob: data:; media-src 'self'; frame-ancestors 'none';
* **X-Frame-Options:** DENY
* **X-Content-Type-Options:** nosniff
* **Referrer-Policy:** no-referrer
* **Permissions-Policy:** restrict camera/mic/geolocation

---

## 12. Key Rotation & Secrets Lifecycle

* **JWT secret keys:** rotate every 90 days.
* **KMS keys:** rotate annually.
* **API keys (3rd party services):** rotate semi-annually.
* **Credential Expiry:** all secrets must have expiration & rotation pipeline.

---

## 13. Testing & Penetration

* **Automated Scans:** OWASP ZAP or Burp Suite Lite in CI pipeline.
* **Pentest:** independent pen test before global launch.
* **Bug Bounty (future):** reward security researchers for vulnerabilities.

---

✅ This ensures **WorkRant** is safe against deanonymization, common web exploits, and legal risks.

---
