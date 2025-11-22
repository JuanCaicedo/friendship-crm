import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/services/contactService';
import { NotFoundError, ValidationError } from '@/lib/models';
import { parsePositiveInteger } from '@/lib/utils/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parsePositiveInteger(params.id, 'id');
    if (!id) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }
    const contact = contactService.getContact(id);

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parsePositiveInteger(params.id, 'id');
    if (!id) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
    }
    contactService.archiveContact(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving contact:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to archive contact' }, { status: 500 });
  }
}

