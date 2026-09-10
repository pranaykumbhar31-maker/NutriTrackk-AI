'use client';

import React, { useState } from 'react';
import { Plus, Search, X, Check, Utensils } from 'lucide-react';
import { FoodItem, MealLog, MealType, NutritionalInfo } from '@/lib/types';
import { searchFoodDatabase, VERIFIED_FOOD_DATABASE } from '@/lib/foodDatabase';
import { addMealLog } from '@/lib/storage';

interface ManualMealLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
  onMealAdded?: () => void;
}

export default function ManualMealLogger({
  isOpen,
  onClose,
  defaultMealType = 'lunch',
  onMealAdded,
}: ManualMealLoggerProps) {
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState<number>(250);
  const [customProtein, setCustomProtein] = useState<number>(15);
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!isOpen) return null;

  const searchResults = searchFoodDatabase(searchQuery);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity(1);
    setIsCustomMode(false);
  };

  const handleSave = () => {
    let foodToLog: FoodItem;
    let qty = quantity;

    if (isCustomMode) {
      foodToLog = {
        id: `custom-${Date.now()}`,
        name: customName || 'Custom Food Entry',
        category: 'composite',
        servingSize: 1,
        servingUnit: 'serving',
        calories: customCalories,
        protein: customProtein,
        carbs: Math.max(0, Math.round((customCalories - customProtein * 4) / 5)),
        fats: Math.max(0, Math.round((customCalories - customProtein * 4) / 10)),
      };
      qty = 1;
    } else if (selectedFood) {
      foodToLog = selectedFood;
    } else {
      return;
    }

    const calculatedNutrition: NutritionalInfo = {
      calories: Math.round(foodToLog.calories * qty),
      protein: Math.round(foodToLog.protein * qty * 10) / 10,
      carbs: Math.round(foodToLog.carbs * qty * 10) / 10,
      fats: Math.round(foodToLog.fats * qty * 10) / 10,
      fiber: Math.round((foodToLog.fiber || 0) * qty * 10) / 10,
      sodium: Math.round((foodToLog.sodium || 0) * qty),
    };

    const newMeal: MealLog = {
      id: `meal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType,
      items: [
        {
          foodItem: foodToLog,
          quantity: qty,
          calculatedNutrition,
        },
      ],
      totalNutrition: calculatedNutrition,
      notes: 'Manually logged via quick search',
    };

    addMealLog(newMeal);
    onMealAdded?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-stone-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">Manual Meal Logging</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type Picker */}
        <div className="mt-4 flex items-center justify-center bg-stone-100 p-1 rounded-full text-xs font-semibold">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
            <button
              key={t}
              onClick={() => setMealType(t)}
              className={`flex-1 py-1.5 rounded-full capitalize transition-colors ${
                mealType === t
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Mode Toggle */}
        <div className="mt-4 flex items-center gap-2 border-b border-stone-100 pb-2">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`text-xs font-bold pb-1 transition-colors ${
              !isCustomMode
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Search Food Database
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`text-xs font-bold pb-1 transition-colors ${
              isCustomMode
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Custom Quick Add
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {!isCustomMode ? (
            <>
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chicken, roti, quinoa, paneer, modak..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Search results */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {searchResults.map((food) => {
                  const isChosen = selectedFood?.id === food.id;
                  return (
                    <button
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between border transition-all ${
                        isChosen
                          ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                          : 'bg-white border-stone-100 hover:border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-800">{food.name}</div>
                        <div className="text-[11px] text-stone-500">
                          {food.calories} kcal • {food.servingSize} {food.servingUnit}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-emerald-700">{food.protein}g P</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected food portion adjustments */}
              {selectedFood && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-900">
                      Adjust Portion ({selectedFood.name})
                    </span>
                    <span className="text-xs font-extrabold text-stone-900">
                      {Math.round(selectedFood.calories * quantity)} kcal
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-600">
                      Serving: {quantity}x ({selectedFood.servingSize * quantity} {selectedFood.servingUnit})
                    </span>
                    <div className="flex items-center bg-white rounded-full border border-stone-200">
                      <button
                        onClick={() => setQuantity((q) => Math.max(0.25, Math.round((q - 0.25) * 100) / 100))}
                        className="w-7 h-7 flex items-center justify-center text-stone-600 font-bold"
                      >
                        &minus;
                      </button>
                      <span className="text-xs font-bold px-2">{quantity}x</span>
                      <button
                        onClick={() => setQuantity((q) => Math.round((q + 0.25) * 100) / 100)}
                        className="w-7 h-7 flex items-center justify-center text-stone-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Custom quick entry mode */
            <div className="space-y-3 p-1">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Meal / Item Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Grandma's Spinach Curry"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isCustomMode && !selectedFood}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Add to {mealType}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
