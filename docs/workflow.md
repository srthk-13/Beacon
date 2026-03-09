# Development Workflow – Beacon

---

## Branch Strategy

main → production-ready
dev → integration branch

No direct push to main.

---

## Backend Rules

- Controllers contain no business logic
- Services handle DB operations
- Analytics & optimization logic must be pure functions
- Consistent response format

---

## Frontend Rules

- Pages are containers
- API calls only inside src/api/
- No direct axios calls inside components
- No Redux (use Context only)

---

## Code Review Policy

- Every feature requires PR
- Architecture violations are rejected
- No schema change without updating db-schema.md
- No endpoint change without updating api-spec.md