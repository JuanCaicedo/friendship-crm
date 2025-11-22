import { NextRequest, NextResponse } from 'next/server';
import { reminderService } from '@/lib/services/reminderService';
import { CreateReminderParams, ValidationError, NotFoundError } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const body: CreateReminderParams = await request.json();
    const reminder = reminderService.createReminder(body);
    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}

