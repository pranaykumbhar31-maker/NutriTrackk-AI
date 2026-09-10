'use client';

import React from 'react';

interface MacroSplitBarProps {
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  showLabels?: boolean;
}

export default function MacroSplitBar({
  proteinGrams,
  carbsGrams,
  fatsGrams,
  showLabels = true,
}: MacroSplitBarProps) {
  // Convert to calories to find percentage of energy
  const proteinCals = proteinGrams * 4;
  const carbsCals = carbsGrams * 4;
  const fatsCals = fatsGrams * 9;
  const totalCals = Math.max(1, proteinCals + carbsCals + fatsCals);

  const pPct = Math.max(5, Math.round((proteinCals / totalCals) * 100));
  const cPct = Math.max(5, Math.round((carbsCals / totalCals) * 100));
  const fPct = Math.max(5, 100 - pPct - cPct);

  return (
    <div className="w-full">
      {/* Segmented bar */}
      <div className="h-2 w-full flex rounded-full overflow-hidden bg-stone-100 shadow-inner">
        <div
          style={{ width: `${pPct}%` }}
          className="bg-[#3B82F6] transition-all duration-700 ease-out"
          title={`Protein: ${proteinGrams}g (${pPct}%)`}
        />
        <div
          style={{ width: `${cPct}%` }}
          className="bg-[#F59E0B] transition-all duration-700 ease-out"
          title={`Carbs: ${carbsGrams}g (${cPct}%)`}
        />
        <div
          style={{ width: `${fPct}%` }}
          className="bg-[#EC4899] transition-all duration-700 ease-out"
          title={`Fats: ${fatsGrams}g (${fPct}%)`}
        />
      </div>

      {showLabels && (
        <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mt-1.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span>Protein <strong className="text-stone-700">{proteinGrams}g</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span>Carbs <strong className="text-stone-700">{carbsGrams}g</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
            <span>Fats <strong className="text-stone-700">{fatsGrams}g</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
