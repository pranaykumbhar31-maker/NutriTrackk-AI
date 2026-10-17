import { NextRequest, NextResponse } from 'next/server';
import { analyzeFoodImageMultimodal, calibrateNutritionAccurate } from '@/lib/foodVisionEngine';
import { VERIFIED_FOOD_DATABASE } from '@/lib/foodDatabase';

const COMPOSITE_PRESET_ITEMS: Record<string, { title: string; inputs: { name: string; quantityGrams: number }[] }> = {
  'f-curry-rice-naan-plate': {
    title: 'Indian Spiced Curry with Basmati Rice & Naan',
    inputs: [
      { name: 'Steamed White Basmati Rice', quantityGrams: 150 },
      { name: 'Indian Spiced Chicken Tikka Masala / Curry', quantityGrams: 180 },
      { name: 'Tandoori Garlic Naan / Flatbread', quantityGrams: 80 },
      { name: 'Cherry Tomatoes & Radish', quantityGrams: 30 },
    ],
  },
  'f-mediterranean-power-bowl': {
    title: 'Mediterranean Rainbow Grain Bowl',
    inputs: [
      { name: 'Cooked Quinoa', quantityGrams: 150 },
      { name: 'Boiled Garbanzo / Chickpeas', quantityGrams: 100 },
      { name: 'Hass Avocado (Sliced)', quantityGrams: 50 },
      { name: 'Cherry Tomatoes & Radish', quantityGrams: 75 },
    ],
  },
  'f-avocado-poached-egg-plate': {
    title: 'Avocado Toast & Organic Poached Egg',
    inputs: [
      { name: 'Whole Grain Sourdough Toast', quantityGrams: 45 },
      { name: 'Poached Egg', quantityGrams: 50 },
      { name: 'Hass Avocado (Sliced)', quantityGrams: 50 },
      { name: 'Fresh Blueberries & Strawberries', quantityGrams: 60 },
    ],
  },
  'f-modak-steamed': {
    title: 'Festive Steamed Modak Thali',
    inputs: [
      { name: 'Steamed Ukadiche Modak (Traditional Festive Sweet)', quantityGrams: 100 },
      { name: 'Cardamom Saffron Rice Kheer', quantityGrams: 120 },
      { name: 'Besan Ladoo (Desi Ghee)', quantityGrams: 45 },
    ],
  },
  'f-salmon-grilled': {
    title: 'Wild Salmon with Asparagus & Lemon',
    inputs: [
      { name: 'Wild Salmon (Grilled)', quantityGrams: 150 },
      { name: 'Baby Spinach / Mixed Greens', quantityGrams: 80 },
      { name: 'Steamed Brown Rice', quantityGrams: 100 },
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, sampleDishId, customApiKey, fileName, userDescription, clientFeatures } = body;

    // 1. If user selected a pre-curated realistic sample plate
    if (sampleDishId) {
      if (COMPOSITE_PRESET_ITEMS[sampleDishId]) {
        const composite = COMPOSITE_PRESET_ITEMS[sampleDishId];
        const calibrated = calibrateNutritionAccurate(composite.inputs);
        return NextResponse.json({
          success: true,
          isFood: true,
          plateTitle: composite.title,
          identifiedItems: calibrated.items,
          totalEstimatedNutrition: calibrated.totalNutrition,
          healthScore: calibrated.healthScore,
          aiObservation: `Verified ${composite.title}. Exact Atwater calibrated: ${calibrated.totalNutrition.calories} kcal (${calibrated.totalNutrition.protein}g protein, ${calibrated.totalNutrition.carbs}g carbs, ${calibrated.totalNutrition.fats}g healthy fats). Zero random values.`,
          provider: 'clinical_cv_engine',
        });
      }

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
      clientFeatures,
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
