import { NextRequest, NextResponse } from 'next/server';

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
      const res = await fetch(`${SCANNER_URL}/foods/${sanitizedId}/servings`, {
        headers: getHeaders(),
      });
      if (res.status === 404) {
        return NextResponse.json({ error: 'Unknown food_id' }, { status: 404 });
      }
      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch servings' }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    // 2. If searching for foods by query
    if (q !== null && q !== undefined) {
      const trimmedQ = q.slice(0, 80).trim();
      if (!trimmedQ) {
        return NextResponse.json({ results: [] });
      }
      const res = await fetch(`${SCANNER_URL}/foods/search?q=${encodeURIComponent(trimmedQ)}`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        return NextResponse.json({ results: [] }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Query parameter "q" or "foodId" required.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to proxy search request' }, { status: 500 });
  }
}
