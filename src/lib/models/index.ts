// Common types
export type Timestamp = number; // Unix timestamp (seconds since epoch)
export type HealthStatus = 'green' | 'yellow' | 'red';
export type InteractionType = 'text' | 'call' | 'hangout';
export type ReminderStatus = 'pending' | 'done';

// Contact
export interface Contact {
  id: number;
  name: string;
  birthday: string | null;
  profileNote: string | null;
  createdAt: Timestamp;
  archived: boolean;
  updatedAt: Timestamp;
  tags?: Tag[];
}

export interface CreateContactParams {
  name: string;
  birthday?: string;
  profileNote?: string;
  tagIds?: number[];
}

export interface UpdateContactParams {
  name?: string;
  birthday?: string | null;
  profileNote?: string | null;
}

export interface GetContactsOptions {
  archived?: boolean;
  tagId?: number;
  limit?: number;
  offset?: number;
}

// Tag
export interface Tag {
  id: number;
  name: string;
  minIntervalDays: number;
  maxIntervalDays: number;
  priority: number;
  isDefault: boolean;
  createdAt: Timestamp;
}

export interface CreateTagParams {
  name: string;
  minIntervalDays: number;
  maxIntervalDays: number;
  priority: number;
}

export interface UpdateTagParams {
  name?: string;
  minIntervalDays?: number;
  maxIntervalDays?: number;
  priority?: number;
}

// Interaction
export interface Interaction {
  id: number;
  contactId: number;
  type: InteractionType;
  weight: number;
  timestamp: Timestamp;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LogInteractionParams {
  contactId: number;
  type: InteractionType;
  timestamp: Timestamp;
  notes?: string;
}

export interface UpdateInteractionParams {
  type?: InteractionType;
  timestamp?: Timestamp;
  notes?: string | null;
}

export interface GetInteractionsOptions {
  contactId?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp' | 'created_at';
  order?: 'asc' | 'desc';
}

// Reminder
export interface Reminder {
  id: number;
  contactId: number;
  dueDate: Timestamp;
  status: ReminderStatus;
  note: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateReminderParams {
  contactId: number;
  dueDate: Timestamp;
  note?: string;
}

export interface GetRemindersOptions {
  contactId?: number;
  status?: ReminderStatus;
  dueBefore?: Timestamp;
  includePast?: boolean;
}

// Snooze
export interface Snooze {
  id: number;
  contactId: number;
  snoozedUntil: Timestamp;
  createdAt: Timestamp;
}

// Health Score
export interface HealthScore {
  contactId: number;
  score: number;
  status: HealthStatus;
  lastInteractionTimestamp: Timestamp | null;
  expectedIntervalDays: number;
}

// Recommendation
export interface Recommendation {
  contactId: number;
  contact: Contact;
  reason: string;
  priority: number;
  healthStatus: HealthStatus;
  isReminder: boolean;
}

export interface RecommendationOptions {
  limit?: number;
  excludeContactIds?: number[];
}

// Error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

