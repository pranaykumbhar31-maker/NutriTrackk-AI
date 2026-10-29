import { NextRequest, NextResponse } from 'next/server';
import { VERIFIED_FOOD_DATABASE, searchFoodDatabase } from '@/lib/foodDatabase';

const SCANNER_URL = process.env.SCANNER_URL ?? 'http://127.0.0.1:8001';
const SCANNER_API_KEY = process.env.SCANNER_API_KEY ?? ''; // server-only; never NEXT_PUBLIC_*

const getHeaders = (): Record<string, string> => (SCANNER_API_KEY ? { 'X-API-Key': SCANNER_API_KEY } : {});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const foodId = searchParams.get('foodId') || searchParams.get('id');
    const q = searchParams.get('q');

    // 1. If asking for servings of a specific food
    if (foodId) {
      const sanitizedId = encodeURIComponent(foodId.slice(0, 100).trim());
      try {
        const res = await fetch(`${SCANNER_URL}/foods/${sanitizedId}/servings`, {
          headers: getHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {}

      // Fallback to local verified food database
      const local = VERIFIED_FOOD_DATABASE.find((f) => f.id === foodId);
      if (local) {
        return NextResponse.json({
          food_id: foodId,
          options: [
            { label: `${local.servingSize} ${local.servingUnit}`, grams: local.servingSize },
            { label: '100 g', grams: 100 },
          ],
        });
      }

      return NextResponse.json({ error: 'Unknown food_id' }, { status: 404 });
    }

    // 2. If searching for foods by query
    if (q !== null && q !== undefined) {
      const trimmedQ = q.slice(0, 80).trim();
      if (!trimmedQ) {
        return NextResponse.json({ results: [] });
      }
      try {
        const res = await fetch(`${SCANNER_URL}/foods/search?q=${encodeURIComponent(trimmedQ)}`, {
          headers: getHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            return NextResponse.json(data);
          }
        }
      } catch {}

      // Fallback to local food database
      const localMatches = searchFoodDatabase(trimmedQ)
        .slice(0, 8)
        .map((f) => ({
          id: f.id,
          name: f.name,
          score: 0.9,
          kind: 'generic_reference',
        }));
      return NextResponse.json({ results: localMatches });
    }

    return NextResponse.json({ error: 'Query parameter "q" or "foodId" required.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to proxy search request' }, { status: 500 });
  }
}
