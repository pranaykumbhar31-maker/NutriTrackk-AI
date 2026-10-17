'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Sparkles,
  Target,
  Dumbbell,
  Utensils,
  Droplets,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  ArrowRight,
  Printer,
  RotateCcw,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Check,
  Zap,
  Heart,
  Scale,
  Activity,
  Bed,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getStoredProfile,
  getStoredRoutinePlan,
  saveStoredRoutinePlan,
} from '@/lib/storage';
import {
  generatePersonalizedRoutine,
  RoutineGeneratorInput,
} from '@/lib/routineEngine';
import { GeneratedRoutinePlan, RoutineHabitChecklistItem } from '@/lib/types';
import MacroSplitBar from '@/components/MacroSplitBar';

export default function RoutinePage() {
  const [profile, setProfile] = useState(getStoredProfile());
  const [routinePlan, setRoutinePlan] = useState<GeneratedRoutinePlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'diet' | 'workout' | 'checklist'>('diet');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isApplied, setIsApplied] = useState(false);

  // Form State
  const [formData, setFormData] = useState<RoutineGeneratorInput>({
    name: profile?.name || 'Maya',
    age: profile?.age || 26,
    gender: profile?.gender || 'female',
    currentWeightKg: profile?.weightKg || 58,
    heightCm: profile?.heightCm || 165,
    targetWeightKg: profile?.targetWeightKg || 56,
    goal: profile?.goal || 'lose_fat',
    pace: 'moderate',
    activityLevel: profile?.activityLevel || 'moderate',
    dietaryPreference: profile?.dietaryPreference || 'vegetarian',
    allergies: profile?.allergies || ['peanuts'],
    workoutLocation: 'gym',
  });

  const [newAllergyInput, setNewAllergyInput] = useState('');

  // Checklist adherence state
  const [checklist, setChecklist] = useState<RoutineHabitChecklistItem[]>([]);

  useEffect(() => {
    const prof = getStoredProfile();
    setProfile(prof);
    const existing = getStoredRoutinePlan();

    if (existing) {
      setRoutinePlan(existing);
      setChecklist(existing.dailyChecklist || []);
      setFormData({
        name: existing.userName,
        age: existing.age,
        gender: existing.gender,
        currentWeightKg: existing.currentWeightKg,
        heightCm: existing.heightCm,
        targetWeightKg: existing.targetWeightKg,
        goal: existing.goal,
        pace: existing.pace,
        activityLevel: existing.activityLevel,
        dietaryPreference: existing.dietaryPreference,
        allergies: existing.allergies,
        workoutLocation: existing.workoutLocation,
      });
    } else {
      // Generate default routine for active user on first visit
      const generated = generatePersonalizedRoutine({
        name: prof?.name || 'Maya',
        age: prof?.age || 26,
        gender: prof?.gender || 'female',
        currentWeightKg: prof?.weightKg || 58,
        heightCm: prof?.heightCm || 165,
        targetWeightKg: prof?.targetWeightKg || 56,
        goal: prof?.goal || 'lose_fat',
        pace: 'moderate',
        activityLevel: prof?.activityLevel || 'moderate',
        dietaryPreference: prof?.dietaryPreference || 'vegetarian',
        allergies: prof?.allergies || ['peanuts'],
        workoutLocation: 'gym',
      });
      setRoutinePlan(generated);
      setChecklist(generated.dailyChecklist);
      saveStoredRoutinePlan(generated);
    }
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const generated = generatePersonalizedRoutine(formData);
    setRoutinePlan(generated);
    setChecklist(generated.dailyChecklist);
    saveStoredRoutinePlan(generated);
    setIsEditing(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10B981', '#059669', '#3B82F6', '#F59E0B'],
    });
  };

  const handleApplyToProfile = () => {
    if (!routinePlan) return;
    saveStoredRoutinePlan(routinePlan);
    setIsApplied(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#10B981', '#059669', '#3B82F6'],
    });
    setTimeout(() => setIsApplied(false), 3000);
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) => {
      const updated = prev.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it));
      const allDone = updated.every((it) => it.completed);
      if (allDone) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#F59E0B', '#3B82F6'],
        });
      }
      return updated;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const addAllergy = () => {
    if (!newAllergyInput.trim()) return;
    const clean = newAllergyInput.trim().toLowerCase();
    if (!formData.allergies.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, clean],
      }));
    }
    setNewAllergyInput('');
  };

  const removeAllergy = (a: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((item) => item !== a),
    }));
  };

  const completedChecklistCount = checklist.filter((c) => c.completed).length;
  const checklistPercent = checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 print:p-0">
      {/* Top Header & Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Goal & Comprehensive Routine Generator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Personalized Goal & Daily Routine Chart
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Mifflin-St Jeor biometric calibration generates your exact daily meal timings, macro portions, and a 7-day workout routine tailored to your fitness goal.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 print:hidden">
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-200 hover:border-emerald-300 hover:bg-stone-50 text-xs sm:text-sm font-semibold text-stone-700 transition-colors"
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>{isEditing ? 'Close Customizer' : 'Customize Goals & Biometrics'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-200 hover:border-emerald-300 hover:bg-stone-50 text-xs sm:text-sm font-semibold text-stone-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleApplyToProfile}
            disabled={isApplied}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            {isApplied ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-emerald-200" />}
            <span>{isApplied ? 'Targets Applied!' : 'Apply to Dashboard'}</span>
          </button>
        </div>
      </div>

      {/* Customizable Intake Form Modal / Accordion */}
      {isEditing && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 print:hidden">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base sm:text-lg">Set Your Goals & Lifestyle Parameters</h3>
                <p className="text-xs text-stone-500">Provide accurate vitals so our AI can calculate optimal calories, macros & exercise splits.</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="text-stone-400 hover:text-stone-600 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-stone-100"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Row 1: Core Vitals */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Personal Biometrics</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Age (Years)</label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / Neutral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="220"
                    required
                    value={formData.currentWeightKg}
                    onChange={(e) => setFormData({ ...formData, currentWeightKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="230"
                    required
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Target Goals & Pace */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Target Goal & Timeline Pace</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Primary Fitness Goal</label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="lose_fat">Lose Fat & Get Lean (Calorie Deficit)</option>
                    <option value="build_muscle">Build Muscle & Strength (Calorie Surplus)</option>
                    <option value="maintain">Maintain Healthy Weight & Tone</option>
                    <option value="improve_health">Longevity, Energy & Vitality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="220"
                    required
                    value={formData.targetWeightKg}
                    onChange={(e) => setFormData({ ...formData, targetWeightKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Pace / Aggressiveness</label>
                  <select
                    value={formData.pace}
                    onChange={(e) => setFormData({ ...formData, pace: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="sustainable">Sustainable & Gradual (~0.35 kg/week)</option>
                    <option value="moderate">Moderate & Balanced (~0.55 kg/week - Recommended)</option>
                    <option value="accelerated">Accelerated Transformation (~0.85 kg/week)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Diet & Exercise Settings */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Nutrition Preference, Allergies & Workout Setting</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Dietary Style</label>
                  <select
                    value={formData.dietaryPreference}
                    onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="vegetarian">Vegetarian (Dairy & Plant Focus)</option>
                    <option value="non_veg">Non-Vegetarian / Omnivore (Chicken, Fish, Eggs)</option>
                    <option value="vegan">100% Plant-Based Vegan</option>
                    <option value="eggetarian">Eggetarian (Vegetarian + Eggs)</option>
                    <option value="keto">Low-Carb / Ketogenic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Workout Equipment Setting</label>
                  <select
                    value={formData.workoutLocation}
                    onChange={(e) => setFormData({ ...formData, workoutLocation: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="gym">Gym (Barbells, Cables & Machines)</option>
                    <option value="home_dumbbells">Home Gym (Dumbbells & Bands)</option>
                    <option value="bodyweight">No Equipment (Calisthenics & Floor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Daily Activity Level</label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="sedentary">Sedentary (Desk work, &lt; 5,000 steps)</option>
                    <option value="light">Lightly Active (1-3 days exercise)</option>
                    <option value="moderate">Moderately Active (3-5 days workout - Standard)</option>
                    <option value="very_active">Very Active (6-7 days heavy training)</option>
                  </select>
                </div>
              </div>

              {/* Allergies Chips */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Food Allergies / Disliked Foods</label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {formData.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200"
                    >
                      <span className="capitalize">{allergy}</span>
                      <button
                        type="button"
                        onClick={() => removeAllergy(allergy)}
                        className="text-stone-400 hover:text-stone-700 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={newAllergyInput}
                    onChange={(e) => setNewAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAllergy();
                      }
                    }}
                    placeholder="e.g. dairy, gluten, shellfish..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Calculate & Generate Custom Routine Chart</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {routinePlan && (
        <>
          {/* Executive Target Dashboard Header */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {routinePlan.userName}’s Action Plan
                  </h2>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {routinePlan.goal.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-stone-300 text-xs sm:text-sm max-w-xl">
                  Target: <strong>{routinePlan.targetWeightKg} kg</strong> (Current: {routinePlan.currentWeightKg} kg) • Projected Goal Date: <strong>{routinePlan.targetCompletionDate}</strong> ({routinePlan.projectedWeeksToGoal} weeks)
                </p>
              </div>

              {/* BMI Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 flex items-center gap-4">
                <div>
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">BMI Status</span>
                  <div className="text-xl font-extrabold text-white flex items-center gap-2">
                    <span>{routinePlan.bmi}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
                      {routinePlan.bmiCategory}
                    </span>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">TDEE Expenditure</span>
                  <div className="text-xl font-extrabold text-white">
                    {routinePlan.tdee} <span className="text-xs font-normal text-stone-300">kcal/day</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Macro & Nutrient Target Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-6 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center justify-between text-stone-400 text-[11px] font-bold uppercase">
                  <span>Daily Calories</span>
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-black text-white mt-1">
                  {routinePlan.dailyCalorieTarget} <span className="text-xs font-normal text-stone-300">kcal</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center justify-between text-stone-400 text-[11px] font-bold uppercase">
                  <span>Protein Target</span>
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-black text-emerald-300 mt-1">
                  {routinePlan.dailyProteinTarget} <span className="text-xs font-normal text-stone-300">g</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center justify-between text-stone-400 text-[11px] font-bold uppercase">
                  <span>Carbohydrates</span>
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-xl font-black text-teal-200 mt-1">
                  {routinePlan.dailyCarbsTarget} <span className="text-xs font-normal text-stone-300">g</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center justify-between text-stone-400 text-[11px] font-bold uppercase">
                  <span>Healthy Fats</span>
                  <Heart className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-xl font-black text-purple-200 mt-1">
                  {routinePlan.dailyFatsTarget} <span className="text-xs font-normal text-stone-300">g</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center justify-between text-stone-400 text-[11px] font-bold uppercase">
                  <span>Dietary Fiber</span>
                  <Utensils className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <div className="text-xl font-black text-white mt-1">
                  {routinePlan.dailyFiberTarget} <span className="text-xs font-normal text-stone-300">g</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="flex items-center justify-between text-stone-400 text-[11px] font-bold uppercase">
                  <span>Water Goal</span>
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-xl font-black text-sky-300 mt-1">
                  {routinePlan.dailyWaterTargetLiters} <span className="text-xs font-normal text-stone-300">L ({routinePlan.dailyWaterTargetCups} cups)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Routine Sections */}
          <div className="flex items-center gap-2 border-b border-stone-200/80 pb-px print:hidden">
            <button
              onClick={() => setActiveTab('diet')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all border-b-2 ${
                activeTab === 'diet'
                  ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>1. Daily Diet & Meal Routine</span>
            </button>

            <button
              onClick={() => setActiveTab('workout')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all border-b-2 ${
                activeTab === 'workout'
                  ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              <span>2. 7-Day Workout Routine</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all border-b-2 ${
                activeTab === 'checklist'
                  ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Daily Adherence Checklist ({checklistPercent}%)</span>
            </button>
          </div>

          {/* TAB 1: DAILY DIET & MEAL ROUTINE */}
          {(activeTab === 'diet' || typeof window === 'undefined') && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">
                      Timed Daily Meal & Diet Schedule
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                      Structured into 6 strategic intervals to maximize metabolic thermogenesis, maintain consistent energy, and hit exact macronutrient targets.
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                    Style: {routinePlan.dietaryPreference.toUpperCase()}
                  </span>
                </div>

                {/* Meals Timeline */}
                <div className="space-y-4">
                  {routinePlan.meals.map((meal, idx) => (
                    <div
                      key={meal.id}
                      className="p-5 rounded-2xl bg-stone-50/70 hover:bg-emerald-50/30 border border-stone-200/70 hover:border-emerald-300 transition-all group"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-800 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{meal.timeOfDay}</span>
                          </span>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                              {meal.mealSlot}
                            </span>
                            <h4 className="font-bold text-stone-900 text-base">{meal.title}</h4>
                          </div>
                        </div>

                        {/* Macro pills */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60">
                            {meal.calories} kcal
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            {meal.protein}g protein
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/60">
                            {meal.carbs}g carbs
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200/60">
                            {meal.fats}g fats
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-stone-700 leading-relaxed mb-3">
                        {meal.description} <strong className="text-stone-900 font-semibold">({meal.portion})</strong>
                      </p>

                      <div className="bg-white rounded-xl p-3 border border-stone-200/60 text-xs space-y-1.5">
                        <div className="flex items-start gap-1.5 text-stone-600">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong className="text-stone-800">Clinical Benefit:</strong> {meal.benefits}</span>
                        </div>

                        {meal.alternatives.length > 0 && (
                          <div className="flex items-start gap-1.5 text-stone-500">
                            <RotateCcw className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span><strong className="text-stone-700">Smart Swaps:</strong> {meal.alternatives.join(' • ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hydration & Guidelines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hydration Protocol */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Droplets className="w-5 h-5 text-sky-500" />
                    <h4 className="font-bold text-stone-900 text-base">Daily Hydration Protocol ({routinePlan.dailyWaterTargetLiters} Liters)</h4>
                  </div>
                  <div className="space-y-3">
                    {routinePlan.hydrationGuidelines.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs">
                        <span className="font-bold text-sky-900 shrink-0">{h.amount}</span>
                        <div>
                          <span className="font-bold text-sky-800 block">{h.time}</span>
                          <span className="text-stone-600">{h.purpose}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Diet Rules */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-stone-900 text-base">Key Nutritional Principles</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {routinePlan.dietaryGuidelines.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 7-DAY WORKOUT ROUTINE */}
          {activeTab === 'workout' && (
            <div className="space-y-6">
              {/* Day Selector Buttons */}
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                {routinePlan.weeklySplit.map((day) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDayNumber(day.dayNumber)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                      selectedDayNumber === day.dayNumber
                        ? 'bg-stone-900 text-white shadow-md'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                    }`}
                  >
                    <span>{day.dayName}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        day.category === 'rest'
                          ? 'bg-stone-400'
                          : day.category === 'recovery'
                          ? 'bg-sky-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Day Routine Card */}
              {(() => {
                const dayRoutine =
                  routinePlan.weeklySplit.find((d) => d.dayNumber === selectedDayNumber) ||
                  routinePlan.weeklySplit[0];

                return (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                            {dayRoutine.dayName} Split
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                            {dayRoutine.category.toUpperCase()} • {dayRoutine.intensity} Intensity
                          </span>
                        </div>
                        <h3 className="text-2xl font-extrabold text-stone-900 mt-1">
                          {dayRoutine.focusTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>{dayRoutine.durationMinutes} Minutes</span>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60">
                          <Flame className="w-4 h-4 text-amber-600" />
                          <span>~{dayRoutine.estimatedBurnKcal} kcal Burn</span>
                        </div>
                      </div>
                    </div>

                    {/* Warm-up */}
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Dynamic Warm-up & Joint Mobility (5 Minutes)</span>
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        {dayRoutine.warmup.map((w, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 text-xs text-stone-700 bg-white px-3 py-1 rounded-xl border border-stone-200/70"
                          >
                            <span>✓</span>
                            <span>{w}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Exercises Table */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                        Main Exercise Progression
                      </h4>
                      <div className="space-y-3">
                        {dayRoutine.exercises.map((ex, i) => (
                          <div
                            key={ex.id || i}
                            className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-emerald-300 transition-all space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-lg bg-stone-900 text-white font-extrabold text-xs flex items-center justify-center">
                                  {i + 1}
                                </span>
                                <h5 className="font-bold text-stone-900 text-sm sm:text-base">
                                  {ex.name}
                                </h5>
                              </div>

                              <div className="flex items-center gap-3 text-xs font-bold">
                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                                  {ex.sets} Sets × {ex.repsOrDuration}
                                </span>
                                {ex.restSeconds > 0 && (
                                  <span className="text-stone-500 font-medium">
                                    Rest: {ex.restSeconds}s
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-1 border-t border-stone-200/50">
                              <span>
                                <strong className="text-stone-700">Target:</strong> {ex.targetMuscles}
                              </span>
                              <span className="text-emerald-700 font-medium">
                                💡 <em>{ex.proFormTip}</em>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cooldown */}
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                        Post-Workout Cool-down & Parasympathetic Recovery
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        {dayRoutine.cooldown.map((c, i) => (
                          <span
                            key={i}
                            className="text-xs text-stone-600 bg-white px-3 py-1 rounded-xl border border-stone-200/60"
                          >
                            • {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: DAILY ADHERENCE CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">
                    Today’s Routine Adherence Tracker
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    Small daily habits compound into massive physical transformations. Check off items as you complete them throughout your day.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-stone-400 block font-medium">Progress</span>
                    <span className="text-lg font-black text-emerald-600">
                      {completedChecklistCount} / {checklist.length} Done ({checklistPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all group ${
                      item.completed
                        ? 'bg-emerald-50/60 border-emerald-300 text-stone-900'
                        : 'bg-stone-50 border-stone-200/70 hover:border-emerald-200 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          item.completed
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-stone-300 group-hover:border-emerald-400 bg-white'
                        }`}
                      >
                        {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>

                      <div>
                        <span
                          className={`text-sm font-semibold block ${
                            item.completed ? 'line-through text-stone-500' : 'text-stone-900'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium">
                          Scheduled: {item.timeHint}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400 group-hover:text-emerald-700">
                      {item.completed ? 'Completed' : 'Pending'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
