# Feature Specification: Personal Friendship CRM

**Feature Branch**: `001-friendship-crm`  
**Created**: 2025-11-18  
**Status**: Draft  
**Input**: User description: "Build an app following the guidelines in the initial app specification document I added"

## Clarifications

### Session 2025-01-27

- Q: How should the system handle error states and user feedback when operations fail? → A: Display user-friendly error messages with actionable guidance (e.g., "Couldn't save contact. Please try again.") and retry options
- Q: How should the system handle empty states (e.g., no contacts, no interactions, no recommendations)? → A: Display contextual empty states with prominent call-to-action buttons to guide first actions
- Q: How should the system calculate the exact thresholds for health indicators (green/yellow/red)? → A: Weighted decay formula based on interaction weight and time elapsed (exponential decay)
- Q: What format should be used for local data persistence? → A: Encrypted local database (SQLite with encryption layer) - chosen to support future migration to hosted database
- Q: How should the recommendation algorithm prioritize contacts when multiple factors are considered? → A: Health status should be the primary factor since it already incorporates tag priority and interaction history; recommendations should prioritize contacts based on their health status

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add and Manage Contacts with Tags (Priority: P1)

A user wants to start tracking their friendships and relationships. They need to add people they care about to the system, along with relationship categories (tags) that help determine how frequently they should stay in touch. Each contact can belong to multiple categories, allowing flexible relationship classification.

**Why this priority**: This is the foundation of the entire application. Users must be able to add and manage contacts with their relationship categories before they can log interactions, receive recommendations, or track relationship health. This story delivers immediate value by creating a personal directory of important relationships with meaningful categorization.

**Independent Test**: Can be fully tested by adding a new contact with name, optional birthday, profile notes, and one or more relationship tags (e.g., "Family", "Close friend"), viewing the contact's information, editing their details or tags, and archiving them if needed. This delivers value as a standalone contact management system with flexible categorization.

**Acceptance Scenarios**:

1. **Given** the user opens the app for the first time, **When** they add a new contact with name and select one or more relationship tags, **Then** the contact is saved and appears in their contact list with the selected tags displayed
2. **Given** a contact exists in the system, **When** the user views their details, **Then** all stored information (name, tags, birthday, profile note) is displayed
3. **Given** a contact exists with one tag, **When** the user adds additional tags, **Then** the contact now belongs to multiple relationship categories
4. **Given** a contact exists in the system, **When** the user edits their information or tags, **Then** the updated details are saved and reflected immediately
5. **Given** a contact exists, **When** the user archives them, **Then** the contact is marked as archived but remains in the system for historical reference

---

### User Story 2 - Log Interactions with Weighted Types (Priority: P2)

A user wants to record when they interact with someone, whether it's a text message, phone call, or in-person hangout. Different interaction types have different "weights" that reflect how meaningful the contact was - a hangout refreshes the relationship more than a text message. This helps the system understand relationship health over time.

**Why this priority**: Interaction logging is essential for calculating relationship health and generating meaningful recommendations. Without interaction history with proper weighting, the system cannot determine who needs attention or how urgently. This story enables users to build a historical record that accurately reflects relationship maintenance.

**Independent Test**: Can be fully tested by logging different types of interactions (text, call, hangout) with a contact, including date, type, and optional notes, then viewing the interaction history for that contact in chronological order. The system should recognize that different interaction types have different relationship-refreshing values. This delivers value as a personal interaction journal with meaningful categorization.

**Acceptance Scenarios**:

1. **Given** a contact exists in the system, **When** the user logs a text interaction with date and optional notes, **Then** the interaction is saved with weight 1 and associated with that contact
2. **Given** a contact exists, **When** the user logs a phone call interaction, **Then** the interaction is saved with weight 3
3. **Given** a contact exists, **When** the user logs a hangout interaction, **Then** the interaction is saved with weight 6
4. **Given** interactions have been logged for a contact, **When** the user views that contact's details, **Then** they see a chronological list of all interactions with their types and dates
5. **Given** multiple interactions exist across different contacts, **When** the user views interaction history, **Then** they see all interactions sorted by date with contact context
6. **Given** an interaction exists, **When** the user edits or deletes it, **Then** the changes are saved or the interaction is removed

---

### User Story 3 - View Relationship Health and Dashboard (Priority: P2)

A user wants to see how "healthy" each relationship is based on recent interactions and the expected contact frequency for that relationship type. Each contact has a health indicator (green/yellow/red) that reflects whether the relationship is up-to-date, needs attention soon, or is overdue. The dashboard shows this at a glance.

**Why this priority**: Health visualization transforms the app from a simple log into an actionable relationship maintenance tool. Users can immediately see which relationships need attention without manually calculating time since last contact. This story delivers the visual feedback that makes relationship maintenance intuitive.

**Independent Test**: Can be fully tested by viewing contacts with different interaction histories and tag-based frequency expectations, and seeing accurate health indicators (green for healthy, yellow for needs attention soon, red for overdue). The health should update automatically based on last interaction date, interaction type weight, and the contact's relationship tag frequency requirements. This delivers value by providing immediate visual feedback on relationship status.

**Acceptance Scenarios**:

1. **Given** a contact with a recent high-weight interaction (hangout) and a tag requiring weekly contact, **When** the user views their health, **Then** they see a green health indicator
2. **Given** a contact with an old interaction and a tag requiring frequent contact, **When** the user views their health, **Then** they see a yellow or red health indicator based on how overdue they are
3. **Given** a contact with multiple tags having different frequency requirements, **When** the system calculates health, **Then** it uses the tag with highest priority to determine expected frequency
4. **Given** contacts with varying health levels, **When** the user views the dashboard, **Then** they see contacts sorted by health status with clear visual indicators

---

### User Story 4 - Receive Recommendations (Priority: P3)

A user wants to see gentle, encouraging suggestions about who they should reach out to. The system recommends up to 3 contacts at a time, prioritizing primarily by relationship health status (which already incorporates tag priority and interaction history). Recommendations should feel warm and supportive, not transactional. Users can snooze recommendations for contacts they're not ready to reach out to yet, which deprioritizes those contacts for a period of time.

**Why this priority**: While tracking relationships and interactions provides value, the recommendation feature transforms the app into a proactive relationship maintenance tool. This story delivers the "gentle nudge" that helps users remember to stay connected with the people who matter most, prioritized by relationship health status which already reflects both importance (via tag priority) and urgency (via interaction history).

**Independent Test**: Can be fully tested by viewing recommendations when contacts exist with varying health levels and tag priorities, seeing that the system surfaces the most important relationships that need attention, being able to refresh recommendations or act on them, and snoozing recommendations to deprioritize contacts temporarily. This delivers value by surfacing relationships that may need attention in a prioritized, non-intrusive way.

**Acceptance Scenarios**:

1. **Given** the user has contacts with varying health levels, **When** they view recommendations, **Then** they see up to 3 contacts prioritized by health status (which reflects tag priority and interaction history), with warm messaging
2. **Given** a contact with high-priority tags and low health, **When** the user views recommendations, **Then** that contact appears in recommendations with an encouraging message about why they should reach out
3. **Given** recommendations are displayed, **When** the user logs an interaction with a recommended contact, **Then** the recommendation updates to reflect the recent contact
4. **Given** recommendations are displayed, **When** the user refreshes recommendations, **Then** they see a new set of recommendations (avoiding duplicates when possible)
5. **Given** the user has no contacts or all contacts are healthy, **When** they view recommendations, **Then** they see an encouraging message appropriate to the situation
6. **Given** a recommendation is displayed for a contact, **When** the user snoozes the recommendation, **Then** that contact is deprioritized and won't appear in recommendations for a period of time, but their health status remains unchanged
7. **Given** a contact has been snoozed, **When** the snooze period expires, **Then** that contact can appear in recommendations again if their health status warrants it

---

### User Story 5 - Create and Manage Reminders (Priority: P3)

A user wants to set reminders to contact specific people at future dates. They can mark reminders as done when they've completed the contact. Reminders can be created manually or generated from recommendations.

**Why this priority**: Reminders provide users with a way to plan future relationship maintenance. This story adds flexibility to the recommendation system and helps users manage their relationship maintenance schedule proactively.

**Independent Test**: Can be fully tested by creating a reminder for a contact with a due date, viewing pending reminders, and marking a reminder as done. Reminders should appear in recommendations with highest priority. This delivers value by allowing users to plan relationship maintenance tasks.

**Acceptance Scenarios**:

1. **Given** a contact exists, **When** the user creates a reminder with a due date and optional note, **Then** the reminder is saved and appears in the contact's reminder list
2. **Given** a reminder exists with status "pending", **When** the user views recommendations, **Then** reminders that are due or overdue appear with highest priority
3. **Given** a reminder exists, **When** the user marks it as done, **Then** the reminder status changes to "done" and it no longer appears in active recommendations
4. **Given** multiple reminders exist, **When** the user views a contact's details, **Then** they see all reminders for that contact with their status and due dates

---

### Edge Cases

- What happens when a user tries to add a contact with the same name as an existing contact?
  * It's possible to have contacts with the same name. It's up to the user to disambiguate them, the same as they would in the phone contacts app.
- How does the system handle contacts with no tags assigned?
  * The default should be to reach out to these people once per year by text message, so they have a very low requirement.
- What happens when a user tries to log an interaction for a contact that was archived?
  * This should still be allowed and recorded fine. If a contact is archived, that just means they will not show up in any future reminders.
- How does the system calculate health for a contact with no interaction history?
  * One year after the contact has been created can be the first time that the system suggests reaching out by text message. Until then, nothing is required.
- What happens when a contact has tags with conflicting frequency requirements?
  * It should always consider the most high priority tag. For example if one tag requires reaching out every quarter, and another every month, then the monthly should take priority.
- How does the system handle recommendations when all contacts are healthy?
  * If all contacts are healthy, then the system gives no recommendations
- What happens when a reminder's due date is in the past?
  * There should be a feature to view all past reminders that haven't been addressed, so that the user can think of everyone they missed. 
- How does the system handle contacts with multiple tags when calculating recommendations?
  * Always consider the highest priority
- What happens when a user tries to delete a tag that's assigned to contacts?
  * Any contacts that have that tag have it removed
- How does the system handle very old interaction dates (e.g., years ago) when calculating health?
  * The health continues going down if there's no recent interactions. That means that old interaction dates stop contributing much to the health.
- How should the system handle error states when operations fail?
  * The system displays user-friendly error messages with actionable guidance (e.g., "Couldn't save contact. Please try again.") and provides retry options where applicable, maintaining the warm and encouraging tone of the application.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to add a contact with at minimum a name
- **FR-002**: System MUST allow users to assign one or more relationship tags to each contact
- **FR-003**: System MUST allow users to store optional information about contacts (birthday, profile notes)
- **FR-004**: System MUST allow users to view a list of all their contacts
- **FR-005**: System MUST allow users to view detailed information about a specific contact
- **FR-006**: System MUST allow users to edit contact information and tags
- **FR-007**: System MUST allow users to archive contacts (preserving them for historical reference)
- **FR-008**: System MUST provide default relationship tags with predefined frequency intervals and priorities
- **FR-009**: System MUST allow users to create custom relationship tags with their own frequency intervals and priorities
- **FR-010**: System MUST allow users to log interactions with contacts, specifying type (text, call, hangout)
- **FR-011**: System MUST assign different weights to interaction types (text=1, call=3, hangout=6) for health calculations
- **FR-012**: System MUST allow users to add optional notes to interactions
- **FR-013**: System MUST display interaction history for a contact in chronological order
- **FR-014**: System MUST allow users to edit or delete logged interactions
- **FR-015**: System MUST calculate and display relationship health for each contact using a weighted decay formula (exponential decay) based on time since last interaction, interaction weight, and tag-based frequency requirements
- **FR-016**: System MUST display health using visual indicators (green for healthy, yellow for needs attention, red for overdue)
- **FR-017**: System MUST use the highest-priority tag when a contact has multiple tags for health calculations
- **FR-018**: System MUST display a dashboard showing contact summaries with health indicators
- **FR-019**: System MUST generate up to 3 recommendations prioritizing contacts primarily by health status (which already incorporates tag priority and interaction history)
- **FR-020**: System MUST prioritize due or overdue reminders above other recommendations
- **FR-021**: System MUST allow users to refresh recommendations to see different suggestions
- **FR-022**: System MUST present recommendations with warm, encouraging messaging
- **FR-023**: System MUST allow users to create reminders for contacts with due dates
- **FR-024**: System MUST allow users to snooze recommendations for contacts, which deprioritizes those contacts from appearing in recommendations for a period of time
- **FR-025**: System MUST allow users to mark reminders as done
- **FR-026**: System MUST display reminder status (pending, done)
- **FR-027**: System MUST store all data locally on the user's device using an encrypted local database (SQLite with encryption layer)
- **FR-028**: System MUST preserve all data when the application is closed and reopened
- **FR-029**: System MUST present all information and recommendations in a warm, personal, encouraging tone
- **FR-030**: System MUST display profile notes (memory jogs) when viewing contacts or recommendations
- **FR-031**: System MUST display user-friendly error messages with actionable guidance when operations fail, including retry options where applicable
- **FR-032**: System MUST display contextual empty states with prominent call-to-action buttons to guide users when no data exists (e.g., "No contacts yet" with "Add Your First Contact" button)

### Key Entities *(include if feature involves data)*

- **Contact**: Represents someone the user wants to maintain a relationship with. Key attributes include name (required), optional birthday, profile note (persistent information to help remember context), creation date, and archived status. A contact can belong to zero, one, or multiple relationship categories (tags).

- **Tag**: Represents a relationship category that determines how frequently the user wants to reach out. Key attributes include name, minimum interval days, maximum interval days, and priority (higher = more important). Tags have default values (Family, Close friend, Acquaintance, Old friend) but users can create custom tags.

- **ContactTag**: Represents the many-to-many relationship between contacts and tags. A contact can have multiple tags, and each tag can apply to multiple contacts.

- **Interaction**: Represents a single contact event between the user and a contact. Key attributes include type (text, call, or hangout), weight (derived from type: 1, 3, or 6), timestamp, and optional notes. Interactions are used to calculate relationship health.

- **Reminder**: Represents a user-defined task to contact someone. Key attributes include associated contact, due date, status (pending or done), and optional note. Reminders appear in recommendations with highest priority when due or overdue.

- **Snooze**: Represents a temporary deprioritization of a contact from recommendations. When a user snoozes a recommendation, it creates a snooze record that prevents that contact from appearing in recommendations for a period of time. Snoozing is treated as a type of interaction, but does not affect the contact's health status. Key attributes include associated contact, snoozed until timestamp, and creation timestamp.

- **Health Score**: A calculated value representing relationship freshness, derived using a weighted decay formula (exponential decay) based on time since last interaction, interaction weight, and expected contact frequency based on tags. Displayed as green (healthy), yellow (needs attention), or red (overdue).

- **Recommendation**: A suggestion for who the user should reach out to, prioritized primarily by health status (which already incorporates tag priority and interaction history). Includes the contact, reason for recommendation, and encouraging messaging.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a new contact with name and tags in under 30 seconds
- **SC-002**: Users can log an interaction with all required information in under 20 seconds
- **SC-003**: Users can view their complete contact list and access any contact's details in under 3 seconds
- **SC-004**: The dashboard displays health indicators and recommendations within 2 seconds of opening
- **SC-005**: Users can successfully add and manage at least 200 contacts without performance degradation
- **SC-006**: Users can view interaction history spanning at least 5 years without noticeable delay
- **SC-007**: 90% of users can complete their first contact addition without needing help or documentation
- **SC-008**: The app maintains all data integrity when closed and reopened, with zero data loss
- **SC-009**: Health calculations update accurately within 1 second of logging a new interaction
- **SC-010**: Recommendations are relevant (users find at least 75% of recommendations useful for maintaining relationships)
- **SC-011**: Users report that the app feels warm and encouraging rather than transactional or business-like
- **SC-012**: Users can create and manage at least 50 reminders without performance issues
- **SC-013**: The system correctly prioritizes recommendations based on tag importance and health (verified through user testing)
- **SC-014**: Users can assign multiple tags to a contact and see all tags displayed correctly
- **SC-015**: Health indicators accurately reflect relationship status based on interaction history and tag requirements

