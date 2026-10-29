import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Don't draw header on first page (cover/intro)
        if self._pageNumber > 1:
            # Header line and text
            self.drawString(54, letter[1] - 36, "NutriTrack AI — Overall System & Architectural Context Specification")
            self.drawRightString(letter[0] - 54, letter[1] - 36, "Production v2.5")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawString(54, 34, "NutriTrack AI • Intelligent Nutrition & Festival Intelligence Platform • https://nutritrack-app-beryl-five.vercel.app")
        self.drawRightString(letter[0] - 54, 34, page_text)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(54, 46, letter[0] - 54, 46)
        
        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#065F46") # Emerald 800
    dark_slate = colors.HexColor("#0F172A")    # Slate 900
    text_color = colors.HexColor("#334155")    # Slate 700
    accent_emerald = colors.HexColor("#10B981")# Emerald 500
    accent_teal = colors.HexColor("#0D9488")   # Teal 600

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=dark_slate,
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=accent_teal,
        spaceAfter=15,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=dark_slate,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=text_color,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=text_color,
        leftIndent=14,
        spaceAfter=3,
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#065F46"),
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=dark_slate,
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0F172A"),
    )

    story = []

    # --- TITLE / COVER BLOCK ---
    story.append(Paragraph("NutriTrack AI — Comprehensive System & Architectural Context", title_style))
    story.append(Paragraph("Intelligent Personal Nutrition, Computer Vision & Smart Festival Balance Platform", subtitle_style))

    # Meta card table
    meta_data = [
        [
            Paragraph("<b>Production URL:</b> https://nutritrack-app-beryl-five.vercel.app", table_body_style),
            Paragraph("<b>Version:</b> 2.5 (Production Release)", table_body_style),
        ],
        [
            Paragraph("<b>GitHub Repository:</b> github.com/pranaykumbhar31-maker/NutriTrackk-AI", table_body_style),
            Paragraph("<b>Stack:</b> Next.js 16 (Turbopack), TypeScript, Tailwind", table_body_style),
        ],
        [
            Paragraph("<b>Author / Maintainer:</b> Pranay & NutriTrack AI Team", table_body_style),
            Paragraph("<b>Last Updated:</b> October 2026", table_body_style),
        ]
    ]
    meta_table = Table(meta_data, colWidths=[270, 234])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#A7F3D0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#D1FAE5")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # --- SECTION 1: EXECUTIVE SUMMARY & CORE MISSION ---
    story.append(Paragraph("1. Executive Summary & Core Philosophy", h1_style))
    story.append(Paragraph(
        "<b>NutriTrack AI</b> is an intelligent, clinically calibrated personal nutrition and lifestyle management web application designed to eliminate the restrictive guilt, repetitive inaccuracies, and social friction found in conventional calorie-counting tools. Centered around the principle of <i>'AI Nutrition, Made Human'</i>, NutriTrack AI bridges everyday nutrition goals with real-world social occasions, holidays, weddings, and cultural celebrations.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Fundamental Flaws of Traditional Trackers:</b>", h2_style
    ))
    story.append(Paragraph("• <b>Rigid Lab Mindset:</b> Most trackers assume human life occurs in a sterile vacuum. Eating a festive treat or going to a wedding triggers punitive calorie warnings, red charts, and feelings of failure.", bullet_style))
    story.append(Paragraph("• <b>Random/Fluctuating Numbers:</b> AI vision tools often hallucinate erratic macro values for the same food (e.g., claiming a single apple has 30g of protein or 600 kcal).", bullet_style))
    story.append(Paragraph("• <b>Disconnection from Daily Routines:</b> Users are told their daily targets, but are left stranded on <i>how</i> to structure their actual day — when to eat, what portions to cook, and what workout split fits their exact goal.", bullet_style))
    story.append(Paragraph(
        "<b>NutriTrack AI's Scientific Solution:</b>", h2_style
    ))
    story.append(Paragraph("1. <b>Strict Atwater Energy Laws:</b> Eliminates all random hallucinations by enforcing the fundamental nutritional equation: <code>Calories = (Protein × 4) + (Carbs × 4) + (Fats × 9)</code>, cross-verified against verified USDA and IFCT databases.", bullet_style))
    story.append(Paragraph("2. <b>3-Phase Smart Festival Intelligence:</b> Connects nutrition with festivals (Navratri, Diwali, Weekend Celebrations) through pre-event blood-sugar preparation, during-event mindful enjoyment with zero guilt, and post-event scientific electrolyte restoration.", bullet_style))
    story.append(Paragraph("3. <b>Automated Goal & Routine Chart Generator:</b> Asks for user biometrics (age, weight, height, goal, pace, workout setting) and produces a complete, timed daily meal routine (07:00 AM to 09:45 PM) and a 7-day structured exercise routine.", bullet_style))

    story.append(Spacer(1, 8))

    # --- SECTION 2: SYSTEM ARCHITECTURE & TECH STACK ---
    story.append(Paragraph("2. System Architecture & Tech Stack", h1_style))
    
    arch_data = [
        [Paragraph("<b>Component Layer</b>", table_header_style), Paragraph("<b>Technology / Implementation Details</b>", table_header_style)],
        [Paragraph("<b>Core Framework</b>", table_body_style), Paragraph("Next.js 16.3.3 (Turbopack engine), React 19, TypeScript 5.8 with strict typing.", table_body_style)],
        [Paragraph("<b>Styling & Design System</b>", table_body_style), Paragraph("Tailwind CSS v4 with custom Emerald/Teal medical-wellness theme, Lucide React icons, and canvas-confetti.", table_body_style)],
        [Paragraph("<b>Computer Vision Engine</b>", table_body_style), Paragraph("Dual-mode architecture: Node.js <code>sharp</code> spectral analysis + Client-side HTML5 Canvas pixel sampling + Groq/Gemini Vision API fallbacks.", table_body_style)],
        [Paragraph("<b>Persistence Architecture</b>", table_body_style), Paragraph("Local-First Storage with browser event dispatchers (<code>nutritrack_meals_updated</code>, <code>nutritrack_profile_updated</code>) synced with server DB API routes (<code>/api/user/sync</code>).", table_body_style)],
        [Paragraph("<b>Biometric Algorithms</b>", table_body_style), Paragraph("Mifflin-St Jeor BMR Equation, TDEE activity multipliers (1.2 to 1.725), Quetelet BMI Index, and Atwater Specific Energy Factor System.", table_body_style)],
        [Paragraph("<b>Hosting & CI/CD</b>", table_body_style), Paragraph("Vercel Global Edge Network (East US - iad1), Turbopack optimized builds with 18 static/dynamic routes.", table_body_style)],
    ]
    arch_table = Table(arch_data, colWidths=[130, 374])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(arch_table)

    story.append(Spacer(1, 10))

    # --- SECTION 3: CORE FEATURES SPECIFICATIONS ---
    story.append(Paragraph("3. Detailed Core Feature Breakdown", h1_style))

    # Feature 3.1: AI Food Scanner
    story.append(Paragraph("3.1 Trained AI Food Scanner & Computer Vision Engine", h2_style))
    story.append(Paragraph(
        "The NutriTrack AI Food Scanner allows users to snap live camera photos, upload meal images, or select realistic pre-curated meal plates. Unlike standard vision wrappers that blindly accept any uploaded photo, NutriTrack AI features a dedicated <b>Dual-Gate Validation System</b>:",
        body_style
    ))
    story.append(Paragraph("• <b>Strict Non-Food Rejection Guard:</b> Analyzes image entropy, color variance, and RGB distribution. If the image depicts text documents, screenshots, receipts, mobile phones, laptops, selfie faces, clothing, tools, or vehicles, scanning is immediately rejected with: <i>'Non-food item detected. NutriTrack AI only scans edible food items, meals, and beverages.'</i>", bullet_style))
    story.append(Paragraph("• <b>Single-Food Item Acceptance:</b> Simple, single-ingredient foods (e.g., an apple, banana, boiled egg, bowl of steamed white rice, bread slice) are cleanly recognized without false negative errors.", bullet_style))
    story.append(Paragraph("• <b>Multi-Item Plate Decomposition:</b> Complex dishes are segmented into constituent foods (e.g. Basmati Rice 150g + Dal Tadka 180g + Palak Paneer 80g).", bullet_style))
    story.append(Paragraph("• <b>Sticky Query Elimination:</b> Fresh file uploads and camera snapshots automatically clear previous query states, preventing old search terms from hijacking new photo scans.", bullet_style))

    # Feature 3.2: Goal & Routine Generator
    story.append(Paragraph("3.2 Personalized Goal & Daily Routine Chart Generator (/routine)", h2_style))
    story.append(Paragraph(
        "A marquee addition to NutriTrack AI, the Goal & Routine Chart Generator transforms abstract health targets into an actionable, daily operational schedule:",
        body_style
    ))
    story.append(Paragraph("• <b>Personalized Intake Parameters:</b> Captures Name, Age, Gender, Weight, Height, Target Weight, Primary Goal (Fat Loss, Muscle Hypertrophy, Maintenance, Longevity), Weekly Pace, Activity Level, Dietary Preference (Veg, Non-Veg, Vegan, Eggetarian, Keto), Allergies, and Workout Location (Gym, Home Dumbbells, Bodyweight).", bullet_style))
    story.append(Paragraph("• <b>Biometric Target Calculation:</b> Derives exact BMR, TDEE, calibrated Daily Calorie target, Protein (g), Carbohydrates (g), Healthy Fats (g), Fiber (g), Hydration allowance (Liters and 250ml cups), and projected weeks to completion.", bullet_style))
    story.append(Paragraph("• <b>6-7 Timed Daily Meal Protocol:</b> Features Early Morning Kickstart (07:00 AM), Power Breakfast (08:30 AM), Mid-Morning Snack (11:30 AM), Balanced Lunch (01:30 PM), Evening Fuel (05:00 PM), Restorative Dinner (08:00 PM), and Bedtime Elixir (09:45 PM), complete with portion weights, macro breakdowns, clinical benefits, and smart culinary swaps.", bullet_style))
    story.append(Paragraph("• <b>7-Day Structured Workout Routine:</b> Distinct splits (Push, Pull, Legs, Active Recovery, Full Body Conditioning, Cardio, Rest) with warm-up sets, 4-5 targeted exercises with Sets, Reps, Rest intervals, target muscles, form tips, and cool-down protocols.", bullet_style))
    story.append(Paragraph("• <b>Interactive Daily Adherence Checklist:</b> Live check-off system for hydration milestones, workouts, and meal logging with progress tracking and confetti celebration.", bullet_style))
    story.append(Paragraph("• <b>One-Click Dashboard Sync:</b> The <i>'Apply to Dashboard'</i> button instantly writes calculated targets to user storage, re-calibrating the dashboard energy gauge and macro split bars.", bullet_style))

    # Page Break for clean reading
    story.append(PageBreak())

    # Feature 3.3: Smart Festival & Calendar Mode
    story.append(Paragraph("3.3 Smart Nutrition Calendar & Festival Mode (/calendar)", h2_style))
    story.append(Paragraph(
        "Cultural festivals, family dining, and celebrations are an essential part of life. Traditional dieting approaches lead to binge-and-starve cycles. NutriTrack AI resolves this through its <b>3-Phase Festive Lifecycle Architecture</b>:",
        body_style
    ))

    fest_data = [
        [Paragraph("<b>Phase</b>", table_header_style), Paragraph("<b>Strategic Objective</b>", table_header_style), Paragraph("<b>Nutritional Action Protocol</b>", table_header_style)],
        [
            Paragraph("<b>Phase 1: Pre-Event Preparation</b>", table_body_style),
            Paragraph("Blood Sugar Stabilization & Satiety Anchoring", table_body_style),
            Paragraph("Higher morning protein (Greek yogurt, eggs, paneer) and dietary fiber to blunt insulin spikes. Pre-event hydration of 1.5L - 2.0L water.", table_body_style)
        ],
        [
            Paragraph("<b>Phase 2: During-Event Mindful Enjoyment</b>", table_body_style),
            Paragraph("Guilt-Free Presence & Savoring Favorites", table_body_style),
            Paragraph("1-tap logging of festive foods (steamed modaks, ladoos, biryani). Zero punitive alarms or shame-based notifications.", table_body_style)
        ],
        [
            Paragraph("<b>Phase 3: Post-Event Scientific Balance</b>", table_body_style),
            Paragraph("Electrolyte Balance & Normal Routine Resumption", table_body_style),
            Paragraph("No extreme fasting or compensatory starvation. Potassium-rich meals (spinach, avocado, lentils) and gentle 20-30 min walking to naturally balance temporary sodium retention.", table_body_style)
        ],
    ]
    fest_table = Table(fest_data, colWidths=[100, 140, 264])
    fest_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(fest_table)
    story.append(Spacer(1, 6))

    # Feature 3.4: Daily Dashboard
    story.append(Paragraph("3.4 Interactive Daily Dashboard (/dashboard)", h2_style))
    story.append(Paragraph("• <b>Energy Left Donut Gauge:</b> Displays real-time consumed vs remaining calories with smooth radial SVG progress and color transitions.", bullet_style))
    story.append(Paragraph("• <b>Macronutrient Distribution Split:</b> Visual progress bars for Protein, Carbohydrates, and Fats with remaining gram targets.", bullet_style))
    story.append(Paragraph("• <b>Interactive Water Logging:</b> Track glasses and liters against daily targets with quick increment/decrement buttons.", bullet_style))
    story.append(Paragraph("• <b>Categorized Meal Cards:</b> Breakdown by Breakfast, Lunch, Dinner, and Snacks with photo thumbnails, macro tags, portion adjustments, and deletion.", bullet_style))
    story.append(Paragraph("• <b>Dynamic Quetelet BMI Status:</b> Computes live BMI and healthy target weight bracket based on current user height and weight.", bullet_style))

    # Feature 3.5: Conversational Assistant & Reminders
    story.append(Paragraph("3.5 Conversational Assistant & Smart Reminder Drawer", h2_style))
    story.append(Paragraph("• <b>NutriTrack AI Coach:</b> Floating assistant bubble and popover drawer providing empathetic advice for dining out, overeating recovery, and high-protein recipe recommendations.", bullet_style))
    story.append(Paragraph("• <b>Smart Reminders:</b> Sliding drawer with toggleable notifications for breakfast, lunch, dinner, water milestones, and festival preparation alerts.", bullet_style))

    # Feature 3.6: Multi-Profile & Server Persistence
    story.append(Paragraph("3.6 Multi-Profile Architecture & Hybrid Backend Persistence", h2_style))
    story.append(Paragraph("• <b>Multi-Account Management:</b> Allows multiple family members or demo profiles to switch seamlessly from the navigation bar dropdown.", bullet_style))
    story.append(Paragraph("• <b>Hybrid Data Synchronization:</b> LocalStorage provides instantaneous offline-first responsiveness; background API calls to <code>/api/user/sync</code> sync account state with server persistence.", bullet_style))

    story.append(Spacer(1, 8))

    # --- SECTION 4: COMPLETE FILE STRUCTURE ---
    story.append(Paragraph("4. Project Architecture & File Directory Map", h1_style))
    
    file_map_data = [
        [Paragraph("<b>Path</b>", table_header_style), Paragraph("<b>Type</b>", table_header_style), Paragraph("<b>Core Responsibility</b>", table_header_style)],
        [Paragraph("<code>src/app/page.tsx</code>", code_style), Paragraph("Page (Client)", table_body_style), Paragraph("Root Home page with Hero section, Goal & Routine spotlight, Festival feature cards, and navigation links.", table_body_style)],
        [Paragraph("<code>src/app/routine/page.tsx</code>", code_style), Paragraph("Page (Client)", table_body_style), Paragraph("Interactive Goal & Routine Generator page. Displays 6-meal daily schedule, 7-day workout routine, and adherence checklist.", table_body_style)],
        [Paragraph("<code>src/app/scanner/page.tsx</code>", code_style), Paragraph("Page (Client)", table_body_style), Paragraph("AI Food Scanner page with live camera, photo upload, preset dishes, and non-food validation warnings.", table_body_style)],
        [Paragraph("<code>src/app/dashboard/page.tsx</code>", code_style), Paragraph("Page (Client)", table_body_style), Paragraph("Daily nutrition tracking center: Energy Left gauge, meal slots, water intake, and BMI tracking.", table_body_style)],
        [Paragraph("<code>src/app/calendar/page.tsx</code>", code_style), Paragraph("Page (Client)", table_body_style), Paragraph("Calendar & Festival intelligence center with 3-phase pre/during/post-event guidance.", table_body_style)],
        [Paragraph("<code>src/app/recommendations/page.tsx</code>", code_style), Paragraph("Page (Client)", table_body_style), Paragraph("Target-calibrated meal suggestions and workout recommendations.", table_body_style)],
        [Paragraph("<code>src/app/analytics/page.tsx</code>", code_style), Paragraph("Page (Client)", table_body_style), Paragraph("Calorie streaks, weight trajectory charts, and festival recovery analysis.", table_body_style)],
        [Paragraph("<code>src/app/login/page.tsx</code>", code_style), Paragraph("Page (Client)", table_body_style), Paragraph("User sign in, registration wizard, and demo account switching.", table_body_style)],
        [Paragraph("<code>src/app/profile/page.tsx</code>", code_style), Paragraph("Page (Client)", table_body_style), Paragraph("Biometric stats, allergy management, and calorie target calibration.", table_body_style)],
        [Paragraph("<code>src/lib/routineEngine.ts</code>", code_style), Paragraph("Library", table_body_style), Paragraph("Algorithmic engine generating timed diet plans, 7-day workout splits, and daily habit checklists.", table_body_style)],
        [Paragraph("<code>src/lib/foodVisionEngine.ts</code>", code_style), Paragraph("Library", table_body_style), Paragraph("Spectral computer vision classifier, non-food rejection guard, and Atwater nutrient calibration.", table_body_style)],
        [Paragraph("<code>src/lib/festivalEngine.ts</code>", code_style), Paragraph("Library", table_body_style), Paragraph("Festival lifecycle algorithms, pre/post event logic, and Event Impact Reports.", table_body_style)],
        [Paragraph("<code>src/lib/nutritionEngine.ts</code>", code_style), Paragraph("Library", table_body_style), Paragraph("Mifflin-St Jeor BMR, TDEE, BMI, and daily macro aggregation calculations.", table_body_style)],
        [Paragraph("<code>src/lib/storage.ts</code>", code_style), Paragraph("Library", table_body_style), Paragraph("Local storage state management, event dispatchers, and backend sync integration.", table_body_style)],
        [Paragraph("<code>src/lib/foodDatabase.ts</code>", code_style), Paragraph("Library", table_body_style), Paragraph("Comprehensive verified database of 150+ foods with USDA/IFCT macro profiles.", table_body_style)],
        [Paragraph("<code>src/app/api/scan-food/route.ts</code>", code_style), Paragraph("API Route", table_body_style), Paragraph("Food scanning POST endpoint: verifies image validity, performs vision analysis, and returns Atwater macros.", table_body_style)],
        [Paragraph("<code>src/app/api/assistant/route.ts</code>", code_style), Paragraph("API Route", table_body_style), Paragraph("Nutrition coaching chat endpoint with ethical guidelines and festive support.", table_body_style)],
        [Paragraph("<code>src/app/api/auth/...</code>", code_style), Paragraph("API Route", table_body_style), Paragraph("Backend user registration, login, and user list endpoints.", table_body_style)],
        [Paragraph("<code>src/app/api/user/sync/route.ts</code>", code_style), Paragraph("API Route", table_body_style), Paragraph("Endpoint for syncing user profile, meals, water, and events to server database.", table_body_style)],
    ]
    file_map_table = Table(file_map_data, colWidths=[150, 80, 274])
    file_map_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(file_map_table)

    # Page Break for clean reading
    story.append(PageBreak())

    # --- SECTION 5: API ENDPOINTS SPECIFICATION ---
    story.append(Paragraph("5. API Architecture & Request/Response Specification", h1_style))

    api_data = [
        [Paragraph("<b>Endpoint</b>", table_header_style), Paragraph("<b>Method</b>", table_header_style), Paragraph("<b>Payload Parameters</b>", table_header_style), Paragraph("<b>Output Description</b>", table_header_style)],
        [
            Paragraph("<code>/api/scan-food</code>", code_style),
            Paragraph("POST", table_body_style),
            Paragraph("<code>imageBase64</code>, <code>sampleDishId</code>, <code>fileName</code>, <code>userDescription</code>", table_body_style),
            Paragraph("Returns <code>isFood: boolean</code>, detected food items, Atwater nutrition, health score, and clinical observations. Rejects non-food with explanation.", table_body_style),
        ],
        [
            Paragraph("<code>/api/assistant</code>", code_style),
            Paragraph("POST", table_body_style),
            Paragraph("<code>message</code>, <code>history</code>, <code>userProfile</code>, <code>todayConsumed</code>, <code>upcomingEventName</code>", table_body_style),
            Paragraph("Returns empathetic, scientifically grounded conversational advice tailored to the user's remaining calories and festive context.", table_body_style),
        ],
        [
            Paragraph("<code>/api/auth/register</code>", code_style),
            Paragraph("POST", table_body_style),
            Paragraph("<code>name</code>, <code>email</code>, <code>password</code>, <code>profile</code>", table_body_style),
            Paragraph("Creates a new user account and profile record in server persistence.", table_body_style),
        ],
        [
            Paragraph("<code>/api/auth/login</code>", code_style),
            Paragraph("POST", table_body_style),
            Paragraph("<code>email</code>, <code>password</code>", table_body_style),
            Paragraph("Authenticates user credentials and returns full account state and profile.", table_body_style),
        ],
        [
            Paragraph("<code>/api/user/sync</code>", code_style),
            Paragraph("POST", table_body_style),
            Paragraph("<code>userId</code>, <code>payload: { profile, meals, water, events }</code>", table_body_style),
            Paragraph("Synchronizes client-side local changes to the server database for cross-device continuity.", table_body_style),
        ],
    ]
    api_table = Table(api_data, colWidths=[95, 45, 170, 194])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(api_table)

    story.append(Spacer(1, 10))

    # --- SECTION 6: LOCAL SETUP & DEPLOYMENT GUIDE ---
    story.append(Paragraph("6. Installation, Local Execution & Deployment", h1_style))
    story.append(Paragraph(
        "<b>Prerequisites:</b> Node.js v18.0.0 or higher (v24 LTS recommended) and npm v9+ installed.",
        body_style
    ))
    story.append(Paragraph("<b>1. Clone & Install Dependencies:</b>", h2_style))
    story.append(Paragraph("<code>git clone https://github.com/pranaykumbhar31-maker/NutriTrackk-AI.git<br/>cd NutriTrackk-AI<br/>npm install</code>", code_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>2. Run Development Server:</b>", h2_style))
    story.append(Paragraph("<code>npm run dev</code><br/>Access the application at <code>http://localhost:3000</code> with instant Turbopack hot reloading.", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>3. Production Build & Verification:</b>", h2_style))
    story.append(Paragraph("<code>npm run build<br/>npm start</code><br/>Verifies all 18 routes, strict TypeScript types, and server-side compilation.", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>4. Vercel Production Deployment:</b>", h2_style))
    story.append(Paragraph("<code>npx vercel --prod --yes</code><br/>Deploys directly to the live production domain with edge distribution and zero downtime.", body_style))

    story.append(Spacer(1, 10))

    # --- SECTION 7: SUMMARY & FUTURE ROADMAP ---
    story.append(Paragraph("7. Strategic Value & Future Enhancements", h1_style))
    story.append(Paragraph(
        "NutriTrack AI successfully establishes a new paradigm in digital nutrition. By combining <b>Atwater scientific integrity</b>, <b>intelligent non-food computer vision validation</b>, <b>empathetic festival lifecycle balance</b>, and <b>automated goal-driven routine charts</b>, it provides users with an actionable roadmap to sustainable health without neurotic restriction.",
        body_style
    ))
    story.append(Paragraph("• <b>Upcoming Enhancements:</b> Apple Health & Google Health Connect wearable sync, multi-lingual Indian regional language support, and barcode scanning for packaged grocery items.", bullet_style))

    # Build the PDF using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")


if __name__ == '__main__':
    target_path = sys.argv[1] if len(sys.argv) > 1 else 'NutriTrack_AI_Overall_Context.pdf'
    build_pdf(target_path)
