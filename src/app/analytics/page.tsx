'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingDown,
  Sparkles,
  Calendar,
  Award,
  Flame,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  getStoredProfile,
  getStoredMeals,
  getStoredWeightLogs,
  getStoredEvents,
} from '@/lib/storage';
import { calculateBMI } from '@/lib/nutritionEngine';
import { UserProfile, WeightLog, MealLog, CalendarEvent } from '@/lib/types';

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newWeightInput, setNewWeightInput] = useState<string>('58.0');

  useEffect(() => {
    setProfile(getStoredProfile());
    setWeightLogs(getStoredWeightLogs());
    setEvents(getStoredEvents());
  }, []);

  const bmiInfo = calculateBMI(profile?.weightKg || 58, profile?.heightCm || 165);

  // 7-day calorie history mock data points leading up to today
  const weeklyCalorieData = [
    { day: 'Fri', eaten: 1980, target: 2100, status: 'on_track' },
    { day: 'Sat', eaten: 2150, target: 2100, status: 'balanced' },
    { day: 'Sun', eaten: 2040, target: 2100, status: 'on_track' },
    { day: 'Mon', eaten: 1890, target: 2100, status: 'on_track' },
    { day: 'Tue', eaten: 1950, target: 2100, status: 'on_track' },
    { day: 'Wed', eaten: 2020, target: 2100, status: 'on_track' },
    { day: 'Today', eaten: 1552, target: 2100, status: 'active' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Features 11 & 12: Progress Visualization & Habit History</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Habit History & Progress
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-1">
          Review your weight trajectory, calorie consistency streaks, and celebration recovery trends over time.
        </p>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs font-bold text-stone-500 uppercase">Current Weight</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-stone-900">{profile?.weightKg || 58} kg</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingDown className="w-3.5 h-3.5" /> -1.2 kg
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Goal: {profile?.targetWeightKg || 56} kg</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs font-bold text-stone-500 uppercase">Meal Consistency Streak</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-stone-900">
              {profile?.streakDays || 4} Days
            </span>
            <span className="text-xs font-bold text-amber-500">🔥 On a roll</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Target: 7-day milestone</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs font-bold text-stone-500 uppercase">BMI Status</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-600">{bmiInfo.bmi}</span>
            <span className="text-xs font-semibold text-stone-600">{bmiInfo.category}</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Healthy optimal range: 18.5 - 24.9</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
          <div className="text-xs font-bold text-stone-500 uppercase">Celebration Balance Rate</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-teal-700">100%</span>
            <span className="text-xs font-semibold text-stone-500">Resilient</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Zero restrictive compensation</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 7-Day Calorie Adherence Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">7-Day Calorie Intake vs Target</h2>
              <p className="text-xs text-stone-500">Target baseline: 2,100 kcal / day</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              96% Weekly Adherence
            </span>
          </div>

          {/* SVG/CSS Bar Chart */}
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end justify-between gap-2 px-2 border-b border-stone-200">
              {weeklyCalorieData.map((d, i) => {
                const heightPct = Math.min(100, Math.round((d.eaten / 2400) * 100));
                const isToday = d.day === 'Today';

                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] py-1 px-1.5 rounded mb-1 text-center whitespace-nowrap pointer-events-none">
                      {d.eaten} kcal
                    </div>

                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-10 rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-[#00C27A] shadow-xs'
                          : 'bg-emerald-200/80 hover:bg-emerald-300'
                      }`}
                    />
                    <span className={`text-[11px] font-semibold mt-2 ${isToday ? 'text-emerald-700 font-bold' : 'text-stone-500'}`}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2">
            <span>Average: ~1,945 kcal / day</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00C27A]" />
              <span>Today in progress</span>
            </span>
          </div>
        </div>

        {/* Right Column: Weight Trend Visualizer */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">Weight Trend (September)</h2>
              <p className="text-xs text-stone-500">Starting: 59.2 kg • Target: 56.0 kg</p>
            </div>
          </div>

          {/* SVG Smooth Line Representation */}
          <div className="h-44 relative flex items-center justify-center p-2">
            <svg className="w-full h-full" viewBox="0 0 300 120">
              {/* Target Line */}
              <line
                x1="20"
                y1="95"
                x2="280"
                y2="95"
                stroke="#CBD5E1"
                strokeDasharray="4"
                strokeWidth="1.5"
              />
              <text x="240" y="90" fontSize="9" fill="#94A3B8" fontWeight="bold">
                Target 56kg
              </text>

              {/* Smooth trend curve */}
              <path
                d="M 20 25 Q 90 45, 150 65 T 280 80"
                fill="none"
                stroke="#10B981"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="20" cy="25" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="100" cy="50" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="190" cy="72" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="280" cy="80" r="5.5" fill="#059669" stroke="#FFFFFF" strokeWidth="2.5" />

              <text x="260" y="70" fontSize="10" fill="#059669" fontWeight="bold">
                58.0 kg
              </text>
            </svg>
          </div>

          {/* History log entries */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Recent Weigh-ins
            </span>
            {weightLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-stone-700">{log.date}</span>
                <span className="font-extrabold text-stone-900">{log.weightKg} kg</span>
                <span className="text-[11px] text-emerald-600 font-semibold">BMI {log.bmi}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Festival History Table */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
        <h2 className="font-extrabold text-stone-900 text-base">
          Festival & Celebration Nutrition History
        </h2>
        <p className="text-xs text-stone-500">
          How NutriTrack AI helped you navigate cultural occasions with mindful joy and seamless next-day balance.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase font-bold text-[10px] tracking-wider border-y border-stone-100">
              <tr>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Strategy</th>
                <th className="py-3 px-4">Recovery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900">{evt.title}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-md capitalize text-[11px]">
                      {evt.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">{evt.date}</td>
                  <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                    {evt.preEventPlan.smartSwaps[0]?.healthierAlternative || 'Balanced early meals'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Balanced Next Day</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
