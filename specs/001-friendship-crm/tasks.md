# Implementation Tasks: Personal Friendship CRM

**Branch**: `001-friendship-crm` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Status**: Ready for implementation

This document breaks down the implementation plan into actionable tasks. Each task includes references to detailed documentation for implementation guidance.

---

## Phase 1: Foundation & Setup

**Goal**: Set up project structure, dependencies, and development environment

- [ ] **Task 1.1**: Initialize Next.js Project
  - **Reference**: `quickstart.md` → "Project Setup" → "1. Initialize Next.js Project"
  - **Action**: Create Next.js app with TypeScript and App Router
  - **Output**: Basic Next.js project structure

- [ ] **Task 1.2**: Install Dependencies
  - **Reference**: `quickstart.md` → "Project Setup" → "2. Install Dependencies"
  - **Action**: Install Material-UI, better-sqlite3 (or sql.js), SWR, and development dependencies
  - **Output**: `package.json` with all required dependencies

- [ ] **Task 1.3**: Create Project Structure
  - **Reference**: `plan.md` → "Project Structure" → "Source Code" (lines 68-132)
  - **Action**: Create directory structure for app/, src/, and tests/
  - **Output**: Complete folder structure matching the plan

- [ ] **Task 1.4**: Configure Material-UI Theme
  - **Reference**: `quickstart.md` → "Implement UI Components" → "Material-UI Theme Setup" (lines 692-754)
  - **Reference**: `plan.md` → "UI/UX Patterns" → "Color Scheme" (lines 683-690)
  - **Action**: Create `src/lib/theme.ts` with warm, friendly theme configuration
  - **Output**: Theme file with blue-based color scheme matching prototype

- [ ] **Task 1.5**: Set Up SWR Configuration
  - **Reference**: `quickstart.md` → "Implement UI Components" → "SWR Configuration" (lines 756-804)
  - **Action**: Create SWR config and provider wrapper
  - **Output**: `src/lib/swr-config.ts` and SWR provider in root layout

---

## Phase 2: Data Layer

**Goal**: Implement database schema, encryption, and data access layer

- [ ] **Task 2.1**: Define TypeScript Models
  - **Reference**: `data-model.md` → "Entities" section (lines 19-210)
  - **Reference**: `contracts/service-contracts.md` → "Data Models" section (lines 500-570)
  - **Action**: Create TypeScript interfaces in `src/lib/models/` for Contact, Tag, Interaction, Reminder, Snooze, HealthScore, Recommendation
  - **Output**: Complete type definitions matching the data model

- [ ] **Task 2.2**: Set Up SQLite Database
  - **Reference**: `quickstart.md` → "Database Setup" → "Initialize SQLite Database" (lines 112-296)
  - **Reference**: `data-model.md` → "Entities" section for table schemas
  - **Action**: Create `src/lib/database/db.ts` with SQLite database connection, define tables, create indexes
  - **Output**: Database connection with all tables and relationships

- [ ] **Task 2.3**: Implement Database Migrations
  - **Reference**: `data-model.md` → "Database Schema Versioning" (lines 240-250)
  - **Action**: Create migration system for schema versioning
  - **Output**: Migration files in `src/lib/database/migrations/`

- [ ] **Task 2.4**: Implement Encryption Layer
  - **Reference**: `quickstart.md` → "Database Setup" → "Encryption Setup" (lines 263-296)
  - **Reference**: `research.md` → "Storage & Encryption" section (lines 53-73)
  - **Action**: Configure SQLite with SQLCipher or implement encryption at rest for the database file
  - **Output**: Encrypted SQLite database for sensitive data storage

- [ ] **Task 2.5**: Initialize Default Tags
  - **Reference**: `data-model.md` → "Tag" → "Default Tags" (lines 50-60)
  - **Reference**: `quickstart.md` → "Database Setup" → database initialization (lines 208-260)
  - **Action**: Add function to insert default tags (Family, Close friend, Acquaintance, Old friend) on first run
  - **Output**: Default tags available in database

---

## Phase 3: Business Logic Layer

**Goal**: Implement service layer with business logic and calculations

- [ ] **Task 3.1**: Implement Health Calculator
  - **Reference**: `quickstart.md` → "Implement Health Calculation" (lines 297-342)
  - **Reference**: `research.md` → "Health Calculation Algorithm" (lines 74-120)
  - **Reference**: `data-model.md` → "Health Score" calculation formula (lines 187-238)
  - **Action**: Create `src/lib/utils/healthCalculator.ts` with exponential decay formula
  - **Output**: Health calculation function with proper thresholds (green/yellow/red)

- [ ] **Task 3.2**: Implement Validators
  - **Reference**: `data-model.md` → "Validation Rules" for each entity
  - **Reference**: `contracts/service-contracts.md` → "Error Types" (lines 580-590)
  - **Action**: Create `src/lib/utils/validators.ts` with validation functions
  - **Output**: Validation utilities for all entity fields

- [ ] **Task 3.3**: Implement ContactService
  - **Reference**: `contracts/service-contracts.md` → "ContactService" section (lines 27-80)
  - **Reference**: `quickstart.md` → "Implement Service Layer" → ContactService example (lines 344-565)
  - **Action**: Create `src/lib/services/contactService.ts` with all CRUD operations
  - **Output**: Complete contact service with tag assignment/removal

- [ ] **Task 3.4**: Implement TagService
  - **Reference**: `contracts/service-contracts.md` → "TagService" section (lines 82-130)
  - **Action**: Create `src/lib/services/tagService.ts` with tag management
  - **Output**: Tag service with default tag protection

- [ ] **Task 3.5**: Implement InteractionService
  - **Reference**: `contracts/service-contracts.md` → "InteractionService" section (lines 132-200)
  - **Action**: Create `src/lib/services/interactionService.ts` with interaction logging
  - **Output**: Interaction service with proper weight assignment (text=1, call=3, hangout=6)

- [ ] **Task 3.6**: Implement HealthService
  - **Reference**: `contracts/service-contracts.md` → "HealthService" section (lines 331-380)
  - **Reference**: `quickstart.md` → "Implement Health Calculation" (lines 297-342) for health calculator implementation
  - **Action**: Create `src/lib/services/healthService.ts` that uses healthCalculator
  - **Output**: Health service with batch calculation support

- [ ] **Task 3.7**: Implement RecommendationService
  - **Reference**: `contracts/service-contracts.md` → "RecommendationService" section (lines 370-410)
  - **Reference**: `data-model.md` → "Recommendation" prioritization algorithm (lines 240-250)
  - **Action**: Create `src/lib/services/recommendationService.ts` with prioritization logic
  - **Output**: Recommendation service that excludes snoozed contacts and prioritizes by health

- [ ] **Task 3.8**: Implement ReminderService
  - **Reference**: `contracts/service-contracts.md` → "ReminderService" section (lines 420-480)
  - **Action**: Create `src/lib/services/reminderService.ts` with reminder CRUD
  - **Output**: Reminder service (status: pending/done only, no snoozed)

- [ ] **Task 3.9**: Implement SnoozeService
  - **Reference**: `contracts/service-contracts.md` → "SnoozeService" section (lines 490-520)
  - **Reference**: `data-model.md` → "Snooze" entity (lines 180-210)
  - **Action**: Create `src/lib/services/snoozeService.ts` for recommendation snoozing
  - **Output**: Snooze service that deprioritizes contacts temporarily

- [ ] **Task 3.10**: Create Next.js API Routes
  - **Reference**: `contracts/service-contracts.md` → All service contracts
  - **Reference**: `quickstart.md` → "Create API Routes" (lines 567-688)
  - **Reference**: `plan.md` → "Project Structure" → API routes (lines 68-99)
  - **Action**: Create Next.js API route handlers in `app/api/` that use the service layer
  - **Output**: RESTful API endpoints for all entities (contacts, tags, interactions, health, recommendations, reminders, snoozes)

---

## Phase 4: React Hooks & Data Fetching

**Goal**: Create SWR hooks for data fetching and mutations

- [ ] **Task 4.1**: Implement useContacts Hook
  - **Reference**: `quickstart.md` → "Custom Hooks with SWR" → useContacts (lines 861-923)
  - **Action**: Create `src/hooks/useContacts.ts` and `src/hooks/useContact.ts` that fetch from `/api/contacts`
  - **Output**: Hooks for fetching contact list and single contact via API

- [ ] **Task 4.2**: Implement useRecommendations Hook
  - **Reference**: `quickstart.md` → "Custom Hooks with SWR" → useRecommendations (lines 809-858)
  - **Action**: Create `src/hooks/useRecommendations.ts` that fetches from `/api/recommendations` with refresh capability
  - **Output**: Hook for fetching recommendations with refresh function via API

- [ ] **Task 4.3**: Implement Mutation Hooks
  - **Reference**: `quickstart.md` → "Using SWR with Mutations" (lines 980-1100)
  - **Action**: Create `src/hooks/useContactMutations.ts` with create/update/delete that call API endpoints
  - **Output**: Mutation hooks with optimistic updates that use API routes

---

## Phase 5: UI Components (Foundation)

**Goal**: Build reusable UI components and shared elements

- [ ] **Task 5.1**: Implement HealthIndicator Component
  - **Reference**: `plan.md` → "UI/UX Patterns" → "Components" → HealthIndicator (line 219)
  - **Reference**: `figma-prototype/src/components/HealthIndicator.tsx`
  - **Action**: Create `src/components/HealthIndicator.tsx` with green/yellow/red states
  - **Output**: Reusable health indicator component

- [ ] **Task 5.2**: Implement EmptyState Component
  - **Reference**: `quickstart.md` → "Empty State Component" (lines 1146-1204)
  - **Reference**: `plan.md` → "UI/UX Patterns" → Empty states
  - **Action**: Create `src/components/shared/EmptyState.tsx` with friendly messaging
  - **Output**: Reusable empty state component with CTA buttons

- [ ] **Task 5.3**: Implement Navigation Component
  - **Reference**: `plan.md` → "UI/UX Patterns" → "Navigation" (lines 186-189)
  - **Reference**: `figma-prototype/src/components/Navigation.tsx`
  - **Action**: Create `src/components/Navigation.tsx` with top nav bar
  - **Output**: Navigation component with Dashboard/Contacts links

---

## Phase 6: UI Components (Feature-Specific)

**Goal**: Build feature-specific components for each user story

- [ ] **Task 6.1**: Implement Dashboard Component
  - **Reference**: `quickstart.md` → "Dashboard Component with SWR" (lines 925-985)
  - **Reference**: `plan.md` → "UI/UX Patterns" → "Dashboard" (lines 650-655)
  - **Reference**: `figma-prototype/src/components/Dashboard.tsx`
  - **Action**: Create `src/components/Dashboard.tsx` with recommendations and reminders
  - **Output**: Dashboard showing up to 3 recommendations with refresh

- [ ] **Task 6.2**: Implement RecommendationCard Component
  - **Reference**: `plan.md` → "UI/UX Patterns" → "Components" → RecommendationCard (line 220)
  - **Reference**: `figma-prototype/src/components/RecommendationCard.tsx`
  - **Action**: Create `src/components/RecommendationCard.tsx` with personalized messaging
  - **Output**: Recommendation card with snooze and log interaction actions

- [ ] **Task 6.3**: Implement ContactList Component
  - **Reference**: `plan.md` → "UI/UX Patterns" → "Contact List" (lines 198-203)
  - **Reference**: `figma-prototype/src/components/ContactList.tsx`
  - **Action**: Create `src/components/ContactList.tsx` with search, filter, sort
  - **Output**: Contact list with cards showing health, tags, and last interaction

- [ ] **Task 6.4**: Implement ContactDetail Component
  - **Reference**: `plan.md` → "UI/UX Patterns" → "Contact Detail" (lines 205-211)
  - **Reference**: `figma-prototype/src/components/ContactDetail.tsx`
  - **Action**: Create `src/components/ContactDetail.tsx` with header, profile note, reminders, interaction timeline
  - **Output**: Complete contact detail view with all information

- [ ] **Task 6.5**: Implement ContactForm Component
  - **Reference**: `plan.md` → "UI/UX Patterns" → "Forms" → Contact Form (lines 672-675)
  - **Reference**: `figma-prototype/src/components/ContactForm.tsx`
  - **Reference**: `quickstart.md` → "Contact Form with SWR Mutation" (lines 1062-1142)
  - **Action**: Create `src/components/ContactForm.tsx` for add/edit contact
  - **Output**: Form with validation and tag multi-select

- [ ] **Task 6.6**: Implement LogInteraction Component
  - **Reference**: `plan.md` → "UI/UX Patterns" → "Forms" → Log Interaction (line 215)
  - **Reference**: `figma-prototype/src/components/LogInteraction.tsx`
  - **Action**: Create `src/components/LogInteraction.tsx` with interaction type selection
  - **Output**: Form for logging text/call/hangout interactions

---

## Phase 7: Next.js Pages & Routing

**Goal**: Create Next.js pages that use the components

- [ ] **Task 7.1**: Create Root Layout
  - **Reference**: `quickstart.md` → "SWR Provider Setup" (lines 774-804)
  - **Action**: Create `app/layout.tsx` with SWR provider, Material-UI theme provider, Navigation
  - **Output**: Root layout with providers and navigation

- [ ] **Task 7.2**: Create Dashboard Page
  - **Reference**: `plan.md` → "Project Structure" → app/page.tsx
  - **Action**: Create `app/page.tsx` that renders Dashboard component
  - **Output**: Home page showing dashboard

- [ ] **Task 7.3**: Create Contact List Page
  - **Reference**: `plan.md` → "Project Structure" → app/contacts/page.tsx
  - **Action**: Create `app/contacts/page.tsx` that renders ContactList component
  - **Output**: Contact list page

- [ ] **Task 7.4**: Create Contact Detail Page
  - **Reference**: `plan.md` → "Project Structure" → app/contacts/[id]/page.tsx
  - **Action**: Create `app/contacts/[id]/page.tsx` that renders ContactDetail component
  - **Output**: Dynamic contact detail page

- [ ] **Task 7.5**: Create Add Contact Page
  - **Reference**: `plan.md` → "Project Structure" → app/contacts/new/page.tsx
  - **Action**: Create `app/contacts/new/page.tsx` that renders ContactForm component
  - **Output**: Add contact page

- [ ] **Task 7.6**: Create Edit Contact Page
  - **Reference**: `plan.md` → "Project Structure" → app/contacts/[id]/edit/page.tsx
  - **Action**: Create `app/contacts/[id]/edit/page.tsx` that renders ContactForm with existing data
  - **Output**: Edit contact page

- [ ] **Task 7.7**: Create Log Interaction Page
  - **Reference**: `plan.md` → "Project Structure" → app/interactions/[contactId]/page.tsx
  - **Action**: Create `app/interactions/[contactId]/page.tsx` that renders LogInteraction component
  - **Output**: Log interaction page

---

## Phase 8: Testing

**Goal**: Implement comprehensive test coverage

- [ ] **Task 8.1**: Set Up Testing Infrastructure
  - **Reference**: `quickstart.md` → "Testing Setup" → "Jest Configuration" (lines 1208-1228)
  - **Action**: Configure Jest, React Testing Library, and MSW
  - **Output**: Testing environment ready

- [ ] **Task 8.2**: Write Unit Tests for Utilities
  - **Reference**: `quickstart.md` → "Unit Tests" (lines 1234-1265)
  - **Action**: Write tests for `healthCalculator.ts` and `validators.ts`
  - **Output**: Unit test coverage for core utilities

- [ ] **Task 8.3**: Write Integration Tests for Services
  - **Reference**: `quickstart.md` → "Integration Tests" (lines 1267-1296)
  - **Action**: Write tests for all service layer methods
  - **Output**: Integration test coverage for data operations

- [ ] **Task 8.4**: Write Tests for SWR Hooks
  - **Reference**: `quickstart.md` → "Testing SWR Hooks" (lines 1298-1350)
  - **Action**: Write tests for all custom hooks
  - **Output**: Hook test coverage

- [ ] **Task 8.5**: Write Component Tests
  - **Reference**: `quickstart.md` → Testing examples
  - **Action**: Write tests for key UI components
  - **Output**: Component test coverage

---

## Phase 9: Error Handling & Edge Cases

**Goal**: Implement error handling and edge case scenarios

- [ ] **Task 9.1**: Implement Error Handling
  - **Reference**: `spec.md` → "Clarifications" → Error states (line 12)
  - **Reference**: `spec.md` → FR-031 (user-friendly error messages)
  - **Action**: Add error boundaries, error states in components, retry logic
  - **Output**: Comprehensive error handling throughout app

- [ ] **Task 9.2**: Implement Empty States
  - **Reference**: `spec.md` → "Clarifications" → Empty states (line 13)
  - **Reference**: `spec.md` → FR-032 (empty states with CTAs)
  - **Action**: Add empty states to all lists (contacts, interactions, recommendations)
  - **Output**: Friendly empty states with action buttons

- [ ] **Task 9.3**: Handle Edge Cases
  - **Reference**: `spec.md` → "Edge Cases" section (lines 100-134)
  - **Action**: Implement handling for duplicate names, no tags, archived contacts, etc.
  - **Output**: All edge cases handled gracefully

---

## Phase 10: Polish & Refinement

**Goal**: Final touches, performance optimization, and UX improvements

- [ ] **Task 10.1**: Optimize Performance
  - **Reference**: `research.md` → "Performance Optimization" (lines 254-273)
  - **Action**: Implement lazy loading, caching, debouncing, pagination
  - **Output**: App meets performance goals (2s dashboard, 3s contact list)

- [ ] **Task 10.2**: Add Loading States
  - **Reference**: `plan.md` → UI patterns
  - **Action**: Add loading skeletons and spinners throughout
  - **Output**: Smooth loading experience

- [ ] **Task 10.3**: Add Progressive Web App Features (Optional)
  - **Reference**: Next.js PWA documentation
  - **Action**: Add service worker and manifest for installability (basic PWA features)
  - **Output**: App can be installed as a web app (note: requires network connectivity for data access)

- [ ] **Task 10.4**: Final UX Polish
  - **Reference**: `plan.md` → "UI/UX Patterns" (all sections)
  - **Reference**: `figma-prototype/` for design reference
  - **Action**: Ensure warm tone, friendly copy, smooth animations
  - **Output**: Polished, encouraging user experience

---

## Progress Summary

**Total Tasks**: 51  
**Completed**: 0  
**In Progress**: 0  
**Remaining**: 51

### Phase Completion Status

- [ ] Phase 1: Foundation & Setup (5 tasks)
- [ ] Phase 2: Data Layer (5 tasks)
- [ ] Phase 3: Business Logic Layer (10 tasks)
- [ ] Phase 4: React Hooks & Data Fetching (3 tasks)
- [ ] Phase 5: UI Components - Foundation (3 tasks)
- [ ] Phase 6: UI Components - Features (6 tasks)
- [ ] Phase 7: Next.js Pages & Routing (7 tasks)
- [ ] Phase 8: Testing (5 tasks)
- [ ] Phase 9: Error Handling & Edge Cases (3 tasks)
- [ ] Phase 10: Polish & Refinement (4 tasks)

---

## Quick Reference

When implementing tasks, refer to:

- **`spec.md`**: Complete feature specification with user stories and requirements
- **`data-model.md`**: Database schema and entity definitions
- **`contracts/service-contracts.md`**: Service layer API contracts
- **`quickstart.md`**: Step-by-step implementation guide with code examples
- **`research.md`**: Technical decisions and rationale
- **`plan.md`**: Complete implementation plan with project structure
- **`figma-prototype/`**: Interactive UI prototype for design reference

