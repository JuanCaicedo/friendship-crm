import { NextRequest, NextResponse } from 'next/server';
import { snoozeService } from '@/lib/services/snoozeService';
import { ValidationError, NotFoundError } from '@/lib/models';
import { parsePositiveInteger } from '@/lib/utils/validators';

export async function POST(request: NextRequest) {
  try {
    const body: { contactId: number | string; days: number | string } = await request.json();
    
    const contactId = typeof body.contactId === 'number'
      ? body.contactId
      : parsePositiveInteger(String(body.contactId), 'contactId');
    
    if (!contactId || contactId <= 0) {
      throw new ValidationError('contactId must be a valid positive integer');
    }
    
    const days = typeof body.days === 'number'
      ? body.days
      : parsePositiveInteger(String(body.days), 'days');
    
    if (!days || days <= 0) {
      throw new ValidationError('days must be a valid positive integer');
    }
    
    const snooze = snoozeService.snoozeRecommendation(contactId, days);
    return NextResponse.json(snooze, { status: 201 });
  } catch (error) {
    console.error('Error creating snooze:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to create snooze' }, { status: 500 });
  }
}

