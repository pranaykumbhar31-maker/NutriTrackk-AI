'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Info,
  ChevronRight,
  Flame,
  Dumbbell,
  ShieldCheck,
  Utensils,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { addMealLog, getStoredProfile } from '@/lib/storage';
import { MealLog, MealType, NutritionalInfo, FoodItem } from '@/lib/types';
import { VERIFIED_FOOD_DATABASE } from '@/lib/foodDatabase';
import MacroSplitBar from '@/components/MacroSplitBar';

interface DetectedItemState {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  quantity: number;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatsPerUnit: number;
  fiberPerUnit?: number;
  sodiumPerUnit?: number;
  confidence: number;
}

const SAMPLE_PRESETS = [
  {
    id: 'f-mediterranean-power-bowl',
    title: 'Mediterranean Rainbow Grain Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    calories: 440,
    protein: 16.5,
    tag: 'Quinoa, Chickpeas, Veggies',
  },
  {
    id: 'f-avocado-poached-egg-plate',
    title: 'Avocado Toast & Organic Poached Egg',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
    calories: 385,
    protein: 17.5,
    tag: 'Sourdough, Egg, Avocado',
  },
  {
    id: 'f-modak-steamed',
    title: 'Festive Steamed Modak Thali',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    calories: 410,
    protein: 8.5,
    tag: 'Ganesh Chaturthi Festive Dish',
  },
  {
    id: 'f-salmon-grilled',
    title: 'Wild Salmon with Asparagus & Lemon',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80',
    calories: 360,
    protein: 34.0,
    tag: 'Omega-3 Rich & Lean',
  },
];

export default function ScannerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [plateTitle, setPlateTitle] = useState('Mediterranean Rainbow Grain Bowl');
  const [aiInsight, setAiInsight] = useState(
    'AI detected high fiber from chickpeas and quinoa with monounsaturated healthy fats from avocado.'
  );
  const [items, setItems] = useState<DetectedItemState[]>([
    {
      id: 'd-1',
      name: 'Cooked Quinoa & Mixed Wild Grains',
      servingSize: 150,
      servingUnit: 'cup',
      quantity: 1,
      caloriesPerUnit: 180,
      proteinPerUnit: 6.0,
      carbsPerUnit: 32.0,
      fatsPerUnit: 2.8,
      fiberPerUnit: 4.0,
      confidence: 0.96,
    },
    {
      id: 'd-2',
      name: 'Spiced Chickpeas / Garbanzo',
      servingSize: 100,
      servingUnit: 'half cup',
      quantity: 1,
      caloriesPerUnit: 164,
      proteinPerUnit: 8.9,
      carbsPerUnit: 27.4,
      fatsPerUnit: 2.6,
      fiberPerUnit: 7.6,
      confidence: 0.94,
    },
    {
      id: 'd-3',
      name: 'Hass Avocado Slices',
      servingSize: 50,
      servingUnit: 'half avocado',
      quantity: 1,
      caloriesPerUnit: 80,
      proteinPerUnit: 1.0,
      carbsPerUnit: 4.0,
      fatsPerUnit: 7.5,
      fiberPerUnit: 3.4,
      confidence: 0.92,
    },
    {
      id: 'd-4',
      name: 'Cherry Tomatoes, Cucumber & Radish',
      servingSize: 80,
      servingUnit: 'serving',
      quantity: 1,
      caloriesPerUnit: 16,
      proteinPerUnit: 0.6,
      carbsPerUnit: 3.5,
      fatsPerUnit: 0.2,
      fiberPerUnit: 1.2,
      confidence: 0.89,
    },
  ]);

  const [mealType, setMealType] = useState<MealType>('lunch');
  const [isSaved, setIsSaved] = useState(false);

  // Compute live total based on portion adjustments
  const totalCalories = items.reduce((acc, item) => acc + Math.round(item.caloriesPerUnit * item.quantity), 0);
  const totalProtein = Math.round(
    items.reduce((acc, item) => acc + item.proteinPerUnit * item.quantity, 0) * 10
  ) / 10;
  const totalCarbs = Math.round(
    items.reduce((acc, item) => acc + item.carbsPerUnit * item.quantity, 0) * 10
  ) / 10;
  const totalFats = Math.round(
    items.reduce((acc, item) => acc + item.fatsPerUnit * item.quantity, 0) * 10
  ) / 10;
  const totalFiber = Math.round(
    items.reduce((acc, item) => acc + (item.fiberPerUnit || 0) * item.quantity, 0) * 10
  ) / 10;

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      runAiScan(base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle live camera capture
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch {
      alert('Camera access denied or unavailable. You can upload an image or choose a preset.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      stopCamera();
      runAiScan(dataUrl);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Run AI Scan
  const runAiScan = async (imgBase64?: string, sampleId?: string) => {
    setIsScanning(true);
    setIsSaved(false);

    try {
      const res = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgBase64 || selectedImage,
          sampleDishId: sampleId,
        }),
      });
      const data = await res.json();

      if (data.success && data.identifiedItems) {
        setPlateTitle(data.plateTitle || 'Identified Meal Plate');
        setAiInsight(data.aiObservation || 'Nutritional breakdown computed via AI image vision.');

        const mapped: DetectedItemState[] = data.identifiedItems.map(
          (it: { name: string; servingSize: number; servingUnit: string; nutrition: NutritionalInfo; confidence: number }, idx: number) => ({
            id: `scan-${Date.now()}-${idx}`,
            name: it.name,
            servingSize: it.servingSize,
            servingUnit: it.servingUnit,
            quantity: 1,
            caloriesPerUnit: it.nutrition.calories,
            proteinPerUnit: it.nutrition.protein,
            carbsPerUnit: it.nutrition.carbs,
            fatsPerUnit: it.nutrition.fats,
            fiberPerUnit: it.nutrition.fiber || 2,
            confidence: it.confidence || 0.9,
          })
        );
        setItems(mapped);
      }
    } catch {
      // Keep existing items as reliable fallback
    } finally {
      setIsScanning(false);
    }
  };

  // Update quantity / portion
  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const newQty = Math.max(0.25, Math.round((it.quantity + delta) * 10) / 10);
          return { ...it, quantity: newQty };
        }
        return it;
      })
    );
  };

  // Delete item
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Add extra side item
  const addExtraItem = () => {
    const randomFood = VERIFIED_FOOD_DATABASE[Math.floor(Math.random() * VERIFIED_FOOD_DATABASE.length)];
    const newItem: DetectedItemState = {
      id: `add-${Date.now()}`,
      name: randomFood.name,
      servingSize: randomFood.servingSize,
      servingUnit: randomFood.servingUnit,
      quantity: 1,
      caloriesPerUnit: randomFood.calories,
      proteinPerUnit: randomFood.protein,
      carbsPerUnit: randomFood.carbs,
      fatsPerUnit: randomFood.fats,
      fiberPerUnit: randomFood.fiber || 1,
      confidence: 1.0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Save Confirmed Meal to History
  const handleSaveMeal = () => {
    const mealLog: MealLog = {
      id: `meal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType,
      items: items.map((it) => ({
        foodItem: {
          id: it.id,
          name: it.name,
          category: 'composite',
          servingSize: it.servingSize,
          servingUnit: it.servingUnit,
          calories: it.caloriesPerUnit,
          protein: it.proteinPerUnit,
          carbs: it.carbsPerUnit,
          fats: it.fatsPerUnit,
          fiber: it.fiberPerUnit,
        },
        quantity: it.quantity,
        calculatedNutrition: {
          calories: Math.round(it.caloriesPerUnit * it.quantity),
          protein: Math.round(it.proteinPerUnit * it.quantity * 10) / 10,
          carbs: Math.round(it.carbsPerUnit * it.quantity * 10) / 10,
          fats: Math.round(it.fatsPerUnit * it.quantity * 10) / 10,
          fiber: Math.round((it.fiberPerUnit || 0) * it.quantity * 10) / 10,
        },
      })),
      totalNutrition: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
        fiber: totalFiber,
      },
      photoUrl: selectedImage || undefined,
      notes: `${plateTitle} confirmed via AI Scanner`,
      aiAnalyzed: true,
    };

    addMealLog(mealLog);
    setIsSaved(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10B981', '#059669', '#3B82F6', '#F59E0B'],
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Title & Introduction */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Feature 1: AI Food-Image Recognition</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Scan & Analyze Your Meal
        </h1>
        <p className="text-stone-600 text-sm sm:text-base mt-1">
          Take a photo, upload an image, or pick a curated plate. NutriTrack AI identifies ingredients, calculates calories and macros, and allows you to customize portions before saving.
        </p>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image / Camera Capture & Sample Dishes */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm">
            {/* Viewport / Photo container */}
            <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : selectedImage ? (
                <Image
                  src={selectedImage}
                  alt="Meal preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              ) : (
                <div className="text-center p-6 text-stone-400">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No photo selected</p>
                </div>
              )}

              {/* Scanning Overlay Spinner */}
              {isScanning && (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                  <RefreshCw className="w-9 h-9 animate-spin text-emerald-400 mb-2" />
                  <span className="font-bold text-sm">Analyzing meal plate...</span>
                  <span className="text-xs text-stone-300">Estimating portions & micronutrients</span>
                </div>
              )}

              {/* Tag pill over photo */}
              <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Vision Active</span>
              </div>
            </div>

            {/* Action Bar under Photo */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {isCameraActive ? (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-full text-sm shadow-sm transition-all"
                  >
                    Capture Snapshot
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-full text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-4 py-2 rounded-full text-xs sm:text-sm transition-colors"
                    >
                      <Upload className="w-4 h-4 text-stone-600" />
                      <span>Upload Photo</span>
                    </button>

                    <button
                      onClick={startCamera}
                      className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-4 py-2 rounded-full text-xs sm:text-sm transition-colors"
                    >
                      <Camera className="w-4 h-4 text-stone-600" />
                      <span>Live Camera</span>
                    </button>
                  </div>

                  <button
                    onClick={() => runAiScan()}
                    disabled={isScanning}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-full transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>Re-analyze</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Preset Realistic Dishes */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Or Try One-Click Food Samples
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedImage(preset.image);
                    runAiScan(undefined, preset.id);
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-2xl border border-stone-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all group"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={preset.image}
                      alt={preset.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-800 truncate">{preset.title}</p>
                    <p className="text-[11px] text-stone-500">{preset.calories} kcal • {preset.protein}g P</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Detection Breakdown & Portion Editor */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm">
            {/* Header with Title & Meal Type Picker */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900">{plateTitle}</h2>
                <p className="text-xs text-stone-500 mt-0.5">Identified & verified by NutriTrack AI</p>
              </div>

              {/* Meal Category Selector */}
              <div className="flex items-center bg-stone-100 p-1 rounded-full text-xs font-semibold">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setMealType(t)}
                    className={`px-2.5 py-1 rounded-full capitalize transition-colors ${
                      mealType === t
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Observation Note */}
            <div className="mt-4 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-stone-700 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900 font-semibold">AI Nutritional Note: </strong>
                {aiInsight}
              </div>
            </div>

            {/* Total Macro Card Preview */}
            <div className="mt-5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Total Plate Nutrition
                </span>
                <span className="text-lg font-extrabold text-stone-900 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {totalCalories} kcal
                </span>
              </div>

              <MacroSplitBar
                proteinGrams={totalProtein}
                carbsGrams={totalCarbs}
                fatsGrams={totalFats}
              />

              <div className="mt-2 text-right">
                <span className="text-[11px] text-stone-500 font-medium">
                  Fiber: <strong className="text-stone-700">{totalFiber}g</strong>
                </span>
              </div>
            </div>

            {/* Detected Items List with User Portion Customization */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-900">
                  Detected Food Items ({items.length})
                </h3>
                <span className="text-[11px] text-stone-400">
                  Tap &minus;/+ to adjust portions
                </span>
              </div>

              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-300 transition-colors flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] bg-emerald-100/70 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                          {Math.round(item.confidence * 100)}% match
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {Math.round(item.caloriesPerUnit * item.quantity)} kcal •{' '}
                        {Math.round(item.proteinPerUnit * item.quantity * 10) / 10}g Protein •{' '}
                        {Math.round(item.carbsPerUnit * item.quantity * 10) / 10}g Carbs
                      </p>
                    </div>

                    {/* Portion Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-stone-100 rounded-full border border-stone-200">
                        <button
                          onClick={() => updateQuantity(item.id, -0.25)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold"
                        >
                          &minus;
                        </button>
                        <span className="text-xs font-bold text-stone-800 px-2 min-w-9 text-center">
                          {item.quantity}x
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 0.25)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Extra Side Dish Button */}
              <button
                onClick={addExtraItem}
                className="mt-3 w-full py-2.5 rounded-2xl border border-dashed border-stone-300 hover:border-emerald-400 hover:bg-emerald-50/50 text-xs font-semibold text-stone-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add side dish or dressing</span>
              </button>
            </div>

            {/* Confirm & Save Button */}
            <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-xs font-medium text-stone-500 hover:text-stone-800"
              >
                Discard & Exit
              </button>

              <button
                onClick={handleSaveMeal}
                disabled={items.length === 0 || isSaved}
                className="bg-[#00C27A] hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-full shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Logged to Dashboard!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Save Meal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
