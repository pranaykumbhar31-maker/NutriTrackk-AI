'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Droplets,
  Footprints,
  Heart,
  ShieldCheck,
  X,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getStoredEvents,
  getStoredMeals,
  getStoredProfile,
  addCalendarEvent,
  updateCalendarEvent,
} from '@/lib/storage';
import {
  generateEventImpactReport,
  generatePreEventGuidance,
  generateDuringEventGuidance,
  generateRecoveryPlan,
} from '@/lib/festivalEngine';
import {
  CalendarEvent,
  EventType,
  MealLog,
  UserProfile,
  EventImpactReport,
} from '@/lib/types';
import MacroSplitBar from '@/components/MacroSplitBar';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-ganesh-chaturthi');
  const [activePhase, setActivePhase] = useState<'before' | 'during' | 'after'>('before');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealLog[]>([]);

  // Modals
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isImpactReportOpen, setIsImpactReportOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<EventImpactReport | null>(null);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>('festival');
  const [newEventDate, setNewEventDate] = useState('2026-09-15');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Selected Day in Calendar
  const [selectedDay, setSelectedDay] = useState<number>(11); // Sept 11 (Ganesh Chaturthi)

  useEffect(() => {
    const evts = getStoredEvents();
    setEvents(evts);
    if (evts.length > 0 && !evts.find((e) => e.id === selectedEventId)) {
      setSelectedEventId(evts[0].id);
    }
    setProfile(getStoredProfile());
    setMeals(getStoredMeals());

    const handleUpdate = () => {
      setEvents(getStoredEvents());
      setMeals(getStoredMeals());
      setProfile(getStoredProfile());
    };
    window.addEventListener('nutritrack_events_updated', handleUpdate);
    return () => window.removeEventListener('nutritrack_events_updated', handleUpdate);
  }, [selectedEventId]);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Open Impact Report
  const handleOpenReport = () => {
    if (!currentEvent || !profile) return;
    const report = generateEventImpactReport(currentEvent, meals, profile);
    setGeneratedReport(report);
    setIsImpactReportOpen(true);
  };

  // Add custom event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const created: CalendarEvent = {
      id: `evt-custom-${Date.now()}`,
      title: newEventTitle,
      type: newEventType,
      date: newEventDate,
      description: newEventDesc || `Celebration and mindful eating occasion.`,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      preEventPlan: generatePreEventGuidance(newEventType, newEventTitle),
      duringEventGuidance: generateDuringEventGuidance(newEventTitle, profile?.dailyCalorieTarget || 2100),
      recoveryPlan: generateRecoveryPlan(newEventTitle, 400),
      isCustom: true,
    };

    addCalendarEvent(created);
    setSelectedEventId(created.id);
    setIsAddEventOpen(false);
    setNewEventTitle('');
    setNewEventDesc('');

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  // Calendar Days representation (September 2026)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Features 8, 9 & 10: Smart Nutrition Calendar & Festival Mode</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Festival & Event Nutrition Intelligence
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Connect your daily nutrition with real-world cultural celebrations, weddings, vacations, and dining out. Enjoy life&apos;s moments while maintaining lifelong balance.
          </p>
        </div>

        <button
          onClick={() => setIsAddEventOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full shadow-sm flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Event / Celebration</span>
        </button>
      </div>

      {/* Main Layout: Calendar Grid (Left) + Festival Mode Station (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Monthly Calendar */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
              <h2 className="font-extrabold text-stone-900 text-lg">September 2026</h2>
            </div>
            <div className="flex items-center gap-1 text-stone-400">
              <button className="p-1.5 hover:bg-stone-100 rounded-full text-stone-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-stone-100 rounded-full text-stone-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-stone-400 uppercase">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {/* Empty offset for Sept 1, 2026 (Tuesday = 2 offset) */}
            <div className="h-12" />
            <div className="h-12" />

            {daysInMonth.map((day) => {
              const dateStr = `2026-09-${day < 10 ? `0${day}` : day}`;
              const eventOnDay = events.find((e) => e.date === dateStr);
              const isSelected = selectedDay === day;
              const isToday = day === 10;

              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    if (eventOnDay) setSelectedEventId(eventOnDay.id);
                  }}
                  className={`h-12 rounded-xl flex flex-col items-center justify-between p-1 transition-all border ${
                    isSelected
                      ? 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-sm'
                      : eventOnDay
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                      : isToday
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-stone-50/60 border-stone-100 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  {eventOnDay ? (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-amber-500'
                      }`}
                      title={eventOnDay.title}
                    />
                  ) : day <= 10 ? (
                    <span className="text-[9px] text-stone-400 font-medium">1.5k</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Legend */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Normal Tracked Day</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Festival / Event Day</span>
            </span>
          </div>

          {/* Upcoming Events Carousel List */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Upcoming Events & Occasions
            </h3>
            {events.map((evt) => {
              const isSelected = evt.id === currentEvent?.id;
              return (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                      : 'bg-stone-50/60 border-stone-200/70 hover:bg-stone-100'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-2">
                      <span>{evt.title}</span>
                      <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                        {evt.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">Date: {evt.date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Festival/Event Mode Active Workspace */}
        {currentEvent && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-6">
            {/* Event Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-stone-900">{currentEvent.title}</span>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Festival Mode
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">{currentEvent.description}</p>
              </div>

              <button
                onClick={handleOpenReport}
                className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs px-4 py-2 rounded-full shadow-xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Event Impact Insights</span>
              </button>
            </div>

            {/* 3-Phase Navigation Tabs */}
            <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setActivePhase('before')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePhase === 'before'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Before Event (Prep)
              </button>
              <button
                onClick={() => setActivePhase('during')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePhase === 'during'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. During Event (Mindful)
              </button>
              <button
                onClick={() => setActivePhase('after')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePhase === 'after'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3. After Event (Balance)
              </button>
            </div>

            {/* PHASE 1: BEFORE EVENT */}
            {activePhase === 'before' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-stone-800 leading-relaxed">
                  <strong className="text-amber-900 font-bold block mb-1">
                    Preparation Strategy for {currentEvent.title}
                  </strong>
                  {currentEvent.preEventPlan.preparationSummary}
                </div>

                {/* Earlier Day Meals */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                    Recommended Earlier-Day Nourishment
                  </h3>
                  <div className="space-y-2">
                    {currentEvent.preEventPlan.earlierDayMeals.map((meal, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-700 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{meal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Swaps */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                    Smart Festive Swaps (Enjoy Without Heavy Sluggishness)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentEvent.preEventPlan.smartSwaps.map((swap, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 text-xs"
                      >
                        <div className="font-bold text-rose-700 line-through mb-0.5">
                          {swap.original}
                        </div>
                        <div className="font-bold text-emerald-800 mb-1">
                          ✨ Swap: {swap.healthierAlternative}
                        </div>
                        <p className="text-[11px] text-stone-600 leading-relaxed">{swap.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Portion Mindset */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 leading-relaxed">
                  <strong className="text-stone-800 font-semibold block mb-0.5">Mindful Portioning:</strong>
                  {currentEvent.preEventPlan.portionStrategy}
                </div>
              </div>
            )}

            {/* PHASE 2: DURING EVENT */}
            {activePhase === 'during' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                  <strong className="text-emerald-900 font-bold block mb-1">
                    {currentEvent.duringEventGuidance.enjoymentFocus}
                  </strong>
                  Savor each bite, stay present with friends and family, and let go of anxiety. NutriTrack AI helps you track easily without shame.
                </div>

                {/* Quick 1-Tap Festive Food Logger */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center justify-between">
                    <span>Quick Festive Food Logging</span>
                    <Link
                      href="/scanner"
                      className="text-emerald-600 font-semibold text-xs flex items-center gap-1 hover:underline"
                    >
                      <span>Take Photo</span> →
                    </Link>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: 'Steamed Modak (1 pc)', kcal: 145 },
                      { name: 'Besan Ladoo (1 pc)', kcal: 215 },
                      { name: 'Veg Dum Biryani', kcal: 460 },
                      { name: 'Gulab Jamun (2 pc)', kcal: 290 },
                      { name: 'Cardamom Kheer', kcal: 210 },
                      { name: 'Chaas / Buttermilk', kcal: 45 },
                    ].map((food, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          alert(`Logged 1 serving of ${food.name} (${food.kcal} kcal) to celebration meal!`);
                        }}
                        className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition-all"
                      >
                        <div className="font-bold text-xs text-stone-800 truncate">{food.name}</div>
                        <div className="text-[11px] text-stone-500 font-medium">+{food.kcal} kcal</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mindful Reminders */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                    Mindful Gathering Reminders
                  </h3>
                  <div className="space-y-2">
                    {currentEvent.duringEventGuidance.mindfulReminders.map((reminder, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-white border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5"
                      >
                        <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{reminder}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 3: AFTER EVENT */}
            {activePhase === 'after' && (
              <div className="space-y-5 animate-in fade-in">
                {/* Non-punitive core message */}
                <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs text-stone-800 leading-relaxed">
                  <strong className="text-teal-900 font-bold block mb-1">
                    🌿 Zero Restrictive Rebound Policy
                  </strong>
                  {currentEvent.recoveryPlan.mentalNote}
                </div>

                {/* Next Meal Suggestion */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Recommended Next Meal
                    </span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Light & Restorative
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">
                    {currentEvent.recoveryPlan.nextMealSuggestion.title}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {currentEvent.recoveryPlan.nextMealSuggestion.description}
                  </p>
                  <div className="mt-2.5 p-2.5 rounded-xl bg-stone-50 text-[11px] text-stone-700">
                    <strong>Nutritional Focus:</strong> {currentEvent.recoveryPlan.nextMealSuggestion.targetNutrients}
                  </div>
                </div>

                {/* Hydration & Gentle Activity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-teal-800 mb-1.5">
                      <Droplets className="w-4 h-4" />
                      <span>Hydration Strategy</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      {currentEvent.recoveryPlan.hydrationGuidance}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1.5">
                      <Footprints className="w-4 h-4" />
                      <span>Gentle Activity</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      {currentEvent.recoveryPlan.activitySuggestion.type} — {currentEvent.recoveryPlan.activitySuggestion.purpose}
                    </p>
                  </div>
                </div>

                {/* View Full Report Button */}
                <button
                  onClick={handleOpenReport}
                  className="w-full py-3 bg-[#00C27A] hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm rounded-full shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Full Event Impact Report</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EVENT IMPACT INSIGHTS MODAL (Feature 10: Event Impact Insights) */}
      {isImpactReportOpen && generatedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-stone-200 flex flex-col max-h-[92vh] overflow-y-auto">
            {/* Report Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Official Health Impact Report
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">
                  Event: {generatedReport.eventName}
                </h2>
                <p className="text-xs text-stone-500">Date: {generatedReport.date}</p>
              </div>
              <button
                onClick={() => setIsImpactReportOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Report Body */}
            <div className="py-4 space-y-4 text-xs sm:text-sm">
              {/* Food Consumed */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                <span className="font-bold text-stone-900 block mb-1 text-xs uppercase tracking-wider">
                  Food Consumed:
                </span>
                <p className="text-stone-700 text-xs">
                  {generatedReport.foodsConsumed.join(', ') || 'Steamed Ukadiche Modaks, Veg Dum Biryani, Salad'}
                </p>
              </div>

              {/* Estimated Nutrition */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
                <span className="font-bold text-emerald-950 block mb-2 text-xs uppercase tracking-wider">
                  Estimated Nutrition:
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-stone-500 font-semibold">Calories</div>
                    <div className="font-extrabold text-stone-900 text-sm">
                      {generatedReport.estimatedNutrition.calories || 680} kcal
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-stone-500 font-semibold">Protein</div>
                    <div className="font-extrabold text-stone-900 text-sm">
                      {generatedReport.estimatedNutrition.protein || 22}g
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-stone-500 font-semibold">Carbs</div>
                    <div className="font-extrabold text-stone-900 text-sm">
                      {generatedReport.estimatedNutrition.carbs || 85}g
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-stone-500 font-semibold">Fats</div>
                    <div className="font-extrabold text-stone-900 text-sm">
                      {generatedReport.estimatedNutrition.fats || 24}g
                    </div>
                  </div>
                </div>
              </div>

              {/* Compared with Normal Intake */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                <span className="font-bold text-stone-900 block mb-1 text-xs uppercase tracking-wider">
                  Compared with Normal Intake:
                </span>
                <p className="text-stone-700 text-xs">
                  {generatedReport.comparedWithNormal.details}
                </p>
              </div>

              {/* Potential Pattern */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                <span className="font-bold text-stone-900 block mb-1 text-xs uppercase tracking-wider">
                  Potential Pattern:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {generatedReport.potentialPatterns.map((pat, i) => (
                    <span
                      key={i}
                      className="bg-amber-100 text-amber-900 font-semibold text-[11px] px-2 py-0.5 rounded-md capitalize"
                    >
                      {pat.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Next Step */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="font-bold block mb-1 text-xs uppercase tracking-wider">
                  Recommended Next Step:
                </span>
                <p className="text-xs leading-relaxed">{generatedReport.recommendedNextStep}</p>
              </div>

              {/* Recovery / Balance Plan */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-900 block mb-1.5 text-xs uppercase tracking-wider">
                  Recovery/Balance Plan:
                </span>
                <ul className="text-xs text-stone-700 space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Next Meal:</strong> {generatedReport.recoveryBalancePlan.nextMealSuggestion.title} ({generatedReport.recoveryBalancePlan.nextMealSuggestion.recipeIdea})
                  </li>
                  <li>
                    <strong>Next-Day Rhythm:</strong> Return to normal breakfast, drink 2.5L water, zero fasting.
                  </li>
                  <li>
                    <strong>Activity Suggestion:</strong> {generatedReport.recoveryBalancePlan.activitySuggestion.type}
                  </li>
                </ul>
              </div>

              {/* Safe Messaging Disclaimer */}
              <div className="p-3 rounded-2xl bg-stone-100 text-[11px] text-stone-600 italic">
                {generatedReport.safeMessaging}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `NutriTrack AI Event Report: ${generatedReport.eventName} - Balanced Plan Active`
                  );
                  alert('Report copied to clipboard!');
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share / Copy</span>
              </button>
              <button
                onClick={() => setIsImpactReportOpen(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2 rounded-full transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM EVENT MODAL */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base">Add Celebration or Event</h3>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Event / Festival Name
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Maya's Birthday Party, Wedding Feast..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Event Type</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as EventType)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-emerald-500 capitalize"
                  >
                    <option value="festival">Festival</option>
                    <option value="celebration">Celebration</option>
                    <option value="wedding">Wedding</option>
                    <option value="birthday">Birthday</option>
                    <option value="vacation">Vacation</option>
                    <option value="restaurant_outing">Restaurant Outing</option>
                    <option value="cheat_meal">Special Meal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Notes / Foods</label>
                <textarea
                  rows={2}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="e.g. Expecting multi-course dinner with friends..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-colors"
                >
                  Add Event to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
