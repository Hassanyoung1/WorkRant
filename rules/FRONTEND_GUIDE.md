

---

# `FRONTEND_GUIDE.md` — WorkRant Frontend Rules

**Purpose:** define strict conventions for building the WorkRant frontend in **Next.js (React) + TypeScript**. Rules focus on anonymity, performance, SEO, and safe UI/UX patterns.

---

## 1. Guiding Principles

* **Anonymity by Design:** no user interface should encourage or expose PII.
* **Trustworthy UI:** always display disclaimers and community safety prompts.
* **Performance & Accessibility:** must be lightweight, SEO-optimized, and WCAG AA compliant.
* **Scalable Layout:** consistent design system for rapid feature growth.

---

## 2. Project Setup

* **Framework:** Next.js (latest stable).
* **Language:** TypeScript strictly enforced.
* **Styling:** Tailwind CSS + Headless UI for accessibility.
* **State Management:** Zustand for global state (lightweight, no Redux).
* **Forms:** React Hook Form + Zod for validation.
* **Linting & Formatting:** ESLint + Prettier with CI enforcement.
* **Testing:** Playwright (E2E) + Jest/RTL (unit/integration).

---

## 3. Anonymity & UX Rules

* **No Profile Pictures:** avatars must be generated pseudonyms (e.g., color-coded initials, hash-based identicons).
* **No Location Data:** geolocation API must be disabled in browsers.
* **No External Trackers:** forbid Google Analytics, Facebook Pixel, etc. Use self-hosted analytics (e.g., Plausible, Umami).
* **PII Warning UI:**

  * Before posting, users see:

    > “⚠ Do not share personal details (email, phone, NIN). Posts are permanent.”
* **Safe Input:** Textareas must auto-strip obvious PII patterns (emails, phone numbers) before submit.

---

## 4. Pages & Routing Rules

* `/` → Main feed (latest & trending rants).
* `/company/[slug]` → Company profile with aggregated posts + ratings.
* `/post/[id]` → Single post page with comments + voting.
* `/tag/[tag]` → Filtered feed by tag (`#salary-issues`, `#harassment`).
* `/auth` → Pseudonym creation & persistence.
* `/report/[id]` → Report flow (modal or standalone page).
* **Dynamic Routing:** Next.js file-based routing must be clean URLs, no query string leaks of sensitive info.

---

## 5. Component Rules

* **UI Library:** build atomic components → Button, Card, Modal, Alert, Input, Tag, Avatar.
* **Post Composer:**

  * Textarea + tags + company selector.
  * Must block submission if input matches regex for emails/phone numbers.
* **Company Selector:**

  * Autocomplete dropdown querying `/api/companies/search`.
  * Fallback: allow free-text to create new companies.
* **Voting Component:** up/down arrows with optimistic UI updates.
* **Reports Modal:** dropdown for reasons + optional text.

---

## 6. SEO & Metadata

* **Meta Tags:**

  * `title`: WorkRant — Anonymous Workplace Voices.
  * `description`: Unfiltered anonymous rants about workplaces in Nigeria.
* **OpenGraph:** for posts/companies, generate OG cards with:

  * Post excerpt or company name.
  * No user pseudonym shown in OG preview.
* **Robots:**

  * Allow indexing of company pages & posts.
  * Disallow `/auth`, `/report/*`.

---

## 7. Performance Rules

* **Image Optimization:** Next.js `<Image>` with AVIF/WEBP support.
* **Code Splitting:** dynamic imports for heavy components (charts, editor).
* **Caching:**

  * Static generation for company pages.
  * SWR (stale-while-revalidate) for feed.
* **Lighthouse Targets:**

  * Performance ≥ 90
  * Accessibility ≥ 90
  * SEO ≥ 90

---

## 8. Accessibility

* All interactive elements must have ARIA labels.
* Dark mode support required (auto-detect system preference).
* Color palette must meet WCAG AA contrast.
* Keyboard navigation required for posting, voting, reporting.

---

## 9. Security Rules (Frontend-Specific)

* **CSP Headers:** enforced via Next.js middleware (see `SECURITY_RULES.md`).
* **Sanitize User Input:** render posts/comments via DOMPurify to strip scripts.
* **Rate Limits UI:** prevent spam by disabling "Post" button until server response returns.
* **No Local Storage for Tokens:** use `httpOnly` cookies for session JWTs.

---

## 10. Testing Requirements

* **Unit Tests:**

  * All UI components must have Jest + RTL tests.
  * Snapshot testing for major components.
* **E2E Tests:**

  * Posting flow (create rant → view in feed).
  * Voting flow.
  * Reporting flow.
  * Company profile aggregation.
* **Accessibility Tests:** run axe-core automated checks in CI.

---

## 11. Theming & Branding

* **Color Scheme:**

  * Primary: `#1D4ED8` (blue — trust).
  * Secondary: `#FACC15` (yellow — caution/warning).
  * Neutral grays for text.
* **Typography:**

  * Headings: Inter Bold.
  * Body: Inter Regular.
* **Logos/Icons:**

  * SVG only, no raster logos.
  * Anonymous iconography (masks, bubbles).

---

## 12. AI Agent Rules (Frontend)

* AI agents generating frontend code must:

  * Use **TypeScript strict mode**.
  * Always enforce **eslint/prettier**.
  * Never include raw user IDs or pseudonyms in client-visible markup.
  * Respect **security headers** from backend.
  * Must not suggest adding analytics libraries without explicit approval.

---

✅ With this, the **frontend has clear, enforceable rules** for anonymity, UX, SEO, and performance.

---

