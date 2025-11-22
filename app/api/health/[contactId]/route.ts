import { NextRequest, NextResponse } from 'next/server';
import { healthService } from '@/lib/services/healthService';
import { NotFoundError, ValidationError } from '@/lib/models';
import { parsePositiveInteger } from '@/lib/utils/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const contactId = parsePositiveInteger(params.contactId, 'contactId');
    if (!contactId) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }
    const health = healthService.calculateHealth(contactId);
    return NextResponse.json(health);
  } catch (error) {
    console.error('Error calculating health:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to calculate health' }, { status: 500 });
  }
}

