import { NextRequest, NextResponse } from 'next/server';
import { recommendationService } from '@/lib/services/recommendationService';
import { RecommendationOptions, ValidationError } from '@/lib/models';
import { parsePositiveInteger } from '@/lib/utils/validators';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Safely parse excludeContactIds array
    let excludeContactIds: number[] | undefined;
    const excludeParam = searchParams.get('excludeContactIds');
    if (excludeParam) {
      try {
        const parsed = JSON.parse(excludeParam);
        if (Array.isArray(parsed)) {
          // Validate all items are positive integers
          excludeContactIds = parsed.map((id, index) => {
            const parsedId = parsePositiveInteger(String(id), `excludeContactIds[${index}]`);
            if (!parsedId) {
              throw new ValidationError(`excludeContactIds[${index}] must be a valid positive integer`);
            }
            return parsedId;
          });
        } else {
          throw new ValidationError('excludeContactIds must be an array');
        }
      } catch (err) {
        if (err instanceof ValidationError) {
          throw err;
        }
        throw new ValidationError('Invalid excludeContactIds format');
      }
    }

    const options: RecommendationOptions = {
      limit: parsePositiveInteger(searchParams.get('limit'), 'limit') || 3,
      excludeContactIds,
    };

    const recommendations = recommendationService.generateRecommendations(options);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: { excludeContactIds?: number[] } = await request.json();
    
    // Validate excludeContactIds array if provided
    let excludeContactIds: number[] = [];
    if (body.excludeContactIds) {
      if (!Array.isArray(body.excludeContactIds)) {
        throw new ValidationError('excludeContactIds must be an array');
      }
      excludeContactIds = body.excludeContactIds.map((id, index) => {
        const parsedId = parsePositiveInteger(String(id), `excludeContactIds[${index}]`);
        if (!parsedId) {
          throw new ValidationError(`excludeContactIds[${index}] must be a valid positive integer`);
        }
        return parsedId;
      });
    }
    
    const recommendations = recommendationService.refreshRecommendations(excludeContactIds);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error refreshing recommendations:', error);
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to refresh recommendations' }, { status: 500 });
  }
}

