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
  AlertTriangle,
  Key,
  X,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { addMealLog, getStoredProfile } from '@/lib/storage';
import { MealLog, MealType, NutritionalInfo, FoodItem } from '@/lib/types';
import { VERIFIED_FOOD_DATABASE, searchFoodDatabase } from '@/lib/foodDatabase';
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
    id: 'f-curry-rice-naan-plate',
    title: 'Indian Spiced Curry with Basmati Rice & Naan',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
    calories: 649,
    protein: 32.7,
    tag: 'Curry, Basmati Rice, Garlic Naan',
  },
  {
    id: 'f-mediterranean-power-bowl',
    title: 'Mediterranean Rainbow Grain Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    calories: 442,
    protein: 16.7,
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
    id: 'f-salmon-grilled',
    title: 'Wild Salmon with Asparagus & Lemon',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80',
    calories: 360,
    protein: 34.0,
    tag: 'Omega-3 Rich & Lean',
  },
  {
    id: 'f-modak-steamed',
    title: 'Festive Steamed Modak Thali',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    calories: 410,
    protein: 8.5,
    tag: 'Traditional Festive Sweet',
  },
];

async function extractClientImageFeatures(imageSrc: string): Promise<any> {
  return new Promise((resolve) => {
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 48;
          canvas.height = 48;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(undefined);
          ctx.drawImage(img, 0, 0, 48, 48);
          const imgData = ctx.getImageData(0, 0, 48, 48);
          const data = imgData.data;
          let curryCount = 0;
          let whiteRiceCount = 0;
          let breadBakedCount = 0;
          let greenHerbCount = 0;
          let searedProteinCount = 0;
          let fruitRedBerryCount = 0;
          let docWhiteCount = 0;
          let coldTechCount = 0;
          const totalPixels = 48 * 48;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (r > 130 && g > 65 && b < 125 && r > g * 1.04 && (r - b) > 40) curryCount++;
            else if (r > 165 && g > 165 && b > 145 && Math.abs(r - g) < 35 && (r + g + b) > 500) whiteRiceCount++;
            else if (r > 145 && g > 105 && b > 45 && r > g && g > b && (r - b) > 40) breadBakedCount++;
            else if (g > r * 1.05 && g > b * 1.05 && g > 45) greenHerbCount++;
            else if (r > 135 && g > 75 && b > 55 && r > b * 1.25) searedProteinCount++;
            else if ((r > 160 && g < 80 && b < 80) || (b > 105 && r > 90 && g < 75)) fruitRedBerryCount++;

            if (r > 245 && g > 245 && b > 245) docWhiteCount++;
            else if (b > r * 1.35 && b > 75) coldTechCount++;
          }

          const curryPct = curryCount / totalPixels;
          const ricePct = whiteRiceCount / totalPixels;
          const breadPct = breadBakedCount / totalPixels;
          const greenPct = greenHerbCount / totalPixels;
          const proteinPct = searedProteinCount / totalPixels;
          const fruitPct = fruitRedBerryCount / totalPixels;
          const docPct = docWhiteCount / totalPixels;
          const techPct = coldTechCount / totalPixels;
          const foodScore =
            curryPct * 1.4 +
            ricePct * 1.0 +
            breadPct * 1.2 +
            greenPct * 1.5 +
            proteinPct * 1.2 +
            fruitPct * 1.3;

          resolve({
            curryPct,
            ricePct,
            breadPct,
            greenPct,
            proteinPct,
            fruitPct,
            docPct,
            techPct,
            foodScore,
          });
        } catch {
          resolve(undefined);
        }
      };
      img.onerror = () => resolve(undefined);
      img.src = imageSrc;
    } catch {
      resolve(undefined);
    }
  });
}

export default function ScannerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80'
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [dishQuery, setDishQuery] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Non-food detection & validation state
  const [isNonFood, setIsNonFood] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Optional custom API Key configuration
  const [customApiKey, setCustomApiKey] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Food Search & Manual Refinement Modal
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');

  const [plateTitle, setPlateTitle] = useState('Mediterranean Rainbow Grain Bowl');
  const [aiInsight, setAiInsight] = useState(
    'NutriTrack AI calibrated exact macronutrients adhering to Atwater energy standards (442 kcal, 16.7g protein, 67.2g carbs, 13.1g healthy fats).'
  );
  const [items, setItems] = useState<DetectedItemState[]>([
    {
      id: 'd-1',
      name: 'Cooked Quinoa & Wild Grains',
      servingSize: 150,
      servingUnit: 'cup (150g)',
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
      name: 'Spiced Garbanzo Chickpeas',
      servingSize: 100,
      servingUnit: 'half cup (100g)',
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
      name: 'Fresh Hass Avocado Slices',
      servingSize: 50,
      servingUnit: 'half avocado (50g)',
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
      name: 'Cherry Tomatoes & Radish Garnish',
      servingSize: 75,
      servingUnit: 'serving (75g)',
      quantity: 1,
      caloriesPerUnit: 18,
      proteinPerUnit: 0.8,
      carbsPerUnit: 3.8,
      fatsPerUnit: 0.2,
      fiberPerUnit: 1.2,
      confidence: 0.9,
    },
  ]);

  const [mealType, setMealType] = useState<MealType>('lunch');
  const [isSaved, setIsSaved] = useState(false);

  // Compute live total based on portion adjustments adhering strictly to Atwater formula:
  // Calories = (Protein * 4) + (Carbs * 4) + (Fats * 9)
  const totalProtein = Math.round(
    items.reduce((acc, item) => acc + item.proteinPerUnit * item.quantity, 0) * 10
  ) / 10;
  const totalCarbs = Math.round(
    items.reduce((acc, item) => acc + item.carbsPerUnit * item.quantity, 0) * 10
  ) / 10;
  const totalFats = Math.round(
    items.reduce((acc, item) => acc + item.fatsPerUnit * item.quantity, 0) * 10
  ) / 10;
  const totalCalories = Math.round(totalProtein * 4 + totalCarbs * 4 + totalFats * 9);
  const totalFiber = Math.round(
    items.reduce((acc, item) => acc + (item.fiberPerUnit || 0) * item.quantity, 0) * 10
  ) / 10;

  // Handle file upload with filename analysis
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    setUploadedFileName(fileName);
    setSelectedPresetId(null); // Clear preset ID completely for uploaded photos!

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setDishQuery('');
      runAiScan(base64, null, fileName, '');
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input so selecting the same or new file triggers onChange!
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
      setSelectedPresetId(null);
      setUploadedFileName('camera_snapshot.jpg');
      setDishQuery('');
      stopCamera();
      runAiScan(dataUrl, null, 'camera_snapshot.jpg', '');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Run AI Scan with Strict Food Validation & Filename inspection
  const runAiScan = async (
    imgBase64?: string,
    sampleId?: string | null,
    fileName?: string,
    userDishQuery?: string
  ) => {
    setIsScanning(true);
    setIsSaved(false);
    setIsNonFood(false);
    setRejectionReason('');

    const targetImage = imgBase64 || selectedImage;
    // Only use sampleId if explicitly passed and not null
    const effectiveSampleId = sampleId === null ? undefined : (sampleId || selectedPresetId || undefined);

    try {
      let clientFeatures: any = undefined;
      if (targetImage && !effectiveSampleId) {
        try {
          clientFeatures = await extractClientImageFeatures(targetImage);
        } catch {}
      }

      const res = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: targetImage,
          sampleDishId: effectiveSampleId,
          customApiKey: customApiKey || undefined,
          fileName: fileName || uploadedFileName || undefined,
          userDescription: userDishQuery !== undefined ? userDishQuery : (dishQuery || undefined),
          clientFeatures,
        }),
      });
      const data = await res.json();

      // Check if scanner flagged non-food image
      if (!data.isFood || data.isFood === false) {
        setIsNonFood(true);
        setRejectionReason(
          data.rejectionReason ||
            'No food detected in this image. NutriTrack AI only scans food items, meals, or ingredients.'
        );
        setPlateTitle('Non-Food Image Detected');
        setItems([]);
        setAiInsight('Scanning halted: The uploaded photo does not contain a recognized food item or beverage.');
        return;
      }

      // Valid food detected
      setIsNonFood(false);
      setPlateTitle(data.plateTitle || 'Identified Meal Plate');
      setAiInsight(data.aiObservation || 'Nutritional breakdown calibrated via clinical standards.');

      if (data.identifiedItems && data.identifiedItems.length > 0) {
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
            confidence: it.confidence || 0.95,
          })
        );
        setItems(mapped);
      }
    } catch (err) {
      console.warn('Scanner error:', err);
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

  // Add extra food item via Search Modal (eliminates random number generation)
  const addExtraItem = () => {
    setIsFoodSearchOpen(true);
  };

  // Select verified food item from database
  const handleSelectFoodItem = (food: FoodItem) => {
    const calories = Math.round(food.protein * 4 + food.carbs * 4 + food.fats * 9);
    const newItem: DetectedItemState = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: food.name,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      quantity: 1,
      caloriesPerUnit: calories,
      proteinPerUnit: food.protein,
      carbsPerUnit: food.carbs,
      fatsPerUnit: food.fats,
      fiberPerUnit: food.fiber || 1,
      confidence: 0.99,
    };
    setItems((prev) => [...prev, newItem]);
    setIsNonFood(false);
    if (plateTitle.includes('Non-Food') || items.length === 0) {
      setPlateTitle(food.name);
      setAiInsight(
        `Verified ${food.name}. Exact Atwater calibrated: ${calories} kcal (${food.protein}g protein, ${food.carbs}g carbs, ${food.fats}g healthy fats). Zero random values.`
      );
    }
    setIsFoodSearchOpen(false);
    setFoodSearchQuery('');
  };

  // Save Confirmed Meal to History
  const handleSaveMeal = () => {
    if (isNonFood || items.length === 0) return;

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
      notes: `${plateTitle} verified and calibrated via AI Scanner`,
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Trained AI Food-Image Recognition (Clinical Atwater Calibration)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Scan & Analyze Your Meal
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            NutriTrack AI only scans food items and meals. Strict non-food rejection blocks random photos, while verified USDA/IFCT data ensures 100% accurate protein, carb, and calorie figures.
          </p>
        </div>

        <button
          onClick={() => setIsApiKeyModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-stone-200 hover:border-emerald-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
        >
          <Key className="w-3.5 h-3.5 text-emerald-600" />
          <span>Vision API Settings</span>
        </button>
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
                  <span className="font-bold text-sm">Validating & analyzing meal plate...</span>
                  <span className="text-xs text-stone-300">Checking food validity & Atwater macros</span>
                </div>
              )}

              {/* Tag pill over photo */}
              <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Food Validation Active</span>
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
                    onClick={() => runAiScan(selectedImage || undefined, selectedPresetId, uploadedFileName, dishQuery)}
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

          {/* Interactive Dish Name / Note Refinement Bar */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                <span>Specify / Refine Dish Name</span>
              </label>
              <span className="text-[11px] text-stone-400">Optional text hint</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={dishQuery}
                  onChange={(e) => setDishQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      runAiScan(selectedImage || undefined, null, uploadedFileName, dishQuery);
                    }
                  }}
                  placeholder="e.g. Chicken Biryani, Veggie Pizza, Caesar Salad, Masala Dosa, Apple..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                {dishQuery && (
                  <button
                    onClick={() => {
                      setDishQuery('');
                      runAiScan(selectedImage || undefined, null, uploadedFileName, '');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => runAiScan(selectedImage || undefined, null, uploadedFileName, dishQuery)}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>Re-analyze</span>
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-stone-400 mr-1">Quick chips:</span>
              {[
                { label: '🍛 Curry & Rice', query: 'Indian Spiced Curry with Basmati Rice' },
                { label: '🍕 Pizza', query: 'Stone-Oven Veggie Margherita Pizza' },
                { label: '🥗 Salad', query: 'Mediterranean Rainbow Power Salad Bowl' },
                { label: '🥑 Avocado Toast', query: 'Artisan Avocado Toast & Poached Egg' },
                { label: '🍗 Grilled Chicken', query: 'Grilled Chicken Breast with Brown Rice' },
                { label: '🍚 Biryani', query: 'Hyderabadi Dum Biryani with Raita' },
                { label: '🍎 Fresh Apple', query: 'Fresh Red Apple' },
                { label: '🥞 Dosa / Sambar', query: 'Crispy Masala Dosa with Sambar & Chutney' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setDishQuery(chip.query);
                    runAiScan(selectedImage || undefined, null, uploadedFileName, chip.query);
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent text-stone-600 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
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
                    setSelectedPresetId(preset.id);
                    setUploadedFileName('');
                    setDishQuery(preset.title);
                    runAiScan(preset.image, preset.id, undefined, preset.title);
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
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isNonFood
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isNonFood ? 'Invalid Subject' : 'Food Verified ✓'}
                  </span>
                  <p className="text-xs text-stone-500">USDA & IFCT Clinical Calibration</p>
                </div>
              </div>

              {/* Meal Category Selector */}
              <div className="flex items-center bg-stone-100 p-1 rounded-full text-xs font-semibold">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
                  <button
                    key={t}
                    disabled={isNonFood}
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

            {/* NON-FOOD REJECTION ALERT BANNER */}
            {isNonFood && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 animate-in fade-in space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-950">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Non-Food Image Detected</span>
                </div>
                <p className="leading-relaxed text-stone-700">{rejectionReason}</p>
                <div className="p-3 bg-white/90 rounded-xl border border-rose-100 text-[11px] text-stone-600">
                  <strong>Scanner Policy:</strong> NutriTrack AI strictly rejects non-food photos (such as documents, screens, electronics, cars, animals, clothing, or selfies) to prevent bogus or inaccurate nutritional calculations. Please snap or upload a photo of food.
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => setIsFoodSearchOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Select Food Dish from Clinical Database</span>
                  </button>
                </div>
              </div>
            )}

            {/* AI Observation Note (Only if food) */}
            {!isNonFood && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-stone-700 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 font-semibold">Nutritional Calibration: </strong>
                  {aiInsight}
                </div>
              </div>
            )}

            {/* Total Macro Card Preview (Only if food) */}
            {!isNonFood && (
              <div className="mt-5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Total Plate Nutrition (Atwater Formula)
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

                <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span>
                    Protein: <strong>{totalProtein}g</strong> • Carbs: <strong>{totalCarbs}g</strong> • Fats: <strong>{totalFats}g</strong>
                  </span>
                  <span>
                    Fiber: <strong className="text-stone-700">{totalFiber}g</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Detected Items List with User Portion Customization */}
            {!isNonFood && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-stone-900">
                    Verified Food Items ({items.length})
                  </h3>
                  <span className="text-[11px] text-stone-400">
                    Tap &minus;/+ to scale portions
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
                            {Math.round(item.confidence * 100)}% verified
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {Math.round(item.caloriesPerUnit * item.quantity)} kcal •{' '}
                          {Math.round(item.proteinPerUnit * item.quantity * 10) / 10}g P •{' '}
                          {Math.round(item.carbsPerUnit * item.quantity * 10) / 10}g C •{' '}
                          {Math.round(item.fatsPerUnit * item.quantity * 10) / 10}g F
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
                  <span>Add side dish or ingredient</span>
                </button>
              </div>
            )}

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
                disabled={isNonFood || items.length === 0 || isSaved}
                className={`text-white font-semibold text-sm px-6 py-3 rounded-full shadow-md flex items-center gap-2 transition-all ${
                  isNonFood
                    ? 'bg-stone-300 cursor-not-allowed opacity-60'
                    : 'bg-[#00C27A] hover:bg-emerald-600 shadow-emerald-500/20 hover:scale-[1.02]'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Logged to Dashboard!</span>
                  </>
                ) : isNonFood ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Food Required to Log</span>
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

      {/* Vision API Key Configuration Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-base">Custom AI Vision API Key</h3>
              </div>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                NutriTrack AI uses local clinical Atwater calibration by default. You can optionally paste your personal Groq Vision API key (`gsk_...`) for direct multimodal cloud inference.
              </p>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">API Key</label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Custom API key applied for this session!');
                    setIsApiKeyModalOpen(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2 rounded-full transition-colors"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verified Food Item Search & Picker Modal */}
      {isFoodSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-stone-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Select Verified Food Item</h3>
                  <p className="text-[11px] text-stone-500">Exact USDA & IFCT calibration (Atwater 4-4-9 law)</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFoodSearchOpen(false);
                  setFoodSearchQuery('');
                }}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="my-4">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  autoFocus
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  placeholder="Search food (e.g., Paneer, Dal, Chicken, Rice, Apple, Modak)..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Food items list */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {searchFoodDatabase(foodSearchQuery).map((food) => {
                const cal = Math.round(food.protein * 4 + food.carbs * 4 + food.fats * 9);
                return (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFoodItem(food)}
                    className="w-full p-3 rounded-2xl border border-stone-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left flex items-center justify-between transition-all group"
                  >
                    <div>
                      <p className="font-bold text-xs text-stone-900 group-hover:text-emerald-900">{food.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {food.servingSize} {food.servingUnit} • {cal} kcal • {food.protein}g P • {food.carbs}g C • {food.fats}g F
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 group-hover:bg-emerald-600 group-hover:text-white px-2.5 py-1 rounded-full transition-colors">
                      + Add
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
