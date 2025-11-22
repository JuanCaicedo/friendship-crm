import { NextRequest, NextResponse } from 'next/server';
import { reminderService } from '@/lib/services/reminderService';
import { NotFoundError, ValidationError } from '@/lib/models';
import { parsePositiveInteger } from '@/lib/utils/validators';

export async function POST(request: NextRequest) {
  try {
    const body: { id: number | string } = await request.json();
    const id = typeof body.id === 'number' 
      ? body.id 
      : parsePositiveInteger(String(body.id), 'id');
    
    if (!id || id <= 0) {
      throw new ValidationError('id must be a valid positive integer');
    }
    
    const reminder = reminderService.markReminderDone(id);
    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Error marking reminder done:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to mark reminder done' }, { status: 500 });
  }
}

