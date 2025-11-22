import { db } from '../database/db';
import {
  Contact,
  CreateContactParams,
  UpdateContactParams,
  GetContactsOptions,
  Tag,
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../models';
import { validateName, validateBirthday, validateProfileNote } from '../utils/validators';

export class ContactService {
  createContact(params: CreateContactParams): Contact {
    validateName(params.name);
    if (params.birthday) validateBirthday(params.birthday);
    if (params.profileNote) validateProfileNote(params.profileNote);

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
          // Verify tag exists
          const tag = db.prepare('SELECT id FROM tags WHERE id = ?').get(tagId);
          if (!tag) {
            throw new NotFoundError(`Tag with id ${tagId} not found`);
          }
          try {
            insertContactTag.run(id, tagId, now);
          } catch (err: any) {
            // Ignore unique constraint violations (tag already assigned)
            if (!err.message.includes('UNIQUE constraint')) {
              throw err;
            }
          }
        }
      });

      insertTags(params.tagIds);
    }

    return this.getContact(id)!;
  }

  getContact(id: number): Contact | null {
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
      tags: contactTags.map((t) => ({
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

  getContacts(options?: GetContactsOptions): Contact[] {
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
    return contacts.map((contact) => {
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
        tags: contactTags.map((t) => ({
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

  updateContact(id: number, params: UpdateContactParams): Contact {
    const contact = this.getContact(id);
    if (!contact) {
      throw new NotFoundError(`Contact with id ${id} not found`);
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (params.name !== undefined) {
      validateName(params.name);
      updates.push('name = ?');
      values.push(params.name.trim());
    }

    if (params.birthday !== undefined) {
      if (params.birthday !== null) validateBirthday(params.birthday);
      updates.push('birthday = ?');
      values.push(params.birthday);
    }

    if (params.profileNote !== undefined) {
      if (params.profileNote !== null) validateProfileNote(params.profileNote);
      updates.push('profile_note = ?');
      values.push(params.profileNote);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      values.push(Math.floor(Date.now() / 1000));
      values.push(id);

      db.prepare(`UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    return this.getContact(id)!;
  }

  archiveContact(id: number): Contact {
    const contact = this.getContact(id);
    if (!contact) {
      throw new NotFoundError(`Contact with id ${id} not found`);
    }

    db.prepare('UPDATE contacts SET archived = 1, updated_at = ? WHERE id = ?').run(
      Math.floor(Date.now() / 1000),
      id
    );

    return this.getContact(id)!;
  }

  unarchiveContact(id: number): Contact {
    const contact = this.getContact(id);
    if (!contact) {
      throw new NotFoundError(`Contact with id ${id} not found`);
    }

    db.prepare('UPDATE contacts SET archived = 0, updated_at = ? WHERE id = ?').run(
      Math.floor(Date.now() / 1000),
      id
    );

    return this.getContact(id)!;
  }

  assignTag(contactId: number, tagId: number): void {
    const contact = this.getContact(contactId);
    if (!contact) {
      throw new NotFoundError(`Contact with id ${contactId} not found`);
    }

    const tag = db.prepare('SELECT id FROM tags WHERE id = ?').get(tagId) as any;
    if (!tag) {
      throw new NotFoundError(`Tag with id ${tagId} not found`);
    }

    const now = Math.floor(Date.now() / 1000);
    try {
      db.prepare(`
        INSERT INTO contact_tags (contact_id, tag_id, created_at)
        VALUES (?, ?, ?)
      `).run(contactId, tagId, now);
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint')) {
        throw new ConflictError(`Tag ${tagId} is already assigned to contact ${contactId}`);
      }
      throw err;
    }
  }

  removeTag(contactId: number, tagId: number): void {
    const contact = this.getContact(contactId);
    if (!contact) {
      throw new NotFoundError(`Contact with id ${contactId} not found`);
    }

    const result = db.prepare(`
      DELETE FROM contact_tags
      WHERE contact_id = ? AND tag_id = ?
    `).run(contactId, tagId);

    if (result.changes === 0) {
      throw new NotFoundError(`Tag ${tagId} is not assigned to contact ${contactId}`);
    }
  }
}

export const contactService = new ContactService();

