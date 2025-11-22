import { db } from '../database/db';
import {
  Interaction,
  LogInteractionParams,
  UpdateInteractionParams,
  GetInteractionsOptions,
  NotFoundError,
  ValidationError,
} from '../models';
import { validateInteractionType, validateNotes, getInteractionWeight } from '../utils/validators';

export class InteractionService {
  logInteraction(params: LogInteractionParams): Interaction {
    validateInteractionType(params.type);

    // Verify contact exists
    const contact = db.prepare('SELECT id FROM contacts WHERE id = ?').get(params.contactId) as any;
    if (!contact) {
      throw new NotFoundError(`Contact with id ${params.contactId} not found`);
    }

    const weight = getInteractionWeight(params.type);
    const now = Math.floor(Date.now() / 1000);

    if (params.notes) {
      validateNotes(params.notes, 2000);
    }

    const result = db.prepare(`
      INSERT INTO interactions (contact_id, type, timestamp, notes, weight, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      params.contactId,
      params.type,
      params.timestamp,
      params.notes || null,
      weight,
      now,
      now
    );

    return this.getInteraction(result.lastInsertRowid as number)!;
  }

  getInteraction(id: number): Interaction | null {
    const interaction = db.prepare('SELECT * FROM interactions WHERE id = ?').get(id) as any;
    if (!interaction) return null;

    return {
      id: interaction.id,
      contactId: interaction.contact_id,
      type: interaction.type as 'text' | 'call' | 'hangout',
      weight: interaction.weight,
      timestamp: interaction.timestamp,
      notes: interaction.notes,
      createdAt: interaction.created_at,
      updatedAt: interaction.updated_at,
    };
  }

  getInteractions(options: GetInteractionsOptions = {}): Interaction[] {
    let query = 'SELECT * FROM interactions WHERE 1=1';
    const params: any[] = [];

    if (options.contactId) {
      query += ' AND contact_id = ?';
      params.push(options.contactId);
    }

    // Validate and whitelist orderBy to prevent SQL injection
    const allowedOrderByColumns = ['timestamp', 'created_at'];
    const orderBy = options.orderBy && allowedOrderByColumns.includes(options.orderBy)
      ? options.orderBy
      : 'timestamp';

    // Validate and whitelist order direction to prevent SQL injection
    const allowedOrderDirections = ['asc', 'desc'];
    const order = options.order && allowedOrderDirections.includes(options.order.toLowerCase())
      ? options.order.toLowerCase()
      : 'desc';

    query += ` ORDER BY ${orderBy} ${order.toUpperCase()}`;

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const interactions = db.prepare(query).all(...params) as any[];
    return interactions.map((interaction) => ({
      id: interaction.id,
      contactId: interaction.contact_id,
      type: interaction.type as 'text' | 'call' | 'hangout',
      weight: interaction.weight,
      timestamp: interaction.timestamp,
      notes: interaction.notes,
      createdAt: interaction.created_at,
      updatedAt: interaction.updated_at,
    }));
  }

  updateInteraction(id: number, params: UpdateInteractionParams): Interaction {
    const interaction = this.getInteraction(id);
    if (!interaction) {
      throw new NotFoundError(`Interaction with id ${id} not found`);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let newWeight = interaction.weight;

    if (params.type !== undefined) {
      validateInteractionType(params.type);
      newWeight = getInteractionWeight(params.type);
      updates.push('type = ?');
      updates.push('weight = ?');
      values.push(params.type);
      values.push(newWeight);
    }

    if (params.timestamp !== undefined) {
      updates.push('timestamp = ?');
      values.push(params.timestamp);
    }

    if (params.notes !== undefined) {
      if (params.notes !== null) validateNotes(params.notes, 2000);
      updates.push('notes = ?');
      values.push(params.notes);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      values.push(Math.floor(Date.now() / 1000));
      values.push(id);
      db.prepare(`UPDATE interactions SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    return this.getInteraction(id)!;
  }

  deleteInteraction(id: number): void {
    const interaction = this.getInteraction(id);
    if (!interaction) {
      throw new NotFoundError(`Interaction with id ${id} not found`);
    }

    db.prepare('DELETE FROM interactions WHERE id = ?').run(id);
  }
}

export const interactionService = new InteractionService();

