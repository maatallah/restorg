# 🔒 Project Governance & AI Agent Rules
## RestOrg Development Protocol

> [!WARNING]
> **This document defines IMMUTABLE rules for AI agents and developers.**
> Any changes to architecture, scope, or data model REQUIRE explicit human approval.

---

## 1. Document Lock Status

### 🔴 LOCKED (No AI changes without approval)
These documents are **design-frozen** and cannot be modified by AI agents:

| Document | Status | Lock Date | Reason |
|----------|--------|-----------|--------|
| `ARCHITECTURE.md` | 🔴 LOCKED | 2026-02-03 | Architecture baseline approved |
| `DATA_MODEL.md` | 🔴 LOCKED | 2026-02-03 | Core schema finalized |
| `MVP_SCOPE.md` | 🔴 LOCKED | 2026-02-03 | Feature scope frozen |
| `USER_PERSONAS.md` | 🔴 LOCKED | 2026-02-03 | User journeys agreed |
| `TECH_ARCHITECTURE.md` | 🔴 LOCKED | 2026-02-03 | Stack decisions finalized |

**AI Agent Rule**:
```
IF document.status == LOCKED:
    IF user_request.includes("modify", "change", "update"):
        RESPOND: "This document is locked. Please confirm you want to override the lock."
        REQUIRE: explicit_user_confirmation = True
```

> Note: If any of these files do not exist yet, they should be created only after explicit user approval.

---

### 🟡 CONTROLLED (Review required)
These can be updated but require human review before merge:

| Area | Review Gate | Approver |
|------|------------|----------|
| Implementation code (`src/`, `apps/`) | Pull Request | Tech Lead |
| Database migrations | Manual review | DBA/Tech Lead |
| API changes (breaking) | Architecture review | Product + Tech Lead |

---

### 🟢 OPEN (AI can modify freely)
- Task tracking (`task.md`)
- Test files (`*.test.*`)
- Documentation updates (typos, clarifications)
- Comments and JSDoc

---

## 2. Milestone-Based Workflow

### Phase 0: Design (PLANNED)
**Gate: Architecture Review Meeting**

- [ ] Architecture vision written
- [ ] MVP scope agreed
- [ ] Data model drafted
- [ ] Tech stack selected
- [ ] Personas validated

**EXIT CRITERIA**: Stakeholder sign-off on all LOCKED documents

---

### Phase 1: Foundation (Weeks 1-2)
**Milestone: Core platform + Auth working**

**Deliverables**:
1. Database setup
2. API server running
3. Auth (JWT) + roles
4. Tenant/restaurant isolation middleware
5. Basic health checks

**Exit Criteria**:
- [ ] User can register/login
- [ ] Role-based access enforced
- [ ] Restaurant isolation works

---

### Phase 2: Menu & Ordering (Weeks 3-4)
**Milestone: Core ordering works end-to-end**

**Deliverables**:
1. Menu & items management
2. Pricing & availability
3. Cart + order placement
4. Order status workflow

**Exit Criteria**:
- [ ] Order created from menu
- [ ] Status flow works (created → in prep → ready)

---

### Phase 3: Fulfillment Modes (Weeks 5-6)
**Milestone: On-site, takeaway, delivery supported**

**Deliverables**:
1. Table management / table number flow
2. Takeaway pickup flow
3. Delivery address + handoff
4. Customer notifications

**Exit Criteria**:
- [ ] Each fulfillment mode tested end-to-end
- [ ] Notifications sent correctly

---

### Phase 4: Payments (Week 7)
**Milestone: Payments operational**

**Deliverables**:
1. In-site payment flow
2. Online payment flow (PSP integration)
3. Refunds / cancellations

**Exit Criteria**:
- [ ] Payment recorded reliably
- [ ] Refund process works

---

### Phase 5: Ops & Analytics (Week 8)
**Milestone: Operational dashboards + reporting**

**Deliverables**:
1. Kitchen display / prep queue
2. Basic sales reports
3. SLA metrics (prep time, pickup time)

**Exit Criteria**:
- [ ] Ops dashboards usable
- [ ] Reports exported

---

## 3. Decision Log
All major decisions must be logged here.

### Decision Log Format
```markdown
## [DECISION-XXX] - Title
**Date**: YYYY-MM-DD
**Decider**: Name/Role
**Status**: APPROVED | REJECTED | PENDING

**Context**: Why was this decision needed?

**Options Considered**:
1. Option A - Pros/Cons
2. Option B - Pros/Cons

**Decision**: We chose X because...

**Consequences**: This means we will/won't...

**Reversible?**: YES | NO (if no, extra caution required)
```

---

## 4. AI Agent Behavioral Rules

### Rule 1: Respect the Lock 🔒
If a document is LOCKED, ask for explicit override before any changes.

### Rule 2: Milestone Boundaries
No features outside the current phase without user approval.

### Rule 3: Data Model Consistency
Before creating any entity, verify with `DATA_MODEL.md`.

### Rule 4: No Scope Creep
If a feature is not in `MVP_SCOPE.md`, ask before adding.

### Rule 5: Test Coverage Mandate
Minimum 70% coverage per module before merge.

### Rule 6: Verify Assumptions
Do not assume tools, credentials, services, or data exist.
Verify with the user or by checking the workspace before proceeding.

### Rule 7: Response Role Prefix
Each response must begin with the active role, e.g. `Builder:` or `Reviewer:`.

---

## 5. Change Request Protocol

### For Locked Documents
1. User proposes change
2. AI creates proposal in `proposals/PROP-XXX.md`
3. Human review
4. If approved, update doc + log in `CHANGELOG.md`

Template: `proposals/PROP-001-change.md`
```markdown
# Proposal: [Short Title]

## Requester
Name / Role

## Rationale
Why is this change needed?

## Impact Analysis
- **Scope**: ...
- **Timeline**: ...
- **Risk**: ...

## Modified Documents
- `ARCHITECTURE.md`
- `MVP_SCOPE.md`

## Recommendation
✅ APPROVE | ❌ REJECT | ⚠️ NEED MORE INFO

## Decision
[ ] APPROVED
[ ] REJECTED
[ ] NEEDS MORE INFO
```

---

## 6. Version Control Strategy

### Branch Protection
```
main (production)
  ↑
  | ← Pull Request Required + Review
  |
develop (integration)
  ↑
  | ← Feature branches merge here
  |
feature/module-name
```

**Commit Message Format**
```
type(scope): short description

Refs: #issue-number
Phase: 1 | 2 | 3 | 4 | 5
```

---

## 7. Review Gates Checklist

Before phase completion:
- [ ] All deliverables complete
- [ ] Exit criteria met
- [ ] Test coverage > 70%
- [ ] No critical bugs
- [ ] Docs updated
- [ ] Demo prepared

**Gate Keeper**: Tech Lead

---

## 8. Emergency Protocol

**Scenario**: Critical bug blocking launch

Process:
1. Create `HOTFIX-XXX` branch from `main`
2. Fix bug
3. Fast-track review
4. Deploy
5. Merge back to `develop`
6. Log in `DECISION_LOG.md`

---

## 9. AI Agent Prompt Template

When starting any coding task, AI must say:
```
I am about to implement [FEATURE_NAME].

Let me verify:
1. Is this in the current milestone scope? ✅/❌
2. Does it require modifying locked documents? ✅/❌
3. Does the data model change? ✅/❌
4. Test coverage plan: [DESCRIPTION]

Proceeding...
```

---

## 10. Metrics & Monitoring

Tracked metrics:
- Scope creep
- Architecture violations
- Test coverage
- Performance p95 API latency
- Bug rate

---

## 11. GitHub Repository Management

### Required Practices
- Create and maintain `README.md` (project summary, setup, run, test).
- Ensure local repo initialization and remote origin setup.
- Synchronize to remote on major phase completion with clear, descriptive commit messages.
- Detect mass deletions before any push and require user confirmation.

### Mass Deletion Guard
Before pushing, run:
- `git status`
- `git diff --stat`
If deletions appear unusually high, pause and ask the user for confirmation before pushing.

---

## 12. Tech Stack Verification Commands

### Rule
Always align tool checks to `TECH_ARCHITECTURE.md`.
If that file does not exist yet, ask the user before assuming a stack.

### Example Checks (adjust to actual stack)
- `git --version`
- `node --version`
- `npm --version`
- `pnpm --version`
- `python --version`
- `docker --version`

---

## 13. Code Commenting & File Headers

### Commenting Policy
- Add a clear module header comment describing purpose and boundaries.
- Add explanatory comments for non-obvious logic.
- Avoid redundant line-by-line comments.

### Header Log (per file)
At the top of new or significantly modified files, maintain:
- `Last-Updated`: YYYY-MM-DD HH:MM (local time)
- `Purpose`: 1-line summary

---

## ✅ Summary: AI Agent Commandments
1. Do not modify LOCKED documents without approval
2. Verify milestone scope before implementation
3. Match `DATA_MODEL.md` exactly
4. Write tests (70%+ coverage)
5. Log all major decisions
6. Ask before adding features
7. Enforce tenant isolation
8. Keep payment flows audited
9. Update `task.md` after milestones
10. Seek human approval for ambiguity
11. Do not assume missing tools or credentials
12. Confirm mass deletions before pushing
13. Begin each response with the active role
14. Maintain header logs on significant file edits

---

**Document Status**: 🔴 LOCKED  
**Version**: 1.1  
**Last Updated**: 2026-02-04  
**Next Review**: After Phase 1 completion
