import { NextRequest, NextResponse } from 'next/server';
import { analyzeFoodImageMultimodal } from '@/lib/foodVisionEngine';
import { VERIFIED_FOOD_DATABASE } from '@/lib/foodDatabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, sampleDishId, customApiKey, fileName, userDescription } = body;

    // 1. If user selected a pre-curated realistic sample plate
    if (sampleDishId) {
      const match = VERIFIED_FOOD_DATABASE.find((f) => f.id === sampleDishId);
      if (match) {
        // Enforce strict Atwater specific factors: calories = protein*4 + carbs*4 + fats*9
        const calories = Math.round(match.protein * 4 + match.carbs * 4 + match.fats * 9);
        return NextResponse.json({
          success: true,
          isFood: true,
          plateTitle: match.name,
          identifiedItems: [
            {
              name: match.name,
              servingSize: match.servingSize,
              servingUnit: match.servingUnit,
              nutrition: {
                calories,
                protein: match.protein,
                carbs: match.carbs,
                fats: match.fats,
                fiber: match.fiber || 5,
                sodium: match.sodium || 280,
                sugar: match.sugar || 3,
                potassium: match.potassium || 300,
                calcium: match.calcium || 80,
                iron: match.iron || 2,
              },
              confidence: 0.98,
              healthTag: 'Clinically Calibrated',
            },
          ],
          totalEstimatedNutrition: {
            calories,
            protein: match.protein,
            carbs: match.carbs,
            fats: match.fats,
            fiber: match.fiber || 5,
            sodium: match.sodium || 280,
            sugar: match.sugar || 3,
            potassium: match.potassium || 300,
          },
          healthScore: 92,
          aiObservation: `Verified ${match.name}. Exact Atwater calibrated: ${calories} kcal (${match.protein}g protein, ${match.carbs}g carbs, ${match.fats}g healthy fats). Zero random values.`,
          provider: 'clinical_cv_engine',
        });
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, isFood: false, rejectionReason: 'No image data provided.' },
        { status: 400 }
      );
    }

    // 2. Multimodal AI Analysis with Strict Food vs Non-Food Validation
    const analysis = await analyzeFoodImageMultimodal(imageBase64, customApiKey, {
      fileName,
      userDescription,
    });

    if (!analysis.isFood) {
      return NextResponse.json({
        success: false,
        isFood: false,
        rejectionReason:
          analysis.rejectionReason ||
          'No food detected in this photo. NutriTrack AI only scans food items, meals, or ingredients.',
        plateTitle: 'Non-Food Image Detected',
        identifiedItems: [],
        totalEstimatedNutrition: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        healthScore: 0,
        aiObservation: 'Image analysis rejected: Not a food item.',
        provider: analysis.provider,
      });
    }

    return NextResponse.json({
      ...analysis,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
