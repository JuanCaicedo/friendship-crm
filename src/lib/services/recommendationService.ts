import { db } from '../database/db';
import { contactService } from './contactService';
import { healthService } from './healthService';
import { reminderService } from './reminderService';
import { snoozeService } from './snoozeService';
import { Recommendation, RecommendationOptions, HealthStatus, Contact } from '../models';

// Helper for status ordering
const statusOrder: Record<HealthStatus, number> = {
  red: 3,
  yellow: 2,
  green: 1,
};

export class RecommendationService {
  generateRecommendations(options: RecommendationOptions = {}): Recommendation[] {
    const limit = options.limit || 3;
    const excludeContactIds = options.excludeContactIds || [];
    const now = Math.floor(Date.now() / 1000);

    // Get all active (non-archived) contacts
    const contacts = contactService.getContacts({ archived: false });

    // Get due/overdue reminders (highest priority)
    const reminders = reminderService.getReminders({
      status: 'pending',
      dueBefore: now,
      includePast: true,
    });

    const recommendations: Recommendation[] = [];

    // First, add recommendations based on reminders
    for (const reminder of reminders) {
      if (excludeContactIds.includes(reminder.contactId)) continue;
      if (snoozeService.isSnoozed(reminder.contactId)) continue;

      const contact = contactService.getContact(reminder.contactId);
      if (!contact) continue;

      const health = healthService.calculateHealth(reminder.contactId);
      const daysOverdue = Math.floor((now - reminder.dueDate) / 86400);

      recommendations.push({
        contactId: reminder.contactId,
        contact,
        reason: daysOverdue > 0
          ? `You have a reminder to reach out to ${contact.name} that's ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue.`
          : `You have a reminder to reach out to ${contact.name} today.`,
        priority: 1000 + (reminder.dueDate - now), // Higher priority for more overdue
        healthStatus: health.status,
        isReminder: true,
      });
    }

    // Then, add recommendations based on health status
    const healthScores = new Map<number, { health: { status: HealthStatus; score: number; lastInteractionTimestamp: number | null }; contact: Contact }>();
    for (const contact of contacts) {
      if (excludeContactIds.includes(contact.id)) continue;
      if (snoozeService.isSnoozed(contact.id)) continue;

      // Check if already in recommendations (from reminder)
      if (recommendations.some((r) => r.contactId === contact.id)) continue;

      // For contacts with no tags: only recommend if it's been at least 1 year since creation
      // and they have no interactions or it's been a year since last interaction
      if (!contact.tags || contact.tags.length === 0) {
        const daysSinceCreation = Math.floor((now - contact.createdAt) / 86400);
        if (daysSinceCreation < 365) {
          continue; // Skip contacts created less than a year ago with no tags
        }
      }

      const health = healthService.calculateHealth(contact.id);
      if (health.status === 'green' && !reminders.some((r) => r.contactId === contact.id)) {
        continue; // Skip healthy contacts unless they have a reminder
      }

      healthScores.set(contact.id, { health, contact });
    }

    // Sort by health status (red > yellow > green) and then by score (lower = more urgent)
    const sortedContacts = Array.from(healthScores.entries()).sort((a, b) => {
      const statusDiff = statusOrder[b[1].health.status] - statusOrder[a[1].health.status];
      if (statusDiff !== 0) return statusDiff;
      return a[1].health.score - b[1].health.score; // Lower score = more urgent
    });

    for (const [contactId, { health, contact }] of sortedContacts) {
      if (recommendations.length >= limit) break;

      let reason = '';
      if (health.status === 'red') {
        if (!contact.tags || contact.tags.length === 0) {
          reason = `It's been a while since you added ${contact.name}. Consider reaching out with a quick message!`;
        } else {
          reason = `It's been a while since you last connected with ${contact.name}. They'd love to hear from you!`;
        }
      } else if (health.status === 'yellow') {
        reason = `${contact.name} could use some attention soon. A quick check-in would be great!`;
      }

      recommendations.push({
        contactId,
        contact,
        reason,
        priority: statusOrder[health.status] * 100 - health.score * 100,
        healthStatus: health.status,
        isReminder: false,
      });
    }

    // Sort all recommendations by priority (descending)
    recommendations.sort((a, b) => b.priority - a.priority);

    return recommendations.slice(0, limit);
  }

  refreshRecommendations(excludeContactIds: number[]): Recommendation[] {
    return this.generateRecommendations({
      limit: 3,
      excludeContactIds,
    });
  }
}

export const recommendationService = new RecommendationService();

