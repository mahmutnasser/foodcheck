# FoodCheck Egypt

Mobile-first Arabic PWA for food scanning, food decisions, and personal symptom tracking.

## Egypt-focused capabilities
- Egyptian Arabic aliases and common local dishes
- Egyptian restaurant mode with recipe-component selection
- Barcode lookup with Open Food Facts and FoodCheck Egypt community data
- Duplicate protection by barcode/name
- Back-of-pack OCR for Arabic/English ingredients and nutrition values
- Full nutrition entry: calories, fat, saturated fat, sugars, fibre, protein, salt and sodium
- Salt classification and WHO daily-limit guidance
- Portion estimates using Egyptian household units
- Symptom timing + severity and correlation-style personal pattern reports
- Alternatives based on the reason for a warning
- Data confidence and source labels
- Product corrections and community review queue
- Local admin dashboard for data completeness and pending submissions
- Optional Supabase backend adapter with RLS schema
- Household profiles
- Low-data/offline-friendly mode
- Install-to-home-screen prompt
- First-run onboarding
- Arabic / English core UI switch
- Price field and comparison

## Optional shared backend
The app works without a backend. To enable Supabase:
1. Run `supabase-schema.sql` in your Supabase project.
2. Edit `backend-config.js` with the project URL and **publishable/anon** key.
3. Never put a service-role key in this public GitHub Pages frontend.

Public users may read approved products and submit pending products. Approval should happen only through a trusted admin path.

## Health evidence
Rules are informational and reference WHO, NIDDK, WGO, Monash FODMAP, NHS and AHA. FoodCheck does not diagnose disease or replace individualized medical or dietetic advice.
