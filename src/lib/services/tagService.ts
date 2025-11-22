import { db } from '../database/db';
import {
  Tag,
  CreateTagParams,
  UpdateTagParams,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../models';
import { validateTagName, validateIntervalDays, validatePriority } from '../utils/validators';

export class TagService {
  createTag(params: CreateTagParams): Tag {
    validateTagName(params.name);
    validateIntervalDays(params.minIntervalDays, params.maxIntervalDays);
    validatePriority(params.priority);

    // Check for duplicate name
    const existing = db.prepare('SELECT id FROM tags WHERE name = ?').get(params.name.trim()) as any;
    if (existing) {
      throw new ConflictError(`Tag with name "${params.name}" already exists`);
    }

    const now = Math.floor(Date.now() / 1000);
    const result = db.prepare(`
      INSERT INTO tags (name, min_interval_days, max_interval_days, priority, is_default, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(
      params.name.trim(),
      params.minIntervalDays,
      params.maxIntervalDays,
      params.priority,
      now
    );

    return this.getTag(result.lastInsertRowid as number)!;
  }

  getTag(id: number): Tag | null {
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as any;
    if (!tag) return null;

    return {
      id: tag.id,
      name: tag.name,
      minIntervalDays: tag.min_interval_days,
      maxIntervalDays: tag.max_interval_days,
      priority: tag.priority,
      isDefault: tag.is_default === 1,
      createdAt: tag.created_at,
    };
  }

  getTags(): Tag[] {
    const tags = db.prepare('SELECT * FROM tags ORDER BY priority DESC, name ASC').all() as any[];
    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      minIntervalDays: tag.min_interval_days,
      maxIntervalDays: tag.max_interval_days,
      priority: tag.priority,
      isDefault: tag.is_default === 1,
      createdAt: tag.created_at,
    }));
  }

  updateTag(id: number, params: UpdateTagParams): Tag {
    const tag = this.getTag(id);
    if (!tag) {
      throw new NotFoundError(`Tag with id ${id} not found`);
    }

    if (tag.isDefault) {
      throw new ForbiddenError('Default tags cannot be modified');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (params.name !== undefined) {
      validateTagName(params.name);
      // Check for duplicate name (excluding current tag)
      const existing = db.prepare('SELECT id FROM tags WHERE name = ? AND id != ?').get(params.name.trim(), id) as any;
      if (existing) {
        throw new ConflictError(`Tag with name "${params.name}" already exists`);
      }
      updates.push('name = ?');
      values.push(params.name.trim());
    }

    if (params.minIntervalDays !== undefined || params.maxIntervalDays !== undefined) {
      const minInterval = params.minIntervalDays ?? tag.minIntervalDays;
      const maxInterval = params.maxIntervalDays ?? tag.maxIntervalDays;
      validateIntervalDays(minInterval, maxInterval);
      if (params.minIntervalDays !== undefined) {
        updates.push('min_interval_days = ?');
        values.push(params.minIntervalDays);
      }
      if (params.maxIntervalDays !== undefined) {
        updates.push('max_interval_days = ?');
        values.push(params.maxIntervalDays);
      }
    }

    if (params.priority !== undefined) {
      validatePriority(params.priority);
      updates.push('priority = ?');
      values.push(params.priority);
    }

    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE tags SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    return this.getTag(id)!;
  }

  deleteTag(id: number): void {
    const tag = this.getTag(id);
    if (!tag) {
      throw new NotFoundError(`Tag with id ${id} not found`);
    }

    if (tag.isDefault) {
      throw new ForbiddenError('Default tags cannot be deleted');
    }

    // Cascade delete will remove contact_tags relationships
    db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  }
}

export const tagService = new TagService();

