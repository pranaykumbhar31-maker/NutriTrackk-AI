'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  Target,
  Scale,
  ShieldCheck,
  ChevronRight,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getAllAccounts,
  loginUser,
  registerNewUser,
  setActiveAccount,
  getActiveAccountId,
} from '@/lib/storage';
import { calculateTargets } from '@/lib/nutritionEngine';
import { UserProfile, UserAccount } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('maya@nutritrack.ai');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Sign up form state (Step 1: Credentials, Step 2: Biometrics)
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Biometrics & Goals
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [heightCm, setHeightCm] = useState<number>(168);
  const [weightKg, setWeightKg] = useState<number>(62);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(58);
  const [goal, setGoal] = useState<'lose_fat' | 'build_muscle' | 'maintain' | 'improve_health'>('lose_fat');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very_active'>('moderate');
  const [dietaryPreference, setDietaryPreference] = useState<'all' | 'vegetarian' | 'vegan' | 'eggetarian' | 'keto'>('all');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [newAllergyInput, setNewAllergyInput] = useState('');

  // Status & error alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingAccounts = getAllAccounts();
  const currentActiveId = getActiveAccountId();

  // Quick switch between pre-seeded demo profiles
  const handleQuickSwitch = (accId: string) => {
    setActiveAccount(accId);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#10B981', '#059669', '#3B82F6'],
    });
    router.push('/dashboard');
  };

  // Handle standard login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = loginUser(loginEmail, loginPassword);
    if (!result.success) {
      setErrorMsg(result.error || 'Login failed. Please check your credentials.');
      setIsSubmitting(false);
      return;
    }

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  // Handle new user registration
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (signupStep === 1) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Please complete all account fields.');
        return;
      }
      setSignupStep(2);
      return;
    }

    // Step 2 submit: Calibrate targets and save new individual profile
    setIsSubmitting(true);
    const mockProfile: UserProfile = {
      id: 'temp',
      name,
      age,
      gender,
      heightCm,
      weightKg,
      targetWeightKg,
      targetDate: '2026-12-31',
      activityLevel,
      goal,
      dietaryPreference,
      allergies: selectedAllergies,
      dislikedFoods: [],
      dailyCalorieTarget: 2000,
      dailyProteinTarget: 100,
      dailyCarbsTarget: 220,
      dailyFatsTarget: 55,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    const calculated = calculateTargets(mockProfile);
    const result = registerNewUser(email, name, password, {
      ...mockProfile,
      dailyCalorieTarget: calculated.calorieTarget,
      dailyProteinTarget: calculated.proteinTarget,
      dailyCarbsTarget: calculated.carbsTarget,
      dailyFatsTarget: calculated.fatsTarget,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Registration failed.');
      setIsSubmitting(false);
      return;
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  const toggleAllergy = (al: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(al) ? prev.filter((a) => a !== al) : [...prev, al]
    );
  };

  const addCustomAllergy = () => {
    if (!newAllergyInput.trim()) return;
    if (!selectedAllergies.includes(newAllergyInput.toLowerCase().trim())) {
      setSelectedAllergies([...selectedAllergies, newAllergyInput.toLowerCase().trim()]);
    }
    setNewAllergyInput('');
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Individual Nutrition Profiles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          {mode === 'login' ? 'Welcome Back to NutriTrack' : 'Create Your Personal Profile'}
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm mt-1.5 max-w-md mx-auto">
          {mode === 'login'
            ? 'Sign in to access your personal meal logs, calorie targets, and festival balance plans.'
            : 'Build your custom nutrition account with clinically calibrated Mifflin-St Jeor targets.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/90 relative">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-2xl mb-6">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setSignupStep(1);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Create New Profile
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* --- MODE 1: LOG IN --- */}
        {mode === 'login' && (
          <div className="space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-[#00C27A] hover:bg-emerald-600 text-white font-semibold py-3 rounded-full text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Profile Switcher (Preserving All Data) */}
            <div className="pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Saved Profiles on Device ({existingAccounts.length})</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">1-Click Switch</span>
              </div>

              <div className="space-y-2">
                {existingAccounts.map((acc) => {
                  const isActive = acc.id === currentActiveId;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => handleQuickSwitch(acc.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                          : 'bg-stone-50/60 border-stone-200/70 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {acc.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                            <span>{acc.name}</span>
                            {isActive && (
                              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {acc.email} • {acc.profile.dailyCalorieTarget} kcal • {acc.profile.goal.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- MODE 2: SIGN UP (INDIVIDUAL PROFILE CREATION) --- */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-5">
            {/* Progress Stepper */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
              <span className={`font-bold ${signupStep === 1 ? 'text-emerald-700' : 'text-stone-400'}`}>
                1. Account Credentials
              </span>
              <span className="text-stone-300">→</span>
              <span className={`font-bold ${signupStep === 2 ? 'text-emerald-700' : 'text-stone-400'}`}>
                2. Personal Biometrics & Goal
              </span>
            </div>

            {/* STEP 1: Basic Credentials */}
            {signupStep === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya, Rohan, Priya..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Create Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 rounded-full text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <span>Next: Personalize My Nutrition Stats</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Biometrics, Lifestyle & Calibration */}
            {signupStep === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Age</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Biological Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500 font-semibold capitalize"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      required
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Goal Wt (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={targetWeightKg}
                      onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Primary Health Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500 font-semibold capitalize"
                  >
                    <option value="lose_fat">Sustainable Fat Loss & Tone</option>
                    <option value="build_muscle">Lean Muscle Hypertrophy</option>
                    <option value="maintain">Weight Maintenance & Vitality</option>
                    <option value="improve_health">General Longevity & Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Dietary Preference</label>
                  <select
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500 font-semibold capitalize"
                  >
                    <option value="all">Omnivore (No dietary restrictions)</option>
                    <option value="vegetarian">Vegetarian (Plant + Dairy)</option>
                    <option value="vegan">Vegan (Strict Plant-Based)</option>
                    <option value="eggetarian">Eggetarian</option>
                    <option value="keto">Ketogenic / Low-Carb</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Allergies (Tap to toggle)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['peanuts', 'dairy', 'gluten', 'shellfish', 'soy', 'eggs'].map((al) => {
                      const isSelected = selectedAllergies.includes(al);
                      return (
                        <button
                          key={al}
                          type="button"
                          onClick={() => toggleAllergy(al)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors capitalize ${
                            isSelected
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {al}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-xs font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#00C27A] hover:bg-emerald-600 text-white font-semibold py-3 rounded-full text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <span>Finish & Build My Nutrition Plan</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
