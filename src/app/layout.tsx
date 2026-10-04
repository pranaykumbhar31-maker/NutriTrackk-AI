'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import ConversationalAssistant from '@/components/ConversationalAssistant';
import ReminderDrawer from '@/components/ReminderDrawer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const isLandingPage = pathname === '/';

  return (
    <html lang="en">
      <head>
        <title>NutriTrack AI — Personal Nutrition & Festival Intelligence</title>
        <meta
          name="description"
          content="Intelligent nutrition, meal tracking, health goals, and smart festival & event balance powered by AI."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-[#FAFCFB] text-stone-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenReminders={() => setIsRemindersOpen(true)}
        />

        <main className="w-full">{children}</main>

        {!isLandingPage && (
          <>
            <ConversationalAssistant
              isOpen={isAssistantOpen}
              onClose={() => setIsAssistantOpen(false)}
              onToggle={() => setIsAssistantOpen((prev) => !prev)}
            />

            <ReminderDrawer
              isOpen={isRemindersOpen}
              onClose={() => setIsRemindersOpen(false)}
            />
          </>
        )}
      </body>
    </html>
  );
}
