'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Flame,
  Utensils,
  AlertTriangle,
  X,
  Search,
  Scale,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { addMealLog } from '@/lib/storage';
import { MealLog, MealType, FoodItem } from '@/lib/types';
import { searchFoodDatabase } from '@/lib/foodDatabase';
import MacroSplitBar from '@/components/MacroSplitBar';

interface DetectedItemState {
  id: string;
  foodId?: string;
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
  sugarPerUnit?: number;
  potassiumPerUnit?: number;
  calciumPerUnit?: number;
  ironPerUnit?: number;
  confidence?: number;
  nutritionFlags?: string[];
}

interface ServingOption {
  label: string;
  grams: number;
  weight_basis?: string;
}

interface CandidateItem {
  label: string;
  display: string;
  food_id: string;
  match_quality?: string;
  probability?: number;
}

type ScanStatus =
  | 'idle'
  | 'accepted'
  | 'needs_confirmation'
  | 'rejected_non_food'
  | 'ambiguous'
  | 'low_quality_image'
  | 'packaged_label_detected'
  | 'model_unavailable'
  | 'invalid_image'
  | 'scanner_error';

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

export default function ScannerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80'
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Scanner status and feedback state
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Servings and Grams portion selection
  const [servingOptions, setServingOptions] = useState<ServingOption[]>([]);
  const [activeFoodId, setActiveFoodId] = useState<string | null>(null);
  const [customGrams, setCustomGrams] = useState<number>(100);
  const [isUpdatingPortion, setIsUpdatingPortion] = useState(false);

  // Food Search Modal
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [remoteSearchResults, setRemoteSearchResults] = useState<Array<{ id: string; name: string; score: number }>>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);

  const [plateTitle, setPlateTitle] = useState('Mediterranean Rainbow Grain Bowl');
  const [aiInsight, setAiInsight] = useState(
    'Reference nutrition values loaded. Adjust portion in grams to match your exact meal.'
  );

  const [items, setItems] = useState<DetectedItemState[]>([
    {
      id: 'd-1',
      foodId: 'f-quinoa-cooked',
      name: 'Cooked Quinoa',
      servingSize: 150,
      servingUnit: 'g',
      quantity: 1,
      caloriesPerUnit: 180,
      proteinPerUnit: 6.0,
      carbsPerUnit: 32.0,
      fatsPerUnit: 2.8,
      fiberPerUnit: 4.0,
      confidence: undefined,
    },
    {
      id: 'd-2',
      foodId: 'f-chickpeas-boiled',
      name: 'Boiled Garbanzo Chickpeas',
      servingSize: 100,
      servingUnit: 'g',
      quantity: 1,
      caloriesPerUnit: 164,
      proteinPerUnit: 8.9,
      carbsPerUnit: 27.4,
      fatsPerUnit: 2.6,
      fiberPerUnit: 7.6,
      confidence: undefined,
    },
    {
      id: 'd-3',
      foodId: 'f-avocado-raw',
      name: 'Fresh Hass Avocado',
      servingSize: 50,
      servingUnit: 'g',
      quantity: 1,
      caloriesPerUnit: 80,
      proteinPerUnit: 1.0,
      carbsPerUnit: 4.0,
      fatsPerUnit: 7.5,
      fiberPerUnit: 3.4,
      confidence: undefined,
    },
    {
      id: 'd-4',
      foodId: 'f-cherry-tomatoes',
      name: 'Cherry Tomatoes',
      servingSize: 75,
      servingUnit: 'g',
      quantity: 1,
      caloriesPerUnit: 18,
      proteinPerUnit: 0.8,
      carbsPerUnit: 3.8,
      fatsPerUnit: 0.2,
      fiberPerUnit: 1.2,
      confidence: undefined,
    },
  ]);

  const [mealType, setMealType] = useState<MealType>('lunch');
  const [isSaved, setIsSaved] = useState(false);

  // Compute live total based on portion adjustments
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

  // Return undefined if no item provides fiber
  const hasFiberData = items.some((item) => item.fiberPerUnit !== undefined);
  const totalFiber = hasFiberData
    ? Math.round(
        items.reduce((acc, item) => acc + (item.fiberPerUnit || 0) * item.quantity, 0) * 10
      ) / 10
    : undefined;

  // Fetch serving options whenever activeFoodId changes
  const fetchServingOptions = useCallback(async (foodId: string) => {
    try {
      const res = await fetch(`/api/scan-food/search?foodId=${encodeURIComponent(foodId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.options && Array.isArray(data.options)) {
          setServingOptions(data.options);
          if (data.options.length > 0) {
            setCustomGrams(data.options[0].grams);
          }
          return;
        }
      }
    } catch {}
    setServingOptions([{ label: '100 g', grams: 100 }]);
  }, []);

  // Update primary item portion via server /nutrition calculation
  const handleUpdatePortionGrams = async (grams: number) => {
    if (!activeFoodId || grams <= 0) return;
    setCustomGrams(grams);
    setIsUpdatingPortion(true);
    try {
      const res = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: activeFoodId, grams }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.identifiedItems?.length > 0) {
          const fresh = data.identifiedItems[0];
          setItems((prev) =>
            prev.map((it) => {
              if (it.foodId === activeFoodId || prev.length === 1) {
                return {
                  ...it,
                  servingSize: fresh.servingSize,
                  servingUnit: fresh.servingUnit,
                  caloriesPerUnit: fresh.caloriesPerUnit,
                  proteinPerUnit: fresh.proteinPerUnit,
                  carbsPerUnit: fresh.carbsPerUnit,
                  fatsPerUnit: fresh.fatsPerUnit,
                  fiberPerUnit: fresh.fiberPerUnit,
                  sodiumPerUnit: fresh.sodiumPerUnit,
                  nutritionFlags: fresh.nutritionFlags,
                };
              }
              return it;
            })
          );
        }
      }
    } catch (err) {
      console.warn('Failed to recalculate portion:', err);
    } finally {
      setIsUpdatingPortion(false);
    }
  };

  // Convert image URL or File to Data URL
  const convertUrlToDataUrl = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return url;
    }
  };

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScanStatus('invalid_image');
      setRejectionReason('The uploaded file is not a supported image format. Please upload a JPEG, PNG, or WebP photo.');
      setItems([]);
      e.target.value = '';
      return;
    }

    setSelectedPresetId(null);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      runAiScan(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Camera Handlers
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch {
      alert('Camera access denied or unavailable. You can upload an image or select a preset.');
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

  // Run AI Scan with the standalone Python Scanner proxy
  const runAiScan = async (imgBase64?: string) => {
    setIsScanning(true);
    setIsSaved(false);
    setRejectionReason('');
    setCandidates([]);
    setNeedsConfirmation(false);

    let targetImage = imgBase64 || selectedImage;
    if (targetImage && !targetImage.startsWith('data:')) {
      targetImage = await convertUrlToDataUrl(targetImage);
    }

    if (!targetImage) {
      setIsScanning(false);
      return;
    }

    try {
      const res = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: targetImage }),
      });
      const data = await res.json();
      applyScanResponse(data);
    } catch {
      setScanStatus('scanner_error');
      setRejectionReason('Unable to reach the scanner service. Please verify the scanner is running or search manually.');
      setItems([]);
    } finally {
      setIsScanning(false);
    }
  };

  // Select candidate or manual food item
  const handleSelectFoodId = async (foodId: string, grams?: number) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId, grams }),
      });
      const data = await res.json();
      if (data.success && data.identifiedItems?.length > 0) {
        applyScanResponse(data);
        setActiveFoodId(foodId);
        fetchServingOptions(foodId);
      }
    } catch {
      alert('Could not retrieve nutrition for selected item.');
    } finally {
      setIsScanning(false);
    }
  };

  // Apply server response to state
  const applyScanResponse = (data: any) => {
    const status: ScanStatus = data.scanStatus || (data.isFood ? 'accepted' : 'rejected_non_food');
    setScanStatus(status);
    setCandidates(data.candidates || []);
    setNeedsConfirmation(Boolean(data.needsConfirmation));

    if (data.rejectionReason) {
      setRejectionReason(data.rejectionReason);
    }

    if (!data.isFood || status !== 'accepted') {
      if (status !== 'needs_confirmation') {
        setItems([]);
      }
      setPlateTitle(data.plateTitle || 'Could not identify');
      setAiInsight(data.aiObservation || data.rejectionReason || 'No food detected.');
      return;
    }

    // Status is accepted
    setPlateTitle(data.plateTitle || 'Identified Food Item');
    setAiInsight(data.aiObservation || 'Nutritional breakdown retrieved from verified reference data.');

    if (data.identifiedItems && data.identifiedItems.length > 0) {
      const mapped: DetectedItemState[] = data.identifiedItems.map((it: any, idx: number) => ({
        id: `scan-${Date.now()}-${idx}`,
        foodId: it.foodId || it.id,
        name: it.name,
        servingSize: it.servingSize,
        servingUnit: it.servingUnit || 'g',
        quantity: 1,
        caloriesPerUnit: it.caloriesPerUnit ?? it.nutrition?.calories ?? 0,
        proteinPerUnit: it.proteinPerUnit ?? it.nutrition?.protein ?? 0,
        carbsPerUnit: it.carbsPerUnit ?? it.nutrition?.carbs ?? 0,
        fatsPerUnit: it.fatsPerUnit ?? it.nutrition?.fats ?? 0,
        fiberPerUnit: it.fiberPerUnit ?? it.nutrition?.fiber,
        sodiumPerUnit: it.sodiumPerUnit ?? it.nutrition?.sodium,
        sugarPerUnit: it.sugarPerUnit ?? it.nutrition?.sugar,
        potassiumPerUnit: it.potassiumPerUnit ?? it.nutrition?.potassium,
        calciumPerUnit: it.calciumPerUnit ?? it.nutrition?.calcium,
        ironPerUnit: it.ironPerUnit ?? it.nutrition?.iron,
        confidence: it.confidence,
        nutritionFlags: it.nutritionFlags,
      }));
      setItems(mapped);

      const firstFoodId = mapped[0]?.foodId;
      if (firstFoodId) {
        setActiveFoodId(firstFoodId);
        fetchServingOptions(firstFoodId);
      }
    }
  };

  // Update quantity / portion multiplier
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

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Add extra food item via manual search
  const handleSelectFoodItem = (food: FoodItem) => {
    const calories = Math.round(food.protein * 4 + food.carbs * 4 + food.fats * 9);
    const newItem: DetectedItemState = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      foodId: food.id,
      name: food.name,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      quantity: 1,
      caloriesPerUnit: calories,
      proteinPerUnit: food.protein,
      carbsPerUnit: food.carbs,
      fatsPerUnit: food.fats,
      fiberPerUnit: food.fiber,
      confidence: undefined,
    };
    setItems((prev) => [...prev, newItem]);
    setScanStatus('accepted');
    if (plateTitle.includes('Could not') || items.length === 0) {
      setPlateTitle(food.name);
      setAiInsight(`Verified ${food.name} added manually.`);
      setActiveFoodId(food.id);
      fetchServingOptions(food.id);
    }
    setIsFoodSearchOpen(false);
    setFoodSearchQuery('');
  };

  // Remote search proxy
  useEffect(() => {
    if (!foodSearchQuery.trim()) {
      setRemoteSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingRemote(true);
      try {
        const res = await fetch(`/api/scan-food/search?q=${encodeURIComponent(foodSearchQuery.slice(0, 80))}`);
        if (res.ok) {
          const data = await res.json();
          setRemoteSearchResults(data.results || []);
        }
      } catch {
        setRemoteSearchResults([]);
      } finally {
        setIsSearchingRemote(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [foodSearchQuery]);

  // Save Confirmed Meal to History
  const handleSaveMeal = () => {
    if (items.length === 0 || isNonFoodStatus(scanStatus)) return;

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
          fiber: it.fiberPerUnit !== undefined ? Math.round(it.fiberPerUnit * it.quantity * 10) / 10 : undefined,
        },
      })),
      totalNutrition: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
        fiber: totalFiber !== undefined ? totalFiber : 0,
      },
      photoUrl: selectedImage || undefined,
      notes: `${plateTitle} logged via NutriTrack Scanner`,
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

  const isNonFoodStatus = (st: ScanStatus) => {
    return (
      st === 'rejected_non_food' ||
      st === 'ambiguous' ||
      st === 'low_quality_image' ||
      st === 'packaged_label_detected' ||
      st === 'model_unavailable' ||
      st === 'invalid_image' ||
      st === 'scanner_error'
    );
  };

  const getStatusDetails = (st: ScanStatus) => {
    switch (st) {
      case 'rejected_non_food':
        return {
          title: 'Non-Food Image Detected',
          desc: rejectionReason || 'The photo does not contain a recognized food item, beverage, or meal.',
          badge: 'Non-Food Detected',
          badgeColor: 'bg-rose-100 text-rose-800',
        };
      case 'ambiguous':
        return {
          title: 'Ambiguous Image',
          desc: rejectionReason || 'The image could not be definitively classified as food. Please try a clearer angle or search manually.',
          badge: 'Ambiguous',
          badgeColor: 'bg-amber-100 text-amber-800',
        };
      case 'low_quality_image':
        return {
          title: 'Low Quality Image',
          desc: rejectionReason || 'The image is too blurry, dark, or low-resolution for reliable analysis.',
          badge: 'Low Quality',
          badgeColor: 'bg-amber-100 text-amber-800',
        };
      case 'packaged_label_detected':
        return {
          title: 'Nutrition Facts Label Detected',
          desc: rejectionReason || 'A printed nutrition facts label was detected. Use manual search or enter the values directly.',
          badge: 'Label Detected',
          badgeColor: 'bg-blue-100 text-blue-800',
        };
      case 'model_unavailable':
        return {
          title: 'AI Model Training Pending',
          desc: rejectionReason || 'Neural food classifier weights are not loaded yet. Photo recognition is disabled until model training is complete. Please search for your food manually below.',
          badge: 'Model Unavailable',
          badgeColor: 'bg-indigo-100 text-indigo-800',
        };
      case 'invalid_image':
        return {
          title: 'Invalid Image File',
          desc: rejectionReason || 'Unsupported or corrupt image format. Please upload a valid JPEG, PNG, or WebP photo.',
          badge: 'Invalid Image',
          badgeColor: 'bg-rose-100 text-rose-800',
        };
      case 'scanner_error':
        return {
          title: 'Scanner Service Unavailable',
          desc: rejectionReason || 'Could not connect to the scanner service. You can search our verified database manually.',
          badge: 'Service Offline',
          badgeColor: 'bg-stone-200 text-stone-800',
        };
      case 'needs_confirmation':
        return {
          title: 'Please Confirm Your Food',
          desc: 'Select the matching food item from the candidate list below or search manually.',
          badge: 'Confirmation Needed',
          badgeColor: 'bg-amber-100 text-amber-800',
        };
      case 'accepted':
      default:
        return {
          title: plateTitle,
          desc: aiInsight,
          badge: 'Food Verified ✓',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        };
    }
  };

  const statusInfo = getStatusDetails(scanStatus);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Title & Introduction */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Standalone Multimodal Food Scanner Pipeline</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Scan & Analyze Your Meal
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-1">
            Capture or upload a meal photo. Food items are validated against our verified nutrition database with transparent reference values and configurable portions.
          </p>
        </div>

        <button
          onClick={() => setIsFoodSearchOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-200 hover:border-emerald-300 hover:bg-stone-50 text-xs sm:text-sm font-semibold text-stone-700 transition-colors shadow-xs"
        >
          <Search className="w-4 h-4 text-emerald-600" />
          <span>Manual Food Search</span>
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
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
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
                  <span className="font-bold text-sm">Evaluating photo & nutrition...</span>
                  <span className="text-xs text-stone-300">Communicating with scanner engine</span>
                </div>
              )}

              {/* Tag pill over photo */}
              <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{statusInfo.badge}</span>
              </div>
            </div>

            {/* Action Bar under Photo */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
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
                    onClick={() => runAiScan(selectedImage || undefined)}
                    disabled={isScanning}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-full transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>Re-scan</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Preset Food Samples */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Or Try Pre-Curated Meal Plates
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedImage(preset.image);
                    setSelectedPresetId(preset.id);
                    runAiScan(preset.image);
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-2xl border text-left transition-all group ${
                    selectedPresetId === preset.id
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-stone-100 hover:border-emerald-300 hover:bg-emerald-50/40'
                  }`}
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
                    <p className="text-[11px] text-stone-500">
                      {preset.calories} kcal • {preset.protein}g P
                    </p>
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
                <h2 className="text-xl font-extrabold text-stone-900">{statusInfo.title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusInfo.badgeColor}`}>
                    {statusInfo.badge}
                  </span>
                  <p className="text-xs text-stone-500">Clinical Reference Database</p>
                </div>
              </div>

              {/* Meal Category Selector */}
              <div className="flex items-center bg-stone-100 p-1 rounded-full text-xs font-semibold">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((t) => (
                  <button
                    key={t}
                    disabled={isNonFoodStatus(scanStatus)}
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

            {/* STATUS BANNER (for non-accepted or model unavailable) */}
            {isNonFoodStatus(scanStatus) && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 animate-in fade-in space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{statusInfo.title}</span>
                </div>
                <p className="leading-relaxed text-stone-700">{statusInfo.desc}</p>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsFoodSearchOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 px-4 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Search manually</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                    <span>Try another photo</span>
                  </button>
                </div>
              </div>
            )}

            {/* NEEDS CONFIRMATION: Show candidate chips */}
            {scanStatus === 'needs_confirmation' && candidates.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-sm">Select Matching Food Candidate</span>
                  <span className="text-[11px] text-emerald-700">Tap to confirm item</span>
                </div>
                <p className="text-stone-600 text-xs">
                  The scanner detected multiple potential matches. Click the candidate that matches your food:
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {candidates.map((cand) => (
                    <button
                      key={cand.food_id || cand.label}
                      onClick={() => handleSelectFoodId(cand.food_id)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
                    >
                      {cand.display || cand.label}
                      {cand.probability !== undefined && (
                        <span className="ml-1 text-[10px] font-normal opacity-80">
                          ({Math.round(cand.probability * 100)}%)
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">Not listed here?</span>
                  <button
                    onClick={() => setIsFoodSearchOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <Search className="w-3 h-3" />
                    <span>Search manually</span>
                  </button>
                </div>
              </div>
            )}

            {/* AI Observation Note (Only if food accepted) */}
            {scanStatus === 'accepted' && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-stone-700 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 font-semibold">Reference Data: </strong>
                  {aiInsight}
                </div>
              </div>
            )}

            {/* Total Macro Card Preview (Only if food accepted) */}
            {scanStatus === 'accepted' && items.length > 0 && (
              <div className="mt-5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Total Estimated Nutrition
                  </span>
                  <span className="text-lg font-extrabold text-stone-900 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {totalCalories} kcal
                  </span>
                </div>

                <MacroSplitBar proteinGrams={totalProtein} carbsGrams={totalCarbs} fatsGrams={totalFats} />

                <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span>
                    Protein: <strong>{totalProtein}g</strong> • Carbs: <strong>{totalCarbs}g</strong> • Fats:{' '}
                    <strong>{totalFats}g</strong>
                  </span>
                  <span>
                    Fiber: <strong>{totalFiber !== undefined ? `${totalFiber}g` : 'n/a'}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Grams & Serving Selector (Options from Servings Endpoint) */}
            {scanStatus === 'accepted' && items.length > 0 && (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Serving & Grams Portion</span>
                  </label>
                  {isUpdatingPortion && (
                    <span className="text-[11px] text-emerald-600 animate-pulse flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Recalculating...
                    </span>
                  )}
                </div>

                {servingOptions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[11px] text-stone-500 mr-1">Preset portions:</span>
                    {servingOptions.map((opt) => (
                      <button
                        key={`${opt.label}-${opt.grams}`}
                        onClick={() => handleUpdatePortionGrams(opt.grams)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          customGrams === opt.grams
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      value={customGrams}
                      onChange={(e) => setCustomGrams(Math.max(1, Number(e.target.value) || 0))}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Portion in grams"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-bold">
                      grams
                    </span>
                  </div>

                  <button
                    onClick={() => handleUpdatePortionGrams(customGrams)}
                    disabled={isUpdatingPortion}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Apply Grams
                  </button>
                </div>
              </div>
            )}

            {/* Detected Items List with User Portion Customization */}
            {scanStatus === 'accepted' && items.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-stone-900">Food Items ({items.length})</h3>
                  <span className="text-[11px] text-stone-400">Scale quantity / portions</span>
                </div>

                <div className="space-y-2.5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-300 transition-colors flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">{item.name}</span>
                          {item.confidence !== undefined ? (
                            <span className="text-[10px] bg-emerald-100/70 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                              {Math.round(item.confidence * 100)}% confidence
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {Math.round(item.caloriesPerUnit * item.quantity)} kcal •{' '}
                          {Math.round(item.proteinPerUnit * item.quantity * 10) / 10}g P •{' '}
                          {Math.round(item.carbsPerUnit * item.quantity * 10) / 10}g C •{' '}
                          {Math.round(item.fatsPerUnit * item.quantity * 10) / 10}g F
                          {item.fiberPerUnit !== undefined && (
                            <span> • {Math.round(item.fiberPerUnit * item.quantity * 10) / 10}g fiber</span>
                          )}
                          {item.sodiumPerUnit !== undefined && (
                            <span> • {Math.round(item.sodiumPerUnit * item.quantity)}mg Na</span>
                          )}
                        </p>
                      </div>

                      {/* Portion Multiplier Stepper */}
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
                  onClick={() => setIsFoodSearchOpen(true)}
                  className="mt-3 w-full py-2.5 rounded-2xl border border-dashed border-stone-300 hover:border-emerald-400 hover:bg-emerald-50/50 text-xs font-semibold text-stone-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another food item or side</span>
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
                disabled={isNonFoodStatus(scanStatus) || items.length === 0 || isSaved}
                className={`text-white font-semibold text-sm px-6 py-3 rounded-full shadow-md flex items-center gap-2 transition-all ${
                  isNonFoodStatus(scanStatus) || items.length === 0
                    ? 'bg-stone-300 cursor-not-allowed opacity-60'
                    : 'bg-[#00C27A] hover:bg-emerald-600 shadow-emerald-500/20 hover:scale-[1.02]'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Logged to Dashboard!</span>
                  </>
                ) : isNonFoodStatus(scanStatus) || items.length === 0 ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Valid Food Required</span>
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

      {/* Verified Food Item Search & Picker Modal */}
      {isFoodSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-stone-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Select Verified Food Item</h3>
                  <p className="text-[11px] text-stone-500">Searches scanner reference database & USDA/IFCT tables</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFoodSearchOpen(false);
                  setFoodSearchQuery('');
                  setRemoteSearchResults([]);
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
                  placeholder="Search food (e.g., Apple, Paneer, Rice, Dal, Chicken, Dosa, Modak)..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Food items list */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {/* Remote scanner search results */}
              {remoteSearchResults.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                    Scanner Database Matches
                  </span>
                  {remoteSearchResults.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => {
                        handleSelectFoodId(res.id);
                        setIsFoodSearchOpen(false);
                      }}
                      className="w-full p-2.5 mb-1.5 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 text-left flex items-center justify-between transition-colors group"
                    >
                      <div>
                        <p className="font-bold text-xs text-stone-900 group-hover:text-emerald-900">{res.name}</p>
                        <p className="text-[10px] text-emerald-600 font-mono">Reference ID: {res.id}</p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2.5 py-1 rounded-full">
                        + Select
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Local database matches */}
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
                        {food.servingSize} {food.servingUnit} • {cal} kcal • {food.protein}g P • {food.carbs}g C •{' '}
                        {food.fats}g F
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
