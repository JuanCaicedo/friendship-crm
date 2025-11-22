import { NextRequest, NextResponse } from 'next/server';
import { tagService } from '@/lib/services/tagService';
import { CreateTagParams, ValidationError, ConflictError } from '@/lib/models';

export async function GET() {
  try {
    const tags = tagService.getTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTagParams = await request.json();
    const tag = tagService.createTag(body);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

