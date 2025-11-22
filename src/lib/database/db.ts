import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize database
// Note: For production, use SQLCipher for encryption
// For now, using regular SQLite
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
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    due_date INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    note TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
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
  CREATE INDEX IF NOT EXISTS idx_tags_priority ON tags(priority);
  CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
  CREATE INDEX IF NOT EXISTS idx_contact_tags_contact_id ON contact_tags(contact_id);
  CREATE INDEX IF NOT EXISTS idx_contact_tags_tag_id ON contact_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_interactions_contact_id ON interactions(contact_id);
  CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON interactions(timestamp);
  CREATE INDEX IF NOT EXISTS idx_interactions_contact_timestamp ON interactions(contact_id, timestamp);
  CREATE INDEX IF NOT EXISTS idx_reminders_contact_id ON reminders(contact_id);
  CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
  CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
  CREATE INDEX IF NOT EXISTS idx_reminders_contact_status ON reminders(contact_id, status);
  CREATE INDEX IF NOT EXISTS idx_snoozes_contact_id ON snoozes(contact_id);
  CREATE INDEX IF NOT EXISTS idx_snoozes_snoozed_until ON snoozes(snoozed_until);
  CREATE INDEX IF NOT EXISTS idx_snoozes_contact_active ON snoozes(contact_id, snoozed_until);
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
    
    const insertTags = db.transaction((tags: Array<{
      name: string;
      minIntervalDays: number;
      maxIntervalDays: number;
      priority: number;
      isDefault: boolean;
      createdAt: number;
    }>) => {
      for (const tag of tags) {
        insertTag.run(
          tag.name,
          tag.minIntervalDays,
          tag.maxIntervalDays,
          tag.priority,
          tag.isDefault ? 1 : 0,
          tag.createdAt
        );
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

// Initialize on module load
initializeDatabase();

