
---

# `RULES.md`

## Purpose

This directory defines strict rules for AI agents contributing to **WorkRant**.
Agents **must not improvise** outside these instructions. Rules are separated into domain-specific files to keep them precise and enforceable.

---

## File Layout

```
/ai-rules
├─ AI_RULES.md             # (this index file)
├─ FRONTEND_RULES.md       # Next.js/React + TypeScript UI rules
├─ BACKEND_RULES.md        # Django REST Framework API rules
├─ DATABASE_RULES.md       # PostgreSQL schema & migrations
├─ SECURITY_RULES.md       # Privacy, anonymity, and legal safety
├─ MODERATION_RULES.md     # Content moderation logic
├─ CONTRIBUTION_RULES.md   # General AI dev workflow rules
```

---

## Global AI Rules (apply everywhere)

1. **Anonymity First**

   * Never write code that collects or exposes emails, phone numbers, NIN, IP addresses, or any real-world identifiers.
   * Always design around **pseudonyms + UUIDs** only.

2. **Legal Safety**

   * Every post/comment endpoint must enforce disclaimer injection:

     > “Opinions expressed are anonymous and unverified.”
   * All posts must flow through **PII filters** before saving.

3. **Consistency**

   * Stick to chosen stack: **Next.js + TypeScript (frontend)**, **Django + DRF (backend)**, **PostgreSQL (DB)**.
   * Do not suggest other stacks unless explicitly instructed.

4. **Security**

   * Default to **least privilege**.
   * Environment variables go in `.env` — no secrets in code.
   * Use `uuid` for IDs, never sequential integers.

5. **Agent Behavior**

   * Agents **must not self-assign tasks** — only act on defined tasks in `AGENT_TASKS.md`.
   * Changes must pass through **`CHECKLIST.md`** verification.

---

## How to Use

* When working on **frontend tasks**, open and follow `FRONTEND_RULES.md`.
* When working on **backend tasks**, open and follow `BACKEND_RULES.md`.
* For DB schema or migrations → `DATABASE_RULES.md`.
* For moderation/PII logic → `MODERATION_RULES.md`.
* For legal/anonymity/security concerns → `SECURITY_RULES.md`.
* For workflow → `CONTRIBUTION_RULES.md`.

---

