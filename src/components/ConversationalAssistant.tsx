'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare, ChevronDown, RotateCcw } from 'lucide-react';
import { getStoredProfile, getStoredMeals, getStoredEvents } from '@/lib/storage';
import { aggregateDailyNutrition } from '@/lib/nutritionEngine';
import { UserProfile, NutritionalInfo, CalendarEvent } from '@/lib/types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ConversationalAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const QUICK_PROMPTS = [
  'What should I eat for dinner?',
  'How many calories did I consume today?',
  'Suggest a high-protein breakfast.',
  'I ate too much festive sweets today, what should I do next?',
  'Am I close to my calorie target?',
  'What healthier alternative can I eat?',
];

export default function ConversationalAssistant({
  isOpen,
  onClose,
  onToggle,
}: ConversationalAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      text: "Hello! I'm your NutriTrack AI Coach. I'm actively tracking your daily meals, calorie goals, and upcoming celebrations. How can I help you nourish your body today?",
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [consumed, setConsumed] = useState<NutritionalInfo>({ calories: 1552, protein: 82, carbs: 172, fats: 58 });
  const [upcomingEvent, setUpcomingEvent] = useState<CalendarEvent | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(getStoredProfile());
    const meals = getStoredMeals();
    const agg = aggregateDailyNutrition(meals);
    if (agg.calories > 0) setConsumed(agg);
    const evts = getStoredEvents();
    if (evts.length > 0) setUpcomingEvent(evts[0]);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (userText: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          userProfile: profile,
          todayConsumed: consumed,
          upcomingEventName: upcomingEvent?.title,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('No reply');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: `You have **${Math.max(0, (profile?.dailyCalorieTarget || 2100) - consumed.calories)} kcal** left today. A high-protein bowl or warm vegetable soup is a fantastic choice right now!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Bubble matching bottom right of reference screenshot */}
      <button
        onClick={onToggle}
        aria-label="Open AI Nutrition Assistant"
        className="fixed bottom-6 right-6 z-50 w-13 h-13 rounded-full bg-stone-900 hover:bg-stone-800 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group border-2 border-white/80"
      >
        <Bot className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
        <span className="sr-only">Open NutriTrack Assistant</span>
        {/* Pulsing online indicator */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
      </button>

      {/* Slide-over / Pop-up Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[640px] h-[82vh] bg-white rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">NutriTrack AI Coach</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-stone-400">
                  {profile?.name || 'Maya'} • {Math.max(0, (profile?.dailyCalorieTarget || 2100) - consumed.calories)} kcal left
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context banner */}
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 text-[11px] text-emerald-900 flex items-center justify-between">
            <span className="font-medium">
              🎉 Upcoming: {upcomingEvent?.title || 'Navratri Festive Celebration'}
            </span>
            <span className="font-semibold text-emerald-700">Pre-event active</span>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-stone-800 border border-stone-200/70 rounded-bl-none prose-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[10px] text-stone-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-stone-400 bg-white p-3 rounded-2xl w-fit border border-stone-200/70">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>NutriTrack Coach is thinking...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="shrink-0 text-[11px] font-medium bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-stone-600 px-3 py-1.5 rounded-full border border-stone-200/70 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-stone-200/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about meals, calories, festivals..."
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white transition-all text-stone-800 placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
