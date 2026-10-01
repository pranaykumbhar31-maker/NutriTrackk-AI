import fs from 'fs';
import path from 'path';
import { UserAccount, MealLog, UserProfile, WaterLog, WeightLog, CalendarEvent, SmartReminder } from './types';
import { DEFAULT_USER_PROFILE, DEFAULT_INITIAL_MEALS, DEFAULT_WEIGHT_LOGS, DEFAULT_REMINDERS, DEFAULT_EXERCISES } from './storage';
import { DEFAULT_CALENDAR_EVENTS } from './festivalEngine';

// Database storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nutritrack-backend.json');
// Fallback for serverless environments where cwd may be read-only
const TMP_DB_FILE = path.join('/tmp', 'nutritrack-backend.json');

function getDbFilePath(): string {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return DB_FILE;
  } catch {
    return TMP_DB_FILE;
  }
}

// In-memory cache for ultra-fast response times
let memoryAccounts: UserAccount[] | null = null;

// Initial pre-seeded accounts
function getInitialSeedAccounts(): UserAccount[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'usr-maya-01',
      email: 'maya@nutritrack.ai',
      name: 'Maya',
      password: 'password123',
      createdAt: '2026-05-20',
      profile: DEFAULT_USER_PROFILE,
      meals: DEFAULT_INITIAL_MEALS,
      weightLogs: DEFAULT_WEIGHT_LOGS,
      water: { date: today, cups: 5, targetCups: 8 },
      events: DEFAULT_CALENDAR_EVENTS,
      reminders: DEFAULT_REMINDERS,
      exercises: DEFAULT_EXERCISES,
    },
    {
      id: 'usr-alex-02',
      email: 'alex@nutritrack.ai',
      name: 'Alex',
      password: 'password123',
      createdAt: '2026-06-01',
      profile: {
        id: 'usr-alex-02',
        name: 'Alex',
        age: 25,
        gender: 'male',
        heightCm: 180,
        weightKg: 75,
        targetWeightKg: 78,
        targetDate: '2026-12-15',
        activityLevel: 'very_active',
        goal: 'build_muscle',
        dietaryPreference: 'non_veg',
        allergies: [],
        dislikedFoods: [],
        dailyCalorieTarget: 2750,
        dailyProteinTarget: 155,
        dailyCarbsTarget: 330,
        dailyFatsTarget: 75,
        streakDays: 6,
        lastActiveDate: today,
      },
      meals: [],
      weightLogs: [
        { id: 'w-al-1', date: '2026-09-01', weightKg: 74.2, bmi: 22.9 },
        { id: 'w-al-2', date: '2026-09-05', weightKg: 74.6, bmi: 23.0 },
        { id: 'w-al-3', date: '2026-09-10', weightKg: 75.0, bmi: 23.1, notes: 'Hypertrophy target' },
      ],
      water: { date: today, cups: 7, targetCups: 8 },
      events: DEFAULT_CALENDAR_EVENTS,
      reminders: DEFAULT_REMINDERS,
      exercises: DEFAULT_EXERCISES,
    },
  ];
}

/**
 * Loads all accounts from the server-side backend database
 */
export async function getAllAccountsFromDb(): Promise<UserAccount[]> {
  if (memoryAccounts && memoryAccounts.length > 0) {
    return memoryAccounts;
  }

  const filePath = getDbFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryAccounts = parsed;
        return memoryAccounts;
      }
    }
  } catch (err) {
    console.warn('Backend DB read failed, initializing with seed:', err);
  }

  // Initialize with seed
  memoryAccounts = getInitialSeedAccounts();
  await persistAccountsToDisk(memoryAccounts);
  return memoryAccounts;
}

/**
 * Persists the current accounts to the server disk
 */
async function persistAccountsToDisk(accounts: UserAccount[]): Promise<void> {
  const filePath = getDbFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Backend DB write failed:', err);
  }
}

/**
 * Gets a user account by email
 */
export async function getAccountByEmail(email: string): Promise<UserAccount | null> {
  const accounts = await getAllAccountsFromDb();
  return accounts.find((a) => a.email.toLowerCase() === email.toLowerCase().trim()) || null;
}

/**
 * Gets a user account by ID
 */
export async function getAccountById(id: string): Promise<UserAccount | null> {
  const accounts = await getAllAccountsFromDb();
  return accounts.find((a) => a.id === id) || null;
}

/**
 * Saves or updates an account in the backend database
 */
export async function saveAccountToDb(account: UserAccount): Promise<UserAccount> {
  const accounts = await getAllAccountsFromDb();
  const existingIndex = accounts.findIndex((a) => a.id === account.id || a.email.toLowerCase() === account.email.toLowerCase());

  if (existingIndex >= 0) {
    accounts[existingIndex] = { ...accounts[existingIndex], ...account };
  } else {
    accounts.push(account);
  }

  memoryAccounts = accounts;
  await persistAccountsToDisk(accounts);
  return account;
}

/**
 * Synchronizes user activity data (meals, weight, water, profile) to the backend database
 */
export async function syncUserData(
  userId: string,
  payload: {
    profile?: UserProfile;
    meals?: MealLog[];
    weightLogs?: WeightLog[];
    water?: WaterLog;
    events?: CalendarEvent[];
    reminders?: SmartReminder[];
  }
): Promise<UserAccount | null> {
  const accounts = await getAllAccountsFromDb();
  const index = accounts.findIndex((a) => a.id === userId);
  if (index < 0) return null;

  const current = accounts[index];
  const updated: UserAccount = {
    ...current,
    profile: payload.profile ? { ...current.profile, ...payload.profile } : current.profile,
    meals: payload.meals !== undefined ? payload.meals : current.meals,
    weightLogs: payload.weightLogs !== undefined ? payload.weightLogs : current.weightLogs,
    water: payload.water !== undefined ? payload.water : current.water,
    events: payload.events !== undefined ? payload.events : current.events,
    reminders: payload.reminders !== undefined ? payload.reminders : current.reminders,
  };

  accounts[index] = updated;
  memoryAccounts = accounts;
  await persistAccountsToDisk(accounts);
  return updated;
}
