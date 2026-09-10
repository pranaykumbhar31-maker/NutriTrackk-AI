import {
  CalendarEvent,
  MealLog,
  SmartReminder,
  UserProfile,
  WaterLog,
  WeightLog,
  ExerciseRecommendation,
  MealRecommendation,
} from './types';
import { DEFAULT_CALENDAR_EVENTS } from './festivalEngine';
export { DEFAULT_CALENDAR_EVENTS };
import { VERIFIED_FOOD_DATABASE } from './foodDatabase';

const STORAGE_KEYS = {
  PROFILE: 'nutritrack_profile_v1',
  MEALS: 'nutritrack_meals_v1',
  EVENTS: 'nutritrack_events_v1',
  WEIGHT_LOGS: 'nutritrack_weight_v1',
  WATER_LOG: 'nutritrack_water_v1',
  REMINDERS: 'nutritrack_reminders_v1',
  EXERCISES: 'nutritrack_exercises_v1',
};

// Initial Profile matching reference screenshot
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-maya-01',
  name: 'Maya',
  age: 26,
  gender: 'female',
  heightCm: 165,
  weightKg: 58,
  targetWeightKg: 56,
  targetDate: '2026-11-30',
  activityLevel: 'moderate',
  goal: 'lose_fat',
  dietaryPreference: 'vegetarian',
  allergies: ['peanuts'],
  dislikedFoods: ['bitter gourd'],
  dailyCalorieTarget: 2100,
  dailyProteinTarget: 110,
  dailyCarbsTarget: 240,
  dailyFatsTarget: 60,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

// Pre-seeded meals totaling exactly 1,552 kcal and 82g protein as in the reference screenshot
export const DEFAULT_INITIAL_MEALS: MealLog[] = [
  {
    id: 'meal-bk-01',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    mealType: 'breakfast',
    items: [
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-avocado-poached-egg-plate') || VERIFIED_FOOD_DATABASE[0],
        quantity: 1,
        calculatedNutrition: {
          calories: 385,
          protein: 17.5,
          carbs: 32.0,
          fats: 21.0,
          fiber: 8.5,
          sodium: 320,
        },
      },
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-berries-mixed') || VERIFIED_FOOD_DATABASE[0],
        quantity: 1,
        calculatedNutrition: {
          calories: 45,
          protein: 0.8,
          carbs: 10.5,
          fats: 0.3,
          fiber: 2.5,
        },
      },
    ],
    totalNutrition: {
      calories: 430,
      protein: 18.3,
      carbs: 42.5,
      fats: 21.3,
      fiber: 11.0,
      sodium: 320,
    },
    photoUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    notes: 'Breakfast with artisan sourdough, poached egg and fresh berries',
    aiAnalyzed: true,
  },
  {
    id: 'meal-ln-01',
    date: new Date().toISOString().split('T')[0],
    time: '13:15',
    mealType: 'lunch',
    items: [
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-mediterranean-power-bowl') || VERIFIED_FOOD_DATABASE[0],
        quantity: 1,
        calculatedNutrition: {
          calories: 440,
          protein: 16.5,
          carbs: 58.0,
          fats: 16.0,
          fiber: 11.2,
          sodium: 340,
        },
      },
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-paneer-raw') || VERIFIED_FOOD_DATABASE[0],
        quantity: 0.7,
        calculatedNutrition: {
          calories: 185,
          protein: 12.8,
          carbs: 2.4,
          fats: 14.5,
          calcium: 336,
        },
      },
    ],
    totalNutrition: {
      calories: 625,
      protein: 29.3,
      carbs: 60.4,
      fats: 30.5,
      fiber: 12.0,
      sodium: 360,
    },
    photoUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    notes: 'Mediterranean Rainbow Bowl with grilled paneer cubes',
    aiAnalyzed: true,
  },
  {
    id: 'meal-sn-01',
    date: new Date().toISOString().split('T')[0],
    time: '16:45',
    mealType: 'snack',
    items: [
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-greek-yogurt') || VERIFIED_FOOD_DATABASE[0],
        quantity: 1.5,
        calculatedNutrition: {
          calories: 135,
          protein: 22.5,
          carbs: 9.0,
          fats: 0.0,
          calcium: 225,
        },
      },
      {
        foodItem: VERIFIED_FOOD_DATABASE.find((f) => f.id === 'f-oats-porridge') || VERIFIED_FOOD_DATABASE[0],
        quantity: 1.6,
        calculatedNutrition: {
          calories: 362,
          protein: 11.9,
          carbs: 60.1,
          fats: 6.2,
          fiber: 7.5,
        },
      },
    ],
    totalNutrition: {
      calories: 497,
      protein: 34.4,
      carbs: 69.1,
      fats: 6.2,
      fiber: 8.0,
      sodium: 90,
    },
    photoUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    notes: 'Post-workout Greek yogurt and oats crunch',
  },
];

export const DEFAULT_WEIGHT_LOGS: WeightLog[] = [
  { id: 'w-1', date: '2026-09-01', weightKg: 59.2, bmi: 22.8 },
  { id: 'w-2', date: '2026-09-04', weightKg: 58.8, bmi: 22.7 },
  { id: 'w-3', date: '2026-09-07', weightKg: 58.4, bmi: 22.5 },
  { id: 'w-4', date: '2026-09-10', weightKg: 58.0, bmi: 22.4, notes: 'Target on track' },
];

export const DEFAULT_REMINDERS: SmartReminder[] = [
  {
    id: 'rem-bk',
    type: 'breakfast',
    title: 'Nourishing Breakfast',
    time: '08:30',
    enabled: true,
    message: 'Time to log your morning fuel and balance your protein!',
  },
  {
    id: 'rem-ln',
    type: 'lunch',
    title: 'Midday Meal Log',
    time: '13:00',
    enabled: true,
    message: 'Take a mindful pause for lunch. What colorful foods are on your plate?',
  },
  {
    id: 'rem-dn',
    type: 'dinner',
    title: 'Dinner Check-In',
    time: '19:45',
    enabled: true,
    message: 'Log your dinner to close out your daily energy balance.',
  },
  {
    id: 'rem-water',
    type: 'water',
    title: 'Hydration Refresh',
    time: '11:00',
    enabled: true,
    message: 'Drink a glass of water. Aiming for 8 cups today!',
  },
  {
    id: 'rem-fest',
    type: 'festival_prep',
    title: 'Festival Preparation Reminder',
    time: '10:00',
    enabled: true,
    message: 'Ganesh Chaturthi is tomorrow! Check your pre-event balance plan.',
  },
];

export const DEFAULT_EXERCISES: ExerciseRecommendation[] = [
  {
    id: 'ex-1',
    title: 'Post-Dinner Glucose Balance Walk',
    category: 'post_meal_neat',
    durationMinutes: 25,
    caloriesBurned: 110,
    intensity: 'light',
    rationale: 'Lowers post-prandial blood sugar spikes by 25% and supports digestive comfort.',
    completed: true,
  },
  {
    id: 'ex-2',
    title: 'Full Body Functional Dumbbell Circuit',
    category: 'strength',
    durationMinutes: 35,
    caloriesBurned: 220,
    intensity: 'moderate',
    rationale: 'Stimulates muscle protein synthesis and supports metabolic lean mass.',
    completed: false,
  },
  {
    id: 'ex-3',
    title: 'Gentle Evening Yoga & Breathwork',
    category: 'mobility',
    durationMinutes: 20,
    caloriesBurned: 65,
    intensity: 'light',
    rationale: 'Lowers evening cortisol and optimizes deep regenerative sleep.',
    completed: false,
  },
];

export const RECOMMENDED_MEALS_SEED: MealRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Lemon Herb Grilled Tofu & Warm Quinoa Salad',
    mealType: 'dinner',
    calories: 380,
    protein: 24,
    carbs: 38,
    fats: 14,
    fiber: 8,
    prepTimeMinutes: 20,
    ingredients: ['Firm Tofu 150g', 'Cooked Quinoa 100g', 'Baby Spinach', 'Cherry Tomatoes', 'Extra Virgin Olive Oil', 'Lemon Juice'],
    tags: ['High Protein', 'Vegetarian', 'Gluten Free'],
    reason: 'Fits your remaining 548 kcal and delivers 24g of clean plant protein to hit your daily goal.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rec-2',
    title: 'Creamy Avocado Edamame Protein Bowl',
    mealType: 'dinner',
    calories: 420,
    protein: 26,
    carbs: 32,
    fats: 18,
    fiber: 10,
    prepTimeMinutes: 15,
    ingredients: ['Edamame beans', 'Hass Avocado', 'Cucumber ribbons', 'Roasted sesame seeds', 'Brown Rice base'],
    tags: ['Heart Healthy', 'High Fiber', 'Vegan'],
    reason: 'High in potassium and healthy fats, ideal for balancing tomorrow\'s festive occasion.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rec-3',
    title: 'Warm Spiced Dal Tadka with Steamed Brown Rice',
    mealType: 'dinner',
    calories: 340,
    protein: 16,
    carbs: 56,
    fats: 6,
    fiber: 9,
    prepTimeMinutes: 25,
    ingredients: ['Yellow lentils', 'Cumin & turmeric', 'Baby spinach', 'Brown rice', 'Ghee 1 tsp'],
    tags: ['Comfort Food', 'High Fiber', 'Ayurvedic Digest'],
    reason: 'Easily digestible and soothing before festive celebrations.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  },
];

// Helper to check if in browser
const isBrowser = typeof window !== 'undefined';

export function getStoredProfile(): UserProfile {
  if (!isBrowser) return DEFAULT_USER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      saveStoredProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  window.dispatchEvent(new Event('nutritrack_profile_updated'));
}

export function getStoredMeals(): MealLog[] {
  if (!isBrowser) return DEFAULT_INITIAL_MEALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (!raw) {
      saveStoredMeals(DEFAULT_INITIAL_MEALS);
      return DEFAULT_INITIAL_MEALS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_MEALS;
  }
}

export function saveStoredMeals(meals: MealLog[]): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  window.dispatchEvent(new Event('nutritrack_meals_updated'));
}

export function addMealLog(meal: MealLog): void {
  const current = getStoredMeals();
  const updated = [meal, ...current];
  saveStoredMeals(updated);
}

export function deleteMealLog(mealId: string): void {
  const current = getStoredMeals();
  const updated = current.filter((m) => m.id !== mealId);
  saveStoredMeals(updated);
}

export function getStoredEvents(): CalendarEvent[] {
  if (!isBrowser) return DEFAULT_CALENDAR_EVENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      saveStoredEvents(DEFAULT_CALENDAR_EVENTS);
      return DEFAULT_CALENDAR_EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CALENDAR_EVENTS;
  }
}

export function saveStoredEvents(events: CalendarEvent[]): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  window.dispatchEvent(new Event('nutritrack_events_updated'));
}

export function addCalendarEvent(event: CalendarEvent): void {
  const current = getStoredEvents();
  const updated = [...current, event];
  saveStoredEvents(updated);
}

export function updateCalendarEvent(updatedEvent: CalendarEvent): void {
  const current = getStoredEvents();
  const updated = current.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
  saveStoredEvents(updated);
}

export function getStoredWeightLogs(): WeightLog[] {
  if (!isBrowser) return DEFAULT_WEIGHT_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    if (!raw) {
      saveStoredWeightLogs(DEFAULT_WEIGHT_LOGS);
      return DEFAULT_WEIGHT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WEIGHT_LOGS;
  }
}

export function saveStoredWeightLogs(logs: WeightLog[]): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
  window.dispatchEvent(new Event('nutritrack_weight_updated'));
}

export function getStoredWater(): WaterLog {
  const today = new Date().toISOString().split('T')[0];
  if (!isBrowser) return { date: today, cups: 5, targetCups: 8 };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER_LOG);
    if (!raw) {
      const initial = { date: today, cups: 5, targetCups: 8 };
      saveStoredWater(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (parsed.date !== today) {
      const reset = { date: today, cups: 0, targetCups: 8 };
      saveStoredWater(reset);
      return reset;
    }
    return parsed;
  } catch {
    return { date: today, cups: 5, targetCups: 8 };
  }
}

export function saveStoredWater(log: WaterLog): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.WATER_LOG, JSON.stringify(log));
  window.dispatchEvent(new Event('nutritrack_water_updated'));
}

export function getStoredReminders(): SmartReminder[] {
  if (!isBrowser) return DEFAULT_REMINDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) {
      saveStoredReminders(DEFAULT_REMINDERS);
      return DEFAULT_REMINDERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export function saveStoredReminders(reminders: SmartReminder[]): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  window.dispatchEvent(new Event('nutritrack_reminders_updated'));
}

export function getStoredExercises(): ExerciseRecommendation[] {
  if (!isBrowser) return DEFAULT_EXERCISES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (!raw) {
      saveStoredExercises(DEFAULT_EXERCISES);
      return DEFAULT_EXERCISES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EXERCISES;
  }
}

export function saveStoredExercises(exercises: ExerciseRecommendation[]): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  window.dispatchEvent(new Event('nutritrack_exercises_updated'));
}
