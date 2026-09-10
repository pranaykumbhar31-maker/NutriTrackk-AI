'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Camera, LayoutDashboard, Calendar, Utensils, BarChart3, Bot, User, Bell } from 'lucide-react';
import { getStoredProfile, getStoredReminders } from '@/lib/storage';
import { UserProfile, SmartReminder } from '@/lib/types';

interface NavbarProps {
  onOpenAssistant?: () => void;
  onOpenReminders?: () => void;
}

export default function Navbar({ onOpenAssistant, onOpenReminders }: NavbarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [activeRemindersCount, setActiveRemindersCount] = useState(0);

  useEffect(() => {
    setProfile(getStoredProfile());
    const rems = getStoredReminders();
    setReminders(rems);
    setActiveRemindersCount(rems.filter((r) => r.enabled).length);

    const handleProfileUpdate = () => setProfile(getStoredProfile());
    const handleRemindersUpdate = () => {
      const updated = getStoredReminders();
      setReminders(updated);
      setActiveRemindersCount(updated.filter((r) => r.enabled).length);
    };

    window.addEventListener('nutritrack_profile_updated', handleProfileUpdate);
    window.addEventListener('nutritrack_reminders_updated', handleRemindersUpdate);
    return () => {
      window.removeEventListener('nutritrack_profile_updated', handleProfileUpdate);
      window.removeEventListener('nutritrack_reminders_updated', handleRemindersUpdate);
    };
  }, []);

  const navLinks = [
    { label: 'Scanner', href: '/scanner', icon: Camera },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Calendar & Festivals', href: '/calendar', icon: Calendar },
    { label: 'Recommendations', href: '/recommendations', icon: Utensils },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6 mb-6">
      <nav className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-full px-5 py-2.5 shadow-sm border border-stone-200/70 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 18.5C6.86 18.5 3.5 15.14 3.5 11C3.5 6.86 6.86 3.5 11 3.5C13.21 3.5 15.21 4.4 16.66 5.84C15.22 7.28 14.32 9.28 14.32 11.49C14.32 15.36 17.46 18.5 21.33 18.5H11Z" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-stone-900">NutriTrack</span>
            <span className="text-[11px] font-semibold tracking-wider text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
              AI
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                }`}
              >
                <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={onOpenAssistant}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100/60 transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            Ask AI
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Reminders Bell Button */}
          {onOpenReminders && (
            <button
              onClick={onOpenReminders}
              title="Smart Reminders"
              className="relative p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {activeRemindersCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}

          {/* Profile Quick Link */}
          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              {profile?.name ? profile.name[0] : 'M'}
            </div>
            <span>{profile?.name || 'Maya'}</span>
          </Link>

          {/* Primary CTA button as shown in reference */}
          <Link
            href="/scanner"
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 rounded-full shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <span>Get started</span>
            <span className="text-stone-400">→</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
