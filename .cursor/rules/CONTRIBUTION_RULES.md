

---

# `CONTRIBUTION_RULES.md`

## Purpose

This document defines how **human contributors** and **AI agents** should collaborate on the **WorkRant** project.
It ensures **consistency**, **quality control**, and **scalable growth** as the platform evolves.

---

## 1. Contribution Principles

* **Transparency** → every contribution must be traceable.
* **Consistency** → follow coding standards and file structures.
* **Security** → contributions must not introduce privacy leaks.
* **AI + Human Harmony** → AI assists, humans review and finalize.

---

## 2. Contribution Workflow

### 2.1 Human Contributors

1. **Fork & Branching**

   * Create feature branches: `feature/<name>`, `fix/<issue>`, `chore/<task>`.
   * Never push directly to `main`.

2. **Commit Messages**

   * Use [Conventional Commits](https://www.conventionalcommits.org/):

     * `feat:` → new feature
     * `fix:` → bug fix
     * `docs:` → documentation only
     * `refactor:` → code refactor
     * `test:` → adding or updating tests
   * Example:

     ```
     feat(api): add anonymous reporting endpoint
     ```

3. **Pull Requests**

   * Must include:

     * Short description of change
     * Link to related issue
     * Checklist of tests passed

4. **Code Reviews**

   * At least **1 peer review** required before merge.
   * Merge allowed only if tests pass.

---

### 2.2 AI Agents

1. **Respect AI Rules**

   * Follow `AI_AGENT_RULES.md` strictly.
   * Always document code with clear explanations.
   * Never hallucinate APIs or libraries.

2. **Scope of AI Contributions**

   * Can draft backend endpoints, frontend components, DB schemas.
   * Can write initial tests and documentation.
   * Must leave TODO comments for uncertain assumptions.

3. **AI Commit Convention**

   * Prefix commits with `[AI]` to track source.
   * Example:

     ```
     [AI] feat(frontend): draft toxic workplace feed component
     ```

4. **Human Review Requirement**

   * AI contributions must be **reviewed and approved by a human** before merging.
   * No direct AI-to-main merges allowed.

---

## 3. Testing Rules

* All new features require:

  * **Unit tests** (backend logic, frontend utilities).
  * **Integration tests** (API + DB flow).
  * **Snapshot/UI tests** (for React components).
* Coverage target: **80% minimum**.

---

## 4. Documentation

* Every new feature must update relevant docs:

  * `README.md` → setup or usage changes
  * `PROJECT_SPEC.md` → if feature impacts scope
  * `Rules/` files → if rules are modified
* Inline comments required for complex logic.

---

## 5. Security & Privacy Checklist

Before merging, contributors must confirm:

* ❌ No hardcoded API keys or secrets.
* ❌ No logging of user PII.
* ✅ Database queries use parameterized statements.
* ✅ Sensitive data encrypted (if stored).

---

## 6. Conflict Resolution

* If contributors disagree:

  * Open a GitHub issue tagged `discussion`.
  * Include both viewpoints and reasoning.
  * Project maintainer decides final resolution.

---

## 7. Contributor Roles

* **Maintainers**: Oversee project direction, approve merges.
* **Developers**: Build features, fix bugs.
* **Moderators**: Enforce `MODERATION_RULES.md`.
* **AI Agents**: Draft features, assist testing, generate docs.

---

✅ These rules ensure **WorkRant** grows in a controlled, collaborative, and safe manner — with **AI + human synergy** at its core.

---
