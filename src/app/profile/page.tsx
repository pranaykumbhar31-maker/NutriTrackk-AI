'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Settings,
  Sparkles,
  Save,
  Check,
  HeartPulse,
  Scale,
  Target,
  Database,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getStoredProfile, saveStoredProfile } from '@/lib/storage';
import { calculateTargets, calculateBMI } from '@/lib/nutritionEngine';
import { UserProfile } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  if (!profile) return null;

  const targets = calculateTargets(profile);
  const bmiInfo = calculateBMI(profile.weightKg, profile.heightCm);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-update calorie targets using Mifflin-St Jeor equation
    const calculated = calculateTargets(profile);
    const updated: UserProfile = {
      ...profile,
      dailyCalorieTarget: calculated.calorieTarget,
      dailyProteinTarget: calculated.proteinTarget,
      dailyCarbsTarget: calculated.carbsTarget,
      dailyFatsTarget: calculated.fatsTarget,
    };

    saveStoredProfile(updated);
    setProfile(updated);
    setIsSaved(true);

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#10B981', '#059669', '#3B82F6'],
    });

    setTimeout(() => setIsSaved(false), 2500);
  };

  const addAllergy = () => {
    if (!newAllergy.trim()) return;
    if (!profile.allergies.includes(newAllergy.toLowerCase().trim())) {
      setProfile({
        ...profile,
        allergies: [...profile.allergies, newAllergy.toLowerCase().trim()],
      });
    }
    setNewAllergy('');
  };

  const removeAllergy = (item: string) => {
    setProfile({
      ...profile,
      allergies: profile.allergies.filter((a) => a !== item),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Settings className="w-3.5 h-3.5 text-emerald-600" />
            <span>Feature 14: User Profile & Clinical Personalization</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Personal Profile & Targets
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            NutriTrack AI calibrates your daily energy target, macronutrient distribution, and meal recommendations using the clinical Mifflin-St Jeor formula.
          </p>
        </div>

        <Link
          href="/routine"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all hover:scale-105"
        >
          <ClipboardList className="w-4 h-4 text-emerald-400" />
          <span>View Custom Routine Chart</span>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Vitals Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <User className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-stone-900 text-lg">Biometrics & Body Stats</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Age (Years)</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Biological Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'female' | 'male' | 'other' })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 capitalize font-semibold"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Height (cm)</label>
              <input
                type="number"
                value={profile.heightCm}
                onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={profile.weightKg}
                onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={profile.targetWeightKg}
                onChange={(e) => setProfile({ ...profile, targetWeightKg: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Goals & Activity Level */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Target className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-stone-900 text-lg">Goal & Lifestyle Activity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Primary Fitness Goal</label>
              <select
                value={profile.goal}
                onChange={(e) => setProfile({ ...profile, goal: e.target.value as any })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 capitalize font-semibold"
              >
                <option value="lose_fat">Sustainable Fat Loss & Tone</option>
                <option value="build_muscle">Lean Muscle Hypertrophy</option>
                <option value="maintain">Weight Maintenance & Vitality</option>
                <option value="improve_health">Longevity & Balanced Health</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Daily Activity Level</label>
              <select
                value={profile.activityLevel}
                onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as any })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 capitalize font-semibold"
              >
                <option value="sedentary">Sedentary (Desk job, light steps)</option>
                <option value="light">Light Activity (1-3 workouts/week)</option>
                <option value="moderate">Moderate Activity (3-5 workouts/week)</option>
                <option value="very_active">Very Active (6-7 intense sessions/week)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dietary Preferences & Allergies */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <h2 className="font-extrabold text-stone-900 text-lg">Dietary Preferences & Allergies</h2>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Eating Pattern</label>
            <select
              value={profile.dietaryPreference}
              onChange={(e) => setProfile({ ...profile, dietaryPreference: e.target.value as any })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 capitalize font-semibold"
            >
              <option value="all">Omnivore (No Restrictions)</option>
              <option value="vegetarian">Vegetarian (Plant + Dairy)</option>
              <option value="vegan">Vegan (Strict Plant-Based)</option>
              <option value="eggetarian">Eggetarian</option>
              <option value="keto">Ketogenic / Low-Carb</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Allergies & Intolerances
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {profile.allergies.map((allergy) => (
                <span
                  key={allergy}
                  className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                >
                  <span className="capitalize">{allergy}</span>
                  <button
                    type="button"
                    onClick={() => removeAllergy(allergy)}
                    className="hover:text-rose-950 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add allergy (e.g. peanuts, gluten, shellfish, dairy)..."
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addAllergy}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Calculated Targets Overview */}
        <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Mifflin-St Jeor Clinical Calibration
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              BMI: {bmiInfo.bmi} ({bmiInfo.category})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="text-[10px] text-stone-500 font-semibold uppercase">BMR</div>
              <div className="text-base font-extrabold text-stone-900">{targets.bmr} kcal</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="text-[10px] text-stone-500 font-semibold uppercase">Daily Calorie Target</div>
              <div className="text-base font-extrabold text-emerald-700">{targets.calorieTarget} kcal</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="text-[10px] text-stone-500 font-semibold uppercase">Protein Target</div>
              <div className="text-base font-extrabold text-[#3B82F6]">{targets.proteinTarget}g</div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="text-[10px] text-stone-500 font-semibold uppercase">Carbs / Fats</div>
              <div className="text-base font-extrabold text-stone-800">
                {targets.carbsTarget}g / {targets.fatsTarget}g
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Cloud Architecture Status */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-stone-500" />
            <span className="font-semibold text-stone-700">Supabase Cloud Sync:</span>
            <span className="text-stone-500">
              {isSupabaseConfigured ? 'Connected to PostgreSQL' : 'Resilient Local Reactive Mode Active'}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="bg-[#00C27A] hover:bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-full shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved & Recalibrated!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Recalibrate Targets</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
