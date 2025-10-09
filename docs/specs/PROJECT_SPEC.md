
# WorkRant – Project Specification

## 1. Overview

**WorkRant** is an anonymous workplace transparency platform where employees can safely and freely share experiences about their employers. The goal is to empower workers with a collective voice while providing job seekers with uncensored insights into company culture.

This spec defines the **MVP scope**, **architecture**, **features**, and **constraints** for V1 of the platform.

---

## 2. Goals

* Provide workers with an **anonymous, secure, and trustworthy** way to rant or review their workplace.
* Allow job seekers and the public to view aggregated, unfiltered insights about companies.
* Ensure **legal safety** via disclaimers, reporting, and moderation systems.
* Build with **Nigeria-first** focus but architected for global scalability.

---

## 3. Non-Goals

* No private messaging or DMs in MVP.
* No complex gamification or badges yet.
* No real identity verification (that breaks anonymity).
* No advanced AI moderation at V1 — just keyword filters + flagging.

---

## 4. Core Features (MVP)

1. **Anonymous Auth & Pseudonyms**

   * Users sign up with only a pseudonym.
   * No email/phone required.
   * Optional recovery token shown once (stored client-side).

2. **Post Creation**

   * Text posts, optional image (uploaded to S3/Supabase Storage).
   * Must tag a company name (new company auto-created if not found).
   * Optional category tags (e.g., `#salary`, `#harassment`).

3. **Company Profiles**

   * Auto-generated when a post is tagged with a company.
   * Aggregates posts, ratings, and metadata.
   * Includes charts (avg rating for fairness, work-life, toxicity).

4. **Voting & Comments**

   * Upvote/downvote system.
   * Comment threads under each post.

5. **Ratings**

   * Users can add ratings (1–5) across:

     * Fairness
     * Work-Life Balance
     * Management Toxicity

6. **Search & Filtering**

   * Search by company name or tag.
   * Filter posts by category tag.

7. **Reporting & Moderation**

   * Report button on each post/comment.
   * Simple moderation queue (admin-only).
   * Auto-flag posts with PII (emails, phone numbers, NIN).

---

## 5. Architecture (High-Level)

```
[Frontend - Next.js/TS]  --->  [Backend API - Django/DRF]  --->  [PostgreSQL + Redis]
                                   |
                                   +--> [Supabase Auth] 
                                   +--> [S3/Supabase Storage for media]
```

* **Frontend**: Next.js for SSR (SEO + shareable company pages).
* **Backend**: Django REST Framework for API logic.
* **Database**: PostgreSQL for relational data.
* **Cache/Rate Limit**: Redis.
* **Auth**: Supabase with anonymous pseudonym model.
* **Hosting**: Vercel (frontend), Render/Heroku (backend), Supabase/AWS RDS (DB).

---

## 6. Database Schema (Initial)

**users**

* id (UUID, PK)
* pseudonym (string, unique)
* recovery\_token\_hash (nullable, text)
* created\_at (timestamp)

**companies**

* id (UUID, PK)
* name (string, unique, indexed)
* industry (nullable string)
* created\_at (timestamp)

**posts**

* id (UUID, PK)
* user\_id (FK → users.id, anonymized link)
* company\_id (FK → companies.id)
* content (text)
* media\_url (nullable string)
* category\_tags (array of strings)
* created\_at (timestamp)
* updated\_at (timestamp)

**ratings**

* id (UUID, PK)
* user\_id (FK → users.id)
* company\_id (FK → companies.id)
* fairness (int 1–5)
* work\_life (int 1–5)
* management\_toxicity (int 1–5)
* created\_at (timestamp)

**comments**

* id (UUID, PK)
* post\_id (FK → posts.id)
* user\_id (FK → users.id)
* content (text)
* created\_at (timestamp)

**votes**

* id (UUID, PK)
* user\_id (FK → users.id)
* post\_id (FK → posts.id)
* vote\_type (enum: up/down)
* created\_at (timestamp)

**reports**

* id (UUID, PK)
* user\_id (FK → users.id)
* post\_id (nullable FK → posts.id)
* comment\_id (nullable FK → comments.id)
* reason (string)
* created\_at (timestamp)
* status (enum: open, reviewed, resolved)

---

## 7. API Endpoints (MVP)

* **Auth**

  * `POST /api/auth/register` → create pseudonym
  * `POST /api/auth/login` → pseudonym login
* **Posts**

  * `POST /api/posts` → create post
  * `GET /api/posts` → list posts (filters: tag, company, trending)
  * `GET /api/posts/:id` → get single post
* **Companies**

  * `GET /api/companies/:name` → get company profile
* **Ratings**

  * `POST /api/ratings` → submit rating
  * `GET /api/companies/:id/ratings` → aggregate ratings
* **Comments**

  * `POST /api/posts/:id/comments` → create comment
* **Votes**

  * `POST /api/posts/:id/vote` → upvote/downvote
* **Reports**

  * `POST /api/reports` → create report

---

## 8. Legal & Safety

* All posts show disclaimer: *“This content is anonymous and unverified.”*
* No personal data collection (emails, phones, addresses).
* Reports and moderation queue mandatory.
* Auto-block PII using regex + ML checks.
* Database logging: keep minimal request logs for rate limiting only (not IPs beyond 24h).

---

## 9. Roadmap (MVP → Future)

**Phase 1 (MVP Launch)**

* Auth, posts, companies, votes, comments, ratings, reporting.

**Phase 2**

* Advanced search + filtering.
* Admin moderation panel.
* Analytics dashboards for companies (read-only).

**Phase 3**

* Mobile app (React Native).
* AI-assisted PII + toxicity moderation.
* Multi-language support.

**Phase 4**

* Global expansion (US, UK, Africa-wide).
* Monetization (premium insights, recruiter dashboards).

---

## 10. Risks & Mitigations

* **Defamation lawsuits** → disclaimers, moderation, takedown system.
* **Deanonymization attempts** → no sensitive data stored, pseudonym-only.
* **Spam/trolling** → rate limiting, IP token hashing, basic filters.
* **PII exposure** → auto-block detection + reporting.

---

This spec defines the **baseline WorkRant MVP**.
All features must prioritize **anonymity**, **legal safety**, and **scalability**.

---

