import { ValidationError } from '../models';

export function validateName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('Name is required');
  }
  if (name.length > 200) {
    throw new ValidationError('Name must be 200 characters or less');
  }
}

export function validateBirthday(birthday: string | null | undefined): void {
  if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    throw new ValidationError('Birthday must be in YYYY-MM-DD format');
  }
}

export function validateProfileNote(note: string | null | undefined): void {
  if (note && note.length > 5000) {
    throw new ValidationError('Profile note must be 5000 characters or less');
  }
}

export function validateTagName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('Tag name is required');
  }
  if (name.length > 100) {
    throw new ValidationError('Tag name must be 100 characters or less');
  }
}

export function validateIntervalDays(min: number, max: number): void {
  if (min < 1) {
    throw new ValidationError('Minimum interval days must be at least 1');
  }
  if (max < min) {
    throw new ValidationError('Maximum interval days must be greater than or equal to minimum');
  }
}

export function validatePriority(priority: number): void {
  if (priority < 1) {
    throw new ValidationError('Priority must be at least 1');
  }
}

export function validateInteractionType(type: string): void {
  if (!['text', 'call', 'hangout'].includes(type)) {
    throw new ValidationError('Interaction type must be text, call, or hangout');
  }
}

export function validateNotes(notes: string | null | undefined, maxLength: number): void {
  if (notes && notes.length > maxLength) {
    throw new ValidationError(`Notes must be ${maxLength} characters or less`);
  }
}

export function getInteractionWeight(type: string): number {
  switch (type) {
    case 'text':
      return 1;
    case 'call':
      return 3;
    case 'hangout':
      return 6;
    default:
      throw new ValidationError('Invalid interaction type');
  }
}

/**
 * Safely parse an integer from a string, validating it's a valid positive integer
 * @param value - String value to parse
 * @param paramName - Name of the parameter for error messages
 * @returns Parsed integer or undefined if value is empty/null
 * @throws ValidationError if value is not a valid positive integer
 */
export function parsePositiveInteger(value: string | null | undefined, paramName: string = 'parameter'): number | undefined {
  if (!value || value.trim() === '') {
    return undefined;
  }

  // Check if it's a valid integer string (allows leading/trailing whitespace)
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new ValidationError(`${paramName} must be a valid positive integer`);
  }

  const parsed = parseInt(trimmed, 10);
  
  // Check for NaN or Infinity (shouldn't happen with regex check, but defensive)
  // Also reject 0 since positive integers must be > 0
  if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
    throw new ValidationError(`${paramName} must be a valid positive integer`);
  }

  return parsed;
}

