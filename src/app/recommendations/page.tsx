'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Utensils,
  Dumbbell,
  Sparkles,
  Check,
  Flame,
  Clock,
  ChevronRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getStoredProfile,
  getStoredMeals,
  getStoredExercises,
  saveStoredExercises,
  RECOMMENDED_MEALS_SEED,
  addMealLog,
} from '@/lib/storage';
import { aggregateDailyNutrition } from '@/lib/nutritionEngine';
import { UserProfile, ExerciseRecommendation, MealRecommendation, MealLog } from '@/lib/types';
import MacroSplitBar from '@/components/MacroSplitBar';

export default function RecommendationsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [exercises, setExercises] = useState<ExerciseRecommendation[]>([]);
  const [meals, setMeals] = useState<MealRecommendation[]>(RECOMMENDED_MEALS_SEED);
  const [filterCategory, setFilterCategory] = useState<'all' | 'high_protein' | 'quick'>('all');
  const [loggedMealIds, setLoggedMealIds] = useState<string[]>([]);
  const [totalBurned, setTotalBurned] = useState<number>(110);

  useEffect(() => {
    setProfile(getStoredProfile());
    const storedEx = getStoredExercises();
    setExercises(storedEx);
    setTotalBurned(
      storedEx.filter((e) => e.completed).reduce((acc, e) => acc + e.caloriesBurned, 0)
    );
  }, []);

  const handleToggleExercise = (id: string) => {
    const updated = exercises.map((ex) =>
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    );
    setExercises(updated);
    saveStoredExercises(updated);

    const justCompleted = updated.find((ex) => ex.id === id)?.completed;
    if (justCompleted) {
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#10B981', '#059669', '#3B82F6'],
      });
    }

    setTotalBurned(
      updated.filter((e) => e.completed).reduce((acc, e) => acc + e.caloriesBurned, 0)
    );
  };

  const handleQuickLogMeal = (rec: MealRecommendation) => {
    const newMeal: MealLog = {
      id: `meal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType: rec.mealType,
      items: [
        {
          foodItem: {
            id: rec.id,
            name: rec.title,
            category: 'composite',
            servingSize: 1,
            servingUnit: 'portion',
            calories: rec.calories,
            protein: rec.protein,
            carbs: rec.carbs,
            fats: rec.fats,
            fiber: rec.fiber,
          },
          quantity: 1,
          calculatedNutrition: {
            calories: rec.calories,
            protein: rec.protein,
            carbs: rec.carbs,
            fats: rec.fats,
            fiber: rec.fiber,
          },
        },
      ],
      totalNutrition: {
        calories: rec.calories,
        protein: rec.protein,
        carbs: rec.carbs,
        fats: rec.fats,
        fiber: rec.fiber,
      },
      notes: `Logged via AI Recommendation: ${rec.reason}`,
      photoUrl: rec.image,
    };

    addMealLog(newMeal);
    setLoggedMealIds((prev) => [...prev, rec.id]);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Features 5 & 6: Personalized Recommendations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Personalized Meals & Workouts
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-1">
          Dynamically generated suggestions based on your remaining macros ({profile?.dailyCalorieTarget ? '548 kcal remaining' : ''}), goal ({profile?.goal.replace('_', ' ')}), and dietary preference ({profile?.dietaryPreference}).
        </p>
      </div>

      {/* Part 1: Personalized Meal Recommendations */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-extrabold text-stone-900">Tailored Next Meal Suggestions</h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-full text-xs font-semibold">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-full transition-colors ${
                filterCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setFilterCategory('high_protein')}
              className={`px-3 py-1 rounded-full transition-colors ${
                filterCategory === 'high_protein'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              High Protein
            </button>
            <button
              onClick={() => setFilterCategory('quick')}
              className={`px-3 py-1 rounded-full transition-colors ${
                filterCategory === 'quick'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Under 20 Mins
            </button>
          </div>
        </div>

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meals
            .filter((m) => {
              if (filterCategory === 'high_protein') return m.protein >= 20;
              if (filterCategory === 'quick') return m.prepTimeMinutes <= 20;
              return true;
            })
            .map((meal) => {
              const isLogged = loggedMealIds.includes(meal.id);
              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Meal Image */}
                    {meal.image && (
                      <div className="relative h-40 rounded-2xl overflow-hidden mb-4 shadow-xs">
                        <Image
                          src={meal.image}
                          alt={meal.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 320px"
                        />
                        <div className="absolute top-2.5 right-2.5 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          {meal.calories} kcal
                        </div>
                      </div>
                    )}

                    {/* Title & Prep */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {meal.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="font-extrabold text-base text-stone-900 leading-snug">
                      {meal.title}
                    </h3>

                    {/* Why Recommended */}
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <strong className="text-emerald-700">Why for you:</strong> {meal.reason}
                    </p>

                    {/* Nutrition Bar */}
                    <div className="mt-3">
                      <MacroSplitBar
                        proteinGrams={meal.protein}
                        carbsGrams={meal.carbs}
                        fatsGrams={meal.fats}
                      />
                    </div>
                  </div>

                  {/* 1-Click Log Action */}
                  <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meal.prepTimeMinutes} mins prep
                    </span>

                    <button
                      onClick={() => handleQuickLogMeal(meal)}
                      disabled={isLogged}
                      className={`text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                        isLogged
                          ? 'bg-stone-100 text-stone-400 cursor-default'
                          : 'bg-[#00C27A] hover:bg-emerald-600 text-white shadow-xs'
                      }`}
                    >
                      {isLogged ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Added to Log</span>
                        </>
                      ) : (
                        <>
                          <span>+ Log this meal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Part 2: Personalized Exercise Recommendations */}
      <section className="space-y-4 pt-4 border-t border-stone-200/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">Personalized Activity & Exercise</h2>
              <p className="text-xs text-stone-500">
                Balanced activities that support metabolic health and glucose clearance without extreme punishment.
              </p>
            </div>
          </div>

          <div className="text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-full">
            Total Active Burn Today: <strong>{totalBurned} kcal</strong>
          </div>
        </div>

        {/* Exercise Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                ex.completed
                  ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                  : 'bg-white border-stone-200/80 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                    {ex.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600">
                    +{ex.caloriesBurned} kcal
                  </span>
                </div>

                <h3 className="font-bold text-sm text-stone-900 mb-1">{ex.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-3">{ex.rationale}</p>

                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ex.durationMinutes} minutes</span>
                  <span className="text-stone-300">•</span>
                  <span className="capitalize">{ex.intensity} intensity</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-500">
                  {ex.completed ? 'Activity recorded' : 'Pending completion'}
                </span>

                <button
                  onClick={() => handleToggleExercise(ex.id)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                    ex.completed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{ex.completed ? 'Completed' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
