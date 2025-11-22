# Figma Design Prompt: Personal Friendship CRM

## Project Overview

Design a web application for a **Personal Friendship CRM** - a tool that helps users maintain their personal relationships by tracking contacts, logging interactions, calculating relationship health, and providing gentle recommendations. This is a Next.js web application using Material-UI components.

**Core Purpose**: Help users stay connected with the people who matter most through systematic tracking and gentle nudges, not transactional reminders.

## Design Principles & Tone

**CRITICAL**: The entire design must feel **warm, encouraging, personal, and supportive** - never transactional or business-like. Think of a caring friend helping you remember to stay in touch, not a corporate CRM system.

### Visual Style
- **Warm color palette**: Soft, inviting colors (warm coral #FF6B6B, soft teal #4ECDC4, warm off-white backgrounds #FFF9F5)
- **Friendly typography**: Approachable, readable fonts with friendly spacing
- **Rounded corners**: Soft, approachable shapes (12px border radius)
- **Gentle shadows**: Subtle depth without harshness
- **Personal touches**: Use friendly icons, encouraging microcopy, and human-centered language

### Tone Guidelines
- Use encouraging language: "You might want to reach out to..." instead of "Contact required"
- Celebrate small wins: "Great job staying connected!" 
- Be supportive, not pushy: "No pressure, but..." instead of "You must..."
- Use first-person, conversational copy

## Key Screens to Design

### 1. Dashboard / Recommendations Screen (Primary Entry Point)
**Purpose**: Show up to 3 personalized recommendations with encouraging messaging

**Key Elements**:
- Page title: "Your Recommendations" or similar friendly greeting
- Subtitle: Encouraging message about staying connected
- Up to 3 recommendation cards, each showing:
  - Contact name and photo/avatar
  - Health indicator (green/yellow/red dot or badge)
  - Warm, personalized reason for recommendation (e.g., "It's been a while since you caught up with Sarah. She's important to you!")
  - Profile note/memory jog if available
  - Actions: "Log Interaction", "Snooze", "Create Reminder"
- Empty state: Friendly illustration, message like "No recommendations yet - you're doing great staying connected!", prominent "Add Your First Contact" button
- Refresh button to get new recommendations

**Design Notes**:
- Cards should feel personal, not like task items
- Use warm colors for health indicators (green = healthy, yellow = needs attention, red = overdue)
- Make the recommendation text feel like a friend's gentle suggestion

### 2. Contact List Screen
**Purpose**: View all contacts with health indicators at a glance

**Key Elements**:
- Search/filter bar
- List of contacts, each showing:
  - Avatar/initial circle
  - Contact name
  - Relationship tags (chips/badges): "Family", "Close friend", etc.
  - Health indicator (green/yellow/red)
  - Last interaction date or "Never"
- Sort options: By health, by name, by last interaction
- Filter options: By tag, archived/active
- "Add Contact" floating action button or prominent button
- Empty state: "Start building your network of relationships" with "Add Your First Contact" button

**Design Notes**:
- Health indicators should be prominent but not alarming
- Tags should be colorful and friendly
- List should feel personal, like a contact list in a phone

### 3. Contact Detail Screen
**Purpose**: View full information about a contact and their interaction history

**Key Elements**:
- Contact header: Name, avatar, birthday (if set), health indicator
- Profile note section: "Memory jog" or "About [Name]"
- Relationship tags section: Chips showing all tags
- Interaction history timeline:
  - Chronological list of interactions (text, call, hangout)
  - Each showing: Type icon, date, optional notes
  - Visual distinction for interaction types (different colors/icons)
- Reminders section: List of pending reminders for this contact
- Action buttons: "Log Interaction", "Edit Contact", "Create Reminder", "Archive"
- Quick actions: Quick log buttons for common interaction types

**Design Notes**:
- Timeline should feel like a personal journal entry
- Make it easy to see relationship history at a glance
- Health indicator should be prominent but not the focus

### 4. Add/Edit Contact Form
**Purpose**: Create or edit contact information

**Key Elements**:
- Form fields:
  - Name (required, prominent)
  - Birthday (date picker)
  - Profile note (large text area, labeled as "Memory jog" or "Notes about [Name]")
  - Relationship tags (multi-select with chips)
- Save/Cancel buttons
- Friendly helper text throughout
- Validation messages that are helpful, not harsh

**Design Notes**:
- Form should feel inviting, not intimidating
- Use friendly labels and helpful placeholder text
- Make tag selection visual and easy

### 5. Log Interaction Screen
**Purpose**: Record an interaction with a contact

**Key Elements**:
- Contact name/avatar at top
- Interaction type selection: Large, friendly buttons for "Text", "Call", "Hangout"
  - Each should have an icon and brief description
  - Visual weight should reflect importance (hangout > call > text)
- Date picker (defaults to today)
- Optional notes field (labeled as "What did you talk about?" or similar)
- Save button
- Quick actions: "Log as today" shortcut

**Design Notes**:
- Make interaction types visually distinct and appealing
- Keep it simple - this should be fast to complete
- Use encouraging copy like "Great job staying in touch!"

### 6. Recommendations Detail / Actions
**Purpose**: Actions available from recommendation cards

**Key Elements**:
- When user clicks a recommendation, show:
  - Quick action buttons: "Log Interaction", "Snooze", "Create Reminder"
  - Snooze options: "Snooze for 3 days", "Snooze for 7 days", or custom
  - Friendly explanation of what snoozing does
- Modal or bottom sheet for quick actions

**Design Notes**:
- Actions should be clear and non-intimidating
- Explain snoozing in friendly terms: "I'll remind you about [Name] later"

## Component Library Requirements

### Health Indicators
- **Green**: Healthy relationship (circular dot, badge, or icon)
- **Yellow**: Needs attention soon (warning but not urgent)
- **Red**: Overdue (needs attention but not alarming)

### Interaction Type Icons
- **Text**: Message/chat icon (weight: 1)
- **Call**: Phone icon (weight: 3)
- **Hangout**: People/meetup icon (weight: 6)

### Tags/Chips
- Colorful, friendly chips for relationship categories
- Default tags: "Family", "Close friend", "Acquaintance", "Old friend"
- Custom tags should be easy to create and visually distinct

### Buttons
- Primary: Warm coral (#FF6B6B) for main actions
- Secondary: Soft teal (#4ECDC4) for secondary actions
- Text buttons for less important actions
- All buttons should have friendly, action-oriented copy

### Cards
- Recommendation cards: Soft shadows, rounded corners, warm background
- Contact cards: Clean, scannable, with clear hierarchy
- Interaction timeline items: Subtle, journal-like appearance

### Empty States
- Friendly illustrations (simple, warm, not corporate)
- Encouraging messages
- Prominent call-to-action buttons
- Examples:
  - "No contacts yet - start building your network!"
  - "You're all caught up! Great job staying connected."
  - "No interactions yet - start logging your connections!"

### Error States
- User-friendly error messages
- Helpful guidance: "Couldn't save contact. Please try again."
- Retry buttons that are encouraging, not demanding
- Never use technical error messages

## Color Palette

**Primary Colors**:
- Primary: Warm Coral `#FF6B6B` (main actions, important elements)
- Primary Light: `#FF8E8E`
- Primary Dark: `#E55555`

**Secondary Colors**:
- Secondary: Soft Teal `#4ECDC4` (secondary actions, accents)
- Secondary Light: `#6EDDD6`
- Secondary Dark: `#3AB5AE`

**Background Colors**:
- Background Default: Warm Off-White `#FFF9F5`
- Background Paper: White `#FFFFFF`

**Health Status Colors**:
- Green (Healthy): `#4CAF50` or similar friendly green
- Yellow (Needs Attention): `#FFC107` or warm amber
- Red (Overdue): `#F44336` or warm red (not alarming)

**Text Colors**:
- Primary Text: Dark gray `#333333` or similar
- Secondary Text: Medium gray `#666666`
- Disabled Text: Light gray `#999999`

## Typography

- **Font Family**: System fonts stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Headings**: Medium weight (600), friendly spacing
- **Body**: Regular weight (400), comfortable line height
- **Buttons**: Medium weight, no uppercase transformation
- **Friendly, approachable sizing**: Not too small, not too large

## Spacing & Layout

- **Border Radius**: 12px for cards, 8px for buttons
- **Padding**: Generous, comfortable spacing (16px, 24px, 32px)
- **Grid**: Responsive, works on desktop and tablet
- **Max Width**: Content areas should be readable (max-width: 960px for main content)

## Micro-interactions & Animations

- **Subtle transitions**: Smooth, gentle animations (200-300ms)
- **Hover states**: Friendly, not aggressive
- **Loading states**: Gentle spinners, not harsh
- **Success feedback**: Celebratory but not over-the-top (e.g., "Contact saved!" with a checkmark)

## Accessibility Requirements

- **Color Contrast**: WCAG AA compliant
- **Touch Targets**: Minimum 44x44px for interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: All interactive elements properly labeled
- **Focus States**: Clear, visible focus indicators

## Responsive Design

- **Desktop**: Full-featured layout with sidebars/navigation
- **Tablet**: Adapted layout, touch-friendly
- **Mobile**: Stacked layout, large touch targets

## Design Deliverables

Please create:
1. **Design System**: Component library with all reusable components
2. **Screen Designs**: All 6+ key screens mentioned above
3. **Empty States**: All empty state variations
4. **Error States**: Error message designs
5. **Loading States**: Loading indicators and skeletons
6. **Interaction Flows**: User journey through key actions
7. **Color Palette**: Complete color system with usage guidelines
8. **Typography Scale**: Complete typography system
9. **Spacing System**: Consistent spacing scale
10. **Icon Set**: Custom or selected icons for interactions, health, etc.

## Key Design Challenges

1. **Making it feel personal, not corporate**: Avoid business CRM aesthetics
2. **Health indicators that inform but don't alarm**: Red should mean "needs attention" not "urgent emergency"
3. **Recommendations that feel like suggestions, not demands**: Warm, encouraging language
4. **Empty states that motivate, not discourage**: Celebrate the journey, not just the destination
5. **Making data entry feel easy, not burdensome**: Quick, simple forms

## Inspiration & References

Think of:
- Personal journal apps (Day One, Journey)
- Relationship apps (but focused on maintenance, not dating)
- Habit tracking apps (but for relationships)
- Warm, friendly productivity apps
- **Avoid**: Corporate CRMs, task management apps that feel cold, business productivity tools

## Technical Constraints

- **Framework**: Next.js with Material-UI (MUI) components
- **Design System**: Should align with Material Design principles but customized for warmth
- **Components**: Should be implementable with MUI components
- **Icons**: Material Icons or similar, but can be customized

## Success Criteria

The design is successful if:
- Users feel encouraged, not pressured
- The interface feels warm and personal
- Health indicators are informative but not alarming
- Recommendations feel like helpful suggestions from a friend
- The overall experience makes relationship maintenance feel manageable and positive
- Empty states motivate action rather than feeling like failures

---

**Remember**: This is a tool for maintaining personal relationships. Every design decision should reinforce warmth, encouragement, and support - never transactional or corporate feelings.

