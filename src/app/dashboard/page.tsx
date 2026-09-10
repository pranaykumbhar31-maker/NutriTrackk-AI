'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Camera,
  Plus,
  Trash2,
  Droplets,
  Calendar,
  Flame,
  Award,
  ChevronRight,
  TrendingDown,
  Info,
  HeartPulse,
} from 'lucide-react';
import EnergyGauge from '@/components/EnergyGauge';
import MacroSplitBar from '@/components/MacroSplitBar';
import ManualMealLogger from '@/components/ManualMealLogger';
import {
  getStoredProfile,
  getStoredMeals,
  deleteMealLog,
  getStoredWater,
  saveStoredWater,
  getStoredEvents,
  DEFAULT_USER_PROFILE,
  DEFAULT_INITIAL_MEALS,
  DEFAULT_CALENDAR_EVENTS,
} from '@/lib/storage';
import { aggregateDailyNutrition, calculateBMI, calculateNutritionScore } from '@/lib/nutritionEngine';
import { MealLog, MealType, NutritionalInfo, UserProfile, WaterLog, CalendarEvent } from '@/lib/types';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_USER_PROFILE);
  const [meals, setMeals] = useState<MealLog[]>(DEFAULT_INITIAL_MEALS);
  const [water, setWater] = useState<WaterLog>({ date: '', cups: 5, targetCups: 8 });
  const [upcomingEvent, setUpcomingEvent] = useState<CalendarEvent | null>(DEFAULT_CALENDAR_EVENTS[0]);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTargetMealType, setManualTargetMealType] = useState<MealType>('lunch');

  const refreshData = () => {
    setProfile(getStoredProfile());
    setMeals(getStoredMeals());
    setWater(getStoredWater());
    const evts = getStoredEvents();
    if (evts.length > 0) setUpcomingEvent(evts[0]);
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('nutritrack_meals_updated', refreshData);
    window.addEventListener('nutritrack_profile_updated', refreshData);
    window.addEventListener('nutritrack_water_updated', refreshData);
    return () => {
      window.removeEventListener('nutritrack_meals_updated', refreshData);
      window.removeEventListener('nutritrack_profile_updated', refreshData);
      window.removeEventListener('nutritrack_water_updated', refreshData);
    };
  }, []);

  const todayNutrition = aggregateDailyNutrition(meals);
  const calorieGoal = profile?.dailyCalorieTarget || 2100;
  const proteinGoal = profile?.dailyProteinTarget || 110;
  const carbsGoal = profile?.dailyCarbsTarget || 240;
  const fatsGoal = profile?.dailyFatsTarget || 60;

  const bmiInfo = calculateBMI(profile?.weightKg || 58, profile?.heightCm || 165);
  const scoreInfo = calculateNutritionScore(todayNutrition, calorieGoal, proteinGoal);

  const handleUpdateWater = (delta: number) => {
    const updated = {
      ...water,
      cups: Math.max(0, Math.min(12, water.cups + delta)),
    };
    setWater(updated);
    saveStoredWater(updated);
  };

  const openLoggerFor = (type: MealType) => {
    setManualTargetMealType(type);
    setIsManualModalOpen(true);
  };

  const mealTypes: { type: MealType; label: string; timeHint: string }[] = [
    { type: 'breakfast', label: 'Breakfast', timeHint: '08:00 - 09:30' },
    { type: 'lunch', label: 'Lunch', timeHint: '12:30 - 14:00' },
    { type: 'dinner', label: 'Dinner', timeHint: '19:00 - 21:00' },
    { type: 'snack', label: 'Snacks & Drinks', timeHint: 'Anytime' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Top Welcome Bar & Streak Banner matching Reference UI */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-teal-600">
            TODAY, 24 MAY
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-0.5">
            Good morning, {profile?.name || 'Maya'} 👋
          </h1>
        </div>

        {/* Floating Streak Pill */}
        <div className="bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-stone-200/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm">
            ✨
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-stone-900">
              {profile?.streakDays || 4} Day Meal Consistency Streak
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              You&apos;re on a roll! Keep it going
            </div>
          </div>
        </div>
      </div>

      {/* Festival Alert Banner (Core Feature 9: Festival Intelligence) */}
      {upcomingEvent && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg shrink-0">
              🎉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-amber-900">
                  Upcoming: {upcomingEvent.title} — Tomorrow
                </span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">
                  Festival Mode Active
                </span>
              </div>
              <p className="text-xs text-stone-700 mt-1 max-w-2xl leading-relaxed">
                <strong className="text-emerald-800">NutriTrack Suggests:</strong> &ldquo;Since you have a celebration tomorrow, aim for a balanced breakfast and lunch. You can enjoy festive foods while keeping your overall day balanced.&rdquo;
              </p>
            </div>
          </div>

          <Link
            href="/calendar"
            className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xs flex items-center gap-1.5 transition-all shrink-0"
          >
            <span>View Festival Prep Plan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Energy Left Ring Gauge */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              ENERGY LEFT
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Target: {calorieGoal} kcal
            </span>
          </div>

          <div className="my-3">
            <EnergyGauge
              consumed={todayNutrition.calories}
              goal={calorieGoal}
              size={155}
              strokeWidth={13}
            />
          </div>

          <div className="w-full pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Burned from Exercise</span>
            <span className="font-semibold text-stone-800">+110 kcal</span>
          </div>
        </div>

        {/* Center: Macronutrient Distribution */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Macronutrient Balance
              </span>
              <span className="text-xs font-semibold text-stone-600">
                Score: <strong className="text-emerald-600">{scoreInfo.label}</strong>
              </span>
            </div>

            <MacroSplitBar
              proteinGrams={todayNutrition.protein}
              carbsGrams={todayNutrition.carbs}
              fatsGrams={todayNutrition.fats}
            />

            {/* Individual Macro Progress Bars */}
            <div className="mt-5 space-y-3">
              {/* Protein */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-stone-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    Protein
                  </span>
                  <span className="font-bold text-stone-900">
                    {todayNutrition.protein}g / {proteinGoal}g
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (todayNutrition.protein / proteinGoal) * 100)}%` }}
                    className="h-full bg-[#3B82F6] rounded-full transition-all duration-700"
                  />
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-stone-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    Carbohydrates
                  </span>
                  <span className="font-bold text-stone-900">
                    {todayNutrition.carbs}g / {carbsGoal}g
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (todayNutrition.carbs / carbsGoal) * 100)}%` }}
                    className="h-full bg-[#F59E0B] rounded-full transition-all duration-700"
                  />
                </div>
              </div>

              {/* Fats */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-stone-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
                    Healthy Fats
                  </span>
                  <span className="font-bold text-stone-900">
                    {todayNutrition.fats}g / {fatsGoal}g
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (todayNutrition.fats / fatsGoal) * 100)}%` }}
                    className="h-full bg-[#EC4899] rounded-full transition-all duration-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Dietary Fiber</span>
            <span className="font-semibold text-stone-800">{todayNutrition.fiber || 23}g / 28g target</span>
          </div>
        </div>

        {/* Right: Quick Vitals (Water, BMI, Weight) */}
        <div className="md:col-span-3 space-y-4">
          {/* Water Intake Card */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-teal-600" />
                Water Tracker
              </span>
              <span className="text-xs font-extrabold text-stone-900">
                {water.cups}/{water.targetCups} cups
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mb-3">Target: 2.0 Liters daily</p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateWater(-1)}
                className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-700 font-bold flex items-center justify-center hover:bg-stone-50 shadow-xs"
              >
                &minus;
              </button>
              <div className="flex-1 flex gap-1 justify-center">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-4 w-2 rounded-full transition-colors ${
                      i < water.cups ? 'bg-teal-500' : 'bg-stone-200'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => handleUpdateWater(1)}
                className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center hover:bg-teal-700 shadow-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* BMI & Weight Card */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-stone-500 uppercase">BMI & Body Weight</span>
              <span className="text-xs font-bold text-emerald-600">{bmiInfo.category}</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-stone-900">{bmiInfo.bmi}</span>
              <span className="text-xs text-stone-500">BMI</span>
              <span className="mx-1 text-stone-300">•</span>
              <span className="text-lg font-bold text-stone-800">{profile?.weightKg || 58} kg</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Healthy weight range: {bmiInfo.healthyWeightRange.min} - {bmiInfo.healthyWeightRange.max} kg
            </p>
          </div>
        </div>
      </div>

      {/* Meals Logged Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900">Today&apos;s Meal Logs</h2>
            <p className="text-xs text-stone-500">Track and review what nourished your body today</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openLoggerFor('lunch')}
              className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold px-4 py-2 rounded-full text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>

            <Link
              href="/scanner"
              className="inline-flex items-center gap-1.5 bg-[#00C27A] hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-full text-xs shadow-sm transition-all hover:scale-105"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>AI Photo Scanner</span>
            </Link>
          </div>
        </div>

        {/* 4 Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mealTypes.map(({ type, label, timeHint }) => {
            const loggedForType = meals.filter((m) => m.mealType === type);
            const typeCalories = loggedForType.reduce((acc, m) => acc + (m.totalNutrition.calories || 0), 0);
            const typeProtein = Math.round(
              loggedForType.reduce((acc, m) => acc + (m.totalNutrition.protein || 0), 0) * 10
            ) / 10;

            return (
              <div
                key={type}
                className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">{label}</h3>
                      <p className="text-[11px] text-stone-400">{timeHint}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full">
                        {typeCalories} kcal • {typeProtein}g P
                      </span>
                      <button
                        onClick={() => openLoggerFor(type)}
                        title={`Add food to ${label}`}
                        className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Items */}
                  <div className="mt-3 space-y-2.5">
                    {loggedForType.length > 0 ? (
                      loggedForType.map((meal) => (
                        <div
                          key={meal.id}
                          className="p-3 rounded-2xl bg-stone-50/70 border border-stone-200/60 flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-900 truncate">
                                {meal.items.map((it) => it.foodItem.name).join(', ')}
                              </span>
                              {meal.aiAnalyzed && (
                                <span className="text-[10px] bg-teal-100/70 text-teal-800 font-semibold px-1.5 py-0.2 rounded">
                                  AI
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {meal.totalNutrition.calories} kcal • {meal.totalNutrition.protein}g Protein • {meal.totalNutrition.carbs}g Carbs
                            </p>
                          </div>

                          <button
                            onClick={() => deleteMealLog(meal.id)}
                            className="text-stone-400 hover:text-rose-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs text-stone-400">No {label.toLowerCase()} logged yet</p>
                        <button
                          onClick={() => openLoggerFor(type)}
                          className="mt-1 text-xs text-emerald-600 font-semibold hover:underline"
                        >
                          + Log {label.toLowerCase()}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Meal Modal */}
      <ManualMealLogger
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        defaultMealType={manualTargetMealType}
        onMealAdded={refreshData}
      />
    </div>
  );
}
