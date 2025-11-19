<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0 (Initial creation)
Modified Principles: None (initial creation)
Added Sections: Core Principles (6), Data Privacy & Security, Development Workflow, Governance
Removed Sections: None
Templates Updated:
  ✅ .specify/templates/plan-template.md - Constitution Check section aligned
  ✅ .specify/templates/spec-template.md - No changes needed (already aligned)
  ✅ .specify/templates/tasks-template.md - No changes needed (already aligned)
Follow-up TODOs: None
-->

# Friendship CRM Constitution

## Core Principles

### I. Data Privacy & Security (NON-NEGOTIABLE)
All user data MUST be handled with strict privacy controls. Personal information about
friends and relationships MUST be encrypted at rest and in transit. Access controls MUST
enforce least-privilege principles. No data collection without explicit user consent.
Rationale: CRM systems handle sensitive personal relationship data; privacy breaches
damage trust irreparably.

### II. User-Centric Design
Every feature MUST solve a real user problem for managing friendships and relationships.
User workflows take precedence over technical elegance. Features MUST be independently
testable by end users. MVP delivery prioritizes core relationship management over
nice-to-have features.
Rationale: A CRM is only valuable if users can effectively manage their relationships
with it.

### III. Test-First Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement.
Red-Green-Refactor cycle strictly enforced. Integration tests required for all
data operations, API endpoints, and user workflows. Contract tests required for
all external integrations.
Rationale: CRM data integrity is critical; bugs in relationship data are costly
and damage user trust.

### IV. API-First Architecture
All functionality MUST be accessible via well-defined APIs. APIs MUST support
both programmatic and UI consumption. API contracts MUST be versioned and
backward-compatible within major versions. Text-based protocols preferred for
debuggability (JSON over binary).
Rationale: Enables multiple interfaces (web, mobile, CLI) and future integrations
without core logic duplication.

### V. Observability & Logging
All operations MUST produce structured logs. Logs MUST include request context,
user actions, and data changes. Error tracking MUST capture full context without
exposing sensitive data. Performance metrics MUST be collected for all user-facing
operations.
Rationale: CRM systems need audit trails for relationship data changes and
performance monitoring for user experience.

### VI. Versioning & Backward Compatibility
API versions follow SEMVER: MAJOR.MINOR.PATCH. Breaking changes require major
version bumps. Database schema changes MUST be backward-compatible or include
migration paths. Deprecation warnings MUST be provided at least one minor version
before removal.
Rationale: Users depend on stable APIs; breaking changes disrupt integrations
and user workflows.

## Data Privacy & Security

All features MUST comply with data protection regulations (GDPR, CCPA, etc.).
Encryption at rest and in transit is mandatory. Access logging required for all
data access operations. User data deletion requests MUST be honored within
regulatory timeframes. No third-party data sharing without explicit opt-in consent.

## Development Workflow

Code reviews MUST verify constitution compliance before merge. All PRs MUST include
tests that demonstrate feature functionality. Complexity additions MUST be justified
in the implementation plan. Features MUST be independently testable and deployable.
Use `.specify/memory/constitution.md` as the source of truth for all development
decisions.

## Governance

This constitution supersedes all other development practices and guidelines.
Amendments require:
1. Documentation of the proposed change and rationale
2. Impact assessment on existing features and templates
3. Update to version number per semantic versioning rules
4. Propagation of changes to all dependent templates and documentation

All PRs and code reviews MUST verify compliance with constitution principles.
Violations MUST be justified in the implementation plan's Complexity Tracking
section or rejected.

**Version**: 1.0.0 | **Ratified**: 2025-11-18 | **Last Amended**: 2025-11-18
