import { NextRequest, NextResponse } from 'next/server';
import { contactService } from '@/lib/services/contactService';
import { GetContactsOptions, ValidationError } from '@/lib/models';
import { parsePositiveInteger } from '@/lib/utils/validators';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const options: GetContactsOptions = {
      archived:
        searchParams.get('archived') === 'true'
          ? true
          : searchParams.get('archived') === 'false'
          ? false
          : undefined,
      tagId: parsePositiveInteger(searchParams.get('tagId'), 'tagId'),
      limit: parsePositiveInteger(searchParams.get('limit'), 'limit'),
      offset: parsePositiveInteger(searchParams.get('offset'), 'offset'),
    };

    const contacts = contactService.getContacts(options);
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

