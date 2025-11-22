import { NextRequest, NextResponse } from 'next/server';
import { interactionService } from '@/lib/services/interactionService';
import { GetInteractionsOptions, ValidationError } from '@/lib/models';
import { parsePositiveInteger } from '@/lib/utils/validators';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Validate orderBy parameter - whitelist approach to prevent SQL injection
    const orderByParam = searchParams.get('orderBy');
    const allowedOrderBy = ['timestamp', 'created_at'];
    const orderBy = orderByParam && allowedOrderBy.includes(orderByParam)
      ? (orderByParam as 'timestamp' | 'created_at')
      : 'timestamp';

    // Validate order parameter - whitelist approach to prevent SQL injection
    const orderParam = searchParams.get('order');
    const allowedOrder = ['asc', 'desc'];
    const order = orderParam && allowedOrder.includes(orderParam.toLowerCase())
      ? (orderParam.toLowerCase() as 'asc' | 'desc')
      : 'desc';

    const options: GetInteractionsOptions = {
      contactId: parsePositiveInteger(searchParams.get('contactId'), 'contactId'),
      limit: parsePositiveInteger(searchParams.get('limit'), 'limit'),
      offset: parsePositiveInteger(searchParams.get('offset'), 'offset'),
      orderBy,
      order,
    };

    const interactions = interactionService.getInteractions(options);
    return NextResponse.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 });
  }
}

