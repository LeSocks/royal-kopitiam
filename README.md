# Royal Kopitiam — Kedai Kopitiam • 东方皇家 • Royal Oriental

Official full-screen brand showcase, interactive 61-item menu explorer (`#01` – `#61`), Drink Bar guide (`#36` – `#45`), 16-slot atmosphere gallery, and comprehensive SEO & GEO (Generative Engine Optimization) suite for **Royal Kopitiam** (**100% No Pork, No Lard**).

## Quick Start

1. **Direct Browser Open (Zero Setup):**
   Open `index.html` directly in any modern browser.
2. **Local Web Server:**
   ```powershell
   python -m http.server 8080
   ```
   Then visit `http://localhost:8080`.

---

## Project Structure

- `index.html` — Full-screen responsive homepage with `<head>` SEO/Local Geo meta suite, Schema.org `@graph` JSON-LD (`Restaurant`, `WebSite`, `BreadcrumbList`, `FAQPage`), `<noscript>` zero-JS crawlable menu summary, and `#faq` Quick Facts & Guest FAQ section.
- `styles.css` — Widescreen responsive layout (`clamp()` typography, 56px slim navbar, multi-row wrapped category filters, zero-overflow Drink Bar, and responsive breakpoints from 4K to 320px).
- `siteData.js` — Single source of truth for restaurant address/contact info, all 9 official menu categories, all 61 official dishes & drinks (`#01` – `#61`), Drink Bar cup proportions, and 16 gallery slots.
- `app.js` — Interactive Menu Explorer (Photo Cards + Classic Menu Board List views), Dish Detail `<dialog>` modal, Drink Bar interactive cup diagram, Gallery Lightbox, and dynamic 61-item `Menu` Schema.org JSON-LD generator.
- `llms.txt` & `llms-full.txt` — Machine-readable entity summary and complete 61-item menu catalog for AI answer engines (ChatGPT Search, Perplexity, Google AI Overviews, Claude, Gemini).
- `robots.txt` & `sitemap.xml` — Search engine and AI crawler configuration + XML & Google Image Sitemap.
- `manifest.webmanifest` — Web App Manifest for mobile devices.
- `assets/`
  - `assets/brand/` — Official Royal Kopitiam circular crest logo.
  - `assets/food/` — Editorial food & beverage photography for menu items and categories.
  - `assets/gallery/` — Restaurant interior and atmosphere photography.

---

## How to Replace Menu or Atmosphere Photos Later

1. Place your new dish or interior photos into `assets/food/` or `assets/gallery/`.
2. Open `siteData.js` and update the `image` path on the corresponding item in `menuItems` (or `galleryPhotos`).
3. To update your street address, Google Maps link, WhatsApp number, or operating hours, edit `restaurantInfo` at the top of `siteData.js`.
