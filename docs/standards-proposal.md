# Engineering Standards Proposal

## Overview

This document proposes a set of engineering standards for adoption by the team. Each standard is designed to be **incrementally adoptable** — we don't need to implement everything at once. The goal is to reduce bugs, speed up development, and make the codebase maintainable by anyone on the team.

---

## 1. Code Style & Formatting

### Standard
- **ESLint** with `eslint:recommended` + `plugin:node/recommended`
- **Prettier** for automatic code formatting
- **Husky + lint-staged** for pre-commit enforcement

### Configuration
```json
// .eslintrc.json
{
  "env": { "node": true, "es2021": true, "jest": true },
  "extends": ["eslint:recommended"],
  "parserOptions": { "ecmaVersion": "latest" },
  "rules": {
    "no-var": "error",
    "prefer-const": "error",
    "eqeqeq": ["error", "always"],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "semi": true
}
```

### Why This Matters
Code style debates in PRs waste everyone's time. Automated formatting eliminates this entirely. ESLint catches real bugs (unused variables, accidental `==`, `var` usage) before they reach production.

---

## 2. Git Workflow

### Standard: Trunk-Based Development with Feature Branches

```
main (protected)
  └── feature/LF-42-add-lead-search
  └── fix/LF-58-login-timeout
  └── chore/update-dependencies
```

### Branch Naming
```
<type>/<ticket-id>-<short-description>
```
Types: `feature/`, `fix/`, `chore/`, `docs/`, `refactor/`

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat(leads): add search by company name
fix(auth): handle expired token redirect
chore: update mongoose to v8.6
docs(api): add pagination examples
```

### Pull Request Rules
1. Every PR must have at least **1 reviewer**
2. CI must pass (lint + tests) before merge
3. PRs should be **small and focused** (< 400 lines changed ideally)
4. Use the PR template (see below)

### PR Template
```markdown
## What does this PR do?
Brief description of the change.

## How to test
Steps to verify the change works.

## Checklist
- [ ] Tests added/updated
- [ ] No console.log left
- [ ] API changes documented in README
- [ ] Backward compatible (or migration noted)
```

---

## 3. Testing Requirements

### Minimum Coverage Targets
| Layer | Target | Tool |
|-------|--------|------|
| API routes | 80% | Jest + Supertest |
| Services | 90% | Jest |
| Frontend | 60% | React Testing Library |

### What to Test
1. **Always test**: Auth flows, permission boundaries, data creation/mutation, error cases
2. **Usually test**: Edge cases, pagination, filtering, input validation
3. **Optionally test**: UI rendering, static content, logging

### Test File Location
Tests live next to the code they test:
```
src/
  controllers/
    lead.controller.js
  services/
    lead.service.js
tests/
  auth.test.js
  leads.test.js
```

### Running Tests
```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode for development
npm test -- --coverage # Generate coverage report
```

---

## 4. API Design Standards

### RESTful Conventions
| Action | Method | Endpoint | Status Code |
|--------|--------|----------|-------------|
| List | GET | `/api/v1/leads` | 200 |
| Get one | GET | `/api/v1/leads/:id` | 200 |
| Create | POST | `/api/v1/leads` | 201 |
| Update | PUT | `/api/v1/leads/:id` | 200 |
| Partial update | PATCH | `/api/v1/leads/:id` | 200 |
| Delete | DELETE | `/api/v1/leads/:id` | 200 |

### Response Format
**Success:**
```json
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 47, "pages": 5 }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "statusCode": 400
}
```

### Status Codes
- `200` — Success
- `201` — Created
- `400` — Bad request (validation error)
- `401` — Unauthorized (no/invalid token)
- `403` — Forbidden (valid token, wrong role)
- `404` — Not found
- `500` — Server error (never expose internals)

---

## 5. Security Standards

### Non-Negotiable
- [ ] **No secrets in code** — all credentials in environment variables
- [ ] **Authentication** on all non-public endpoints
- [ ] **Authorization** checked server-side (never trust the client)
- [ ] **Input validation** on every mutation endpoint
- [ ] **Rate limiting** on auth and public endpoints
- [ ] **CORS** configured for specific domains only
- [ ] **Helmet.js** for HTTP security headers

### Best Practices
- Passwords hashed with bcrypt (cost factor ≥ 12)
- JWT tokens expire (max 7 days)
- Sensitive actions logged with user ID and timestamp
- Dependencies audited weekly (`npm audit`)

---

## 6. Documentation Standards

### README Must Include
1. Project description and purpose
2. Tech stack
3. Setup instructions (step by step)
4. Environment variable reference
5. API endpoint documentation
6. Testing instructions
7. Deployment guide
8. Demo credentials

### Code Documentation
- Complex business logic gets inline comments explaining **why**, not **what**
- Service functions get JSDoc with `@param` and `@returns`
- No commented-out code in main branch

---

## How to Convince a Resistant Team

### The Reality
Engineers resist process changes for valid reasons:
- **"It slows me down"** — Any new process has an adoption cost
- **"We've always done it this way"** — Familiarity bias is real
- **"We don't have time"** — Deadlines are always pressing

### The Strategy: Show, Don't Tell

#### Phase 1: Lead by Example (Week 1)
Don't propose standards in a meeting. Instead:
1. Set up ESLint + Prettier in the repo yourself
2. Make it opt-in (no pre-commit hooks yet)
3. Write a few tests for the most bug-prone module
4. Show the team: "Look, this test caught a bug before it reached production"

**Key insight**: One prevented production bug is worth more than 100 slides about "best practices."

#### Phase 2: Make the Right Thing Easy (Month 1)
1. Add CI pipeline that runs lint + tests on PRs
2. Create a PR template (copy-paste, not enforcement)
3. Set up auto-formatting so people don't have to think about style
4. Make test running fast and painless

**Key insight**: People follow the path of least resistance. If formatting is automatic and tests run in 30 seconds, adoption is effortless.

#### Phase 3: Make It the Team's Decision (Month 2)
1. Bring data: "We've had 3 fewer bugs this month since adding tests"
2. Ask the team: "What standards would YOU want to add?"
3. Let them own the ESLint config — they'll be more invested in following it
4. Celebrate wins: "Great test coverage on that PR, Sarah!"

**Key insight**: Standards that the team co-creates are standards the team actually follows.

#### Phase 4: Formalize Gradually (Quarter 1)
1. Enable pre-commit hooks (by now it's muscle memory)
2. Require PR reviews (by now they're already happening)
3. Document the standards (by now they reflect actual practice, not aspirations)
4. Block merges on test failures (by now tests are a habit)

**Key insight**: Formalize what's already working, don't force what's theoretical.

---

### Anti-Patterns to Avoid

| ❌ Don't | ✅ Do |
|----------|-------|
| Drop a 20-page standards doc on the team | Introduce one tool at a time |
| Enforce everything at once | Let adoption be gradual |
| Make it about compliance | Make it about reducing pain |
| Present it as "my standards" | Present it as "our experiment" |
| Ignore feedback | Iterate based on team experience |
| Shame people for old habits | Celebrate new habits |

---

## Summary

These standards aren't about creating bureaucracy — they're about **making the team faster, safer, and more confident**. Every standard proposed here solves a real problem I've seen in the inherited codebase:

- ESLint catches bugs that reviews miss
- Tests prevent regressions that slow down feature development
- Consistent APIs reduce frontend-backend integration time
- Security standards prevent the kind of incidents that lose customers

The key is incremental adoption: start with the highest-impact, lowest-friction changes, prove their value, and let the team own the rest.
