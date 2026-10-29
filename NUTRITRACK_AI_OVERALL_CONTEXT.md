# NutriTrack AI — Comprehensive Project Context & Technical Architecture

> **Author**: Pranay Kumbhar & Core Engineering Team  
> **Repository**: [https://github.com/pranaykumbhar31-maker/NutriTrackk-AI](https://github.com/pranaykumbhar31-maker/NutriTrackk-AI)  
> **Production Live URL**: [https://nutritrack-app-beryl-five.vercel.app](https://nutritrack-app-beryl-five.vercel.app)  
> **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Sharp, Local-First Storage Architecture.  
> **Generated Document**: `NutriTrack_AI_Overall_Context.pdf`

---

## 1. Executive Summary & Core Philosophy

**NutriTrack AI** is an intelligent, privacy-first nutrition tracking and automated lifestyle optimization platform. Designed around the ethos **"AI Nutrition, Made Human"**, the system solves the primary failure point of traditional macro-tracking applications: excessive manual data logging and friction.

Traditional nutrition apps require users to manually weigh, search, and catalog every ingredient across fragmented databases. NutriTrack AI eliminates this barrier through:
1. **Multimodal Computer Vision Nutrition Extraction**: Instant macro analysis directly from raw food photography.
2. **Deterministic Biological Calibration**: Automated goal determination and personalized 7-day routine charts generated from anthropometric inputs (Mifflin-St Jeor BMR, Total Daily Energy Expenditure, macro partitioning).
3. **Cultural & Festival Diet Adaptation**: Context-aware scheduling with cultural dietary recommendations (e.g., fasting routines, festival feasts, balanced indulgence).
4. **Local-First Zero-Friction Storage**: Instant offline responsiveness without mandatory upfront cloud logins, paired with seamless cloud sync.

---

## 2. System Architecture & Tech Stack

```
+-------------------------------------------------------------------------+
|                              NutriTrack AI                              |
+-------------------------------------------------------------------------+
| Presentation Layer:                                                    |
|  - Next.js 16 App Router (Turbopack, Server & Client Components)        |
|  - Tailwind CSS v4 (Glassmorphic Emerald/Slate Palette)                 |
|  - Lucide React Icons & Framer Motion Responsive Transitions            |
+-------------------------------------------------------------------------+
| Application & Engine Layer:                                             |
|  - Routine Engine (Mifflin-St Jeor TDEE, Caloric Deficit/Surplus Logic) |
|  - Festival Calendar Engine (Cultural events, macro mitigation)         |
|  - Food Classifier & Guardrail System (Sharp image analysis & prompt)   |
+-------------------------------------------------------------------------+
| Storage & Persistence Layer:                                            |
|  - Client: LocalStorage with schema validation, export/import support   |
|  - Server: Route handlers (/api/scan-food, /api/assistant, /api/sync)  |
|  - Edge Deployments: Vercel Serverless Edge Runtime                     |
+-------------------------------------------------------------------------+
```

### Technology Matrix
- **Framework**: Next.js 16.0.7 (App Router with dynamic server routing).
- **Frontend / Styling**: React 19, Tailwind CSS v4, Lucide React, Glassmorphism UI tokens.
- **Image Processing**: Sharp (Edge-compatible server-side buffer validation).
- **State Management**: Reactive Local-First Store (`src/lib/storage.ts`) with custom synchronization hooks.
- **Algorithms**: Mifflin-St Jeor Equations, Macro Calorie Integrity (Atwater general factor: $4\text{ kcal/g}$ Carb, $4\text{ kcal/g}$ Protein, $9\text{ kcal/g}$ Fat).

---

## 3. Core Features Breakdown

### 3.1 AI Food Scanner (`/scanner` & `/api/scan-food`)
- **Camera & File Upload Support**: Direct live capture from mobile camera or image upload.
- **Non-Food Rejection Guardrail**: High-precision validation rejects non-edible objects (e.g., electronics, furniture, animals, stationary) with explicit corrective guidance.
- **Single & Multi-Item Dissection**: Detects individual ingredients, portion sizes, macronutrients (Protein, Carbs, Fats), micronutrients, fiber, and sodium.
- **Atwater Caloric Balance**: Validates calorie totals against macronutrient weights to prevent hallucinated numbers.

### 3.2 Personalized Goal & Routine Generator (`/routine`)
- **Inputs**: User Full Name, Age, Biological Sex, Height (cm), Current Weight (kg), Target Weight (kg), Primary Fitness Goal, and Weekly Activity Level.
- **Engine Logic (`src/lib/routineEngine.ts`)**:
  - Calculates BMR using the Mifflin-St Jeor equation.
  - Multiplies BMR by physical activity multiplier (Sedentary: $1.2$, Light: $1.375$, Moderate: $1.55$, Very Active: $1.725$, Athlete: $1.9$) to derive TDEE.
  - Applies clinical surplus/deficit bounds ($-500\text{ kcal}$ for steady fat loss, $+400\text{ kcal}$ for lean muscle growth).
- **Generated Outputs**:
  - Daily Calorie Target, Water Intake Goal ($35\text{ ml/kg}$ baseline), Protein ($1.8\text{--}2.2\text{ g/kg}$), Healthy Fats, and Complex Carbohydrates.
  - Complete 7-Day Exercise Schedule (Warm-up, strength exercises, sets, reps, rest, cardio cooldown).
  - Complete 7-Day Meal Plan (Breakfast, Mid-morning snack, Lunch, Evening fuel, Dinner) tailored to the user's specific target.
  - One-click PDF / Printable Export feature.

### 3.3 Smart Festival & Cultural Diet Calendar (`/calendar`)
- Tracks cultural events, national holidays, and fasting periods (Navratri, Diwali, Eid, Christmas, Ramadan, Thanksgiving, etc.).
- Dynamically updates past and upcoming dates (e.g., Ganesh Chaturthi 2026 scheduling).
- Provides actionable nutritional strategies for fasting (high-protein hydration, sustained energy carbs) and feast mitigation (pre-meal satiety, post-feast glycemic balance).

### 3.4 Interactive Analytics Dashboard (`/dashboard`)
- Dynamic macro progress rings (Calorie gauge, Protein target progress, Hydration tracking).
- Time-series nutrient consumption charts (7-day and 30-day aggregations).
- Quick meal logging modal with manual override and AI scan integration.

### 3.5 AI Health Assistant (`/assistant`)
- Contextual nutrition advice, recipe suggestions based on remaining macros for the day, and workout optimization advice.

---

## 4. File Tree & Codebase Map

```
nutritrack-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── assistant/route.ts      # Conversational nutrition AI handler
│   │   │   ├── auth/                    # Local authentication & session handling
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   └── session/route.ts
│   │   │   ├── scan-food/route.ts      # Multimodal AI Food Scanner endpoint
│   │   │   └── user/sync/route.ts      # Local-to-server sync endpoint
│   │   ├── assistant/page.tsx          # AI Assistant interactive view
│   │   ├── calendar/page.tsx           # Festival & cultural diet planner
│   │   ├── dashboard/page.tsx          # Real-time analytics & macro dashboard
│   │   ├── food-log/page.tsx           # Detailed daily meal history
│   │   ├── goals/page.tsx              # Nutrition & habit target configuration
│   │   ├── profile/page.tsx            # User profile & account management
│   │   ├── reminders/page.tsx          # Smart meal & hydration notifications
│   │   ├── routine/page.tsx            # Comprehensive Goal & Routine Generator
│   │   ├── scanner/page.tsx            # AI Camera & Photo Nutrition Scanner
│   │   ├── layout.tsx                  # Root layout with global providers
│   │   └── page.tsx                    # Production landing page
│   ├── components/
│   │   ├── AuthModal.tsx               # Login/Signup modal dialog
│   │   ├── CalorieRing.tsx             # SVG animated caloric progress ring
│   │   ├── Footer.tsx                  # Unified responsive footer
│   │   ├── MacroBar.tsx                # Visual macronutrient split bar
│   │   ├── Navbar.tsx                  # Global responsive navigation header
│   │   ├── QuickLogModal.tsx           # Rapid food intake logging dialog
│   │   └── UserSwitcher.tsx            # Multi-account switcher component
│   └── lib/
│       ├── routineEngine.ts            # TDEE, BMR & 7-day routine generator
│       ├── storage.ts                  # Local-first storage abstraction layer
│       └── types.ts                    # Shared TypeScript interfaces & types
├── public/                             # Static assets, icons & graphics
├── generate_context_pdf.py             # ReportLab automated PDF generator
├── package.json                        # Project dependencies & scripts
├── tsconfig.json                       # TypeScript compiler options
└── tailwind.config.ts                  # Tailwind CSS styling configuration
```

---

## 5. API Architecture & Request Specifications

### 5.1 Food Scanner API (`POST /api/scan-food`)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "image": "data:image/jpeg;base64,...",
  "mealType": "lunch"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "isFood": true,
  "foodName": "Paneer Tikka with Mint Chutney",
  "calories": 320,
  "protein": 18,
  "carbs": 12,
  "fat": 22,
  "confidence": 0.94,
  "ingredients": ["Cottage cheese (paneer)", "Yogurt marinade", "Bell peppers", "Spices"]
}
```
- **Rejection Response (`200 OK`)**:
```json
{
  "isFood": false,
  "message": "No food detected in image. Please photograph an edible meal or ingredient."
}
```

---

## 6. Installation, Local Execution & Deployment

### Local Development Setup
1. **Clone repository**:
   ```bash
   git clone https://github.com/pranaykumbhar31-maker/NutriTrackk-AI.git
   cd NutriTrackk-AI/nutritrack-app
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run local development server**:
   ```bash
   npm run dev
   ```
4. **Access in browser**:
   Navigate to `http://localhost:3000`.

### Production Build & Verification
```bash
npm run build
npm run start
```

### Production Deployment
- The repository is connected via Continuous Deployment to Vercel.
- Every commit pushed to `main` automatically triggers zero-downtime Edge deployment.
- Live URL: [https://nutritrack-app-beryl-five.vercel.app](https://nutritrack-app-beryl-five.vercel.app)

---

## 7. Strategic Value & Future Roadmap

1. **Microbiome & Gut Health Tracking**: Correlating logged fiber types with digestive comfort scoring.
2. **Barcode & Packaging OCR Integration**: Instant lookup of packaged foods with real-time nutrient validation.
3. **Wearable Device Synchronization**: Bi-directional integration with Apple HealthKit, Google Health Connect, and Fitbit.
4. **Offline Mobile Apps**: Capacitor / React Native wrappers leveraging the existing TypeScript core.
