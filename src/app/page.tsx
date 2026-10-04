'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized?: boolean;
      init?: () => void;
      destroy?: () => void;
    };
  }
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Intercept fetch to disable logo injection from the Unicorn Studio JSON config directly
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const res = await originalFetch.apply(this, args);
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';
      if (url.includes('unicornstudio') || url.includes('unicorn.studio')) {
        try {
          const clone = res.clone();
          const data = await clone.json();
          if (data && data.options) {
            data.options.includeLogo = false;
            data.options.freePlan = true;
          }
          return new Response(JSON.stringify(data), {
            headers: res.headers,
            status: res.status,
            statusText: res.statusText,
          });
        } catch {
          return res;
        }
      }
      return res;
    };

    // 2. Active DOM watermark purging function
    const purgeWatermark = () => {
      const selectors = [
        'a[href*="unicorn.studio"]',
        'img[src*="made_in_us"]',
        'img[alt*="unicorn.studio"]',
        '[data-us-project] > a',
        '[data-us-project] a[target="_blank"]',
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          el.remove();
        });
      });
    };

    purgeWatermark();

    // 3. MutationObserver to immediately remove badge as soon as it enters DOM
    const observer = new MutationObserver(() => {
      purgeWatermark();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Periodic sweep during canvas startup
    const interval = setInterval(purgeWatermark, 100);
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    // 4. Initialize Unicorn Studio 3D Canvas
    const initUnicorn = () => {
      if (window.UnicornStudio && typeof window.UnicornStudio.init === 'function') {
        try {
          window.UnicornStudio.init();
        } catch (e) {
          console.warn('UnicornStudio init warning:', e);
        }
      }
    };

    if (window.UnicornStudio && window.UnicornStudio.init) {
      initUnicorn();
    } else {
      window.UnicornStudio = { isInitialized: false };
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.3.0/dist/unicornStudio.umd.js';
      script.async = true;
      script.onload = () => {
        initUnicorn();
      };
      (document.head || document.body).appendChild(script);
    }

    return () => {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050807] flex items-center justify-center select-none">
      {/* Fallback & inline CSS protection to completely hide any watermark elements */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            a[href*="unicorn.studio"],
            img[src*="made_in_us"],
            img[alt*="unicorn.studio"],
            [data-us-project] > a,
            [data-us-project] a[target="_blank"] {
              display: none !important;
              opacity: 0 !important;
              pointer-events: none !important;
              visibility: hidden !important;
              width: 0 !important;
              height: 0 !important;
              position: absolute !important;
              clip: rect(0, 0, 0, 0) !important;
              z-index: -9999 !important;
            }
          `,
        }}
      />

      {/* 3D Scene Container rendered by Unicorn Studio */}
      <div
        ref={containerRef}
        data-us-project="im8zsdf5KWTquw3DfoeG"
        className="w-full h-full absolute inset-0 z-10 flex items-center justify-center pointer-events-auto"
        style={{
          width: '100vw',
          height: '100vh',
          minWidth: '100%',
          minHeight: '100%',
        }}
      />

      {/* Subtle top branding chip */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/60 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>NutriTrack AI • Intelligent Nutrition</span>
        </div>
      </div>

      {/* Enter Button: Centered and positioned slightly down */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[72%] sm:top-[74%] z-30 flex flex-col items-center gap-4 text-center pointer-events-auto">
        <Link
          href="/dashboard"
          className="group relative inline-flex items-center gap-3 px-8 sm:px-11 py-4 sm:py-4.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-base sm:text-lg tracking-wide shadow-[0_0_40px_rgba(16,185,129,0.55)] hover:shadow-[0_0_60px_rgba(16,185,129,0.85)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/30 backdrop-blur-md cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
          <span>Enter NutriTrack AI</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform text-white" />
        </Link>

        {/* Secondary quick navigation */}
        <div className="flex items-center gap-4 text-xs font-medium text-stone-400/90 drop-shadow">
          <Link
            href="/home"
            className="hover:text-emerald-400 transition-colors underline decoration-stone-600 hover:decoration-emerald-400"
          >
            Product Overview
          </Link>
          <span className="text-stone-600">•</span>
          <Link
            href="/scanner"
            className="hover:text-emerald-400 transition-colors underline decoration-stone-600 hover:decoration-emerald-400"
          >
            Food Scanner
          </Link>
          <span className="text-stone-600">•</span>
          <Link
            href="/auth"
            className="hover:text-emerald-400 transition-colors underline decoration-stone-600 hover:decoration-emerald-400"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
