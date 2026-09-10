'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, Clock, Check, Plus } from 'lucide-react';
import { getStoredReminders, saveStoredReminders } from '@/lib/storage';
import { SmartReminder } from '@/lib/types';

interface ReminderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderDrawer({ isOpen, onClose }: ReminderDrawerProps) {
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReminders(getStoredReminders());
    }
  }, [isOpen]);

  const toggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setReminders(updated);
    saveStoredReminders(updated);

    const changed = updated.find((r) => r.id === id);
    if (changed) {
      setToastMessage(`${changed.title} ${changed.enabled ? 'activated' : 'paused'}`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">Smart Reminders</h2>
                <p className="text-xs text-stone-500">Gentle prompts to keep your nutrition on track</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast alert */}
          {toastMessage && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Reminder items */}
          <div className="mt-6 space-y-3.5">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition-all ${
                  rem.enabled
                    ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
                    : 'bg-stone-50/50 border-stone-200/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-stone-900">{rem.title}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rem.enabled}
                      onChange={() => toggleReminder(rem.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed mb-2">{rem.message}</p>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Scheduled for {rem.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-stone-100 text-center text-xs text-stone-400">
          Reminders sync locally and send non-intrusive notifications during active browser sessions.
        </div>
      </div>
    </div>
  );
}
