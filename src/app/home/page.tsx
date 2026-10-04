'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Calendar, Sparkles, Utensils, HeartPulse, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import HeroPreviewCard from '@/components/HeroPreviewCard';

export default function HomeOverviewPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="pt-6 sm:pt-12 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Top Pill Badge */}
        <div className="mb-6 flex items-center justify-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI NUTRITION, MADE HUMAN</span>
          </div>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.08] mb-6">
              Your Food.<br />
              <span className="text-[#00C27A]">Your Goals.</span><br />
              Your AI Nutrition<br />
              Coach.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-lg mb-8">
              Track what you eat, understand your nutrition, and get personalized recommendations powered by AI — so small choices add up to a healthier you.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-8">
              <Link
                href="/scanner"
                className="bg-[#00C27A] hover:bg-emerald-600 text-white font-medium px-6 py-3.5 rounded-full shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Analyze my meal</span>
                <span className="text-lg leading-none">↻</span>
              </Link>

              <Link
                href="/dashboard"
                className="bg-white hover:bg-stone-50 text-stone-900 border border-stone-200/90 font-medium px-6 py-3.5 rounded-full shadow-sm flex items-center gap-2 transition-all hover:border-stone-300"
              >
                <span>Explore dashboard</span>
                <span className="text-stone-400">→</span>
              </Link>
            </div>

            {/* Value Props Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold tracking-wider text-stone-500 uppercase mb-5">
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="text-[#00C27A]">✦</span> AI-POWERED
              </span>
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="text-[#00C27A]">✦</span> PERSONALIZED
              </span>
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="text-[#00C27A]">✦</span> GOAL-FOCUSED
              </span>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-2.5 text-xs text-stone-500">
              <div className="flex -space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-800">
                  A
                </div>
                <div className="w-6 h-6 rounded-full bg-teal-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-teal-800">
                  R
                </div>
                <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-amber-800">
                  M
                </div>
              </div>
              <p>
                <strong className="text-stone-800 font-semibold">12,000+ curious eaters</strong> building better habits
              </p>
            </div>
          </div>

          {/* Right Hero Dashboard Preview Card */}
          <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
            <HeroPreviewCard />
          </div>
        </div>
      </section>

      {/* Feature Spotlight: The Smart Nutrition Calendar & Festival Mode */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-transparent via-emerald-50/40 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wider uppercase mb-3">
              <span>🌟 Unique Differentiator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-4">
              Smart Festival & Event Intelligence
            </h2>
            <p className="text-stone-600 leading-relaxed text-base">
              Life doesn&apos;t happen in a sterile lab. NutriTrack AI connects everyday nutrition tracking with real-world celebrations, festivals, weddings, and vacations without guilt or extreme restriction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phase 1: Before Event */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                Before Event: Smart Preparation
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                Plan ahead with balanced earlier-day meals rich in protein and fiber. Get smart festive swaps and hydration guidance so you feel grounded.
              </p>
              <ul className="text-xs text-stone-500 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Stabilize blood sugar before celebrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Healthier festive ingredient alternatives</span>
                </li>
              </ul>
            </div>

            {/* Phase 2: During Event */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                During Event: Mindful Enjoyment
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                Quick 1-tap or photo logging. View approximate impact with zero guilt. Savor traditional treats while maintaining mindful presence.
              </p>
              <ul className="text-xs text-stone-500 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant food camera recognition</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Non-judgmental, guilt-free tracking</span>
                </li>
              </ul>
            </div>

            {/* Phase 3: After Event */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-extrabold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                After Event: Scientific Balance
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                Return to your normal routine. No starvation, no extreme restrictions. Get practical next-day meals, hydration, and gentle activity.
              </p>
              <ul className="text-xs text-stone-500 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Potassium-rich balancing meals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Detailed Event Impact Insights report</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-full transition-colors"
            >
              <span>Explore the Smart Nutrition Calendar & Festival Mode</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Comprehensive Platform Features Grid */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-3">
            Intelligent Features Built for Real Lives
          </h2>
          <p className="text-stone-600 text-sm">
            Everything you need to sustain vibrant nutrition, manage weight, and reach your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/scanner"
            className="group p-5 rounded-3xl bg-white border border-stone-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-1">AI Food Scanner</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Snap or upload meals. Instant identification with calories, macros, and micronutrients.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Try scanner →
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="group p-5 rounded-3xl bg-white border border-stone-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-1">Daily Dashboard</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Energy Left ring gauge, BMI tracking, water intake, and comprehensive meal logging.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-600 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View dashboard →
            </span>
          </Link>

          <Link
            href="/recommendations"
            className="group p-5 rounded-3xl bg-white border border-stone-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-1">Personalized Recommender</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Smart meals tailored to your remaining macros and personalized workouts for your goals.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-600 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              See suggestions →
            </span>
          </Link>

          <Link
            href="/analytics"
            className="group p-5 rounded-3xl bg-white border border-stone-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-1">Habit & Progress Insights</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Weight trajectory charts, calorie consistency streaks, and festival recovery analysis.
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-600 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Check progress →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
