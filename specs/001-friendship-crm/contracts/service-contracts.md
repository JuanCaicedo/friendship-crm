# Service Layer API Contracts

**Date**: 2025-01-27  
**Version**: 1.0.0  
**Purpose**: Define internal service layer APIs for Personal Friendship CRM

## Overview

All functionality is exposed through service layer interfaces. These contracts define the API surface for business logic operations. Services are language-agnostic interfaces that can be implemented in any chosen framework.

## Common Types

```typescript
// Unix timestamp (seconds since epoch)
type Timestamp = number;

// Health status indicator
type HealthStatus = 'green' | 'yellow' | 'red';

// Interaction type
type InteractionType = 'text' | 'call' | 'hangout';

// Reminder status
type ReminderStatus = 'pending' | 'done';
```

## ContactService

Manages contact CRUD operations and tag assignments.

### createContact(params: CreateContactParams): Promise<Contact>

Creates a new contact.

**Parameters**:
```typescript
interface CreateContactParams {
  name: string;                    // Required, 1-200 chars
  birthday?: string;               // Optional, ISO 8601 date (YYYY-MM-DD)
  profileNote?: string;           // Optional, max 5000 chars
  tagIds?: number[];              // Optional, array of tag IDs
}
```

**Returns**: `Contact` object

**Errors**:
- `ValidationError`: Name is empty or exceeds max length
- `NotFoundError`: Tag ID does not exist
- `DatabaseError`: Database operation failed

### getContact(id: number): Promise<Contact | null>

Retrieves a contact by ID.

**Parameters**:
- `id`: Contact ID

**Returns**: `Contact` object or `null` if not found

**Errors**:
- `DatabaseError`: Database operation failed

### getContacts(options?: GetContactsOptions): Promise<Contact[]>

Retrieves a list of contacts.

**Parameters**:
```typescript
interface GetContactsOptions {
  archived?: boolean;             // Filter by archived status (default: false)
  tagId?: number;                 // Filter by tag ID
  limit?: number;                 // Max results (default: no limit)
  offset?: number;                // Pagination offset (default: 0)
}
```

**Returns**: Array of `Contact` objects

**Errors**:
- `DatabaseError`: Database operation failed

### updateContact(id: number, params: UpdateContactParams): Promise<Contact>

Updates an existing contact.

**Parameters**:
```typescript
interface UpdateContactParams {
  name?: string;                  // 1-200 chars
  birthday?: string | null;        // ISO 8601 date or null to clear
  profileNote?: string | null;    // Max 5000 chars or null to clear
}
```

**Returns**: Updated `Contact` object

**Errors**:
- `NotFoundError`: Contact does not exist
- `ValidationError`: Invalid parameter values
- `DatabaseError`: Database operation failed

### archiveContact(id: number): Promise<Contact>

Archives a contact (marks as archived, preserves data).

**Parameters**:
- `id`: Contact ID

**Returns**: Updated `Contact` object with `archived: true`

**Errors**:
- `NotFoundError`: Contact does not exist
- `DatabaseError`: Database operation failed

### unarchiveContact(id: number): Promise<Contact>

Unarchives a contact.

**Parameters**:
- `id`: Contact ID

**Returns**: Updated `Contact` object with `archived: false`

**Errors**:
- `NotFoundError`: Contact does not exist
- `DatabaseError`: Database operation failed

### assignTag(contactId: number, tagId: number): Promise<void>

Assigns a tag to a contact.

**Parameters**:
- `contactId`: Contact ID
- `tagId`: Tag ID

**Returns**: `void`

**Errors**:
- `NotFoundError`: Contact or tag does not exist
- `ConflictError`: Tag already assigned to contact
- `DatabaseError`: Database operation failed

### removeTag(contactId: number, tagId: number): Promise<void>

Removes a tag from a contact.

**Parameters**:
- `contactId`: Contact ID
- `tagId`: Tag ID

**Returns**: `void`

**Errors**:
- `NotFoundError`: Contact or tag does not exist, or tag not assigned
- `DatabaseError`: Database operation failed

## TagService

Manages relationship tags.

### createTag(params: CreateTagParams): Promise<Tag>

Creates a custom tag.

**Parameters**:
```typescript
interface CreateTagParams {
  name: string;                    // Required, 1-100 chars, unique
  minIntervalDays: number;        // Required, >= 1
  maxIntervalDays: number;        // Required, >= minIntervalDays
  priority: number;                // Required, >= 1
}
```

**Returns**: `Tag` object

**Errors**:
- `ValidationError`: Invalid parameter values
- `ConflictError`: Tag name already exists
- `DatabaseError`: Database operation failed

### getTag(id: number): Promise<Tag | null>

Retrieves a tag by ID.

**Parameters**:
- `id`: Tag ID

**Returns**: `Tag` object or `null` if not found

**Errors**:
- `DatabaseError`: Database operation failed

### getTags(): Promise<Tag[]>

Retrieves all tags (default and custom).

**Returns**: Array of `Tag` objects, sorted by priority (descending)

**Errors**:
- `DatabaseError`: Database operation failed

### updateTag(id: number, params: UpdateTagParams): Promise<Tag>

Updates a tag (custom tags only, default tags cannot be modified).

**Parameters**:
```typescript
interface UpdateTagParams {
  name?: string;                   // 1-100 chars, unique
  minIntervalDays?: number;       // >= 1
  maxIntervalDays?: number;       // >= minIntervalDays
  priority?: number;               // >= 1
}
```

**Returns**: Updated `Tag` object

**Errors**:
- `NotFoundError`: Tag does not exist
- `ForbiddenError`: Attempting to update default tag
- `ValidationError`: Invalid parameter values
- `ConflictError`: Tag name already exists
- `DatabaseError`: Database operation failed

### deleteTag(id: number): Promise<void>

Deletes a custom tag (removes from all contacts).

**Parameters**:
- `id`: Tag ID

**Returns**: `void`

**Errors**:
- `NotFoundError`: Tag does not exist
- `ForbiddenError`: Attempting to delete default tag
- `DatabaseError`: Database operation failed

## InteractionService

Manages interaction logging and history.

### logInteraction(params: LogInteractionParams): Promise<Interaction>

Logs a new interaction with a contact.

**Parameters**:
```typescript
interface LogInteractionParams {
  contactId: number;               // Required
  type: InteractionType;           // Required: 'text', 'call', or 'hangout'
  timestamp: Timestamp;            // Required, Unix timestamp
  notes?: string;                  // Optional, max 2000 chars
}
```

**Returns**: `Interaction` object (with calculated `weight`)

**Errors**:
- `NotFoundError`: Contact does not exist
- `ValidationError`: Invalid interaction type or timestamp
- `DatabaseError`: Database operation failed

### getInteraction(id: number): Promise<Interaction | null>

Retrieves an interaction by ID.

**Parameters**:
- `id`: Interaction ID

**Returns**: `Interaction` object or `null` if not found

**Errors**:
- `DatabaseError`: Database operation failed

### getInteractions(options: GetInteractionsOptions): Promise<Interaction[]>

Retrieves interactions, optionally filtered by contact.

**Parameters**:
```typescript
interface GetInteractionsOptions {
  contactId?: number;              // Filter by contact (optional)
  limit?: number;                  // Max results (default: no limit)
  offset?: number;                 // Pagination offset (default: 0)
  orderBy?: 'timestamp' | 'created_at'; // Sort order (default: 'timestamp')
  order?: 'asc' | 'desc';         // Sort direction (default: 'desc')
}
```

**Returns**: Array of `Interaction` objects

**Errors**:
- `DatabaseError`: Database operation failed

### updateInteraction(id: number, params: UpdateInteractionParams): Promise<Interaction>

Updates an existing interaction.

**Parameters**:
```typescript
interface UpdateInteractionParams {
  type?: InteractionType;           // 'text', 'call', or 'hangout'
  timestamp?: Timestamp;          // Unix timestamp
  notes?: string | null;           // Max 2000 chars or null to clear
}
```

**Returns**: Updated `Interaction` object (weight recalculated if type changed)

**Errors**:
- `NotFoundError`: Interaction does not exist
- `ValidationError`: Invalid parameter values
- `DatabaseError`: Database operation failed

### deleteInteraction(id: number): Promise<void>

Deletes an interaction.

**Parameters**:
- `id`: Interaction ID

**Returns**: `void`

**Errors**:
- `NotFoundError`: Interaction does not exist
- `DatabaseError`: Database operation failed

## HealthService

Calculates and retrieves relationship health scores.

### calculateHealth(contactId: number): Promise<HealthScore>

Calculates health score for a contact.

**Parameters**:
- `contactId`: Contact ID

**Returns**: `HealthScore` object

**Errors**:
- `NotFoundError`: Contact does not exist
- `DatabaseError`: Database operation failed

### getHealthStatus(contactId: number): Promise<HealthStatus>

Gets health status indicator (green/yellow/red) for a contact.

**Parameters**:
- `contactId`: Contact ID

**Returns**: `HealthStatus` ('green', 'yellow', or 'red')

**Errors**:
- `NotFoundError`: Contact does not exist
- `DatabaseError`: Database operation failed

### getHealthScores(contactIds: number[]): Promise<Map<number, HealthScore>>

Batch calculates health scores for multiple contacts.

**Parameters**:
- `contactIds`: Array of contact IDs

**Returns**: Map of contact ID to `HealthScore` object

**Errors**:
- `DatabaseError`: Database operation failed

## RecommendationService

Generates personalized recommendations.

### generateRecommendations(options?: RecommendationOptions): Promise<Recommendation[]>

Generates up to 3 recommendations.

**Parameters**:
```typescript
interface RecommendationOptions {
  limit?: number;                  // Max recommendations (default: 3)
  excludeContactIds?: number[];    // Contacts to exclude (for refresh)
}
```

**Returns**: Array of `Recommendation` objects (up to limit), sorted by priority

**Errors**:
- `DatabaseError`: Database operation failed

### refreshRecommendations(excludeContactIds: number[]): Promise<Recommendation[]>

Refreshes recommendations, excluding previously shown contacts.

**Parameters**:
- `excludeContactIds`: Array of contact IDs to exclude

**Returns**: Array of `Recommendation` objects (up to 3)

**Errors**:
- `DatabaseError`: Database operation failed

**Notes**:
- Recommendations automatically exclude contacts with active snoozes (where current time < snoozed_until)

## ReminderService

Manages reminders for contacts.

### createReminder(params: CreateReminderParams): Promise<Reminder>

Creates a reminder for a contact.

**Parameters**:
```typescript
interface CreateReminderParams {
  contactId: number;               // Required
  dueDate: Timestamp;             // Required, Unix timestamp
  note?: string;                   // Optional, max 1000 chars
}
```

**Returns**: `Reminder` object

**Errors**:
- `NotFoundError`: Contact does not exist
- `ValidationError`: Invalid due date
- `DatabaseError`: Database operation failed

### getReminder(id: number): Promise<Reminder | null>

Retrieves a reminder by ID.

**Parameters**:
- `id`: Reminder ID

**Returns**: `Reminder` object or `null` if not found

**Errors**:
- `DatabaseError`: Database operation failed

### getReminders(options: GetRemindersOptions): Promise<Reminder[]>

Retrieves reminders, optionally filtered.

**Parameters**:
```typescript
interface GetRemindersOptions {
  contactId?: number;              // Filter by contact (optional)
  status?: ReminderStatus;         // Filter by status (optional: "pending" or "done")
  dueBefore?: Timestamp;           // Filter by due date (optional)
  includePast?: boolean;           // Include past reminders (default: false)
}
```

**Returns**: Array of `Reminder` objects

**Errors**:
- `DatabaseError`: Database operation failed

### snoozeRecommendation(contactId: number, days: number): Promise<Snooze>

Snoozes a recommendation for a contact, deprioritizing them from recommendations for the specified number of days.

**Parameters**:
- `contactId`: Contact ID to snooze
- `days`: Number of days to snooze (typically 3-7, but can be any positive number)

**Returns**: `Snooze` object with `snoozed_until` timestamp

**Errors**:
- `NotFoundError`: Contact does not exist
- `ValidationError`: Days must be positive
- `DatabaseError`: Database operation failed

**Notes**:
- Snoozing does NOT affect the contact's health status
- Snoozing does NOT create an interaction record
- If contact is already snoozed, the new snooze replaces the old one

### markReminderDone(id: number): Promise<Reminder>

Marks a reminder as done.

**Parameters**:
- `id`: Reminder ID

**Returns**: Updated `Reminder` object with status="done"

**Errors**:
- `NotFoundError`: Reminder does not exist
- `DatabaseError`: Database operation failed

## SnoozeService

Manages snoozing of recommendations.

### snoozeRecommendation(contactId: number, days: number): Promise<Snooze>

Snoozes a recommendation for a contact, deprioritizing them from recommendations for the specified number of days.

**Parameters**:
- `contactId`: Contact ID to snooze
- `days`: Number of days to snooze (typically 3-7, but can be any positive number)

**Returns**: `Snooze` object with `snoozed_until` timestamp

**Errors**:
- `NotFoundError`: Contact does not exist
- `ValidationError`: Days must be positive
- `DatabaseError`: Database operation failed

**Notes**:
- Snoozing does NOT affect the contact's health status
- Snoozing does NOT create an interaction record
- If contact is already snoozed, the new snooze replaces the old one
- Expired snoozes (where current time > snoozed_until) are automatically ignored

## Data Models

### Contact

```typescript
interface Contact {
  id: number;
  name: string;
  birthday: string | null;
  profileNote: string | null;
  createdAt: Timestamp;
  archived: boolean;
  updatedAt: Timestamp;
  tags?: Tag[];                    // Populated when requested
}
```

### Tag

```typescript
interface Tag {
  id: number;
  name: string;
  minIntervalDays: number;
  maxIntervalDays: number;
  priority: number;
  isDefault: boolean;
  createdAt: Timestamp;
}
```

### Interaction

```typescript
interface Interaction {
  id: number;
  contactId: number;
  type: InteractionType;
  weight: number;                  // Calculated: 1, 3, or 6
  timestamp: Timestamp;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Reminder

```typescript
interface Reminder {
  id: number;
  contactId: number;
  dueDate: Timestamp;
  status: ReminderStatus;
  note: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Snooze

```typescript
interface Snooze {
  id: number;
  contactId: number;
  snoozedUntil: Timestamp;
  createdAt: Timestamp;
}
```

### HealthScore

```typescript
interface HealthScore {
  contactId: number;
  score: number;                   // Calculated health score (0.0 - 1.0+)
  status: HealthStatus;            // 'green', 'yellow', or 'red'
  lastInteractionTimestamp: Timestamp | null;
  expectedIntervalDays: number;    // From highest-priority tag
}
```

### Recommendation

```typescript
interface Recommendation {
  contactId: number;
  contact: Contact;                 // Populated contact object
  reason: string;                  // Encouraging message explaining why
  priority: number;                 // Recommendation priority (higher = more important)
  healthStatus: HealthStatus;
  isReminder: boolean;             // True if based on reminder
}
```

## Error Types

All services may throw the following error types:

- `ValidationError`: Invalid input parameters
- `NotFoundError`: Resource does not exist
- `ConflictError`: Resource conflict (e.g., duplicate name)
- `ForbiddenError`: Operation not allowed (e.g., delete default tag)
- `DatabaseError`: Database operation failed

## Versioning

**Current Version**: 1.0.0

**Versioning Strategy**:
- Breaking changes require major version bump (2.0.0)
- New optional parameters are minor version bumps (1.1.0)
- Bug fixes are patch version bumps (1.0.1)

**Backward Compatibility**:
- Service interfaces remain stable within major versions
- New optional parameters added without breaking existing calls
- Deprecated methods marked and removed in next major version

