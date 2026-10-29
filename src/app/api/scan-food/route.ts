import { NextRequest, NextResponse } from 'next/server';
import { VERIFIED_FOOD_DATABASE } from '@/lib/foodDatabase';

const SCANNER_URL = process.env.SCANNER_URL ?? 'http://127.0.0.1:8001';
const SCANNER_API_KEY = process.env.SCANNER_API_KEY ?? ''; // server-only; never NEXT_PUBLIC_*

const getHeaders = (): Record<string, string> => (SCANNER_API_KEY ? { 'X-API-Key': SCANNER_API_KEY } : {});

function dataUrlToBlob(dataUrl: string): Blob {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) {
    const clean = dataUrl.replace(/\s/g, '');
    const buf = Buffer.from(clean, 'base64');
    return new Blob([buf], { type: 'image/jpeg' });
  }
  const mime = m[1];
  if (!mime.startsWith('image/')) {
    throw new Error('invalid_image_type');
  }
  return new Blob([Buffer.from(m[2], 'base64')], { type: mime });
}

const NUT = ['calories', 'protein', 'carbs', 'fats', 'fiber', 'sugar', 'sodium', 'potassium', 'calcium', 'iron'] as const;

async function nutritionFor(foodId: string, grams?: number) {
  try {
    const body = grams ? { items: [{ food_id: foodId, grams }] } : { items: [{ food_id: foodId, servings: 1 }] };
    const r = await fetch(`${SCANNER_URL}/nutrition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getHeaders() },
      body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.items?.[0] ?? null;
  } catch {
    return null;
  }
}

function toLegacy(it: any, status: string, topCandidate?: any) {
  const n: Record<string, number | undefined> = {};
  for (const k of NUT) {
    n[k] = it.nutrients?.[k]?.available ? it.nutrients[k].value : undefined;
  }
  return {
    success: true,
    isFood: true,
    scanStatus: status,
    plateTitle: it.name,
    identifiedItems: [
      {
        id: `item-${it.food_id || it.id || 'food'}`,
        foodId: it.food_id || it.id,
        name: it.name,
        servingSize: it.grams,
        servingUnit: 'g',
        quantity: 1,
        caloriesPerUnit: n.calories ?? 0,
        proteinPerUnit: n.protein ?? 0,
        carbsPerUnit: n.carbs ?? 0,
        fatsPerUnit: n.fats ?? 0,
        fiberPerUnit: n.fiber,
        sodiumPerUnit: n.sodium,
        nutrition: n,
        confidence: topCandidate?.probability ?? undefined,
        healthTag: 'Reference value',
      },
    ],
    totalEstimatedNutrition: n,
    healthScore: undefined,
    nutritionFlags: it.flags,
    aiObservation: `Generic reference values for ${it.grams} g of ${it.name}. Adjust the portion to match what you ate.`,
    provider: 'nutritrack_scanner',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { imageBase64, foodId, grams } = body;

    // Manual correction path: user picked a food (and maybe grams) -> recompute only.
    if (foodId) {
      const it = await nutritionFor(foodId, grams);
      if (it) {
        return NextResponse.json({
          ...toLegacy(it, 'accepted'),
          scanStatus: 'accepted',
          portionRequired: false,
          needsConfirmation: false,
        });
      }

      // Offline / cloud fallback for manual lookup
      const local = VERIFIED_FOOD_DATABASE.find((f) => f.id === foodId);
      if (local) {
        const factor = (grams || local.servingSize) / (local.servingSize || 100);
        const n: Record<string, number | undefined> = {
          calories: Math.round(local.calories * factor),
          protein: Math.round(local.protein * factor * 10) / 10,
          carbs: Math.round(local.carbs * factor * 10) / 10,
          fats: Math.round(local.fats * factor * 10) / 10,
          fiber: local.fiber !== undefined ? Math.round(local.fiber * factor * 10) / 10 : undefined,
          sodium: local.sodium !== undefined ? Math.round(local.sodium * factor) : undefined,
        };
        return NextResponse.json({
          success: true,
          isFood: true,
          scanStatus: 'accepted',
          plateTitle: local.name,
          identifiedItems: [
            {
              id: `item-${local.id}`,
              foodId: local.id,
              name: local.name,
              servingSize: grams || local.servingSize,
              servingUnit: 'g',
              quantity: 1,
              caloriesPerUnit: n.calories ?? 0,
              proteinPerUnit: n.protein ?? 0,
              carbsPerUnit: n.carbs ?? 0,
              fatsPerUnit: n.fats ?? 0,
              fiberPerUnit: n.fiber,
              sodiumPerUnit: n.sodium,
              nutrition: n,
              confidence: undefined,
              healthTag: 'Reference value',
            },
          ],
          totalEstimatedNutrition: n,
          healthScore: undefined,
          nutritionFlags: ['reference_database'],
          aiObservation: `Reference values for ${grams || local.servingSize} g of ${local.name}. Adjust the portion to match what you ate.`,
          provider: 'nutritrack_local_ref',
          portionRequired: false,
          needsConfirmation: false,
        });
      }

      return NextResponse.json({ success: false, error: 'Unknown food or invalid amount' }, { status: 422 });
    }

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, isFood: false, scanStatus: 'invalid_image', rejectionReason: 'No image data provided.' },
        { status: 400 }
      );
    }

    let blob: Blob;
    try {
      blob = dataUrlToBlob(imageBase64);
    } catch {
      return NextResponse.json(
        { success: false, isFood: false, scanStatus: 'invalid_image', rejectionReason: 'Invalid image format. Please upload a valid JPEG, PNG, or WebP photo.' },
        { status: 422 }
      );
    }

    const form = new FormData();
    form.append('image', blob, 'scan.jpg');

    let r: Response;
    try {
      r = await fetch(`${SCANNER_URL}/predict`, {
        method: 'POST',
        headers: getHeaders(),
        body: form,
      });
    } catch {
      return NextResponse.json(
        { success: false, isFood: false, scanStatus: 'scanner_error', rejectionReason: 'Scanner service unavailable. Search for the food manually.' },
        { status: 502 }
      );
    }

    if (r.status === 422) {
      const e = await r.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        isFood: false,
        scanStatus: 'invalid_image',
        rejectionReason: e.detail?.message || 'Invalid image or unsupported format.',
      });
    }

    if (!r.ok) {
      return NextResponse.json(
        { success: false, isFood: false, scanStatus: 'scanner_error', rejectionReason: 'Scanner service unavailable. Search for the food manually.' },
        { status: 502 }
      );
    }

    const p = await r.json();

    const rejectStatuses = ['rejected_non_food', 'ambiguous', 'low_quality_image', 'packaged_label_detected', 'model_unavailable'];
    if (rejectStatuses.includes(p.status)) {
      return NextResponse.json({
        success: false,
        isFood: false,
        scanStatus: p.status,
        rejectionReason: p.message,
        plateTitle: p.status === 'rejected_non_food' ? 'Non-Food Image Detected' : 'Could not identify',
        identifiedItems: [],
        totalEstimatedNutrition: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        healthScore: 0,
        aiObservation: p.message,
        candidates: p.candidates ?? [],
        needsConfirmation: false,
        portionRequired: false,
      });
    }

    // accepted | needs_confirmation: return candidates; if confident, include nutrition for ONE reference serving (user can change portion).
    const top = p.candidates?.[0];
    const base = {
      success: true,
      isFood: true,
      scanStatus: p.status,
      candidates: p.candidates ?? [],
      portionRequired: true,
      needsConfirmation: p.status === 'needs_confirmation',
    };

    if (p.status === 'accepted' && top?.food_id) {
      const it = await nutritionFor(top.food_id);
      if (it) {
        return NextResponse.json({ ...base, ...toLegacy(it, p.status, top), candidates: p.candidates ?? [] });
      }
    }

    return NextResponse.json({
      ...base,
      plateTitle: 'Confirm your food',
      identifiedItems: [],
      totalEstimatedNutrition: { calories: 0, protein: 0, carbs: 0, fats: 0 },
      healthScore: 0,
      aiObservation: p.message,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Scan failed' }, { status: 500 });
  }
}
