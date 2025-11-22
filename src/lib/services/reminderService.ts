import { db } from '../database/db';
import {
  Reminder,
  CreateReminderParams,
  GetRemindersOptions,
  ReminderStatus,
  NotFoundError,
  ValidationError,
} from '../models';
import { validateNotes } from '../utils/validators';

export class ReminderService {
  createReminder(params: CreateReminderParams): Reminder {
    // Verify contact exists
    const contact = db.prepare('SELECT id FROM contacts WHERE id = ?').get(params.contactId) as any;
    if (!contact) {
      throw new NotFoundError(`Contact with id ${params.contactId} not found`);
    }

    if (params.note) {
      validateNotes(params.note, 1000);
    }

    const now = Math.floor(Date.now() / 1000);
    const result = db.prepare(`
      INSERT INTO reminders (contact_id, due_date, status, note, created_at, updated_at)
      VALUES (?, ?, 'pending', ?, ?, ?)
    `).run(
      params.contactId,
      params.dueDate,
      params.note || null,
      now,
      now
    );

    return this.getReminder(result.lastInsertRowid as number)!;
  }

  getReminder(id: number): Reminder | null {
    const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id) as any;
    if (!reminder) return null;

    return {
      id: reminder.id,
      contactId: reminder.contact_id,
      dueDate: reminder.due_date,
      status: reminder.status as ReminderStatus,
      note: reminder.note,
      createdAt: reminder.created_at,
      updatedAt: reminder.updated_at,
    };
  }

  getReminders(options: GetRemindersOptions = {}): Reminder[] {
    let query = 'SELECT * FROM reminders WHERE 1=1';
    const params: any[] = [];

    if (options.contactId) {
      query += ' AND contact_id = ?';
      params.push(options.contactId);
    }

    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }

    if (options.dueBefore) {
      query += ' AND due_date <= ?';
      params.push(options.dueBefore);
    }

    if (!options.includePast) {
      const now = Math.floor(Date.now() / 1000);
      query += ' AND due_date >= ?';
      params.push(now);
    }

    query += ' ORDER BY due_date ASC';

    const reminders = db.prepare(query).all(...params) as any[];
    return reminders.map((reminder) => ({
      id: reminder.id,
      contactId: reminder.contact_id,
      dueDate: reminder.due_date,
      status: reminder.status as ReminderStatus,
      note: reminder.note,
      createdAt: reminder.created_at,
      updatedAt: reminder.updated_at,
    }));
  }

  markReminderDone(id: number): Reminder {
    const reminder = this.getReminder(id);
    if (!reminder) {
      throw new NotFoundError(`Reminder with id ${id} not found`);
    }

    const now = Math.floor(Date.now() / 1000);
    db.prepare('UPDATE reminders SET status = ?, updated_at = ? WHERE id = ?').run('done', now, id);

    return this.getReminder(id)!;
  }
}

export const reminderService = new ReminderService();

