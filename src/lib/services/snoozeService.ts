import { db } from '../database/db';
import { Snooze, NotFoundError, ValidationError } from '../models';

export class SnoozeService {
  snoozeRecommendation(contactId: number, days: number): Snooze {
    if (days <= 0) {
      throw new ValidationError('Days must be positive');
    }

    // Verify contact exists
    const contact = db.prepare('SELECT id FROM contacts WHERE id = ?').get(contactId) as any;
    if (!contact) {
      throw new NotFoundError(`Contact with id ${contactId} not found`);
    }

    const now = Math.floor(Date.now() / 1000);
    const snoozedUntil = now + days * 86400;

    // Check if snooze already exists
    const existing = db.prepare('SELECT id FROM snoozes WHERE contact_id = ?').get(contactId) as any;

    if (existing) {
      // Update existing snooze
      db.prepare('UPDATE snoozes SET snoozed_until = ? WHERE contact_id = ?').run(snoozedUntil, contactId);
      return {
        id: existing.id,
        contactId,
        snoozedUntil,
        createdAt: existing.created_at || now,
      };
    } else {
      // Create new snooze
      const result = db.prepare(`
        INSERT INTO snoozes (contact_id, snoozed_until, created_at)
        VALUES (?, ?, ?)
      `).run(contactId, snoozedUntil, now);

      return {
        id: result.lastInsertRowid as number,
        contactId,
        snoozedUntil,
        createdAt: now,
      };
    }
  }

  isSnoozed(contactId: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    const snooze = db.prepare(`
      SELECT id FROM snoozes
      WHERE contact_id = ? AND snoozed_until > ?
    `).get(contactId, now) as any;
    return !!snooze;
  }

  getActiveSnoozes(): Snooze[] {
    const now = Math.floor(Date.now() / 1000);
    const snoozes = db.prepare(`
      SELECT * FROM snoozes
      WHERE snoozed_until > ?
      ORDER BY snoozed_until ASC
    `).all(now) as any[];

    return snoozes.map((snooze) => ({
      id: snooze.id,
      contactId: snooze.contact_id,
      snoozedUntil: snooze.snoozed_until,
      createdAt: snooze.created_at,
    }));
  }
}

export const snoozeService = new SnoozeService();

