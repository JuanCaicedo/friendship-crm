import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/services/contactService';
import { UpdateContactParams, ValidationError, NotFoundError } from '@/lib/models';
import { parsePositiveInteger } from '@/lib/utils/validators';

export async function POST(request: NextRequest) {
  try {
    const body: { id: number | string; params: UpdateContactParams } = await request.json();
    const id = typeof body.id === 'number'
      ? body.id
      : parsePositiveInteger(String(body.id), 'id');
    
    if (!id || id <= 0) {
      throw new ValidationError('id must be a valid positive integer');
    }
    
    const contact = contactService.updateContact(id, body.params);
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

