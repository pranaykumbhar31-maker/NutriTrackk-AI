import { NextRequest, NextResponse } from 'next/server';
import { getAccountByEmail, saveAccountToDb } from '@/lib/serverDatabase';
import { UserAccount, UserProfile } from '@/lib/types';
import { DEFAULT_CALENDAR_EVENTS } from '@/lib/festivalEngine';
import { DEFAULT_REMINDERS, DEFAULT_EXERCISES } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password, profile } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email and Name are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await getAccountByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists on the server.' },
        { status: 409 }
      );
    }

    const newId = `usr-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const fullProfile: UserProfile = {
      id: newId,
      name: name.trim(),
      age: profile?.age || 25,
      gender: profile?.gender || 'other',
      heightCm: profile?.heightCm || 170,
      weightKg: profile?.weightKg || 65,
      targetWeightKg: profile?.targetWeightKg || 62,
      targetDate: profile?.targetDate || '2026-12-31',
      activityLevel: profile?.activityLevel || 'moderate',
      goal: profile?.goal || 'improve_health',
      dietaryPreference: profile?.dietaryPreference || 'all',
      allergies: profile?.allergies || [],
      dislikedFoods: [],
      dailyCalorieTarget: profile?.dailyCalorieTarget || 2000,
      dailyProteinTarget: profile?.dailyProteinTarget || 100,
      dailyCarbsTarget: profile?.dailyCarbsTarget || 220,
      dailyFatsTarget: profile?.dailyFatsTarget || 55,
      streakDays: 1,
      lastActiveDate: today,
    };

    const newAccount: UserAccount = {
      id: newId,
      email: cleanEmail,
      name: name.trim(),
      password: password || 'password123',
      createdAt: today,
      profile: fullProfile,
      meals: [],
      weightLogs: [
        {
          id: `w-${Date.now()}`,
          date: today,
          weightKg: fullProfile.weightKg,
          bmi: Math.round((fullProfile.weightKg / Math.pow(fullProfile.heightCm / 100, 2)) * 10) / 10,
        },
      ],
      water: { date: today, cups: 0, targetCups: 8 },
      events: DEFAULT_CALENDAR_EVENTS,
      reminders: DEFAULT_REMINDERS,
      exercises: DEFAULT_EXERCISES,
    };

    await saveAccountToDb(newAccount);

    // Return account without plaintext password for security
    const safeAccount = { ...newAccount, password: undefined };
    return NextResponse.json({ success: true, account: safeAccount });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
