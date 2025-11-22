import { db } from '../database/db';
import { HealthScore, HealthStatus, NotFoundError } from '../models';
import { calculateHealth } from '../utils/healthCalculator';

export class HealthService {
  calculateHealth(contactId: number): HealthScore {
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId) as any;
    if (!contact) {
      throw new NotFoundError(`Contact with id ${contactId} not found`);
    }

    // Get highest priority tag
    const tags = db.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN contact_tags ct ON t.id = ct.tag_id
      WHERE ct.contact_id = ?
      ORDER BY t.priority DESC
      LIMIT 1
    `).all(contactId) as any[];

    // Default interval if no tags (365 days, priority 1)
    const expectedIntervalDays = tags.length > 0 ? tags[0].max_interval_days : 365;

    // Get most recent interaction
    const lastInteraction = db.prepare(`
      SELECT timestamp, weight FROM interactions
      WHERE contact_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `).get(contactId) as any;

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const health = calculateHealth(
      lastInteraction?.timestamp || null,
      lastInteraction?.weight || null,
      expectedIntervalDays,
      currentTimestamp
    );

    return {
      ...health,
      contactId,
    };
  }

  getHealthStatus(contactId: number): HealthStatus {
    return this.calculateHealth(contactId).status;
  }

  getHealthScores(contactIds: number[]): Map<number, HealthScore> {
    const scores = new Map<number, HealthScore>();
    for (const contactId of contactIds) {
      try {
        scores.set(contactId, this.calculateHealth(contactId));
      } catch (err) {
        // Skip contacts that don't exist
        if (err instanceof NotFoundError) {
          continue;
        }
        throw err;
      }
    }
    return scores;
  }
}

export const healthService = new HealthService();

