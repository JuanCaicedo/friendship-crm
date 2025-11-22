import { NextRequest, NextResponse } from 'next/server';
import { interactionService } from '@/lib/services/interactionService';
import { LogInteractionParams, ValidationError, NotFoundError } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const body: LogInteractionParams = await request.json();
    const interaction = interactionService.logInteraction(body);
    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    console.error('Error creating interaction:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to create interaction' }, { status: 500 });
  }
}

