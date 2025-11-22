import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/services/contactService';
import { CreateContactParams, ValidationError, NotFoundError, ConflictError } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const body: CreateContactParams = await request.json();
    const contact = contactService.createContact(body);
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}

