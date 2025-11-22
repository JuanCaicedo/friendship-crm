import { contactService } from '@/lib/services/contactService';
import { tagService } from '@/lib/services/tagService';
import { db } from '@/lib/database/db';
import { initializeDatabase } from '@/lib/database/db';

describe('ContactService Integration', () => {
  let defaultTagIds: number[];

  beforeEach(() => {
    // Clean up database before each test
    db.exec(`
      DELETE FROM contact_tags;
      DELETE FROM contacts;
      DELETE FROM tags;
    `);
    
    // Initialize default tags
    initializeDatabase();
    
    // Get default tag IDs for use in tests
    const tags = tagService.getTags();
    defaultTagIds = tags.map(t => t.id);
  });

  describe('createContact', () => {
    it('creates a contact with minimal data', () => {
      const contact = contactService.createContact({
        name: 'John Doe',
      });

      expect(contact.id).toBeDefined();
      expect(contact.name).toBe('John Doe');
      expect(contact.birthday).toBeNull();
      expect(contact.profileNote).toBeNull();
      expect(contact.archived).toBe(false);
      expect(contact.createdAt).toBeGreaterThan(0);
      expect(contact.updatedAt).toBeGreaterThan(0);
    });

    it('creates a contact with all fields', () => {
      const contact = contactService.createContact({
        name: 'Jane Smith',
        birthday: '1990-05-15',
        profileNote: 'Loves hiking and coffee',
        tagIds: defaultTagIds.slice(0, 2),
      });

      expect(contact.name).toBe('Jane Smith');
      expect(contact.birthday).toBe('1990-05-15');
      expect(contact.profileNote).toBe('Loves hiking and coffee');
      expect(contact.tags).toHaveLength(2);
    });

    it('throws error for invalid name', () => {
      expect(() => {
        contactService.createContact({ name: '' });
      }).toThrow('Name is required');
    });
  });

  describe('getContact', () => {
    it('retrieves a contact by id', () => {
      const created = contactService.createContact({ name: 'Test Contact' });
      const retrieved = contactService.getContact(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Contact');
    });

    it('returns null for non-existent contact', () => {
      const retrieved = contactService.getContact(999);
      expect(retrieved).toBeNull();
    });

    it('includes tags when retrieving contact', () => {
      // Ensure we have at least 2 default tags
      const tags = tagService.getTags();
      expect(tags.length).toBeGreaterThanOrEqual(2);
      const tagIds = tags.slice(0, 2).map(t => t.id);
      
      const created = contactService.createContact({
        name: 'Tagged Contact',
        tagIds,
      });
      const retrieved = contactService.getContact(created.id);

      expect(retrieved?.tags).toHaveLength(2);
      expect(retrieved?.tags?.map(t => t.id)).toContain(tagIds[0]);
      expect(retrieved?.tags?.map(t => t.id)).toContain(tagIds[1]);
    });
  });

  describe('getContacts', () => {
    let active1Id: number;
    let active2Id: number;
    let archivedId: number;

    beforeEach(() => {
      const active1 = contactService.createContact({ name: 'Active 1' });
      const active2 = contactService.createContact({ name: 'Active 2' });
      const archived = contactService.createContact({ name: 'Archived' });
      active1Id = active1.id;
      active2Id = active2.id;
      archivedId = archived.id;
      contactService.archiveContact(archived.id);
    });

    it('returns all contacts by default (including archived)', () => {
      const contacts = contactService.getContacts();
      // Should include all 3 contacts we created
      const contactIds = contacts.map(c => c.id);
      expect(contactIds).toContain(active1Id);
      expect(contactIds).toContain(active2Id);
      expect(contactIds).toContain(archivedId);
    });

    it('filters to only active contacts when archived=false', () => {
      const contacts = contactService.getContacts({ archived: false });
      expect(contacts.length).toBe(2);
      expect(contacts.every(c => !c.archived)).toBe(true);
    });

    it('filters by archived status', () => {
      const archived = contactService.getContacts({ archived: true });
      expect(archived.length).toBe(1);
      expect(archived[0].archived).toBe(true);
    });

    it('filters by tag', () => {
      const tagId = defaultTagIds[0];
      contactService.createContact({ name: 'Tagged', tagIds: [tagId] });
      const tagged = contactService.getContacts({ tagId });
      expect(tagged.length).toBe(1);
      expect(tagged[0].name).toBe('Tagged');
    });
  });

  describe('updateContact', () => {
    it('updates contact name', () => {
      const contact = contactService.createContact({ name: 'Original' });
      const updated = contactService.updateContact(contact.id, { name: 'Updated' });

      expect(updated.name).toBe('Updated');
      expect(updated.id).toBe(contact.id);
    });

    it('updates contact birthday', () => {
      const contact = contactService.createContact({ name: 'Test' });
      const updated = contactService.updateContact(contact.id, { birthday: '1990-01-01' });

      expect(updated.birthday).toBe('1990-01-01');
    });

    it('clears birthday when set to null', () => {
      const contact = contactService.createContact({
        name: 'Test',
        birthday: '1990-01-01',
      });
      const updated = contactService.updateContact(contact.id, { birthday: null });

      expect(updated.birthday).toBeNull();
    });
  });

  describe('archiveContact', () => {
    it('archives a contact', () => {
      const contact = contactService.createContact({ name: 'To Archive' });
      const archived = contactService.archiveContact(contact.id);

      expect(archived.archived).toBe(true);
    });
  });

  describe('archiveContact', () => {
    it('archives a contact and removes it from active list', () => {
      const contact = contactService.createContact({ name: 'To Archive' });
      contactService.archiveContact(contact.id);

      const archived = contactService.getContact(contact.id);
      expect(archived?.archived).toBe(true);
      
      const active = contactService.getContacts({ archived: false });
      expect(active.find(c => c.id === contact.id)).toBeUndefined();
    });

    it('archives contact with tags', () => {
      const tagId = defaultTagIds[0];
      const contact = contactService.createContact({
        name: 'Tagged',
        tagIds: [tagId],
      });
      contactService.archiveContact(contact.id);

      const archived = contactService.getContact(contact.id);
      expect(archived?.archived).toBe(true);
      expect(archived?.tags).toHaveLength(1);
    });
  });
});

