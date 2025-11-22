import { tagService } from '@/lib/services/tagService';
import { db } from '@/lib/database/db';
import { initializeDatabase } from '@/lib/database/db';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '@/lib/models';

describe('TagService Integration', () => {
  beforeEach(() => {
    // Clean up database before each test
    db.exec(`
      DELETE FROM contact_tags;
      DELETE FROM tags;
    `);
    
    // Manually insert default tags (since initializeDatabase checks if they exist)
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
  });

  describe('createTag', () => {
    it('creates a custom tag', () => {
      const tag = tagService.createTag({
        name: 'Work Colleague',
        minIntervalDays: 30,
        maxIntervalDays: 60,
        priority: 5,
      });

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe('Work Colleague');
      expect(tag.minIntervalDays).toBe(30);
      expect(tag.maxIntervalDays).toBe(60);
      expect(tag.priority).toBe(5);
      expect(tag.isDefault).toBe(false);
    });

    it('throws error for duplicate name', () => {
      tagService.createTag({
        name: 'Custom Tag',
        minIntervalDays: 7,
        maxIntervalDays: 14,
        priority: 1,
      });

      expect(() => {
        tagService.createTag({
          name: 'Custom Tag',
          minIntervalDays: 7,
          maxIntervalDays: 14,
          priority: 1,
        });
      }).toThrow(ConflictError);
    });

    it('throws error for invalid interval', () => {
      expect(() => {
        tagService.createTag({
          name: 'Invalid',
          minIntervalDays: 10,
          maxIntervalDays: 5, // max < min
          priority: 1,
        });
      }).toThrow(ValidationError);
    });
  });

  describe('getTag', () => {
    it('retrieves a tag by id', () => {
      const created = tagService.createTag({
        name: 'Test Tag',
        minIntervalDays: 7,
        maxIntervalDays: 14,
        priority: 1,
      });
      const retrieved = tagService.getTag(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Tag');
    });

    it('returns null for non-existent tag', () => {
      const retrieved = tagService.getTag(999);
      expect(retrieved).toBeNull();
    });
  });

  describe('getTags', () => {
    it('returns all tags ordered by priority', () => {
      const tags = tagService.getTags();
      expect(tags.length).toBeGreaterThanOrEqual(4); // At least default tags
      
      // Check ordering (priority DESC)
      for (let i = 0; i < tags.length - 1; i++) {
        expect(tags[i].priority).toBeGreaterThanOrEqual(tags[i + 1].priority);
      }
    });

    it('includes default tags', () => {
      const tags = tagService.getTags();
      const defaultTags = tags.filter(t => t.isDefault);
      expect(defaultTags.length).toBe(4);
    });
  });

  describe('updateTag', () => {
    it('updates tag name', () => {
      const tag = tagService.createTag({
        name: 'Original',
        minIntervalDays: 7,
        maxIntervalDays: 14,
        priority: 1,
      });
      const updated = tagService.updateTag(tag.id, { name: 'Updated' });

      expect(updated.name).toBe('Updated');
    });

    it('updates tag intervals', () => {
      const tag = tagService.createTag({
        name: 'Test',
        minIntervalDays: 7,
        maxIntervalDays: 14,
        priority: 1,
      });
      const updated = tagService.updateTag(tag.id, {
        minIntervalDays: 10,
        maxIntervalDays: 20,
      });

      expect(updated.minIntervalDays).toBe(10);
      expect(updated.maxIntervalDays).toBe(20);
    });

    it('prevents updating default tags', () => {
      const defaultTags = tagService.getTags().filter(t => t.isDefault);
      const defaultTag = defaultTags[0];

      expect(() => {
        tagService.updateTag(defaultTag.id, { name: 'Modified' });
      }).toThrow(ForbiddenError);
    });

    it('throws error for duplicate name on update', () => {
      const tag1 = tagService.createTag({
        name: 'Tag 1',
        minIntervalDays: 7,
        maxIntervalDays: 14,
        priority: 1,
      });
      tagService.createTag({
        name: 'Tag 2',
        minIntervalDays: 7,
        maxIntervalDays: 14,
        priority: 1,
      });

      expect(() => {
        tagService.updateTag(tag1.id, { name: 'Tag 2' });
      }).toThrow(ConflictError);
    });
  });

  describe('deleteTag', () => {
    it('deletes a custom tag', () => {
      const tag = tagService.createTag({
        name: 'To Delete',
        minIntervalDays: 7,
        maxIntervalDays: 14,
        priority: 1,
      });
      tagService.deleteTag(tag.id);

      const retrieved = tagService.getTag(tag.id);
      expect(retrieved).toBeNull();
    });

    it('prevents deleting default tags', () => {
      const defaultTags = tagService.getTags().filter(t => t.isDefault);
      const defaultTag = defaultTags[0];

      expect(() => {
        tagService.deleteTag(defaultTag.id);
      }).toThrow(ForbiddenError);
    });

    it('throws error for non-existent tag', () => {
      expect(() => {
        tagService.deleteTag(999);
      }).toThrow(NotFoundError);
    });
  });
});

