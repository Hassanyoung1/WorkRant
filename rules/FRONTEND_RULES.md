
---

# `FRONTEND_RULES.md`

## Purpose

Defines strict rules for AI agents working on the **WorkRant frontend**.
The frontend must be built with **Next.js (React) + TypeScript**, with TailwindCSS for styling.
The UI must prioritize **anonymity, performance, and clarity**.

---

## 1. Core Principles

* **Anonymity-first**: never display user IDs or sensitive data — only pseudonyms.
* **Minimal footprint**: don’t include analytics, trackers, or third-party scripts unless explicitly whitelisted.
* **SEO-focused**: company pages and posts must be indexable.
* **Accessibility**: ensure WCAG AA compliance.
* **Security**: never leak API keys to the client. Use environment variables properly (`NEXT_PUBLIC_` only where safe).

---

## 2. Project Structure

```
workrant-frontend/
├─ pages/                # Next.js routes
│  ├─ index.tsx          # main feed
│  ├─ company/[name].tsx # company profiles
│  ├─ post/[id].tsx      # single post view
│  └─ auth/              # pseudonym auth
├─ components/           # reusable UI
│  ├─ PostCard.tsx
│  ├─ CommentThread.tsx
│  ├─ CompanyHeader.tsx
│  └─ ReportModal.tsx
├─ lib/                  # helpers (api.ts, auth.ts)
├─ store/                # Zustand global state
├─ styles/               # Tailwind configs
├─ public/               # static assets
└─ .env.local            # env vars
```

---

## 3. Authentication Rules

* Auth flow is **pseudonym-based**.
* On signup: user chooses pseudonym → API returns JWT.
* Store JWT in **httpOnly cookie** (not localStorage).
* Recovery token (if provided) is shown **once** to the user and never stored client-side.

---

## 4. Posting & Content Rules

* **Post form**: must include:

  * Text area for rant.
  * Company name (autocomplete).
  * Optional tags (`#salary`, `#harassment`).
  * Upload (image only, max 5MB, stored via backend → storage).
* **Before submission**:

  * Client must run lightweight PII check (regex for phone, email, NIN).
  * Block submission with warning if detected.

---

## 5. Feed & UI Rules

* **Main feed**:

  * Show post content, pseudonym, company name, tags, vote counts.
  * Each post must have disclaimer text:

    > “Opinions expressed are anonymous and unverified.”
* **Company profile page**:

  * Show aggregated ratings (charts).
  * List of recent posts.
* **Single post view**:

  * Show content, comments, votes.
  * Include report button.

---

## 6. Voting & Commenting

* **Voting**:

  * Trigger `POST /api/posts/:id/vote`.
  * Optimistic UI updates allowed, but must confirm with API response.
* **Comments**:

  * Threaded view (flat for MVP, nested later).
  * Must display pseudonym only.

---

## 7. Reporting & Moderation (Frontend Side)

* Every post/comment must have a **Report button**.
* Report modal requires a reason (dropdown + text).
* Submit to `POST /api/reports`.
* No moderation tools in frontend MVP (admin-only in backend).

---

## 8. Styling & UX

* Use **TailwindCSS** with a minimal, professional theme.
* **Theme**:

  * Background: neutral light/dark modes.
  * Primary: blue-gray tones (trustworthy).
  * Accent: red/orange for warnings & reports.
* Keep UI **simple and mobile-first**.

---

## 9. Security Rules

* Never expose secrets in frontend.
* Use only `NEXT_PUBLIC_API_URL` for API base.
* All requests go through a central `lib/api.ts`.
* Sanitize all user content before rendering (`dangerouslySetInnerHTML` forbidden).

---

## 10. Deployment Rules

* Hosted on **Vercel**.
* Use environment variables (`.env.local`) for API endpoints.
* Must work fully over HTTPS.

---

✅ These frontend rules guarantee a **safe, anonymous, and clean UX** for WorkRant.

---
