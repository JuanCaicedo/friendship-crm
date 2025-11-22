# Research: Personal Friendship CRM

**Date**: 2025-01-27  
**Purpose**: Resolve technical decisions for platform, language, frameworks, and implementation details

## Platform Selection

### Decision: Web Application (Next.js)

**Rationale**: 
- Web app provides cross-platform accessibility (desktop, tablet, mobile browsers)
- Next.js offers excellent performance with server-side rendering and static generation
- Material-UI provides consistent, accessible design system
- Can be deployed as a web application
- Server-side SQLite database with encryption support

**Alternatives Considered**:
- **Mobile app**: Rejected - web app provides broader accessibility without app store deployment
- **Desktop app**: Rejected - web app covers desktop use cases with better deployment simplicity
- **Hybrid mobile/web**: Considered - defer to future phase if mobile app needed

**Recommendation**: Next.js web application with Material-UI, requires network connectivity for data access.

## Language & Framework Selection

### Decision: Next.js with TypeScript and Material-UI

**Technology Stack**:
- **Framework**: Next.js 14+ (App Router) - React framework with SSR/SSG
- **Language**: TypeScript - type safety and better developer experience
- **UI Library**: Material-UI (MUI) v5+ - comprehensive component library with theming
- **State Management**: React Context API + useReducer (or Zustand for complex state)
- **Routing**: Next.js App Router (file-based routing)

**Rationale**:
- Next.js provides excellent performance with server-side rendering and static generation
- TypeScript ensures type safety for data models and API contracts
- Material-UI offers rich component library with customizable theming for warm, encouraging tone
- Next.js App Router provides modern React patterns (Server Components, Streaming)
- Large ecosystem and community support

**Testing**: 
- Jest + React Testing Library for unit/integration tests
- Playwright or Cypress for E2E tests
- MSW (Mock Service Worker) for API mocking

**UI Customization**:
- Material-UI theme customization for warm, encouraging tone
- Custom color palette (warm colors, soft gradients)
- Typography adjustments for friendly, personal feel
- Custom component variants for relationship-focused UI

## Storage & Encryption

### Decision: SQLite on Server with SQLCipher Encryption

**Rationale**:
- SQLite provides robust, SQL-based database with excellent performance
- Server-side storage enables better security and data management
- SQLCipher provides transparent encryption at rest
- Better-sqlite3 offers synchronous, high-performance Node.js bindings
- Supports future migration to hosted database (can export/import SQLite database)
- Full SQL support with transactions, indexes, and foreign keys

**Technology Stack**:
- **Database Layer**: better-sqlite3 - SQLite bindings for Node.js
- **Encryption**: SQLCipher - Transparent database encryption at rest
- **Key Management**: Environment variables or secure key management service
- **Migration**: SQL migration scripts for schema versioning

**Alternatives Considered**:
- **IndexedDB with Dexie.js**: Rejected - client-side only, limited to browser environment
- **PostgreSQL/MySQL**: Considered - overkill for single-user app, requires separate server setup
- **Application-level encryption only**: Considered - SQLCipher provides better security with transparent encryption
- **No encryption**: Rejected - violates constitution (Data Privacy & Security principle)

**Implementation Notes**:
- Use better-sqlite3 for database operations (synchronous API, excellent performance)
- Configure SQLCipher for database encryption at rest
- Store encryption key in environment variables (never commit to version control)
- Use SQL migrations for schema versioning
- Database file stored on server filesystem (ensure proper backups)
- Next.js API routes provide HTTP endpoints for data access
- API routes: Next.js API routes provide HTTP endpoints for data access (requires network connectivity)

## Health Calculation Algorithm

### Decision: Exponential Decay Formula

**Formula Details**:
```
health_score = base_score * e^(-decay_rate * time_elapsed)

Where:
- base_score = interaction_weight (1, 3, or 6)
- decay_rate = 1 / (expected_interval_days * decay_factor)
- time_elapsed = days since last interaction
- expected_interval_days = from highest-priority tag (min_interval_days or max_interval_days)
- decay_factor = tuning parameter (e.g., 2.0 means health decays over 2x the expected interval)
```

**Thresholds for Health Indicators**:
- **Green (healthy)**: health_score >= 0.5 (within expected interval)
- **Yellow (needs attention)**: 0.2 <= health_score < 0.5 (approaching overdue)
- **Red (overdue)**: health_score < 0.2 (past expected interval)

**Rationale**:
- Exponential decay naturally models relationship freshness (recent interactions matter more)
- Weighted by interaction type (hangout=6 refreshes more than text=1)
- Accounts for tag-based frequency requirements
- Smooth transitions between health states
- Mathematically sound and testable

**Alternatives Considered**:
- **Linear decay**: Rejected - doesn't reflect real relationship dynamics
- **Fixed thresholds**: Rejected - too simplistic, doesn't account for interaction weights
- **Percentage-based**: Considered - simpler but less accurate for weighted interactions

**Implementation Notes**:
- Calculate health on-demand (when viewing contact) or cache with invalidation on new interaction
- Performance: O(1) calculation per contact, acceptable for 200+ contacts
- Edge cases: No interactions = health_score = 0 (red), new contact (< 1 year) = no requirement (green until 1 year)

## Testing Strategy

### Decision: Multi-layer testing approach

**Test Pyramid**:
1. **Unit Tests** (70%):
   - Health calculation algorithm
   - Data model validation
   - Business logic (recommendation prioritization, tag priority resolution)
   - Utility functions

2. **Integration Tests** (20%):
   - Database operations (CRUD for all entities)
   - Encrypted storage read/write
   - Data migration scenarios
   - Health calculation with real data

3. **UI/Contract Tests** (10%):
   - User workflow tests (add contact → log interaction → view health)
   - API contract tests (if service layer APIs)
   - Error state handling
   - Empty state handling

**Testing Framework Selection**:
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright or Cypress
- **API Mocking**: MSW (Mock Service Worker)
- **Coverage**: Jest coverage reports

**TDD Approach**:
- Write failing tests first
- Implement minimal code to pass
- Refactor while maintaining green tests
- All data operations must have integration tests

## Observability & Logging

### Decision: Structured logging with error tracking

**Logging Requirements**:
- **Structured logs**: JSON format for machine parsing
- **Log levels**: DEBUG, INFO, WARN, ERROR
- **Context**: Include user actions, data changes, performance metrics
- **Privacy**: Never log sensitive data (contact names, notes, interaction details)
- **Performance**: Log operation timings (dashboard load, health calculation, database queries)

**Error Tracking**:
- Capture full error context (stack traces, user actions leading to error)
- Sanitize sensitive data before logging
- User-friendly error messages (as per FR-031)
- Error recovery suggestions

**Metrics to Track**:
- Dashboard load time (target: <2s)
- Contact list access time (target: <3s)
- Health calculation time (target: <1s)
- Database operation latency
- App crash rate
- User action success/failure rates

**Implementation**:
- Use platform-appropriate logging library
- Consider Sentry or similar for error tracking (if cloud service acceptable)
- Local log files for offline debugging

## API Architecture (Internal)

### Decision: Service layer with clear interfaces

**Architecture Pattern**: Service-oriented internal APIs

**Service Layer Structure**:
```
services/
├── ContactService
│   ├── createContact()
│   ├── updateContact()
│   ├── archiveContact()
│   └── getContacts()
├── InteractionService
│   ├── logInteraction()
│   ├── updateInteraction()
│   └── getInteractions()
├── HealthService
│   ├── calculateHealth()
│   └── getHealthStatus()
├── RecommendationService
│   ├── generateRecommendations()
│   └── refreshRecommendations()
└── ReminderService
    ├── createReminder()
    ├── snoozeReminder()
    └── markDone()
```

**Rationale**:
- Enables API-first architecture (all functionality accessible via services)
- Supports future HTTP API if needed (migration path)
- Testable in isolation
- Clear separation of concerns

**Versioning Strategy**:
- Internal APIs: version via interface changes (TypeScript interfaces, Swift protocols, etc.)
- Database schema: versioned migrations
- Future HTTP API: SEMVER (v1, v2, etc.)

## Project Structure Decision

### Decision: Next.js App Router structure (web app)

**Rationale**:
- Full-stack app with server-side database (SQLite)
- Next.js App Router provides file-based routing, Server Components, and API routes
- Clear separation: models, services, database, API routes, UI components, pages
- TypeScript throughout for type safety

**Structure**:
```
app/                 # Next.js App Router (pages/routes)
├── (dashboard)/     # Dashboard route group
│   ├── page.tsx
│   └── layout.tsx
├── contacts/
│   ├── page.tsx
│   ├── [id]/
│   └── new/
└── layout.tsx

src/
├── components/      # React components (Material-UI)
│   ├── contacts/
│   ├── interactions/
│   └── shared/
├── lib/            # Business logic
│   ├── models/     # Data models (TypeScript interfaces)
│   ├── services/   # Business logic services
│   ├── database/   # SQLite setup, migrations, encryption
│   └── utils/      # Helper functions, health calculation
└── hooks/          # Custom React hooks

tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/            # E2E tests (Playwright/Cypress)
```

**Next.js Specific**:
- App Router for routing (file-based)
- Server Components where possible for performance
- Client Components for interactive UI
- API Routes for server-side data access (app/api/ directory)

## Performance Optimization

### Decision: Lazy loading and caching strategy

**Optimization Strategies**:
1. **Lazy load contact list**: Load contacts in batches (pagination or virtual scrolling)
2. **Cache health scores**: Recalculate only when interactions change
3. **Database indexing**: Index on contact_id, interaction_timestamp, tag_priority
4. **Background calculation**: Calculate health scores in background thread
5. **Debounce recommendations**: Don't recalculate on every UI interaction

**Database Optimization**:
- Index on frequently queried fields (contact.archived, interaction.contact_id, interaction.timestamp)
- Use SQLite indexes for efficient queries
- Batch operations where possible (use transactions)
- Use Next.js Server Components for initial data loading
- Client-side caching with SWR for data fetching
- Use prepared statements for repeated queries

**Next.js Specific Optimizations**:
- Static generation for dashboard where possible
- Server Components for initial render
- Client Components only for interactive elements
- Image optimization with next/image
- Code splitting with dynamic imports
- Service Worker: Optional for basic PWA installability (app requires network connectivity for data access)

## Security Considerations

### Decision: SQLCipher with secure key management

**Key Management**:
- Store encryption key in environment variables (DATABASE_ENCRYPTION_KEY)
- Use secure key generation (cryptographically random)
- Never hardcode keys or commit keys to version control
- Use key management service in production (AWS Secrets Manager, etc.)
- Key rotation: requires database re-encryption (future feature)

**Key Generation**:
- Generate unique key per deployment/installation
- Use strong, randomly generated keys (32+ bytes)
- Store keys securely (environment variables, secrets manager)
- Key rotation: requires re-encryption of entire database

**Data Protection**:
- SQLCipher encrypts entire database at rest (transparent encryption)
- All data encrypted automatically (no need to encrypt individual fields)
- HTTPS required for API endpoints (protect data in transit)
- Content Security Policy (CSP) headers for XSS protection
- Input validation and SQL injection prevention (prepared statements)
- User can export/backup encrypted database (future feature)

## Migration Path to Hosted Database

### Decision: Design for future migration

**Migration Strategy**:
- Database schema designed to be portable (standard SQL)
- SQLite database can be exported/imported easily
- SQLCipher databases can be migrated to other SQLCipher instances
- API service layer already uses HTTP endpoints (Next.js API routes)
- Can migrate to PostgreSQL/MySQL by changing database layer implementation

**Future Considerations**:
- User authentication (when moving to hosted)
- Sync mechanism (conflict resolution)
- Backup/restore functionality
- Multi-device support

## Summary of Decisions

| Decision Area | Decision | Status |
|--------------|----------|--------|
| Platform | Web application (Next.js) | ✅ Resolved |
| Language/Framework | Next.js 14+ with TypeScript and Material-UI | ✅ Resolved |
| Local Storage | SQLite on server (better-sqlite3) | ✅ Resolved |
| Encryption | SQLCipher (database encryption at rest) | ✅ Resolved |
| Health Algorithm | Exponential decay formula | ✅ Resolved |
| Testing Strategy | Jest + React Testing Library + Playwright/Cypress | ✅ Resolved |
| Observability | Structured logging + error tracking | ✅ Resolved |
| API Architecture | Service layer pattern | ✅ Resolved |
| Project Structure | Next.js App Router structure | ✅ Resolved |
| Performance | Next.js optimizations + lazy loading + caching | ✅ Resolved |
| Security | SQLCipher with secure key management | ✅ Resolved |

## Remaining Clarifications Needed

1. **Deployment Target**: Vercel, Netlify, self-hosted, or other?
2. **PWA Features**: Basic installability (app requires network connectivity for data access)
3. **Development Timeline**: MVP scope and timeline constraints?

## Next Steps

1. Set up Next.js project with TypeScript and Material-UI
2. Configure SQLite (better-sqlite3) for server-side database
3. Implement encryption with SQLCipher
4. Implement database layer with SQL migrations
5. Create Next.js API routes for data access
6. Implement health calculation algorithm
7. Build service layer APIs
8. Implement UI with Material-UI and warm, encouraging design
9. Add comprehensive test coverage
10. Configure basic PWA features for installability (optional)

