# Quick Start Guide: Personal Friendship CRM

**Date**: 2025-01-27  
**Purpose**: Get started with development of Personal Friendship CRM

## Prerequisites

1. **Node.js**: Version 18+ (LTS recommended)
2. **Package Manager**: npm, yarn, or pnpm
3. **Development Tools**:
   - Code editor (VS Code recommended)
   - Git for version control
   - Modern browser (Chrome, Firefox, Safari, Edge)

## Project Setup

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest friendship-crm --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd friendship-crm
```

**Note**: We'll use Material-UI instead of Tailwind, but Tailwind can coexist or be removed.

### 2. Install Dependencies

```bash
# Core dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material

# Database (SQLite)
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3

# Data Fetching
npm install swr

# Utilities
npm install date-fns

# Development dependencies
npm install --save-dev @types/node @types/react @types/react-dom
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
npm install --save-dev msw  # Mock Service Worker for API mocking
```

### 3. Project Structure

Create the following directory structure:

```
app/                 # Next.js App Router (pages/routes)
├── (dashboard)/     # Dashboard route group
│   ├── page.tsx
│   └── layout.tsx
├── contacts/
│   ├── page.tsx
│   ├── [id]/
│   │   └── page.tsx
│   └── new/
│       └── page.tsx
├── interactions/
│   └── page.tsx
└── layout.tsx

src/
├── components/      # React components (Material-UI)
│   ├── contacts/
│   │   ├── ContactList.tsx
│   │   ├── ContactCard.tsx
│   │   └── ContactForm.tsx
│   ├── interactions/
│   │   ├── InteractionList.tsx
│   │   └── InteractionForm.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   └── Recommendations.tsx
│   └── shared/
│       ├── HealthIndicator.tsx
│       └── EmptyState.tsx
├── lib/            # Business logic
│   ├── models/     # Data models (TypeScript interfaces)
│   ├── services/   # Business logic services
│   │   ├── contactService.ts
│   │   ├── tagService.ts
│   │   ├── interactionService.ts
│   │   ├── healthService.ts
│   │   ├── recommendationService.ts
│   │   └── reminderService.ts
│   ├── database/   # SQLite setup, migrations, encryption
│   │   ├── db.ts
│   │   ├── migrations/
│   │   └── encryption.ts
│   └── utils/     # Helper functions
│       ├── healthCalculator.ts
│       └── validators.ts
└── hooks/          # Custom React hooks (using SWR)
    ├── useContacts.ts
    ├── useHealth.ts
    └── useRecommendations.ts

tests/
├── unit/           # Unit tests
├── integration/     # Integration tests
├── e2e/             # E2E tests (Playwright/Cypress)
└── __mocks__/       # Test mocks (MSW handlers)
```

### 4. Database Setup

**Initialize SQLite Database**:

```typescript
// src/lib/database/db.ts
import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize database (use SQLCipher for encryption in production)
const dbPath = join(dataDir, 'friendship-crm.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birthday TEXT,
    profile_note TEXT,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    min_interval_days INTEGER NOT NULL,
    max_interval_days INTEGER NOT NULL,
    priority INTEGER NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(contact_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    notes TEXT,
    weight INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    due_date INTEGER NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS snoozes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL UNIQUE,
    snoozed_until INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_contacts_archived ON contacts(archived);
  CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
  CREATE INDEX IF NOT EXISTS idx_contact_tags_contact_id ON contact_tags(contact_id);
  CREATE INDEX IF NOT EXISTS idx_contact_tags_tag_id ON contact_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_interactions_contact_id ON interactions(contact_id);
  CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON interactions(timestamp);
  CREATE INDEX IF NOT EXISTS idx_reminders_contact_id ON reminders(contact_id);
  CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
  CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
`);

// Initialize default tags on first run
export function initializeDatabase() {
  const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get() as { count: number };
  
  if (tagCount.count === 0) {
    const now = Math.floor(Date.now() / 1000);
    const insertTag = db.prepare(`
      INSERT INTO tags (name, min_interval_days, max_interval_days, priority, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const insertTags = db.transaction((tags) => {
      for (const tag of tags) {
        insertTag.run(tag.name, tag.minIntervalDays, tag.maxIntervalDays, tag.priority, tag.isDefault ? 1 : 0, tag.createdAt);
      }
    });

    insertTags([
      {
        name: 'Family',
        minIntervalDays: 7,
        maxIntervalDays: 14,
        priority: 10,
        isDefault: true,
        createdAt: now,
      },
      {
        name: 'Close friend',
        minIntervalDays: 14,
        maxIntervalDays: 30,
        priority: 8,
        isDefault: true,
        createdAt: now,
      },
      {
        name: 'Acquaintance',
        minIntervalDays: 90,
        maxIntervalDays: 180,
        priority: 5,
        isDefault: true,
        createdAt: now,
      },
      {
        name: 'Old friend',
        minIntervalDays: 180,
        maxIntervalDays: 365,
        priority: 3,
        isDefault: true,
        createdAt: now,
      },
    ]);
  }
}
```

**Encryption Setup** (SQLCipher):

For production, use SQLCipher to encrypt the database at rest. In development, you can use regular SQLite.

```typescript
// src/lib/database/db.ts (with SQLCipher)
import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Get encryption key from environment variable (in production, use secure key management)
const ENCRYPTION_KEY = process.env.DATABASE_ENCRYPTION_KEY || 'default-dev-key-change-in-production';

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize database with SQLCipher
const dbPath = join(dataDir, 'friendship-crm.db');
export const db = new Database(dbPath);

// Set encryption key (SQLCipher)
db.pragma(`key = "${ENCRYPTION_KEY}"`);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// ... rest of table creation code ...
```

**Note**: For SQLCipher support, you may need to use a different package like `@journeyapps/sqlcipher` or compile better-sqlite3 with SQLCipher support. Alternatively, use application-level encryption for sensitive fields.

### 5. Implement Health Calculation

**Health Calculator** (see `research.md` for formula):

```typescript
// src/lib/utils/healthCalculator.ts
import { HealthScore, HealthStatus } from '../models';

const DECAY_FACTOR = 2.0;

export function calculateHealth(
  lastInteractionTimestamp: number | null,
  lastInteractionWeight: number | null,
  expectedIntervalDays: number,
  currentTimestamp: number
): HealthScore {
  if (lastInteractionTimestamp === null || lastInteractionWeight === null) {
    return {
      score: 0.0,
      status: HealthStatus.RED,
      lastInteractionTimestamp: null,
      expectedIntervalDays,
    };
  }

  const daysElapsed = Math.floor((currentTimestamp - lastInteractionTimestamp) / 86400);
  const decayRate = 1.0 / (expectedIntervalDays * DECAY_FACTOR);
  const score = lastInteractionWeight * Math.exp(-decayRate * daysElapsed);

  let status: HealthStatus;
  if (score >= 0.5) {
    status = HealthStatus.GREEN;
  } else if (score >= 0.2) {
    status = HealthStatus.YELLOW;
  } else {
    status = HealthStatus.RED;
  }

  return {
    score,
    status,
    lastInteractionTimestamp,
    expectedIntervalDays,
  };
}
```

### 6. Implement Service Layer

Start with `ContactService` (see `contracts/service-contracts.md` for API):

```typescript
// src/lib/services/contactService.ts
import { db } from '../database/db';
import { Contact, CreateContactParams, UpdateContactParams } from '../models';
import { ValidationError, NotFoundError } from '../utils/errors';

export class ContactService {
  async createContact(params: CreateContactParams): Promise<Contact> {
    // Validate inputs
    if (!params.name || params.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    if (params.name.length > 200) {
      throw new ValidationError('Name must be 200 characters or less');
    }

    const now = Math.floor(Date.now() / 1000);
    
    // Insert contact
    const insertContact = db.prepare(`
      INSERT INTO contacts (name, birthday, profile_note, archived, created_at, updated_at)
      VALUES (?, ?, ?, 0, ?, ?)
    `);
    
    const result = insertContact.run(
      params.name.trim(),
      params.birthday || null,
      params.profileNote || null,
      now,
      now
    );
    
    const id = result.lastInsertRowid as number;

    // Assign tags if provided
    if (params.tagIds && params.tagIds.length > 0) {
      const insertContactTag = db.prepare(`
        INSERT INTO contact_tags (contact_id, tag_id, created_at)
        VALUES (?, ?, ?)
      `);
      
      const insertTags = db.transaction((tagIds: number[]) => {
        for (const tagId of tagIds) {
          insertContactTag.run(id, tagId, now);
        }
      });
      
      insertTags(params.tagIds);
    }

    return (await this.getContact(id))!;
  }

  async getContact(id: number): Promise<Contact | null> {
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as any;
    if (!contact) return null;

    // Load tags
    const contactTags = db.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN contact_tags ct ON t.id = ct.tag_id
      WHERE ct.contact_id = ?
    `).all(id) as any[];

    return {
      id: contact.id,
      name: contact.name,
      birthday: contact.birthday,
      profileNote: contact.profile_note,
      archived: contact.archived === 1,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at,
      tags: contactTags.map(t => ({
        id: t.id,
        name: t.name,
        minIntervalDays: t.min_interval_days,
        maxIntervalDays: t.max_interval_days,
        priority: t.priority,
        isDefault: t.is_default === 1,
        createdAt: t.created_at,
      })),
    };
  }

  async getContacts(options?: {
    archived?: boolean;
    tagId?: number;
    limit?: number;
    offset?: number;
  }): Promise<Contact[]> {
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params: any[] = [];

    if (options?.archived !== undefined) {
      query += ' AND archived = ?';
      params.push(options.archived ? 1 : 0);
    }

    if (options?.tagId) {
      query += ` AND id IN (
        SELECT contact_id FROM contact_tags WHERE tag_id = ?
      )`;
      params.push(options.tagId);
    }

    query += ' ORDER BY created_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options?.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const contacts = db.prepare(query).all(...params) as any[];

    // Load tags for each contact
    return contacts.map(contact => {
      const contactTags = db.prepare(`
        SELECT t.* FROM tags t
        INNER JOIN contact_tags ct ON t.id = ct.tag_id
        WHERE ct.contact_id = ?
      `).all(contact.id) as any[];

      return {
        id: contact.id,
        name: contact.name,
        birthday: contact.birthday,
        profileNote: contact.profile_note,
        archived: contact.archived === 1,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at,
        tags: contactTags.map(t => ({
          id: t.id,
          name: t.name,
          minIntervalDays: t.min_interval_days,
          maxIntervalDays: t.max_interval_days,
          priority: t.priority,
          isDefault: t.is_default === 1,
          createdAt: t.created_at,
        })),
      };
    });
  }

  async updateContact(id: number, params: UpdateContactParams): Promise<Contact> {
    const contact = await this.getContact(id);
    if (!contact) {
      throw new NotFoundError(`Contact with id ${id} not found`);
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (params.name !== undefined) {
      if (params.name.trim().length === 0) {
        throw new ValidationError('Name cannot be empty');
      }
      updates.push('name = ?');
      values.push(params.name.trim());
    }

    if (params.birthday !== undefined) {
      updates.push('birthday = ?');
      values.push(params.birthday);
    }

    if (params.profileNote !== undefined) {
      updates.push('profile_note = ?');
      values.push(params.profileNote);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      values.push(Math.floor(Date.now() / 1000));
      values.push(id);

      db.prepare(`UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    return (await this.getContact(id))!;
  }

  async archiveContact(id: number): Promise<Contact> {
    const contact = await this.getContact(id);
    if (!contact) {
      throw new NotFoundError(`Contact with id ${id} not found`);
    }

    db.prepare('UPDATE contacts SET archived = 1, updated_at = ? WHERE id = ?').run(
      Math.floor(Date.now() / 1000),
      id
    );

    return (await this.getContact(id))!;
  }

  async unarchiveContact(id: number): Promise<Contact> {
    const contact = await this.getContact(id);
    if (!contact) {
      throw new NotFoundError(`Contact with id ${id} not found`);
    }

    db.prepare('UPDATE contacts SET archived = 0, updated_at = ? WHERE id = ?').run(
      Math.floor(Date.now() / 1000),
      id
    );

    return (await this.getContact(id))!;
  }
}

export const contactService = new ContactService();
```

### 7. Create API Routes

Create Next.js API route handlers that use the service layer:

```typescript
// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/services/contactService';
import { CreateContactParams } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const options = {
      archived: searchParams.get('archived') === 'true' ? true : 
                 searchParams.get('archived') === 'false' ? false : undefined,
      tagId: searchParams.get('tagId') ? Number(searchParams.get('tagId')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined,
    };

    const contacts = await contactService.getContacts(options);
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/contacts/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/services/contactService';
import { CreateContactParams } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const body: CreateContactParams = await request.json();
    const contact = await contactService.createContact(body);
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/contacts/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/services/contactService';
import { UpdateContactParams } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const body: { id: number; params: UpdateContactParams } = await request.json();
    const contact = await contactService.updateContact(body.id, body.params);
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/contacts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/services/contactService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const contact = await contactService.getContact(id);
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    await contactService.archiveContact(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving contact:', error);
    return NextResponse.json(
      { error: 'Failed to archive contact' },
      { status: 500 }
    );
  }
}
```

### 8. Implement UI Components

**Material-UI Theme Setup**:

```typescript
// src/lib/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B6B', // Warm coral
      light: '#FF8E8E',
      dark: '#E55555',
    },
    secondary: {
      main: '#4ECDC4', // Soft teal
      light: '#6EDDD6',
      dark: '#3AB5AE',
    },
    background: {
      default: '#FFF9F5', // Warm off-white
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});
```

**SWR Configuration**:

```typescript
// src/lib/swr-config.ts
import { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  onError: (error) => {
    console.error('SWR Error:', error);
  },
};
```

**SWR Provider Setup** (in root layout):

```typescript
// app/layout.tsx
'use client';

import { SWRConfig } from 'swr';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/lib/theme';
import { swrConfig } from '@/lib/swr-config';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SWRConfig value={swrConfig}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
```

**Custom Hooks with SWR**:

```typescript
// src/hooks/useRecommendations.ts
import useSWR from 'swr';
import { Recommendation } from '@/lib/models';

const RECOMMENDATIONS_KEY = '/api/recommendations';

async function fetchRecommendations(): Promise<Recommendation[]> {
  const response = await fetch('/api/recommendations');
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  return response.json();
}

export function useRecommendations(excludeContactIds?: number[]) {
  const { data, error, isLoading, mutate } = useSWR<Recommendation[]>(
    RECOMMENDATIONS_KEY,
    fetchRecommendations,
    {
      revalidateOnMount: true,
    }
  );

  const refresh = async () => {
    if (excludeContactIds) {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excludeContactIds }),
      });
      if (!response.ok) {
        throw new Error('Failed to refresh recommendations');
      }
      const recommendations = await response.json();
      mutate(recommendations, false); // Update cache without revalidation
    } else {
      await mutate(); // Revalidate
    }
  };

  return {
    recommendations: data || [],
    isLoading,
    isError: error,
    error,
    refresh,
    mutate,
  };
}
```

```typescript
// src/hooks/useContacts.ts
import useSWR from 'swr';
import { contactService } from '@/lib/services/contactService';
import { Contact } from '@/lib/models';

interface UseContactsOptions {
  archived?: boolean;
  tagId?: number;
  limit?: number;
  offset?: number;
}

function getContactsKey(options?: UseContactsOptions): string {
  const params = new URLSearchParams();
  if (options?.archived !== undefined) params.set('archived', String(options.archived));
  if (options?.tagId) params.set('tagId', String(options.tagId));
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));
  return `/api/contacts?${params.toString()}`;
}

async function fetchContacts(key: string): Promise<Contact[]> {
  const response = await fetch(key);
  if (!response.ok) {
    throw new Error('Failed to fetch contacts');
  }
  return response.json();
}

export function useContacts(options?: UseContactsOptions) {
  const key = getContactsKey(options);
  const { data, error, isLoading, mutate } = useSWR<Contact[]>(key, fetchContacts);

  return {
    contacts: data || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

export function useContact(id: number) {
  const { data, error, isLoading, mutate } = useSWR<Contact | null>(
    id ? `/api/contacts/${id}` : null,
    async (key: string) => {
      const response = await fetch(key);
      if (!response.ok) {
        throw new Error('Failed to fetch contact');
      }
      return response.json();
    }
  );

  return {
    contact: data || null,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}
```

**Dashboard Component with SWR**:

```typescript
// src/components/dashboard/Dashboard.tsx
'use client';

import { Container, Typography, CircularProgress, Box, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useRecommendations } from '@/hooks/useRecommendations';
import { EmptyState } from '@/components/shared/EmptyState';
import { Recommendations } from './Recommendations';

export function Dashboard() {
  const { recommendations, isLoading, isError, error, refresh } = useRecommendations();

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Couldn't load recommendations. Please try again.
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <button onClick={refresh}>Try Again</button>
        </Box>
      </Container>
    );
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState
        title="No recommendations yet"
        message="Start by adding someone you care about to your contact list."
        actionLabel="Add Your First Contact"
        actionHref="/contacts/new"
        icon={<AddIcon />}
      />
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Recommendations
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here are some people you might want to reach out to today.
      </Typography>
      <Recommendations recommendations={recommendations} onRefresh={refresh} />
    </Container>
  );
}
```

**Using SWR with Mutations** (for creating/updating data):

```typescript
// src/hooks/useContactMutations.ts
import useSWRMutation from 'swr/mutation';
import { contactService } from '@/lib/services/contactService';
import { Contact, CreateContactParams, UpdateContactParams } from '@/lib/models';
import { useContacts } from './useContacts';

export function useCreateContact() {
  const { mutate: mutateContacts } = useContacts();
  
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/contacts/create',
    async (_key: string, { arg }: { arg: CreateContactParams }) => {
      const response = await fetch('/api/contacts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      });
      if (!response.ok) {
        throw new Error('Failed to create contact');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        // Revalidate contacts list after creation
        mutateContacts();
      },
    }
  );

  return {
    createContact: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateContact() {
  const { mutate: mutateContacts } = useContacts();
  
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/contacts/update',
    async (_key: string, { arg }: { arg: { id: number; params: UpdateContactParams } }) => {
      const response = await fetch('/api/contacts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: arg.id, params: arg.params }),
      });
      if (!response.ok) {
        throw new Error('Failed to update contact');
      }
      return response.json();
    },
    {
      onSuccess: (data) => {
        // Optimistically update the cache
        mutateContacts((contacts) => {
          if (!contacts) return contacts;
          return contacts.map(c => c.id === data.id ? data : c);
        }, false);
      },
    }
  );

  return {
    updateContact: trigger,
    isUpdating: isMutating,
    error,
  };
}
```

**Example: Contact Form with SWR Mutation**:

```typescript
// src/components/contacts/ContactForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Box, Alert } from '@mui/material';
import { useCreateContact } from '@/hooks/useContactMutations';
import { CreateContactParams } from '@/lib/models';

export function ContactForm() {
  const router = useRouter();
  const { createContact, isCreating, error } = useCreateContact();
  const [formData, setFormData] = useState<CreateContactParams>({
    name: '',
    birthday: undefined,
    profileNote: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact(formData);
      router.push('/contacts');
    } catch (err) {
      // Error is handled by SWR
      console.error('Failed to create contact:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Couldn't create contact. Please try again.
        </Alert>
      )}
      
      <TextField
        fullWidth
        label="Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Birthday (YYYY-MM-DD)"
        type="date"
        value={formData.birthday || ''}
        onChange={(e) => setFormData({ ...formData, birthday: e.target.value || undefined })}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Profile Note"
        multiline
        rows={4}
        value={formData.profileNote || ''}
        onChange={(e) => setFormData({ ...formData, profileNote: e.target.value || undefined })}
        sx={{ mb: 2 }}
      />
      
      <Button
        type="submit"
        variant="contained"
        disabled={isCreating || !formData.name.trim()}
        fullWidth
      >
        {isCreating ? 'Creating...' : 'Create Contact'}
      </Button>
    </Box>
  );
}
```

**Empty State Component**:

```typescript
// src/components/shared/EmptyState.tsx
'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        px: 2,
      }}
    >
      {icon && (
        <Box sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        {message}
      </Typography>
      <Button
        component={Link}
        href={actionHref}
        variant="contained"
        size="large"
        startIcon={icon}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}
```

## Testing Setup

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
```

### Unit Tests

```typescript
// tests/unit/healthCalculator.test.ts
import { calculateHealth } from '@/lib/utils/healthCalculator';
import { HealthStatus } from '@/lib/models';

describe('HealthCalculator', () => {
  it('calculates health score correctly', () => {
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 86400;

    const score = calculateHealth(
      sevenDaysAgo,
      6, // hangout weight
      14, // expected interval
      now
    );

    expect(score.status).toBe(HealthStatus.GREEN);
    expect(score.score).toBeGreaterThan(0.5);
  });

  it('returns red status for contacts with no interactions', () => {
    const now = Math.floor(Date.now() / 1000);
    const score = calculateHealth(null, null, 14, now);

    expect(score.status).toBe(HealthStatus.RED);
    expect(score.score).toBe(0);
  });
});
```

### Integration Tests

```typescript
// tests/integration/contactService.test.ts
import { db, initializeDatabase } from '@/lib/database/db';
import { contactService } from '@/lib/services/contactService';

describe('ContactService Integration', () => {
  beforeEach(() => {
    // Use in-memory database for tests
    db.exec('DELETE FROM contacts');
    db.exec('DELETE FROM tags');
    db.exec('DELETE FROM contact_tags');
    initializeDatabase();
  });

  it('creates and retrieves contact', async () => {
    const contact = await contactService.createContact({
      name: 'John Doe',
    });

    expect(contact.name).toBe('John Doe');
    expect(contact.id).toBeDefined();

    const retrieved = await contactService.getContact(contact.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('John Doe');
  });
});
```

### Testing SWR Hooks

```typescript
// tests/hooks/useRecommendations.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useRecommendations } from '@/hooks/useRecommendations';

// Mock fetch
global.fetch = jest.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>
    {children}
  </SWRConfig>
);

describe('useRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches recommendations', async () => {
    const mockRecommendations = [
      { id: 1, contactId: 1, reason: 'Test', priority: 1, healthStatus: 'red' },
    ];
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecommendations,
    });

    const { result } = renderHook(() => useRecommendations(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.recommendations).toEqual(mockRecommendations);
    expect(result.current.isError).toBe(false);
  });

  it('handles errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch')
    );

    const { result } = renderHook(() => useRecommendations(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.recommendations).toEqual([]);
  });
});
```

## Development Workflow

1. **Write Tests First** (TDD):
   - Write failing test
   - Implement minimal code to pass
   - Refactor

2. **Implement Service Layer**:
   - Start with `ContactService`
   - Then `TagService`, `InteractionService`
   - Then `HealthService`, `RecommendationService`, `ReminderService`

3. **Implement UI**:
   - Start with dashboard
   - Then contact list and detail
   - Then add/edit forms

4. **Add Error Handling**:
   - User-friendly error messages (FR-031)
   - Retry options where applicable
   - Maintain warm, encouraging tone

5. **Add Empty States**:
   - Empty state for no contacts
   - Empty state for no interactions
   - Empty state for no recommendations
   - All with prominent CTAs (FR-032)

6. **Use SWR for Data Fetching**:
   - Create custom hooks with `useSWR` for data fetching
   - Use `useSWRMutation` for create/update/delete operations
   - Leverage SWR's automatic caching and revalidation
   - Implement optimistic updates for better UX

## Key Implementation Notes

1. **Encryption**: Use SQLCipher for database encryption at rest, or application-level encryption for sensitive fields
2. **Key Management**: Store encryption key securely in environment variables (never commit to version control)
3. **Health Calculation**: Use exponential decay formula (see `research.md`)
4. **Recommendations**: Prioritize by health status (red > yellow > green)
5. **Tone**: All UI text should be warm and encouraging (FR-029)
6. **Performance**: Lazy load lists, cache health scores, use SQLite indexes
7. **Next.js**: Use Server Components where possible, Client Components only for interactivity
8. **Material-UI**: Customize theme for warm, encouraging feel
9. **SWR**: Use SWR for all data fetching to get automatic caching, revalidation, and error handling
10. **SWR Mutations**: Use `useSWRMutation` for create/update/delete operations with optimistic updates

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Next Steps

1. Set up Next.js project with TypeScript and Material-UI
2. Implement database layer with SQLite (better-sqlite3) and encryption (SQLCipher)
3. Create Next.js API routes for data access
3. Implement service layer (start with ContactService)
4. Implement health calculation algorithm
5. Build UI components with Material-UI
6. Add comprehensive test coverage
7. Configure basic PWA features for installability (optional, requires network connectivity)
8. Test with 200+ contacts and 5+ years of data

## Resources

- **Specification**: `spec.md`
- **Data Model**: `data-model.md`
- **API Contracts**: `contracts/service-contracts.md`
- **Research**: `research.md`
- **Plan**: `plan.md`
- **Next.js Docs**: https://nextjs.org/docs
- **Material-UI Docs**: https://mui.com/
- **better-sqlite3 Docs**: https://github.com/WiseLibs/better-sqlite3
- **SQLCipher Docs**: https://www.zetetic.net/sqlcipher/
