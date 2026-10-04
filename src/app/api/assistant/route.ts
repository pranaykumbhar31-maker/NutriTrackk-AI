import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { UserProfile, NutritionalInfo } from '@/lib/types';

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

interface ChatRequestBody {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  userProfile: UserProfile;
  todayConsumed: NutritionalInfo;
  upcomingEventName?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { message, history = [], userProfile, todayConsumed, upcomingEventName } = body;

    const remainingCalories = Math.max(0, userProfile.dailyCalorieTarget - todayConsumed.calories);
    const remainingProtein = Math.max(0, userProfile.dailyProteinTarget - todayConsumed.protein);

    const systemPrompt = `You are NutriTrack AI, an intelligent, empathetic, and scientifically grounded personal nutrition coach.
Current User Context:
- Name: ${userProfile.name} (Age ${userProfile.age}, ${userProfile.gender})
- Current Weight: ${userProfile.weightKg} kg, Target: ${userProfile.targetWeightKg} kg
- Fitness Goal: ${userProfile.goal.replace('_', ' ')}
- Dietary Preference: ${userProfile.dietaryPreference}
- Allergies: ${userProfile.allergies.join(', ') || 'None reported'}
- Today's Calorie Target: ${userProfile.dailyCalorieTarget} kcal
- Today's Consumed: ${todayConsumed.calories} kcal (Protein: ${todayConsumed.protein}g, Carbs: ${todayConsumed.carbs}g, Fats: ${todayConsumed.fats}g)
- Energy Remaining: ${remainingCalories} kcal
- Protein Remaining: ${Math.round(remainingProtein)}g
- Upcoming Event/Festival: ${upcomingEventName || 'Navratri Festive Garba & Feasting'}

CRITICAL ETHICAL & CLINICAL GUIDELINES:
1. NEVER encourage starvation, extreme calorie restriction, skipping meals, purging, laxatives, or punitive excessive exercise.
2. If the user ate "too much junk food", festive sweets, or overate:
   - Reassure them warmly: One meal or day does NOT define their overall health or ruin their progress.
   - Advise them to "Balance your next meal", "Return to your normal routine", "Choose a lighter, nutrient-dense meal", and "Consider a 20-30 min relaxing walk or your planned workout".
   - Suggest plenty of water (2.5L-3L) to help naturally balance sodium and hydration.
3. Keep responses concise, warm, actionable, and formatted with clean markdown bullet points.
4. If recommending a meal or alternative, specify ingredients that match their dietary preference (${userProfile.dietaryPreference}) and respect any allergies (${userProfile.allergies.join(', ')}).`;

    if (groq) {
      try {
        const groqMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
          { role: 'user', content: message },
        ];

        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages,
          temperature: 0.6,
          max_tokens: 500,
        });

        const reply = completion.choices[0]?.message?.content;
        if (reply) {
          return NextResponse.json({ success: true, reply });
        }
      } catch (llmErr) {
        console.warn('Groq LLM error, using smart fallback:', llmErr);
      }
    }

    // High-quality smart contextual responses fallback
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('dinner') || lower.includes('what should i eat')) {
      reply = `Based on your day so far, you have **${remainingCalories} kcal** and **${Math.round(
        remainingProtein
      )}g of protein** left to reach your goal!\n\nHere are two balanced options for dinner:\n\n1. **Lemon Herb Grilled Paneer/Tofu Bowl** (~380 kcal, 24g protein): Seared paneer or firm tofu with steamed quinoa, cucumber, cherry tomatoes, and a light olive oil-lemon dressing.\n2. **Warm Spiced Dal Tadka with Steamed Brown Rice** (~340 kcal, 16g protein): Comforting yellow lentils with cumin and turmeric, paired with a small portion of brown rice and sautéed baby spinach.\n\nBoth are gentle on digestion and keep your macros right on target!`;
    } else if (lower.includes('calories') && lower.includes('consume')) {
      reply = `You have consumed **${todayConsumed.calories} kcal** out of your **${userProfile.dailyCalorieTarget} kcal** target today.\n\n- **Energy remaining**: ${remainingCalories} kcal\n- **Protein**: ${todayConsumed.protein}g / ${userProfile.dailyProteinTarget}g\n- **Carbohydrates**: ${todayConsumed.carbs}g\n- **Fats**: ${todayConsumed.fats}g\n\nYou're pacing well!`;
    } else if (lower.includes('high-protein') || lower.includes('breakfast')) {
      reply = `Here are 2 great high-protein breakfast suggestions tailored to your ${userProfile.dietaryPreference} preference:\n\n- **Sourdough Avocado & 2 Poached Eggs Plate**: ~385 kcal, 18g protein. Provides healthy monounsaturated fats and steady morning energy.\n- **Thick Greek Yogurt Parfait**: 170g 0% Greek yogurt layered with 1 scoop plant protein or crushed almonds, chia seeds, and fresh berries (~320 kcal, 28g protein).\n\nStarting with 20g+ protein stabilizes ghrelin (hunger hormone) and keeps you focused until lunch!`;
    } else if (lower.includes('too much') || lower.includes('junk') || lower.includes('cheat') || lower.includes('sweet')) {
      reply = `Take a deep breath — **one single meal or celebration never defines your overall progress!** 🌿\n\nHere is your scientific, non-punitive balance plan:\n\n1. **Do not skip meals or starve yourself**: Skipping meals leads to blood sugar crashes and rebound cravings.\n2. **Balance your next meal**: When you feel genuine physical hunger again, choose a lighter, nutrient-dense meal rich in fiber and lean protein (like vegetable lentil soup or a fresh salad).\n3. **Hydrate generously**: Drink 2 to 3 tall glasses of water. Extra sodium and carbs naturally retain water temporarily — this is not fat gain!\n4. **Gentle movement**: Consider a relaxing 20-30 minute outdoor walk to support digestion and clear your mind.\n\nSimply return to your normal nourishing routine tomorrow!`;
    } else if (lower.includes('close to') || lower.includes('target')) {
      reply = `You're currently at **${todayConsumed.calories} kcal**, which is **${Math.round(
        (todayConsumed.calories / userProfile.dailyCalorieTarget) * 100
      )}%** of your **${userProfile.dailyCalorieTarget} kcal** daily allowance. You have **${remainingCalories} kcal** remaining to enjoy mindfully.`;
    } else if (lower.includes('navratri') || lower.includes('festival') || lower.includes('diwali') || lower.includes('event')) {
      reply = `With **${upcomingEventName || 'Navratri Festive Celebrations'}** approaching, here is your NutriTrack festive strategy:\n\n- **Start with a protein & fiber meal**: Having paneer, lentils, Greek yogurt, or eggs stabilizes blood sugar before evening celebrations.\n- **Savor your favorites mindfully**: Enjoy traditional sweets and festive dishes without guilt. Moderation and joy keep your wellness sustainable.\n- **Stay hydrated**: Drink plenty of water throughout gatherings and celebrations.\n\nFestivals are about community, vitality, and joy — celebrate fully!`;
    } else {
      reply = `Hello ${userProfile.name}! I'm tracking your day: you have **${remainingCalories} kcal** and **${Math.round(
        remainingProtein
      )}g of protein** left for today. How can I support your nutrition or meal planning right now? Feel free to ask for meal ideas, festive balance tips, or healthy snack swaps!`;
    }

    return NextResponse.json({ success: true, reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Assistant failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
