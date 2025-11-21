# Implementation Plan: Personal Friendship CRM

**Branch**: `001-friendship-crm` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-friendship-crm/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a personal friendship CRM application that helps users maintain relationships by tracking contacts, logging interactions, calculating relationship health, and providing recommendations. The system uses an encrypted SQLite database on the server (SQLCipher or similar) to store all data, ensuring privacy. Core features include contact management with relationship tags, weighted interaction logging, health score calculation using exponential decay formula, and personalized recommendations prioritized by health status. The application must present information in a warm, encouraging tone and support at least 200 contacts with 5+ years of interaction history.

**Technical Approach**: Web application using Next.js 14+ with TypeScript and Material-UI (with shadcn/ui components available). Service-oriented architecture with internal APIs. SQLite database on the server with encryption at rest. Health calculation using exponential decay algorithm. 

**Design Reference**: Figma prototype available at `specs/001-friendship-crm/figma-prototype/` showing implemented UI components, navigation structure (top nav bar), color scheme (blue-based), and component patterns. See `research.md` for detailed technical decisions.

## Technical Context

**Language/Version**: TypeScript 5+ with Next.js 14+ (App Router)  
**Primary Dependencies**: Next.js, React, Material-UI (MUI), shadcn/ui (Radix UI primitives), better-sqlite3 (SQLite), SWR (data fetching)  
**Storage**: SQLite database on the server, encrypted at rest (SQLCipher or similar), supports future migration to hosted database  
**Testing**: Jest + React Testing Library (unit/integration), Cypress (E2E), MSW (API mocking)  
**Target Platform**: Web application (browser-based)  
**Project Type**: Full-stack web application with server-side database (Next.js API routes + SQLite)  
**Performance Goals**: Dashboard loads within 2 seconds, contact list access <3 seconds, health calculations <1 second, support 200+ contacts with 5+ years history  
**Constraints**: Encrypted data at rest (SQLCipher or similar), zero data loss on server restart, warm/encouraging UI tone, requires network connectivity  
**Scale/Scope**: Single-user personal CRM, 200+ contacts, 5+ years interaction history, 50+ reminders, multiple relationship tags per contact

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- **Data Privacy & Security**: ✅ **COMPLIANT** - Feature handles sensitive personal relationship data. Encryption specified: encrypted SQLite database at rest (SQLCipher or similar). Access controls: single-user server-side app (no multi-user access needed). Consent: implicit (user owns server and data). Data deletion: user can delete contacts/interactions (FR-007, FR-014 support archiving/deletion).

- **User-Centric Design**: ✅ **COMPLIANT** - Solves real problem: maintaining personal relationships through systematic tracking and reminders. All features independently testable by end users (5 user stories with acceptance scenarios). MVP prioritizes core relationship management (P1: contacts, P2: interactions/health, P3: recommendations/reminders).

- **Test-First Development**: ⚠️ **PENDING** - Test strategies will be defined in Phase 1 design. Required: unit tests for health calculation algorithm, integration tests for data operations (CRUD), contract tests for API endpoints, UI tests for user workflows. TDD approach will be enforced.

- **API-First Architecture**: ⚠️ **PENDING** - APIs will be defined in Phase 1 design (contracts/ directory). Server-side app uses Next.js API routes (HTTP APIs) with service layer for business logic. All functionality must be accessible via well-defined HTTP endpoints. Versioning strategy will be defined in Phase 1.

- **Observability**: ⚠️ **PENDING** - Logging requirements not yet specified. Will be defined in Phase 1. Required: structured logs for data operations, error tracking, performance metrics for user-facing operations (dashboard load, health calculations).

- **Versioning**: ⚠️ **PENDING** - Versioning strategy will be defined in Phase 1. Database schema changes must be backward-compatible or include migration paths. API versioning (if applicable) follows SEMVER.

**Status**: ✅ **GATE PASSED** - Core principles satisfied. Test strategies, API definitions, observability, and versioning will be completed in Phase 1 design phase.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                 # Next.js App Router (pages/routes + API routes)
├── page.tsx         # Dashboard (home page)
├── api/             # API routes for server-side data access
│   ├── contacts/
│   │   ├── route.ts      # GET /api/contacts
│   │   ├── create/
│   │   │   └── route.ts  # POST /api/contacts/create
│   │   ├── update/
│   │   │   └── route.ts  # POST /api/contacts/update
│   │   └── [id]/
│   │       └── route.ts  # GET /api/contacts/[id], DELETE
│   ├── tags/
│   │   └── route.ts      # GET /api/tags, POST /api/tags
│   ├── interactions/
│   │   ├── route.ts      # GET /api/interactions (list with filtering)
│   │   ├── create/
│   │   │   └── route.ts  # POST /api/interactions/create
│   │   ├── update/
│   │   │   └── route.ts  # POST /api/interactions/update
│   │   └── [id]/
│   │       └── route.ts  # GET /api/interactions/[id], DELETE
│   ├── health/
│   │   └── route.ts      # GET /api/health/[contactId]
│   ├── recommendations/
│   │   └── route.ts      # GET /api/recommendations
│   ├── reminders/
│   │   ├── route.ts      # GET /api/reminders (list with filtering)
│   │   ├── create/
│   │   │   └── route.ts  # POST /api/reminders/create
│   │   ├── mark-done/
│   │   │   └── route.ts  # POST /api/reminders/mark-done
│   │   └── [id]/
│   │       └── route.ts  # GET /api/reminders/[id]
│   └── snoozes/
│       └── route.ts      # POST, DELETE /api/snoozes
├── contacts/
│   ├── page.tsx     # Contact list
│   ├── [id]/
│   │   └── page.tsx # Contact detail
│   ├── new/
│   │   └── page.tsx # Add contact form
│   └── [id]/
│       └── edit/
│           └── page.tsx # Edit contact form
├── interactions/
│   └── [contactId]/
│       └── page.tsx # Log interaction
└── layout.tsx       # Root layout with Navigation

src/
├── components/      # React components
│   ├── Navigation.tsx        # Top navigation bar (Dashboard, Contacts)
│   ├── Dashboard.tsx          # Dashboard with recommendations
│   ├── ContactList.tsx       # Contact list with search/filter
│   ├── ContactDetail.tsx     # Contact detail view
│   ├── ContactForm.tsx       # Add/edit contact form
│   ├── LogInteraction.tsx    # Log interaction form
│   ├── RecommendationCard.tsx # Recommendation card component
│   ├── HealthIndicator.tsx   # Health status indicator (green/yellow/red)
│   └── ui/                   # shadcn/ui components (optional)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (other shadcn components as needed)
├── lib/            # Business logic
│   ├── models/     # Data models (TypeScript interfaces)
│   ├── services/   # Business logic services
│   │   ├── contactService.ts
│   │   ├── tagService.ts
│   │   ├── interactionService.ts
│   │   ├── healthService.ts
│   │   ├── recommendationService.ts
│   │   ├── reminderService.ts
│   │   └── snoozeService.ts
│   ├── database/   # SQLite setup, migrations, encryption
│   │   ├── db.ts
│   │   ├── migrations/
│   │   └── encryption.ts
│   ├── theme.ts    # Material-UI theme configuration
│   └── utils/     # Helper functions
│       ├── healthCalculator.ts
│       └── validators.ts
└── hooks/          # Custom React hooks (using SWR)
    ├── useContacts.ts
    ├── useContact.ts
    ├── useRecommendations.ts
    ├── useHealth.ts
    └── useContactMutations.ts

tests/
├── unit/           # Unit tests for services, utilities
├── integration/    # Integration tests for database operations
├── e2e/             # E2E tests (Playwright/Cypress)
└── __mocks__/       # Test mocks (MSW handlers)
```

**Structure Decision**: Next.js App Router structure for full-stack web application. Server-side SQLite database with API routes for data access. Clear separation of concerns: app/ (routing + API routes), components/ (UI), lib/ (business logic), hooks/ (React hooks with SWR). Uses Material-UI as primary component library with shadcn/ui components available for specific needs. Top navigation bar (not sidebar) for main navigation between Dashboard and Contacts views.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution principles satisfied.

## Phase Completion Status

### Phase 0: Research ✅ COMPLETE

- **research.md**: Created with platform selection, framework options, SQLCipher encryption, health calculation algorithm, testing strategy, observability, and API architecture decisions
- **Technical Context**: Updated with resolved decisions (platform: web, storage: SQLite on server, etc.)
- **Constitution Check**: ✅ Passed - all principles satisfied

### Phase 1: Design & Contracts ✅ COMPLETE

- **data-model.md**: Created with complete entity definitions, relationships, validation rules, indexes, and calculated entities (HealthScore, Recommendation, Snooze)
- **contracts/service-contracts.md**: Created with full service layer API contracts, data models, error types, and versioning strategy
- **quickstart.md**: Created with project setup, database initialization, service implementation examples, testing setup, and development workflow (includes SWR integration)
- **figma-prototype/**: Interactive prototype showing UI components, navigation structure, and design patterns
- **Project Structure**: Defined Next.js web application structure with top navigation, component organization, and SWR hooks
- **Agent Context**: Updated Cursor IDE context file with technology stack

**Design Insights from Prototype**:
- Top navigation bar (Dashboard, Contacts) - simple, clean navigation pattern
- Blue-based color scheme (primary: #2196F3, secondary: #64B5F6, background: #F5F9FF)
- Material-UI components with shadcn/ui available for specific needs
- Component structure: Navigation, Dashboard, ContactList, ContactDetail, ContactForm, LogInteraction, RecommendationCard, HealthIndicator
- Friendly, encouraging tone throughout UI copy
- Card-based layouts with soft shadows and rounded corners
- Avatar-based contact representation with initials
- Health indicators integrated into contact displays
- Recommendation cards with personalized messaging
- Interaction timeline with icons for different interaction types

### Phase 2: Task Breakdown ✅ COMPLETE

- **tasks.md**: Created with 51 actionable tasks organized into 10 phases, each with clear references to implementation documentation
- **Task Structure**: Each task includes reference links, action items, and expected outputs
- **Progress Tracking**: Includes progress summary and phase completion checklists

## Implementation Sequence

This section provides a clear, step-by-step implementation roadmap with references to detail files. Follow this sequence to build the application systematically.

### Phase 1: Foundation & Setup

**Goal**: Set up project structure, dependencies, and development environment

1. **Initialize Next.js Project**
   - **Reference**: `quickstart.md` → "Project Setup" → "1. Initialize Next.js Project"
   - **Action**: Create Next.js app with TypeScript and App Router
   - **Output**: Basic Next.js project structure

2. **Install Dependencies**
   - **Reference**: `quickstart.md` → "Project Setup" → "2. Install Dependencies"
   - **Action**: Install Material-UI, better-sqlite3 (or sql.js), SWR, and development dependencies
   - **Output**: `package.json` with all required dependencies

3. **Create Project Structure**
   - **Reference**: `plan.md` → "Project Structure" → "Source Code" (lines 68-132)
   - **Action**: Create directory structure for app/, src/, and tests/
   - **Output**: Complete folder structure matching the plan

4. **Configure Material-UI Theme**
   - **Reference**: `quickstart.md` → "Implement UI Components" → "Material-UI Theme Setup" (lines 692-754)
   - **Reference**: `plan.md` → "UI/UX Patterns" → "Color Scheme" (lines 683-690)
   - **Action**: Create `src/lib/theme.ts` with warm, friendly theme configuration
   - **Output**: Theme file with blue-based color scheme matching prototype

5. **Set Up SWR Configuration**
   - **Reference**: `quickstart.md` → "Implement UI Components" → "SWR Configuration" (lines 756-804)
   - **Action**: Create SWR config and provider wrapper
   - **Output**: `src/lib/swr-config.ts` and SWR provider in root layout

### Phase 2: Data Layer

**Goal**: Implement database schema, encryption, and data access layer

6. **Define TypeScript Models**
   - **Reference**: `data-model.md` → "Entities" section (lines 19-210)
   - **Reference**: `contracts/service-contracts.md` → "Data Models" section (lines 500-570)
   - **Action**: Create TypeScript interfaces in `src/lib/models/` for Contact, Tag, Interaction, Reminder, Snooze, HealthScore, Recommendation
   - **Output**: Complete type definitions matching the data model

7. **Set Up SQLite Database**
   - **Reference**: `quickstart.md` → "Database Setup" → "Initialize SQLite Database" (lines 112-296)
   - **Reference**: `data-model.md` → "Entities" section for table schemas
   - **Action**: Create `src/lib/database/db.ts` with SQLite database connection, define tables, create indexes
   - **Output**: Database connection with all tables and relationships

8. **Implement Database Migrations**
   - **Reference**: `data-model.md` → "Database Schema Versioning" (lines 240-250)
   - **Action**: Create migration system for schema versioning
   - **Output**: Migration files in `src/lib/database/migrations/`

9. **Implement Encryption Layer**
   - **Reference**: `quickstart.md` → "Database Setup" → "Encryption Setup" (lines 263-296)
   - **Reference**: `research.md` → "Storage & Encryption" section (lines 53-73)
   - **Action**: Configure SQLite with SQLCipher or implement encryption at rest for the database file
   - **Output**: Encrypted SQLite database for sensitive data storage

10. **Initialize Default Tags**
    - **Reference**: `data-model.md` → "Tag" → "Default Tags" (lines 50-60)
    - **Reference**: `quickstart.md` → "Database Setup" → database initialization (lines 208-260)
    - **Action**: Add function to insert default tags (Family, Close friend, Acquaintance, Old friend) on first run
    - **Output**: Default tags available in database

### Phase 3: Business Logic Layer

**Goal**: Implement service layer with business logic and calculations

11. **Implement Health Calculator**
    - **Reference**: `quickstart.md` → "Implement Health Calculation" (lines 297-342)
    - **Reference**: `research.md` → "Health Calculation Algorithm" (lines 74-120)
    - **Reference**: `data-model.md` → "Health Score" calculation formula (lines 187-238)
    - **Action**: Create `src/lib/utils/healthCalculator.ts` with exponential decay formula
    - **Output**: Health calculation function with proper thresholds (green/yellow/red)

12. **Implement Validators**
    - **Reference**: `data-model.md` → "Validation Rules" for each entity
    - **Reference**: `contracts/service-contracts.md` → "Error Types" (lines 580-590)
    - **Action**: Create `src/lib/utils/validators.ts` with validation functions
    - **Output**: Validation utilities for all entity fields

13. **Implement ContactService**
    - **Reference**: `contracts/service-contracts.md` → "ContactService" section (lines 27-80)
    - **Reference**: `quickstart.md` → "Implement Service Layer" → ContactService example (lines 344-565)
    - **Action**: Create `src/lib/services/contactService.ts` with all CRUD operations
    - **Output**: Complete contact service with tag assignment/removal

14. **Implement TagService**
    - **Reference**: `contracts/service-contracts.md` → "TagService" section (lines 82-130)
    - **Action**: Create `src/lib/services/tagService.ts` with tag management
    - **Output**: Tag service with default tag protection

15. **Implement InteractionService**
    - **Reference**: `contracts/service-contracts.md` → "InteractionService" section (lines 132-200)
    - **Action**: Create `src/lib/services/interactionService.ts` with interaction logging
    - **Output**: Interaction service with proper weight assignment (text=1, call=3, hangout=6)

16. **Implement HealthService**
    - **Reference**: `contracts/service-contracts.md` → "HealthService" section (lines 331-380)
    - **Reference**: `quickstart.md` → "Implement Health Calculation" (lines 297-342) for health calculator implementation
    - **Action**: Create `src/lib/services/healthService.ts` that uses healthCalculator
    - **Output**: Health service with batch calculation support

17. **Implement RecommendationService**
    - **Reference**: `contracts/service-contracts.md` → "RecommendationService" section (lines 370-410)
    - **Reference**: `data-model.md` → "Recommendation" prioritization algorithm (lines 240-250)
    - **Action**: Create `src/lib/services/recommendationService.ts` with prioritization logic
    - **Output**: Recommendation service that excludes snoozed contacts and prioritizes by health

18. **Implement ReminderService**
    - **Reference**: `contracts/service-contracts.md` → "ReminderService" section (lines 420-480)
    - **Action**: Create `src/lib/services/reminderService.ts` with reminder CRUD
    - **Output**: Reminder service (status: pending/done only, no snoozed)

19. **Implement SnoozeService**
    - **Reference**: `contracts/service-contracts.md` → "SnoozeService" section (lines 490-520)
    - **Reference**: `data-model.md` → "Snooze" entity (lines 180-210)
    - **Action**: Create `src/lib/services/snoozeService.ts` for recommendation snoozing
    - **Output**: Snooze service that deprioritizes contacts temporarily

20. **Create Next.js API Routes**
    - **Reference**: `contracts/service-contracts.md` → All service contracts
    - **Reference**: `quickstart.md` → "Create API Routes" (lines 567-688)
    - **Reference**: `plan.md` → "Project Structure" → API routes (lines 68-99)
    - **Action**: Create Next.js API route handlers in `app/api/` that use the service layer
    - **Output**: RESTful API endpoints for all entities (contacts, tags, interactions, health, recommendations, reminders, snoozes)

### Phase 4: React Hooks & Data Fetching

**Goal**: Create SWR hooks for data fetching and mutations

21. **Implement useContacts Hook**
    - **Reference**: `quickstart.md` → "Custom Hooks with SWR" → useContacts (lines 861-923)
    - **Action**: Create `src/hooks/useContacts.ts` and `src/hooks/useContact.ts` that fetch from `/api/contacts`
    - **Output**: Hooks for fetching contact list and single contact via API

22. **Implement useRecommendations Hook**
    - **Reference**: `quickstart.md` → "Custom Hooks with SWR" → useRecommendations (lines 809-858)
    - **Action**: Create `src/hooks/useRecommendations.ts` that fetches from `/api/recommendations` with refresh capability
    - **Output**: Hook for fetching recommendations with refresh function via API

23. **Implement Mutation Hooks**
    - **Reference**: `quickstart.md` → "Using SWR with Mutations" (lines 980-1100)
    - **Action**: Create `src/hooks/useContactMutations.ts` with create/update/delete that call API endpoints
    - **Output**: Mutation hooks with optimistic updates that use API routes

### Phase 5: UI Components (Foundation)

**Goal**: Build reusable UI components and shared elements

24. **Implement HealthIndicator Component**
    - **Reference**: `plan.md` → "UI/UX Patterns" → "Components" → HealthIndicator (line 219)
    - **Reference**: `figma-prototype/src/components/HealthIndicator.tsx`
    - **Action**: Create `src/components/HealthIndicator.tsx` with green/yellow/red states
    - **Output**: Reusable health indicator component

25. **Implement EmptyState Component**
    - **Reference**: `quickstart.md` → "Empty State Component" (lines 1146-1204)
    - **Reference**: `plan.md` → "UI/UX Patterns" → Empty states
    - **Action**: Create `src/components/shared/EmptyState.tsx` with friendly messaging
    - **Output**: Reusable empty state component with CTA buttons

26. **Implement Navigation Component**
    - **Reference**: `plan.md` → "UI/UX Patterns" → "Navigation" (lines 186-189)
    - **Reference**: `figma-prototype/src/components/Navigation.tsx`
    - **Action**: Create `src/components/Navigation.tsx` with top nav bar
    - **Output**: Navigation component with Dashboard/Contacts links

### Phase 6: UI Components (Feature-Specific)

**Goal**: Build feature-specific components for each user story

27. **Implement Dashboard Component**
    - **Reference**: `quickstart.md` → "Dashboard Component with SWR" (lines 925-985)
    - **Reference**: `plan.md` → "UI/UX Patterns" → "Dashboard" (lines 650-655)
    - **Reference**: `figma-prototype/src/components/Dashboard.tsx`
    - **Action**: Create `src/components/Dashboard.tsx` with recommendations and reminders
    - **Output**: Dashboard showing up to 3 recommendations with refresh

28. **Implement RecommendationCard Component**
    - **Reference**: `plan.md` → "UI/UX Patterns" → "Components" → RecommendationCard (line 220)
    - **Reference**: `figma-prototype/src/components/RecommendationCard.tsx`
    - **Action**: Create `src/components/RecommendationCard.tsx` with personalized messaging
    - **Output**: Recommendation card with snooze and log interaction actions

29. **Implement ContactList Component**
    - **Reference**: `plan.md` → "UI/UX Patterns" → "Contact List" (lines 198-203)
    - **Reference**: `figma-prototype/src/components/ContactList.tsx`
    - **Action**: Create `src/components/ContactList.tsx` with search, filter, sort
    - **Output**: Contact list with cards showing health, tags, and last interaction

30. **Implement ContactDetail Component**
    - **Reference**: `plan.md` → "UI/UX Patterns" → "Contact Detail" (lines 205-211)
    - **Reference**: `figma-prototype/src/components/ContactDetail.tsx`
    - **Action**: Create `src/components/ContactDetail.tsx` with header, profile note, reminders, interaction timeline
    - **Output**: Complete contact detail view with all information

31. **Implement ContactForm Component**
    - **Reference**: `plan.md` → "UI/UX Patterns" → "Forms" → Contact Form (lines 672-675)
    - **Reference**: `figma-prototype/src/components/ContactForm.tsx`
    - **Reference**: `quickstart.md` → "Contact Form with SWR Mutation" (lines 1062-1142)
    - **Action**: Create `src/components/ContactForm.tsx` for add/edit contact
    - **Output**: Form with validation and tag multi-select

32. **Implement LogInteraction Component**
    - **Reference**: `plan.md` → "UI/UX Patterns" → "Forms" → Log Interaction (line 215)
    - **Reference**: `figma-prototype/src/components/LogInteraction.tsx`
    - **Action**: Create `src/components/LogInteraction.tsx` with interaction type selection
    - **Output**: Form for logging text/call/hangout interactions

### Phase 7: Next.js Pages & Routing

**Goal**: Create Next.js pages that use the components

33. **Create Root Layout**
    - **Reference**: `quickstart.md` → "SWR Provider Setup" (lines 774-804)
    - **Action**: Create `app/layout.tsx` with SWR provider, Material-UI theme provider, Navigation
    - **Output**: Root layout with providers and navigation

34. **Create Dashboard Page**
    - **Reference**: `plan.md` → "Project Structure" → app/page.tsx
    - **Action**: Create `app/page.tsx` that renders Dashboard component
    - **Output**: Home page showing dashboard

35. **Create Contact List Page**
    - **Reference**: `plan.md` → "Project Structure" → app/contacts/page.tsx
    - **Action**: Create `app/contacts/page.tsx` that renders ContactList component
    - **Output**: Contact list page

36. **Create Contact Detail Page**
    - **Reference**: `plan.md` → "Project Structure" → app/contacts/[id]/page.tsx
    - **Action**: Create `app/contacts/[id]/page.tsx` that renders ContactDetail component
    - **Output**: Dynamic contact detail page

37. **Create Add Contact Page**
    - **Reference**: `plan.md` → "Project Structure" → app/contacts/new/page.tsx
    - **Action**: Create `app/contacts/new/page.tsx` that renders ContactForm component
    - **Output**: Add contact page

38. **Create Edit Contact Page**
    - **Reference**: `plan.md` → "Project Structure" → app/contacts/[id]/edit/page.tsx
    - **Action**: Create `app/contacts/[id]/edit/page.tsx` that renders ContactForm with existing data
    - **Output**: Edit contact page

39. **Create Log Interaction Page**
    - **Reference**: `plan.md` → "Project Structure" → app/interactions/[contactId]/page.tsx
    - **Action**: Create `app/interactions/[contactId]/page.tsx` that renders LogInteraction component
    - **Output**: Log interaction page

### Phase 8: Testing

**Goal**: Implement comprehensive test coverage

40. **Set Up Testing Infrastructure**
    - **Reference**: `quickstart.md` → "Testing Setup" → "Jest Configuration" (lines 1208-1228)
    - **Action**: Configure Jest, React Testing Library, and MSW
    - **Output**: Testing environment ready

41. **Write Unit Tests for Utilities**
    - **Reference**: `quickstart.md` → "Unit Tests" (lines 1234-1265)
    - **Action**: Write tests for `healthCalculator.ts` and `validators.ts`
    - **Output**: Unit test coverage for core utilities

42. **Write Integration Tests for Services**
    - **Reference**: `quickstart.md` → "Integration Tests" (lines 1267-1296)
    - **Action**: Write tests for all service layer methods
    - **Output**: Integration test coverage for data operations

43. **Write Tests for SWR Hooks**
    - **Reference**: `quickstart.md` → "Testing SWR Hooks" (lines 1298-1350)
    - **Action**: Write tests for all custom hooks
    - **Output**: Hook test coverage

44. **Write Component Tests**
    - **Reference**: `quickstart.md` → Testing examples
    - **Action**: Write tests for key UI components
    - **Output**: Component test coverage

### Phase 9: Error Handling & Edge Cases

**Goal**: Implement error handling and edge case scenarios

45. **Implement Error Handling**
    - **Reference**: `spec.md` → "Clarifications" → Error states (line 12)
    - **Reference**: `spec.md` → FR-031 (user-friendly error messages)
    - **Action**: Add error boundaries, error states in components, retry logic
    - **Output**: Comprehensive error handling throughout app

46. **Implement Empty States**
    - **Reference**: `spec.md` → "Clarifications" → Empty states (line 13)
    - **Reference**: `spec.md` → FR-032 (empty states with CTAs)
    - **Action**: Add empty states to all lists (contacts, interactions, recommendations)
    - **Output**: Friendly empty states with action buttons

47. **Handle Edge Cases**
    - **Reference**: `spec.md` → "Edge Cases" section (lines 100-134)
    - **Action**: Implement handling for duplicate names, no tags, archived contacts, etc.
    - **Output**: All edge cases handled gracefully

### Phase 10: Polish & Refinement

**Goal**: Final touches, performance optimization, and UX improvements

48. **Optimize Performance**
    - **Reference**: `research.md` → "Performance Optimization" (lines 254-273)
    - **Action**: Implement lazy loading, caching, debouncing, pagination
    - **Output**: App meets performance goals (2s dashboard, 3s contact list)

49. **Add Loading States**
    - **Reference**: `plan.md` → UI patterns
    - **Action**: Add loading skeletons and spinners throughout
    - **Output**: Smooth loading experience

50. **Add Progressive Web App Features (Optional)**
    - **Reference**: Next.js PWA documentation
    - **Action**: Add service worker and manifest for installability (basic PWA features)
    - **Output**: App can be installed as a web app (note: requires network connectivity for data access)

51. **Final UX Polish**
    - **Reference**: `plan.md` → "UI/UX Patterns" (all sections)
    - **Reference**: `figma-prototype/` for design reference
    - **Action**: Ensure warm tone, friendly copy, smooth animations
    - **Output**: Polished, encouraging user experience

## Implementation Checklist

Use this checklist to track progress through the implementation sequence:

- [ ] Phase 1: Foundation & Setup (Steps 1-5)
- [ ] Phase 2: Data Layer (Steps 6-10)
- [ ] Phase 3: Business Logic Layer (Steps 11-20)
- [ ] Phase 4: React Hooks & Data Fetching (Steps 21-23)
- [ ] Phase 5: UI Components - Foundation (Steps 24-26)
- [ ] Phase 6: UI Components - Features (Steps 27-32)
- [ ] Phase 7: Next.js Pages & Routing (Steps 33-39)
- [ ] Phase 8: Testing (Steps 40-44)
- [ ] Phase 9: Error Handling & Edge Cases (Steps 45-47)
- [ ] Phase 10: Polish & Refinement (Steps 48-51)

## Quick Reference: Detail Files

When implementing, refer to these files for specific information:

### Core Documentation Files

- **`spec.md`**: Complete feature specification
  - User Stories & Acceptance Scenarios (lines 8-107)
  - Functional Requirements (lines 137-171)
  - Edge Cases (lines 100-134)
  - Key Entities (lines 173-187)
  - Success Criteria (lines 189-207)

- **`data-model.md`**: Complete database schema and data model
  - Entity definitions with fields, constraints, indexes (lines 19-210)
  - Calculated entities: HealthScore, Recommendation (lines 212-250)
  - Database schema versioning (lines 240-250)
  - Performance considerations (lines 252-260)

- **`contracts/service-contracts.md`**: Service layer API contracts
  - ContactService API (lines 27-80)
  - TagService API (lines 82-130)
  - InteractionService API (lines 132-200)
  - HealthService API (lines 331-380)
  - RecommendationService API (lines 370-410)
  - ReminderService API (lines 420-480)
  - SnoozeService API (lines 490-520)
  - Data Models (TypeScript interfaces) (lines 500-570)
  - Error Types (lines 580-590)

- **`quickstart.md`**: Step-by-step implementation guide
  - Project Setup (lines 15-110)
  - Database Setup with SQLite (lines 112-296)
  - Health Calculation implementation (lines 297-342)
  - Service Layer examples (lines 344-565)
  - API Routes examples (lines 567-688)
  - UI Components examples (lines 690-1204)
  - SWR Configuration & Hooks (lines 756-923)
  - SWR Mutations (lines 987-1060)
  - Testing Setup (lines 1206-1350)
  - Development Workflow (lines 1352-1418)

- **`research.md`**: Technical decisions and rationale
  - Platform & Framework selection (lines 6-52)
  - Storage & Encryption approach (lines 53-73)
  - Health Calculation Algorithm (lines 74-120)
  - Testing Strategy (lines 121-156)
  - Observability & Logging (lines 157-186)
  - API Architecture (lines 187-227)
  - Project Structure (lines 228-253)
  - Performance Optimization (lines 254-273)
  - Security Considerations (lines 290-323)

- **`plan.md`**: Implementation plan and structure
  - Project Structure (lines 54-135)
  - UI/UX Patterns from Prototype (lines 182-237)
  - Implementation Sequence (this section)

- **`figma-prototype/`**: Interactive UI prototype
  - Component implementations: `src/components/`
  - Navigation structure: `src/components/Navigation.tsx`
  - Theme configuration: `src/App.tsx` (theme object)
  - Design patterns and interactions

### Finding Information by Task Type

**Setting up database?**
→ `quickstart.md` → "Database Setup" (lines 112-296)
→ `data-model.md` → "Entities" for table schemas

**Implementing a service?**
→ `contracts/service-contracts.md` → Find the service section (e.g., "ContactService")
→ `quickstart.md` → "Implement Service Layer" (lines 344-565) for examples

**Creating API routes?**
→ `contracts/service-contracts.md` → Service contracts for API structure
→ `quickstart.md` → "Create API Routes" (lines 567-688) for examples
→ `plan.md` → "Project Structure" → API routes (lines 68-99)
→ Next.js App Router API routes documentation

**Building a UI component?**
→ `plan.md` → "UI/UX Patterns" for design requirements
→ `figma-prototype/src/components/` for reference implementation
→ `quickstart.md` → "Implement UI Components" for code examples

**Calculating health scores?**
→ `research.md` → "Health Calculation Algorithm" (lines 74-120) for formula
→ `data-model.md` → "Health Score" (lines 187-238) for thresholds
→ `quickstart.md` → "Implement Health Calculation" (lines 297-342) for code

**Setting up data fetching?**
→ `quickstart.md` → "SWR Configuration" (lines 756-804) and "Custom Hooks with SWR" (lines 806-923)
→ `quickstart.md` → "Using SWR with Mutations" (lines 987-1060) for mutations

**Handling errors or empty states?**
→ `spec.md` → "Clarifications" (lines 8-16) for requirements
→ `spec.md` → "Edge Cases" (lines 100-134) for scenarios
→ `quickstart.md` → "Empty State Component" (lines 1146-1204) for implementation

**Testing?**
→ `quickstart.md` → "Testing Setup" (lines 1206-1350)
→ `research.md` → "Testing Strategy" (lines 121-156)

## UI/UX Patterns from Prototype

Based on the Figma prototype implementation, the following patterns should be followed:

### Navigation
- **Top App Bar**: Simple horizontal navigation with "Dashboard" and "Contacts" links
- **Active State**: Highlighted background color (rgba(33, 150, 243, 0.08)) for active route
- **Branding**: App name with emoji (💝 Friendship CRM) in top-left

### Dashboard
- **Header**: "Your Dashboard" title with refresh icon button
- **Recommendations Section**: "Friendly Suggestions" subtitle, up to 3 recommendation cards
- **Empty State**: Celebratory message "You're doing great! 🌟" when all contacts are healthy
- **Reminders Section**: "Your Reminders" subtitle, list of upcoming reminders
- **Welcome State**: Friendly welcome message for first-time users with "Add Your First Contact" CTA

### Contact List
- **Header**: "Your Contacts" title with "Add Contact" button
- **Filters**: Search bar, tag filter dropdown, sort dropdown (Name, Health Status, Recent Activity)
- **Contact Cards**: Avatar with initials, name, health indicator, tags (chips), profile note preview, last interaction date
- **Empty State**: Large icon, friendly message, "Add Your First Contact" button
- **Hover Effects**: Card shadow increases on hover for interactivity

### Contact Detail
- **Back Button**: "Back to Contacts" link at top
- **Header Card**: Large avatar, name, health indicator, birthday (if set), tags, action buttons row
- **Action Buttons**: "Log Interaction" (primary), "Edit", "Create Reminder", "Archive" (error color)
- **Profile Note Card**: "About [Name]" section with quoted text
- **Reminders Card**: List of reminders with dates and messages
- **Interaction Timeline**: Chronological list with icons, dates, and notes

### Forms
- **Contact Form**: Name (required), birthday (date picker), profile note (textarea), tags (multi-select chips)
- **Log Interaction**: Contact header, interaction type toggle buttons (Text/Call/Hangout), date picker, notes field
- **Validation**: Friendly error messages, required field indicators

### Components
- **HealthIndicator**: Small circular dot/badge (green/yellow/red) with size variants
- **RecommendationCard**: Avatar, name, health, tags, profile note (italic), personalized message, action buttons
- **Avatar**: Initials-based with primary color background
- **Tags/Chips**: Light blue background (rgba(100, 181, 246, 0.15)) with secondary text color

### Color Scheme (from Prototype)
- **Primary**: #2196F3 (Friendly Blue)
- **Secondary**: #64B5F6 (Light Blue)
- **Background**: #F5F9FF (Light Blue-tinted)
- **Success**: #4CAF50 (Green for healthy)
- **Warning**: #FFC107 (Yellow for attention)
- **Error**: #F44336 (Red for overdue)

### Typography & Spacing
- **Headings**: Medium weight (600), primary color for main headings
- **Body Text**: Regular weight, secondary color for supporting text
- **Card Padding**: 3 (24px) for comfortable spacing
- **Gap Between Elements**: 2 (16px) for lists, 3 (24px) for sections
- **Border Radius**: 12px for cards, 8px for buttons and chips
