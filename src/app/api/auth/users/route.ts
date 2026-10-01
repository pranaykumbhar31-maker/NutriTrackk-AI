import { NextRequest, NextResponse } from 'next/server';
import { getAllAccountsFromDb } from '@/lib/serverDatabase';

export async function GET() {
  try {
    const accounts = await getAllAccountsFromDb();
    // Return profiles list without passwords
    const safeList = accounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      email: acc.email,
      createdAt: acc.createdAt,
      profile: acc.profile,
      mealsCount: acc.meals ? acc.meals.length : 0,
    }));

    return NextResponse.json({ success: true, users: safeList });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch users';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
