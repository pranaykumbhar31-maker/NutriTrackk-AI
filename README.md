# NutriTrack AI — Intelligent Personal Nutrition & Festival Wellness Platform

NutriTrack AI is an intelligent personal nutrition and wellness platform combining AI food-image recognition, manual meal logging, clinical Mifflin-St Jeor nutritional analysis, health tracking, personalized meal and exercise recommendations, conversational nutrition assistance, and a dedicated **Festival & Event Nutrition Intelligence Mode**.

---

## Key Features & Capabilities

1. **AI Food-Image Recognition (`/scanner`)**
   - Live camera capture, photo upload, and one-click realistic food plate presets.
   - Multi-modal vision analysis via Groq Vision (`llama-3.2-11b-vision-preview`) with fallback heuristic.
   - User portion adjustment sliders (0.25x to 3x) and real-time macronutrient recalculation.
   - Saves confirmed meals directly to daily log.

2. **Manual Meal Logging (`/dashboard`)**
   - Breakfast, Lunch, Dinner, and Snacks categorization.
   - Instant search across 500+ ingredients and authentic regional/global dishes.
   - Custom entry support with direct calorie and protein inputs.

3. **Nutrition Analysis & Energy Left Gauge (`/dashboard`)**
   - Circular SVG donut progress gauge (*Energy Left*).
   - Color-coded segmented macronutrient bar (Protein Blue, Carbs Amber, Fats Pink).
   - Micronutrient tracking (Fiber, Sodium, Potassium, Sugar, Calcium, Iron) and clinical health score.

4. **Health & Goal Tracking (`/analytics` & `/profile`)**
   - Clinical Body Mass Index (BMI) calculator with health category indicator.
   - Weight tracking with target milestone visualization and 7-day calorie adherence chart.
   - Interactive water tracker (8 cups / 2.0 Liters daily).

5. **Personalized Recommendations (`/recommendations`)**
   - Meal suggestions dynamically filtered by remaining calories and user allergies/preferences.
   - Exercise recommendations tailored to daily energy intake with 1-click completion.

6. **Conversational AI Nutrition Assistant**
   - Floating chat coach accessible from any screen.
   - Pre-loaded with contextual awareness of the user's logged meals, remaining calories, and upcoming events.
   - Strict ethical guardrails: **Zero starvation, zero extreme restriction, zero purging**. Encourages balance, hydration, and gentle movement.

7. **Smart Nutrition Calendar & Festival Mode (`/calendar`)**
   - Monthly calendar with tracked days and festive event badges.
   - **3-Phase Festival Intelligence**:
     - *Phase 1 (Before Event)*: Preparation plan, balanced earlier meals, and healthier festive swaps.
     - *Phase 2 (During Event)*: Mindful enjoyment reminders and 1-tap quick logging.
     - *Phase 3 (After Event)*: Non-punitive recovery, potassium-rich meals, and 2.5L hydration.
   - **Event Impact Insights Report**: Formatted analysis comparing celebration intake with normal baseline.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React Icons, Canvas Confetti
- **AI Vision & Assistant**: Groq SDK (`llama-3.2-11b-vision-preview`, `llama-3.3-70b-versatile`)
- **Backend / Database**: Supabase PostgreSQL ready (`@supabase/supabase-js`) + Local reactive client persistence

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` (or refer to `.env.example`):
```env
# Standalone Python Food Scanner Service (Server-only; never use NEXT_PUBLIC_)
SCANNER_URL=http://127.0.0.1:8001
SCANNER_API_KEY=your_optional_secret_api_key

# AI Assistant
GROQ_API_KEY=your_groq_api_key_here

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Standalone Python Food Scanner
```bash
cd ../nutritrack-scanner
pip install -r requirements.txt
uvicorn scanner.api.app:app --port 8001
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
