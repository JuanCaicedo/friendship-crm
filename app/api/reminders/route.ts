import { NextRequest, NextResponse } from 'next/server';
import { reminderService } from '@/lib/services/reminderService';
import { GetRemindersOptions, ValidationError } from '@/lib/models';
import { parsePositiveInteger } from '@/lib/utils/validators';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Validate status parameter - whitelist approach
    const statusParam = searchParams.get('status');
    const allowedStatus = ['pending', 'done'];
    const status = statusParam && allowedStatus.includes(statusParam.toLowerCase())
      ? (statusParam.toLowerCase() as 'pending' | 'done')
      : undefined;

    const options: GetRemindersOptions = {
      contactId: parsePositiveInteger(searchParams.get('contactId'), 'contactId'),
      status,
      dueBefore: parsePositiveInteger(searchParams.get('dueBefore'), 'dueBefore'),
      includePast: searchParams.get('includePast') === 'true',
    };

    const reminders = reminderService.getReminders(options);
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

