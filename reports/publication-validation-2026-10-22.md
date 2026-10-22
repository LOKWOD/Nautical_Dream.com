# Publication validation — October 22, 2026

## Pre-deployment result

- Source-of-record build: passed; exactly three entries in `content/publication-2026-10-22.mjs` generated three HTML pages.
- Full post-publication inventory: 421 HTML pages and 404 credited assets.
- Daily audit: passed; each page exceeds 1,100 article words, has complete metadata/schema, at least nine distinct internal links, correct hub/homepage/feed/sitemap/catalog/`llms.txt` discovery, and no duplicate title, canonical, slug or image hash.
- Affiliate pipeline: 406 active approved links sitewide; exactly three new protected commercial links on the TPMS page, each with descriptive category text, approved tag injection, `sponsored nofollow noopener`, disclosure and no product image.
- Image audit: six unique original editorial assets, correct 1600×900 hero and 1200×900 card dimensions, complete source records, no page-level duplicate display image and zero affiliate/product images.
- Static-site audit: passed across 421 HTML pages and 386 unique measured image assets.
- SEO audit: passed across 420 indexable URLs, 367 complete article schemas, 420 breadcrumb schemas and 1,126 dimensioned images.
- JavaScript syntax checks: passed for the source, builder, inventory and daily-audit modules.

## Deployment result

- Publication commit: `ee59cac544198101848731af212dba8b4dc6ab7c` on `main`.
- GitHub Actions: custom Pages deployment, GitHub Pages build/deployment, static-site audit, and visitor-beacon normalization all completed successfully.
- Live custom-domain verification passed for all three canonical article URLs, the homepage module, and the Gear, Destinations and Journal hubs.
- Live metadata checks confirmed the expected canonical URL and Article/Guide/HowTo, BreadcrumbList and FAQPage schema on the new pages.
- Live monetization check confirmed all three descriptive Amazon category anchors on the TPMS guide retain the approved affiliate destination and `sponsored nofollow noopener noreferrer` protection. No affiliate link was clicked during QA.
- Live image pass confirmed six unique editorial assets across nine rendered article/homepage/hub placements, with correct crop and association and zero affiliate/product images.
