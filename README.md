# FoodCheck Egypt

Mobile-first Arabic PWA for food scanning and personal food tracking.

## Egypt market features
- Egyptian Arabic food aliases and common local dishes
- Barcode lookup with Open Food Facts plus a reviewed `community-products.json` dataset
- Missing-barcode local memory
- Community contribution/review workflow via GitHub issues and JSON export
- Back-of-pack photo OCR for ingredients and saturated fat (Arabic + English, best effort)
- Voice search using Egyptian Arabic where supported
- Portion estimates using grams, tablespoon, cup, baladi bread, piece and sandwich
- Confidence level and data-source labels on results
- Product correction workflow
- Household profiles with separate history, favorites, comparisons and health preferences
- Low-data / offline-friendly mode
- Price field and price comparison for manually entered products
- Recipe ingredient chips for Egyptian dishes whose recipes vary

## Health evidence
Rules are informational and reference guidance from WHO, NIDDK, WGO, Monash FODMAP, NHS and AHA. FoodCheck does not diagnose disease and does not replace individualized medical or dietetic advice.

## Architecture
Static GitHub Pages PWA. Personal data stays in browser localStorage. The shared community dataset is read-only from the static site; reviewed submissions can be promoted into `community-products.json`.
