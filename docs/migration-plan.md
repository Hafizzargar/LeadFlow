# Phased Migration Plan — Legacy Lead Management System

## Guiding Principles

1. **Zero-downtime**: Every change ships behind feature flags or as additive-only. No "big-bang" rewrite.
2. **Incremental value**: Each phase delivers measurable improvements that the business can see immediately.
3. **Test before refactor**: Write tests for existing behavior *before* changing it, so regressions are caught automatically.
4. **Strangler fig pattern**: New code wraps and gradually replaces old code. Old endpoints keep working until explicitly deprecated.

---

## Week 1 — Stop the Bleeding

**Goal**: Eliminate the highest-risk security and reliability issues without changing any business logic.

### Day 1–2: Secure Secrets & Add Environment Config
- [ ] Extract all hardcoded secrets (DB URI, JWT secret, API keys) into `.env` files
- [ ] Add `.env` to `.gitignore`
- [ ] Rotate all existing secrets (they're compromised since they were in git history)
- [ ] Set up environment variable management on the deployment platform
- **Rollback**: Revert `.env` changes and restore hardcoded values (temporarily)

### Day 2–3: Add Authentication Middleware
- [ ] Create a JWT authentication middleware
- [ ] Apply it to all protected routes (leave public routes untouched)
- [ ] Create a seed script with admin/member demo accounts
- [ ] Test manually: confirm unauthenticated requests return 401
- **Rollback**: Remove middleware import from route files

### Day 3–4: Add Global Error Handling
- [ ] Create a centralized Express error handler middleware
- [ ] Wrap all existing route handlers in try/catch → next(error)
- [ ] Add basic request logging (morgan in dev, structured JSON in prod)
- [ ] Add `express-rate-limit` to login and public endpoints
- **Rollback**: Remove middleware; errors fall through to Express default handler

### Day 5: Add Input Validation (Critical Endpoints)
- [ ] Add validation to: login, lead creation, lead update
- [ ] Sanitize MongoDB query inputs to prevent NoSQL injection
- [ ] Return consistent error response format: `{ success: false, error: "...", statusCode: 400 }`
- **Rollback**: Remove validation middleware calls from routes

### Week 1 Deliverables
- ✅ No secrets in code
- ✅ All endpoints require authentication (except public form)
- ✅ Server doesn't crash on unexpected input
- ✅ Rate limiting on sensitive endpoints
- ✅ Basic request logging

---

## Month 1 — Build the Foundation

**Goal**: Establish a proper architecture, add test coverage, and set up CI/CD.

### Week 2: Introduce Service Layer Architecture
- [ ] Create a `services/` directory alongside existing route handlers
- [ ] Extract business logic from the 3 most complex route handlers into service functions
- [ ] Route handler calls service → service calls model → service returns result
- [ ] Keep old route code commented (not deleted) until tests confirm the refactor works
- **Pattern**: Strangler fig — new service functions wrap old logic

### Week 3: Add Test Suite
- [ ] Set up Jest + Supertest with in-memory MongoDB (mongodb-memory-server)
- [ ] Write tests for auth flows: login success, login failure, token verification, role guard
- [ ] Write tests for core lead flows: create, read, update status, add note
- [ ] Write tests for permission enforcement: member can't delete, member can't see unassigned leads
- [ ] Target: **60% code coverage** on critical paths

### Week 3–4: Set Up CI/CD
- [ ] Create GitHub Actions workflow:
  - Run ESLint on every PR
  - Run test suite on every PR
  - Block merge if tests fail
- [ ] Set up auto-deploy to staging on merge to `main`
- [ ] Document the deployment process in README

### Week 4: Add Authorization Layer
- [ ] Create role-based middleware (roleGuard)
- [ ] Enforce server-side: admin-only routes, member-only-own-leads rules
- [ ] Remove any frontend-only authorization checks that aren't also enforced server-side
- [ ] Add integration tests for all permission boundaries

### Month 1 Deliverables
- ✅ Clean Controller → Service → Model architecture (critical paths)
- ✅ 60%+ test coverage on auth and core flows
- ✅ CI pipeline blocks bad PRs
- ✅ Auto-deploy to staging
- ✅ Server-enforced authorization

---

## Quarter 1 — Scale and Polish

**Goal**: Complete the architecture migration, add observability, and establish engineering standards.

### Month 2: Complete Architecture Migration
- [ ] Migrate remaining route handlers to service layer pattern
- [ ] Add API versioning (`/api/v1/` prefix)
- [ ] Add pagination to all list endpoints with consistent response format
- [ ] Add search/filter capabilities via query parameters
- [ ] Target: **80% code coverage**

### Month 2: Add Monitoring & Observability
- [ ] Integrate Sentry for error tracking (free tier)
- [ ] Add structured logging with request IDs for traceability
- [ ] Create a `/api/health` endpoint for uptime monitoring
- [ ] Set up alerts for: error rate spikes, response time degradation
- [ ] Add basic performance metrics (response time per endpoint)

### Month 3: Developer Experience & Standards
- [ ] Add ESLint + Prettier with shared config
- [ ] Add Husky pre-commit hooks (lint + test)
- [ ] Create PR template with checklist (tests, docs, migration notes)
- [ ] Write API documentation in README (OpenAPI/Swagger optional)
- [ ] Create onboarding guide for new developers

### Month 3: Frontend Cleanup
- [ ] Remove direct database calls from frontend
- [ ] Centralize API calls through a service layer (axios instance with interceptors)
- [ ] Ensure all auth checks have server-side equivalents
- [ ] Add loading states and error handling to all async operations

### Quarter 1 Deliverables
- ✅ Fully migrated architecture
- ✅ 80%+ test coverage
- ✅ Production monitoring and alerting
- ✅ Developer tooling and standards
- ✅ Clean, maintainable frontend

---

## Risk Mitigation Strategy

| Risk | Mitigation |
|------|-----------|
| Refactored code introduces bugs | Write tests for existing behavior BEFORE refactoring |
| Team pushback on process changes | Start with automation (CI), then propose standards |
| Downtime during migration | Every change is additive; old code stays until new code is proven |
| Loss of tribal knowledge | Document architecture decisions in ADRs (Architecture Decision Records) |
| Scope creep | Each phase has fixed deliverables; new ideas go to the backlog |

---

## Success Metrics

| Metric | Week 1 | Month 1 | Quarter 1 |
|--------|--------|---------|-----------|
| Security vulnerabilities | 0 critical | 0 high | 0 medium |
| Test coverage | 0% → basic | 60% | 80% |
| Mean time to deploy | Hours (manual) | Minutes (auto) | Minutes (auto) |
| Incidents per month | Unknown | Tracked | < 2 |
| Code review turnaround | No reviews | Same-day | Same-day |
