import { NextRequest, NextResponse } from 'next/server';
import { getAccountById, syncUserData } from '@/lib/serverDatabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const account = await getAccountById(userId);
    if (!account) {
      return NextResponse.json({ success: false, error: 'User not found in backend' }, { status: 404 });
    }

    const safeAccount = { ...account, password: undefined };
    return NextResponse.json({ success: true, account: safeAccount });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Sync fetch failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, payload } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const updated = await syncUserData(userId, payload || {});
    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found to sync' }, { status: 404 });
    }

    const safeAccount = { ...updated, password: undefined };
    return NextResponse.json({ success: true, account: safeAccount });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Sync update failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
