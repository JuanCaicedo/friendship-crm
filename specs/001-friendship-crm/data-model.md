# Data Model: Personal Friendship CRM

**Date**: 2025-01-27  
**Database**: Encrypted SQLite (SQLCipher)

## Entity Relationship Diagram

```
Contact ──┐
          ├── ContactTag ─── Tag
          │
          ├── Interaction
          │
          ├── Reminder
          │
          └── Snooze
```

## Entities

### Contact

Represents someone the user wants to maintain a relationship with.

**Table**: `contacts`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| `name` | TEXT | NOT NULL | Contact's name (required) |
| `birthday` | TEXT | NULL | Birthday (ISO 8601 date string, YYYY-MM-DD) |
| `profile_note` | TEXT | NULL | Persistent information to help remember context |
| `created_at` | INTEGER | NOT NULL | Unix timestamp of creation |
| `archived` | INTEGER | NOT NULL, DEFAULT 0 | Boolean: 0 = active, 1 = archived |
| `updated_at` | INTEGER | NOT NULL | Unix timestamp of last update |

**Validation Rules**:
- `name` must be non-empty string (trimmed, min 1 character, max 200 characters)
- `birthday` must be valid ISO 8601 date if provided
- `profile_note` max length: 5000 characters
- `created_at` and `updated_at` must be valid timestamps

**Indexes**:
- `idx_contacts_archived` on `archived`
- `idx_contacts_created_at` on `created_at`

**State Transitions**:
- `archived`: 0 → 1 (archive), 1 → 0 (unarchive) - allowed for historical reference

### Tag

Represents a relationship category that determines how frequently the user wants to reach out.

**Table**: `tags`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| `name` | TEXT | NOT NULL, UNIQUE | Tag name (e.g., "Family", "Close friend") |
| `min_interval_days` | INTEGER | NOT NULL | Minimum days between contacts |
| `max_interval_days` | INTEGER | NOT NULL | Maximum days between contacts |
| `priority` | INTEGER | NOT NULL | Priority (higher = more important) |
| `is_default` | INTEGER | NOT NULL, DEFAULT 0 | Boolean: 1 = default tag, 0 = custom |
| `created_at` | INTEGER | NOT NULL | Unix timestamp of creation |

**Validation Rules**:
- `name` must be non-empty string (trimmed, min 1 character, max 100 characters)
- `min_interval_days` must be >= 1
- `max_interval_days` must be >= `min_interval_days`
- `priority` must be >= 1 (typically 1-10 range)
- Default tags: "Family" (priority 10), "Close friend" (priority 8), "Acquaintance" (priority 5), "Old friend" (priority 3)

**Indexes**:
- `idx_tags_priority` on `priority` (for health calculation)
- `idx_tags_name` on `name` (unique constraint)

**Default Tags** (inserted on first app launch):
1. **Family**: min_interval=7, max_interval=14, priority=10
2. **Close friend**: min_interval=14, max_interval=30, priority=8
3. **Acquaintance**: min_interval=90, max_interval=180, priority=5
4. **Old friend**: min_interval=180, max_interval=365, priority=3

**State Transitions**:
- Tags can be deleted (cascades to ContactTag relationships)
- Default tags cannot be deleted (enforced in application logic)

### ContactTag

Represents the many-to-many relationship between contacts and tags.

**Table**: `contact_tags`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| `contact_id` | INTEGER | NOT NULL, FOREIGN KEY → contacts.id | Reference to contact |
| `tag_id` | INTEGER | NOT NULL, FOREIGN KEY → tags.id | Reference to tag |
| `created_at` | INTEGER | NOT NULL | Unix timestamp of assignment |

**Validation Rules**:
- `contact_id` and `tag_id` must reference existing records
- Unique constraint on (`contact_id`, `tag_id`) to prevent duplicates

**Indexes**:
- `idx_contact_tags_contact` on `contact_id`
- `idx_contact_tags_tag` on `tag_id`
- UNIQUE INDEX on (`contact_id`, `tag_id`)

**Cascade Rules**:
- ON DELETE CASCADE: If contact deleted, delete all ContactTag relationships
- ON DELETE CASCADE: If tag deleted, delete all ContactTag relationships

### Interaction

Represents a single contact event between the user and a contact.

**Table**: `interactions`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| `contact_id` | INTEGER | NOT NULL, FOREIGN KEY → contacts.id | Reference to contact |
| `type` | TEXT | NOT NULL | Interaction type: "text", "call", or "hangout" |
| `weight` | INTEGER | NOT NULL | Weight: 1 (text), 3 (call), 6 (hangout) |
| `timestamp` | INTEGER | NOT NULL | Unix timestamp of interaction |
| `notes` | TEXT | NULL | Optional notes about the interaction |
| `created_at` | INTEGER | NOT NULL | Unix timestamp of record creation |
| `updated_at` | INTEGER | NOT NULL | Unix timestamp of last update |

**Validation Rules**:
- `type` must be one of: "text", "call", "hangout"
- `weight` must match type: text=1, call=3, hangout=6 (enforced in application logic)
- `timestamp` must be valid Unix timestamp
- `notes` max length: 2000 characters
- `contact_id` must reference existing contact (even if archived)

**Indexes**:
- `idx_interactions_contact` on `contact_id`
- `idx_interactions_timestamp` on `timestamp` (for chronological sorting)
- `idx_interactions_contact_timestamp` on (`contact_id`, `timestamp`) (for contact history queries)

**Cascade Rules**:
- ON DELETE CASCADE: If contact deleted, delete all interactions

### Reminder

Represents a user-defined task to contact someone.

**Table**: `reminders`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| `contact_id` | INTEGER | NOT NULL, FOREIGN KEY → contacts.id | Reference to contact |
| `due_date` | INTEGER | NOT NULL | Unix timestamp of due date |
| `status` | TEXT | NOT NULL | Status: "pending" or "done" |
| `note` | TEXT | NULL | Optional note about the reminder |
| `created_at` | INTEGER | NOT NULL | Unix timestamp of creation |
| `updated_at` | INTEGER | NOT NULL | Unix timestamp of last update |

**Validation Rules**:
- `status` must be one of: "pending", "done"
- `due_date` must be valid Unix timestamp
- `note` max length: 1000 characters
- `contact_id` must reference existing contact

**Indexes**:
- `idx_reminders_contact` on `contact_id`
- `idx_reminders_due_date` on `due_date` (for recommendation queries)
- `idx_reminders_status` on `status`
- `idx_reminders_contact_status` on (`contact_id`, `status`)

**State Transitions**:
- `status`: "pending" → "done" (mark done)

**Cascade Rules**:
- ON DELETE CASCADE: If contact deleted, delete all reminders

### Snooze

Represents a temporary deprioritization of a contact from recommendations. Snoozing is treated as a type of interaction but does not affect health status.

**Table**: `snoozes`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| `contact_id` | INTEGER | NOT NULL, FOREIGN KEY → contacts.id | Reference to contact |
| `snoozed_until` | INTEGER | NOT NULL | Unix timestamp until which contact is snoozed |
| `created_at` | INTEGER | NOT NULL | Unix timestamp of creation |

**Validation Rules**:
- `snoozed_until` must be valid Unix timestamp in the future
- `contact_id` must reference existing contact
- Multiple active snoozes for same contact: Only the most recent one is considered (others can be expired/ignored)

**Indexes**:
- `idx_snoozes_contact` on `contact_id`
- `idx_snoozes_snoozed_until` on `snoozed_until` (for filtering expired snoozes)
- `idx_snoozes_contact_active` on (`contact_id`, `snoozed_until`) (for checking active snoozes)

**Cascade Rules**:
- ON DELETE CASCADE: If contact deleted, delete all snoozes

**Notes**:
- Snoozing a contact creates a snooze record that prevents the contact from appearing in recommendations until `snoozed_until` timestamp
- Snoozing does NOT affect health calculation (health remains low if it was low)
- Snoozing does NOT create an interaction record
- When a snooze expires (current time > `snoozed_until`), the contact can appear in recommendations again
- If a user snoozes a contact again before the previous snooze expires, the new snooze replaces the old one

## Calculated Entities

### Health Score

A calculated value representing relationship freshness. Not stored in database, calculated on-demand.

**Calculation Formula** (exponential decay):
```
health_score = interaction_weight * e^(-decay_rate * days_elapsed)

Where:
- interaction_weight = weight of most recent interaction (1, 3, or 6)
- decay_rate = 1 / (expected_interval_days * decay_factor)
- expected_interval_days = max_interval_days from highest-priority tag
- days_elapsed = (current_timestamp - last_interaction_timestamp) / 86400
- decay_factor = 2.0 (tuning parameter)
```

**Health Indicator Thresholds**:
- **Green (healthy)**: health_score >= 0.5
- **Yellow (needs attention)**: 0.2 <= health_score < 0.5
- **Red (overdue)**: health_score < 0.2

**Edge Cases**:
- No interactions: health_score = 0 (red)
- New contact (< 1 year old, no interactions): health_score = 1.0 (green) until 1 year passes
- Contact with no tags: Use default interval (365 days, priority 1)

**Caching Strategy**:
- Calculate on-demand when viewing contact
- Invalidate cache when new interaction is logged
- Recalculate in background after interaction creation

### Recommendation

A suggestion for who the user should reach out to. Not stored in database, generated on-demand.

**Prioritization Algorithm**:
1. **Highest Priority**: Reminders that are due or overdue (status="pending" with due_date <= now)
2. **Secondary Priority**: Contacts sorted by health status (red > yellow > green)
3. **Tie-breaking**: Among same health status, prioritize by lowest health_score (most urgent)
4. **Limit**: Return up to 3 recommendations

**Exclusions**:
- Archived contacts
- Contacts with no tags (unless reminder exists)
- Contacts that are already healthy (green) unless reminder exists
- Contacts with active snoozes (where current timestamp < snoozed_until)

## Database Schema Versioning

**Version 1.0** (Initial schema):
- All tables as defined above
- SQLCipher encryption enabled
- Foreign key constraints enabled
- Indexes as specified

**Migration Strategy**:
- Use versioned migration files
- Track schema version in `schema_version` table
- Apply migrations on app startup
- Backward compatibility: new fields nullable, old fields preserved

## Data Integrity Rules

1. **Referential Integrity**: All foreign keys must reference existing records
2. **Cascade Deletes**: Deleting a contact deletes all related interactions, reminders, and contact_tags
3. **Unique Constraints**: Contact names can be duplicated (user responsibility), but tag names must be unique
4. **Validation**: All application-level validation rules enforced before database writes
5. **Timestamps**: All `created_at` and `updated_at` fields automatically maintained

## Performance Considerations

1. **Indexing**: All foreign keys and frequently queried fields indexed
2. **Query Optimization**: Use prepared statements, limit result sets, paginate large lists
3. **Lazy Loading**: Load contact lists in batches, calculate health on-demand
4. **Caching**: Cache health scores with invalidation on interaction changes

## Security Considerations

1. **Encryption**: Database encrypted at rest using SQLCipher (AES-256)
2. **Key Management**: Encryption key stored in platform keychain/keystore
3. **Data Access**: Single-user app, no multi-user access controls needed
4. **Backup**: User can export encrypted database for backup (future feature)

