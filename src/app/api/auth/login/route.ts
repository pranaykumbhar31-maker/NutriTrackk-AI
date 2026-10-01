import { NextRequest, NextResponse } from 'next/server';
import { getAccountByEmail } from '@/lib/serverDatabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const account = await getAccountByEmail(cleanEmail);

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'No account registered on server with this email. Please sign up.' },
        { status: 404 }
      );
    }

    if (password && account.password && account.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password.' },
        { status: 401 }
      );
    }

    const safeAccount = { ...account, password: undefined };
    return NextResponse.json({ success: true, account: safeAccount });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
