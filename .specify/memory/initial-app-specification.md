# Friendship CRM App Specification (Many-to-Many Tags Version)

This document is a complete, self-contained specification of a personal, local-first "Friendship CRM" application. It is intended to be used directly as a prompt for an LLM to generate designs, code, schemas, or implementation plans.

---

# 1. Core Purpose
The app helps users maintain meaningful social connections by tracking relationships, logging interactions, and providing gentle recommendations on who to reach out to. It should feel warm and empathetic, not like a business CRM.

**Primary goals:**
- Help the user remember to keep in touch with people they care about.
- Provide a simple dashboard with recommendations.
- Track interactions manually.
- Store relationship details locally.

**Tone:** warm, personal, encouraging, and gentle.
**Target user:** primarily the creator of the app and people who care about their social relationships.

---

# 2. Data Model
The app uses a local SQLite database. The data model supports many-to-many tags so each contact can belong to multiple categories.

## 2.1 Contacts
Fields:
- `id` (primary key)
- `name` (text)
- `birthday` (date, optional)
- `profile_note` (text; persistent information like "Lives in Oxford, job searching")
- `created_at` (datetime)
- `archived` (boolean)

Contacts do **not** store a single tag reference—tags are through a join table.

## 2.2 Tags
Tags represent relationship categories and determine how frequently the user wants to reach out.

Fields:
- `id` (primary key)
- `name` (text)
- `min_interval_days` (int)
- `max_interval_days` (int)
- `priority` (int) — higher = more important

**Default tags:**
- Family → 7–7 days, priority 3
- Close friend → 7–14 days, priority 2
- Acquaintance → 60–90 days, priority 0
- Old friend → 365–365 days, priority 1

Users may create custom tags.

## 2.3 ContactTags (Join Table)
Represents a many-to-many relationship between contacts and tags.

Fields:
- `id` (primary key)
- `contact_id` (FK → contacts.id)
- `tag_id` (FK → tags.id)

Rules:
- `(contact_id, tag_id)` must be unique.
- A contact can have 0, 1, or many tags.

## 2.4 Interactions
Manually logged interactions.

Fields:
- `id` (primary key)
- `contact_id` (FK)
- `type` ("text", "call", "hangout")
- `weight` (text=1, call=3, hangout=6)
- `timestamp` (datetime)
- `note` (optional short note)

## 2.5 Reminders
User-defined reminders to contact someone.

Fields:
- `id` (primary key)
- `contact_id` (FK)
- `due_date` (date or datetime)
- `status` ("pending", "snoozed", "done")
- `snoozed_until` (datetime, nullable)
- `note` (optional)

---

# 3. Interaction Types & Weights
- Text → weight 1
- Phone call → weight 3
- Hangout → weight 6

These weights influence how long a contact stays "healthy." Higher weight = better refresh of the relationship.

---

# 4. Health Bar System
Each contact has a single health bar (green → yellow → red) reflecting how up-to-date the relationship is.

## 4.1 Health Calculation
1. Find the last interaction.
2. Compute intensity factor:
   ```
   intensity_factor = weight / 6
   ```
3. Effective "age" of the interaction:
   ```
   effective_days = days_since_last / (0.5 + intensity_factor)
   ```
4. Determine the contact's target interval:
   - Compute target interval per tag: `(min + max)/2`.
   - Use the tag with the **highest priority** if multiple tags exist.
5. Compute health score:
   ```
   ratio = effective_days / target_interval_days
   health = clamp(1 - ratio, 0, 1)
   ```

## 4.2 Color Thresholds
- Green: `health > 0.66`
- Yellow: `0.33 < health ≤ 0.66`
- Red: `health ≤ 0.33`

Health determines recommendations.

---

# 5. Recommendation System
The app surfaces **3 recommendations** when the user requests them.

## 5.1 Priority Rules
1. **Top priority:** due or overdue reminders.
2. Otherwise: contacts ranked by score of tag importance and health.

## 5.2 Tag Priority for Multi-Tag Contacts
- A contact's `tag_priority` = **maximum** priority value of its tags.
- If no tags: `tag_priority = 0`.

## 5.3 Scoring Model
```
score = (tag_priority * 2) + (1 - health)
```

- Higher priority = more important.
- Lower health = more overdue.

## 5.4 Refresh Logic
- Refresh all: recalculate and avoid showing same contacts if possible.
- Refresh single: exclude the removed contact and pull next best.

## 5.5 Snoozing
Snoozing a recommendation creates or updates a reminder.
- Typical snooze: 3–7 days.

---

# 6. UI / UX Structure
Minimal, warm, and personal.

## 6.1 Home Dashboard
Sections:
1. **Today's Recommendations (3 cards)**
   - Name + tag chips
   - Health bar
   - Last interaction summary
   - Reminder text (if applicable)
   - Actions:
     - Log interaction
     - Snooze
     - Refresh

2. **Low Health Connections** list (sorted by health)

3. **Add Contact** button

## 6.2 Contact Detail Page
- Name
- Multi-select tags
- Birthday
- Profile note
- Health bar
- Last interaction summary
- Interaction history
- Log interaction button
- Reminders list

## 6.3 Add Contact Page
- Name
- Multi-select tags
- Birthday
- Initial profile note

---

# 7. Memory Jogs
Memory jogs show the `profile_note` during recommendations or contact view.
Example: “Lives in Oxford, considering job change.”

---

# 8. Storage
- All data stored locally.
- SQLite database.

---

# 9. App Tone
- Warm and personal.
- Gentle nudges.
- Example: “Consider reaching out to Jimbo — it’s been 30 days.”

---

# 10. Summary
A lightweight, offline-first friendship manager featuring:
- Manual interaction tracking
- Many-to-many tag system
- Health bar decay model
- Recommendation engine prioritizing importance over urgency
- Warm, minimal UI

