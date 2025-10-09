
---

# `MODERATION_RULES.md`

## Purpose

Defines strict rules for **content moderation** in **WorkRant**.
Moderation must protect **anonymity**, **free expression**, and **legal safety**, while removing content that could expose identities or break laws.

---

## 1. Core Principles

* **Anonymity First** → protect posters from doxxing or forced exposure.
* **Freedom with Boundaries** → criticism of workplaces is allowed; hate speech, direct threats, and personal identifiers are not.
* **Transparency** → always show disclaimers:

  > “Opinions expressed are anonymous and unverified.”

---

## 2. Disallowed Content

Agents must automatically block or flag posts/comments containing:

1. **Personally Identifiable Information (PII):**

   * Emails
   * Phone numbers
   * National IDs (e.g., NIN, BVN, SSN)
   * Physical addresses
   * Government-issued IDs
   * IP addresses

2. **Direct Threats or Violence**

   * Any credible call to harm individuals or organizations.

3. **Hate Speech**

   * Racist, sexist, religious, or ethnic slurs.

4. **Harassment & Doxxing**

   * Naming individuals in a hostile or exposing way (e.g., “My boss John Doe at XYZ Ltd lives at…”).

5. **Illegal Content**

   * Child exploitation, explicit threats, or incitement to crime.

---

## 3. Allowed but Flagged Content

* Heavy criticism of a company (e.g., “XYZ Ltd is toxic”) → **allowed**.
* Naming companies in negative terms → **allowed**.
* Sharing salary ranges, work conditions, or broad experiences → **allowed**.
* Posts with excessive profanity → **allowed but flagged for review** (not auto-removed).

---

## 4. Moderation Workflow

1. **Pre-Save Filters (Backend)**

   * Regex filters for PII (email, phone, NIN).
   * Keyword checks for violent threats.
   * Auto-reject with a warning if detected.

2. **User Reporting**

   * Every post/comment has a **Report button**.
   * Reports must include category (PII, hate speech, spam, threat, other).
   * Send to `POST /api/reports`.

3. **Admin Review (Phase 2)**

   * Reports appear in moderation dashboard.
   * Admin can delete, warn, or mark safe.
   * Maintain audit logs (no raw user identifiers).

---

## 5. AI Agent Responsibilities

* Must **not allow posts containing PII**.
* Must tag and block content that matches disallowed categories.
* Must never censor workplace criticism unless it breaks the above rules.
* Must add moderation disclaimers to flagged content:

  > “⚠️ This post may violate community guidelines. Pending review.”

---

## 6. Escalation Rules

* If a post contains **credible threat of harm**, escalate immediately:

  * Hide post.
  * Flag to admin.
  * Preserve evidence in secure moderation logs.
* If false positives occur (e.g., regex blocks a harmless post), allow user to resubmit after editing.

---

## 7. Logging & Privacy

* Store only moderation **decision logs** (post ID, category, decision).
* Never log IP addresses or device metadata.
* Keep reports anonymous (reporter identity not stored).

---

✅ With these moderation rules, WorkRant balances **free speech** with **legal and ethical safety**.

---

