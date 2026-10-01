'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Camera,
  LayoutDashboard,
  Calendar,
  Utensils,
  BarChart3,
  Bot,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Users,
  Settings,
} from 'lucide-react';
import {
  getStoredProfile,
  getStoredReminders,
  getActiveAccount,
  getAllAccounts,
  fetchBackendAccounts,
  setActiveAccount,
} from '@/lib/storage';
import { UserProfile, SmartReminder, UserAccount } from '@/lib/types';

interface NavbarProps {
  onOpenAssistant?: () => void;
  onOpenReminders?: () => void;
}

export default function Navbar({ onOpenAssistant, onOpenReminders }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>([]);
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [activeRemindersCount, setActiveRemindersCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshUserData = () => {
    const prof = getStoredProfile();
    setProfile(prof);
    const acc = getActiveAccount();
    setAccount(acc);
    setAllAccounts(getAllAccounts());
    const rems = getStoredReminders();
    setReminders(rems);
    setActiveRemindersCount(rems.filter((r) => r.enabled).length);
  };

  useEffect(() => {
    refreshUserData();
    fetchBackendAccounts().then(() => refreshUserData());

    const handleProfileUpdate = () => refreshUserData();
    const handleAuthChange = () => refreshUserData();
    const handleRemindersUpdate = () => {
      const updated = getStoredReminders();
      setReminders(updated);
      setActiveRemindersCount(updated.filter((r) => r.enabled).length);
    };

    window.addEventListener('nutritrack_profile_updated', handleProfileUpdate);
    window.addEventListener('nutritrack_auth_changed', handleAuthChange);
    window.addEventListener('nutritrack_reminders_updated', handleRemindersUpdate);

    // Close dropdown on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('nutritrack_profile_updated', handleProfileUpdate);
      window.removeEventListener('nutritrack_auth_changed', handleAuthChange);
      window.removeEventListener('nutritrack_reminders_updated', handleRemindersUpdate);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleSwitchAccount = (accId: string) => {
    setActiveAccount(accId);
    setIsProfileMenuOpen(false);
    router.push('/dashboard');
  };

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
          <div className="w-8 h-8 rounded-full bg-[#00C27A] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
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
        <div className="flex items-center gap-2 sm:gap-2.5">
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

          {/* User Profile Pill & Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-stone-200 hover:border-emerald-300 hover:bg-stone-50 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                {account?.name ? account.name[0] : 'M'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-stone-800 max-w-[80px] truncate">
                {account?.name || 'Maya'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Dropdown Card */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-stone-200/90 py-3 z-50 animate-in fade-in">
                {/* Account info */}
                <div className="px-4 pb-3 border-b border-stone-100">
                  <p className="text-xs font-bold text-stone-900 truncate">
                    {account?.name || 'Maya'}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">{account?.email || 'maya@nutritrack.ai'}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">
                    {profile?.goal.replace('_', ' ')} • {profile?.dailyCalorieTarget} kcal
                  </span>
                </div>

                {/* Switch Profiles Submenu */}
                <div className="px-3 py-2 border-b border-stone-100">
                  <p className="text-[10px] uppercase font-bold text-stone-400 px-2 mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Switch Profile</span>
                  </p>
                  <div className="space-y-1">
                    {allAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => handleSwitchAccount(acc.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          acc.id === account?.id
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
                            : 'text-stone-700 hover:bg-stone-50 font-medium'
                        }`}
                      >
                        <span className="truncate">{acc.name}</span>
                        {acc.id === account?.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Links */}
                <div className="p-1 space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-stone-400" />
                    <span>My Profile & Target Calibration</span>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Create Individual Profile / Log in</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Log In link matching reference */}
          <Link
            href="/login"
            className="hidden md:inline-block text-xs font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors"
          >
            Log in
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
