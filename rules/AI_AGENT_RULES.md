

---

# `AI_AGENT_RULES.md`

## Purpose

This file defines how **AI agents** must contribute to the **WorkRant** project.
AI is treated as a first-class contributor but must obey **security, anonymity, and coding standards** without exception.

---

## 1. General Rules

* Always respect project specs (`PROJECT_SPEC.md`) and all other `Rules/*.md`.
* Never change the tech stack or introduce new dependencies unless explicitly allowed.
* All code must be **production-ready** — tested, documented, and secure.
* Prefer **clarity over cleverness** — simple, maintainable code is better than “smart” hacks.
* When multiple approaches exist, explain trade-offs before committing.

---

## 2. Backend Contributions

* Follow `BACKEND_RULES.md` strictly.
* Only expose pseudonym-based IDs, never raw user IDs.
* Sanitize **all inputs** at controller level.
* Never log personally identifiable information (PII).
* Document every new endpoint in `API_REFERENCE.md`.

---

## 3. Frontend Contributions

* Respect `FRONTEND_RULES.md` and `FRONTEND_GUIDE.md`.
* Always use: **Next.js + React + TypeScript + TailwindCSS + Zustand**.
* Do not bypass `lib/api.ts` for API calls.
* Use `NEXT_PUBLIC_*` variables only when safe.
* Ensure accessibility (labels, aria tags, alt attributes).

---

## 4. Database Contributions

* Follow schema in `DATABASE_RULES.md`.
* All migrations must be reversible.
* Never store sensitive PII (real names, emails, IPs).
* Link posts to pseudonyms only — anonymity is a non-negotiable rule.

---

## 5. Security Responsibilities

* Never expose secrets (DB passwords, JWT keys, API tokens).
* All uploads must be validated (file size, MIME type).
* No use of `dangerouslySetInnerHTML` in React.
* Enforce HTTPS for all endpoints.
* Always add disclaimers when displaying user-generated content.

---

## 6. Documentation Duties

* Update relevant `Rules/*.md` if introducing new standards.
* Update `README.md` if setup instructions change.
* Add inline comments for non-trivial code.
* Keep documentation clear, short, and up to date.

---

## 7. Testing & QA

* Write unit tests for backend routes and utilities.
* For frontend, add tests with Jest/React Testing Library.
* Ensure code passes linter (`eslint`) and formatter (`prettier`) before commits.
* No broken or commented-out code should be pushed.

---

## 8. Communication Rules

* If unsure, **ask for clarification instead of guessing**.
* Provide reasoning when suggesting alternatives.
* When making major changes, leave commit messages that are clear and descriptive.

---

✅ With these rules, AI agents behave as **responsible, secure, and reliable contributors** to WorkRant.
