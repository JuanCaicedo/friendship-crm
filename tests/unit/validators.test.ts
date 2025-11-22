import {
  validateName,
  validateBirthday,
  validateProfileNote,
  validateTagName,
  validateIntervalDays,
  validatePriority,
  validateInteractionType,
  validateNotes,
  getInteractionWeight,
  parsePositiveInteger,
} from '@/lib/utils/validators';
import { ValidationError } from '@/lib/models';

describe('Validators', () => {
  describe('validateName', () => {
    it('throws error for empty name', () => {
      expect(() => validateName('')).toThrow(ValidationError);
      expect(() => validateName('   ')).toThrow(ValidationError);
    });

    it('throws error for name longer than 200 characters', () => {
      const longName = 'a'.repeat(201);
      expect(() => validateName(longName)).toThrow(ValidationError);
    });

    it('passes for valid name', () => {
      expect(() => validateName('John Doe')).not.toThrow();
      expect(() => validateName('A')).not.toThrow();
      expect(() => validateName('a'.repeat(200))).not.toThrow();
    });
  });

  describe('validateBirthday', () => {
    it('passes for null or undefined', () => {
      expect(() => validateBirthday(null)).not.toThrow();
      expect(() => validateBirthday(undefined)).not.toThrow();
    });

    it('passes for valid YYYY-MM-DD format', () => {
      expect(() => validateBirthday('1990-01-15')).not.toThrow();
      expect(() => validateBirthday('2000-12-31')).not.toThrow();
    });

    it('throws error for invalid format', () => {
      expect(() => validateBirthday('1990/01/15')).toThrow(ValidationError);
      expect(() => validateBirthday('01-15-1990')).toThrow(ValidationError);
      expect(() => validateBirthday('1990-1-15')).toThrow(ValidationError);
      expect(() => validateBirthday('invalid')).toThrow(ValidationError);
    });
  });

  describe('validateProfileNote', () => {
    it('passes for null or undefined', () => {
      expect(() => validateProfileNote(null)).not.toThrow();
      expect(() => validateProfileNote(undefined)).not.toThrow();
    });

    it('throws error for note longer than 5000 characters', () => {
      const longNote = 'a'.repeat(5001);
      expect(() => validateProfileNote(longNote)).toThrow(ValidationError);
    });

    it('passes for valid note', () => {
      expect(() => validateProfileNote('Short note')).not.toThrow();
      expect(() => validateProfileNote('a'.repeat(5000))).not.toThrow();
    });
  });

  describe('validateTagName', () => {
    it('throws error for empty tag name', () => {
      expect(() => validateTagName('')).toThrow(ValidationError);
      expect(() => validateTagName('   ')).toThrow(ValidationError);
    });

    it('throws error for tag name longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => validateTagName(longName)).toThrow(ValidationError);
    });

    it('passes for valid tag name', () => {
      expect(() => validateTagName('Family')).not.toThrow();
      expect(() => validateTagName('a'.repeat(100))).not.toThrow();
    });
  });

  describe('validateIntervalDays', () => {
    it('throws error if min is less than 1', () => {
      expect(() => validateIntervalDays(0, 10)).toThrow(ValidationError);
      expect(() => validateIntervalDays(-1, 10)).toThrow(ValidationError);
    });

    it('throws error if max is less than min', () => {
      expect(() => validateIntervalDays(10, 5)).toThrow(ValidationError);
    });

    it('passes for valid intervals', () => {
      expect(() => validateIntervalDays(1, 1)).not.toThrow();
      expect(() => validateIntervalDays(7, 14)).not.toThrow();
      expect(() => validateIntervalDays(14, 30)).not.toThrow();
    });
  });

  describe('validatePriority', () => {
    it('throws error if priority is less than 1', () => {
      expect(() => validatePriority(0)).toThrow(ValidationError);
      expect(() => validatePriority(-1)).toThrow(ValidationError);
    });

    it('passes for valid priority', () => {
      expect(() => validatePriority(1)).not.toThrow();
      expect(() => validatePriority(10)).not.toThrow();
    });
  });

  describe('validateInteractionType', () => {
    it('passes for valid interaction types', () => {
      expect(() => validateInteractionType('text')).not.toThrow();
      expect(() => validateInteractionType('call')).not.toThrow();
      expect(() => validateInteractionType('hangout')).not.toThrow();
    });

    it('throws error for invalid interaction type', () => {
      expect(() => validateInteractionType('email')).toThrow(ValidationError);
      expect(() => validateInteractionType('')).toThrow(ValidationError);
      expect(() => validateInteractionType('invalid')).toThrow(ValidationError);
    });
  });

  describe('validateNotes', () => {
    it('passes for null or undefined', () => {
      expect(() => validateNotes(null, 1000)).not.toThrow();
      expect(() => validateNotes(undefined, 1000)).not.toThrow();
    });

    it('throws error if notes exceed maxLength', () => {
      const longNotes = 'a'.repeat(1001);
      expect(() => validateNotes(longNotes, 1000)).toThrow(ValidationError);
    });

    it('passes for valid notes', () => {
      expect(() => validateNotes('Short note', 1000)).not.toThrow();
      expect(() => validateNotes('a'.repeat(1000), 1000)).not.toThrow();
    });
  });

  describe('getInteractionWeight', () => {
    it('returns correct weight for text', () => {
      expect(getInteractionWeight('text')).toBe(1);
    });

    it('returns correct weight for call', () => {
      expect(getInteractionWeight('call')).toBe(3);
    });

    it('returns correct weight for hangout', () => {
      expect(getInteractionWeight('hangout')).toBe(6);
    });

    it('throws error for invalid type', () => {
      expect(() => getInteractionWeight('invalid')).toThrow(ValidationError);
      expect(() => getInteractionWeight('')).toThrow(ValidationError);
    });
  });

  describe('parsePositiveInteger', () => {
    it('returns undefined for null or undefined', () => {
      expect(parsePositiveInteger(null)).toBeUndefined();
      expect(parsePositiveInteger(undefined)).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(parsePositiveInteger('')).toBeUndefined();
      expect(parsePositiveInteger('   ')).toBeUndefined();
    });

    it('parses valid positive integers', () => {
      expect(parsePositiveInteger('1')).toBe(1);
      expect(parsePositiveInteger('123')).toBe(123);
      expect(parsePositiveInteger('  42  ')).toBe(42);
    });

    it('throws error for non-numeric strings', () => {
      expect(() => parsePositiveInteger('abc')).toThrow(ValidationError);
      expect(() => parsePositiveInteger('12.5')).toThrow(ValidationError);
      expect(() => parsePositiveInteger('-5')).toThrow(ValidationError);
      expect(() => parsePositiveInteger('0')).toThrow(ValidationError);
    });

    it('throws error with custom param name', () => {
      expect(() => parsePositiveInteger('abc', 'contactId')).toThrow('contactId must be a valid positive integer');
    });
  });
});

