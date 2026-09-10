'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Bot, ChevronRight, Droplets, Dumbbell, ShieldCheck } from 'lucide-react';
import EnergyGauge from './EnergyGauge';
import MacroSplitBar from './MacroSplitBar';
import { getStoredProfile, getStoredMeals, getStoredWater, getStoredEvents } from '@/lib/storage';
import { aggregateDailyNutrition, calculateBMI } from '@/lib/nutritionEngine';
import { UserProfile, NutritionalInfo, WaterLog, CalendarEvent } from '@/lib/types';

export default function HeroPreviewCard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayNutrition, setTodayNutrition] = useState<NutritionalInfo>({
    calories: 1552,
    protein: 82,
    carbs: 172,
    fats: 58,
  });
  const [water, setWater] = useState<WaterLog>({ date: '', cups: 5, targetCups: 8 });
  const [upcomingEvent, setUpcomingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const prof = getStoredProfile();
    setProfile(prof);
    const meals = getStoredMeals();
    const aggregated = aggregateDailyNutrition(meals);
    if (aggregated.calories > 0) {
      setTodayNutrition(aggregated);
    }
    setWater(getStoredWater());
    const evts = getStoredEvents();
    if (evts.length > 0) {
      setUpcomingEvent(evts[0]);
    }
  }, []);

  const calorieGoal = profile?.dailyCalorieTarget || 2100;
  const bmiData = calculateBMI(profile?.weightKg || 58, profile?.heightCm || 165);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Floating Streak Pill (Top Right, matching reference image) */}
      <div className="absolute -top-4 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2.5 shadow-xl border border-stone-100 flex items-center gap-3 z-20 transition-all hover:scale-105">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">
          🤖
        </div>
        <div className="text-left">
          <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
            NUTRITRACK AI
          </div>
          <div className="text-xs font-bold text-stone-900 flex items-center gap-1">
            <span>You&apos;re on a roll</span>
            <span>✨</span>
          </div>
          <div className="text-[11px] text-stone-500">
            {profile?.streakDays || 4} day meal consistency streak
          </div>
        </div>
      </div>

      {/* Main Dashboard Preview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-100 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/50 rounded-full blur-3xl -z-0 pointer-events-none" />

        {/* Header inside card */}
        <div className="mb-5 relative z-10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
            TODAY, 24 MAY
          </div>
          <h2 className="text-2xl sm:text-[26px] font-extrabold text-stone-900 tracking-tight mt-0.5">
            Good morning, {profile?.name || 'Maya'} 👋
          </h2>
        </div>

        {/* 2-Column Layout: Energy Left Gauge & Meal Photo with Macros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center mb-6 relative z-10 bg-stone-50/60 p-4 rounded-2xl border border-stone-100">
          {/* Left Column: Energy Left */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700 mb-2 self-start">
              ENERGY LEFT
            </div>
            <EnergyGauge
              consumed={todayNutrition.calories}
              goal={calorieGoal}
              size={135}
              strokeWidth={11}
            />
          </div>

          {/* Right Column: Food Image & Segmented Macro Bar */}
          <div className="flex flex-col gap-2.5">
            <div className="relative h-28 sm:h-28 rounded-xl overflow-hidden shadow-sm border border-stone-200/80 group">
              <Image
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80"
                alt="Nutritious rainbow bowl"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, 220px"
              />
              <div className="absolute bottom-1.5 left-2 bg-stone-900/75 backdrop-blur-sm text-[10px] text-white font-medium px-2 py-0.5 rounded-md">
                Lunch • Mediterranean Bowl
              </div>
            </div>

            {/* Macro Bar (Protein Blue, Carbs Amber, Fats Pink) */}
            <MacroSplitBar
              proteinGrams={todayNutrition.protein}
              carbsGrams={todayNutrition.carbs}
              fatsGrams={todayNutrition.fats}
            />
          </div>
        </div>

        {/* Bottom 3 Stat Badges (Protein, Water, BMI) */}
        <div className="grid grid-cols-3 gap-3 relative z-10 mb-5">
          {/* Protein Card */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-3 text-left">
            <div className="text-[11px] font-semibold text-stone-500">Protein</div>
            <div className="text-xl font-extrabold text-stone-900 mt-0.5">
              {todayNutrition.protein}g
            </div>
          </div>

          {/* Water Card */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-3 text-left">
            <div className="text-[11px] font-semibold text-stone-500">Water</div>
            <div className="text-xl font-extrabold text-stone-900 mt-0.5">
              {water.cups}/{water.targetCups} cups
            </div>
          </div>

          {/* BMI Card */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-3 text-left">
            <div className="text-[11px] font-semibold text-stone-500">BMI</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {bmiData.bmi}
            </div>
          </div>
        </div>

        {/* Festival & Event Intelligence Banner */}
        {upcomingEvent && (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 relative z-10 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-1">
              <span className="flex items-center gap-1.5">
                <span>🎉 Upcoming:</span>
                <span>{upcomingEvent.title} — Tomorrow</span>
              </span>
              <Link
                href="/calendar"
                className="text-teal-700 hover:text-teal-800 text-[11px] font-semibold underline flex items-center"
              >
                View Prep Plan →
              </Link>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              <strong className="text-emerald-700">NutriTrack Suggests:</strong> &ldquo;Since you have a celebration tomorrow, aim for a balanced breakfast and lunch. You can enjoy festive foods while keeping your overall day balanced.&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
