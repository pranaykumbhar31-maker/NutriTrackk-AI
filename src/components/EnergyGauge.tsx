'use client';

import React from 'react';

interface EnergyGaugeProps {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export default function EnergyGauge({
  consumed,
  goal,
  size = 140,
  strokeWidth = 12,
}: EnergyGaugeProps) {
  const remaining = Math.max(0, goal - consumed);
  const percentage = Math.min(100, Math.round((consumed / goal) * 100));

  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  // We want the consumed portion to be filled with vibrant emerald
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Animated Value Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#00C27A"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-3xl font-extrabold text-stone-900 tracking-tight leading-none">
            {remaining}
          </span>
          <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mt-0.5">
            kcal left
          </span>
        </div>
      </div>

      {/* Under gauge readout */}
      <div className="mt-2 text-center">
        <p className="text-xs font-medium text-stone-500">
          <span className="font-semibold text-stone-700">{consumed.toLocaleString()}</span> eaten
          <span className="mx-1 text-stone-300">/</span>
          <span className="text-stone-500">{goal.toLocaleString()} goal</span>
        </p>
      </div>
    </div>
  );
}
