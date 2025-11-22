import { interactionService } from '@/lib/services/interactionService';
import { contactService } from '@/lib/services/contactService';
import { db } from '@/lib/database/db';
import { initializeDatabase } from '@/lib/database/db';
import { ValidationError, NotFoundError } from '@/lib/models';

describe('InteractionService Integration', () => {
  let testContactId: number;

  beforeEach(() => {
    // Clean up database before each test
    db.exec(`
      DELETE FROM interactions;
      DELETE FROM contact_tags;
      DELETE FROM contacts;
      DELETE FROM tags;
    `);
    
    // Manually insert default tags (only if they don't exist)
    const now = Math.floor(Date.now() / 1000);
    const insertTag = db.prepare(`
      INSERT OR IGNORE INTO tags (name, min_interval_days, max_interval_days, priority, is_default, created_at)
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
    
    // Create a test contact
    const contact = contactService.createContact({ name: 'Test Contact' });
    testContactId = contact.id;
  });

  describe('logInteraction', () => {
    it('logs a text interaction', () => {
      const now = Math.floor(Date.now() / 1000);
      const interaction = interactionService.logInteraction({
        contactId: testContactId,
        type: 'text',
        timestamp: now,
      });

      expect(interaction.id).toBeDefined();
      expect(interaction.type).toBe('text');
      expect(interaction.weight).toBe(1);
      expect(interaction.contactId).toBe(testContactId);
      expect(interaction.timestamp).toBe(now);
    });

    it('logs a call interaction with correct weight', () => {
      const now = Math.floor(Date.now() / 1000);
      const interaction = interactionService.logInteraction({
        contactId: testContactId,
        type: 'call',
        timestamp: now,
      });

      expect(interaction.type).toBe('call');
      expect(interaction.weight).toBe(3);
    });

    it('logs a hangout interaction with correct weight', () => {
      const now = Math.floor(Date.now() / 1000);
      const interaction = interactionService.logInteraction({
        contactId: testContactId,
        type: 'hangout',
        timestamp: now,
      });

      expect(interaction.type).toBe('hangout');
      expect(interaction.weight).toBe(6);
    });

    it('logs interaction with notes', () => {
      const now = Math.floor(Date.now() / 1000);
      const interaction = interactionService.logInteraction({
        contactId: testContactId,
        type: 'text',
        timestamp: now,
        notes: 'Had a great conversation!',
      });

      expect(interaction.notes).toBe('Had a great conversation!');
    });

    it('throws error for invalid interaction type', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(() => {
        interactionService.logInteraction({
          contactId: testContactId,
          type: 'invalid' as any,
          timestamp: now,
        });
      }).toThrow(ValidationError);
    });

    it('throws error for non-existent contact', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(() => {
        interactionService.logInteraction({
          contactId: 999,
          type: 'text',
          timestamp: now,
        });
      }).toThrow(NotFoundError);
    });

    it('throws error for notes that are too long', () => {
      const now = Math.floor(Date.now() / 1000);
      const longNotes = 'a'.repeat(2001);
      expect(() => {
        interactionService.logInteraction({
          contactId: testContactId,
          type: 'text',
          timestamp: now,
          notes: longNotes,
        });
      }).toThrow(ValidationError);
    });
  });

  describe('getInteraction', () => {
    it('retrieves an interaction by id', () => {
      const now = Math.floor(Date.now() / 1000);
      const created = interactionService.logInteraction({
        contactId: testContactId,
        type: 'text',
        timestamp: now,
      });
      const retrieved = interactionService.getInteraction(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.type).toBe('text');
    });

    it('returns null for non-existent interaction', () => {
      const retrieved = interactionService.getInteraction(999);
      expect(retrieved).toBeNull();
    });
  });

  describe('getInteractions', () => {
    beforeEach(() => {
      // Ensure contact exists (it should from main beforeEach, but be defensive)
      if (!testContactId) {
        const contact = contactService.createContact({ name: 'Test Contact' });
        testContactId = contact.id;
      }
      
      // Create multiple interactions
      const now = Math.floor(Date.now() / 1000);
      interactionService.logInteraction({
        contactId: testContactId,
        type: 'text',
        timestamp: now - 86400, // 1 day ago
      });
      interactionService.logInteraction({
        contactId: testContactId,
        type: 'call',
        timestamp: now - 172800, // 2 days ago
      });
    });

    it('returns all interactions by default', () => {
      const interactions = interactionService.getInteractions();
      expect(interactions.length).toBeGreaterThanOrEqual(2);
    });

    it('filters by contactId', () => {
      const otherContact = contactService.createContact({ name: 'Other Contact' });
      const now = Math.floor(Date.now() / 1000);
      interactionService.logInteraction({
        contactId: otherContact.id,
        type: 'text',
        timestamp: now,
      });

      const interactions = interactionService.getInteractions({ contactId: testContactId });
      expect(interactions.every(i => i.contactId === testContactId)).toBe(true);
    });

    it('orders by timestamp descending by default', () => {
      const interactions = interactionService.getInteractions({ contactId: testContactId });
      for (let i = 0; i < interactions.length - 1; i++) {
        expect(interactions[i].timestamp).toBeGreaterThanOrEqual(interactions[i + 1].timestamp);
      }
    });

    it('orders by timestamp ascending when specified', () => {
      const interactions = interactionService.getInteractions({
        contactId: testContactId,
        order: 'asc',
      });
      for (let i = 0; i < interactions.length - 1; i++) {
        expect(interactions[i].timestamp).toBeLessThanOrEqual(interactions[i + 1].timestamp);
      }
    });

    it('applies limit', () => {
      const interactions = interactionService.getInteractions({
        contactId: testContactId,
        limit: 1,
      });
      expect(interactions.length).toBe(1);
    });

    it('applies offset', () => {
      const all = interactionService.getInteractions({ contactId: testContactId });
      if (all.length > 1) {
        const offset = interactionService.getInteractions({
          contactId: testContactId,
          limit: 10, // Need limit when using offset in SQLite
          offset: 1,
        });
        expect(offset.length).toBeLessThanOrEqual(all.length - 1);
      }
    });
  });

  describe('updateInteraction', () => {
    it('updates interaction type', () => {
      const now = Math.floor(Date.now() / 1000);
      const interaction = interactionService.logInteraction({
        contactId: testContactId,
        type: 'text',
        timestamp: now,
      });
      const updated = interactionService.updateInteraction(interaction.id, { type: 'call' });

      expect(updated.type).toBe('call');
      expect(updated.weight).toBe(3); // Weight should update
    });

    it('updates interaction notes', () => {
      const now = Math.floor(Date.now() / 1000);
      const interaction = interactionService.logInteraction({
        contactId: testContactId,
        type: 'text',
        timestamp: now,
      });
      const updated = interactionService.updateInteraction(interaction.id, {
        notes: 'Updated notes',
      });

      expect(updated.notes).toBe('Updated notes');
    });

    it('clears notes when set to null', () => {
      const now = Math.floor(Date.now() / 1000);
      const interaction = interactionService.logInteraction({
        contactId: testContactId,
        type: 'text',
        timestamp: now,
        notes: 'Some notes',
      });
      const updated = interactionService.updateInteraction(interaction.id, { notes: null });

      expect(updated.notes).toBeNull();
    });
  });

  describe('deleteInteraction', () => {
    it('deletes an interaction', () => {
      const now = Math.floor(Date.now() / 1000);
      const interaction = interactionService.logInteraction({
        contactId: testContactId,
        type: 'text',
        timestamp: now,
      });
      interactionService.deleteInteraction(interaction.id);

      const retrieved = interactionService.getInteraction(interaction.id);
      expect(retrieved).toBeNull();
    });
  });
});

