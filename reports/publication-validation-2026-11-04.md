# Publication validation — November 4, 2026

- Source of record: `content/publication-2026-11-04.mjs`
- Generator: `scripts/build-publication-2026-11-04.mjs`
- Daily audit: `scripts/audit-daily-2026-11-04.mjs`
- Inventory: `scripts/inventory-2026-11-04.mjs`
- Expected new pages: exactly 3
- Expected new affiliate links: 3 text-only Amazon category links on the canvas-snap guide
- Expected new editorial assets: 6 unique credited WebP files
- Expected reciprocal links: 6

## Local release gate

- Daily publication audit: PASS — three unique pages above the 1,400-word gate, six unique credited editorial assets, zero product images, three protected paid links and six reciprocal cluster links.
- Static-site audit: PASS — 460 HTML pages, 20 long-form thresholds and 464 unique image assets checked.
- SEO audit: PASS — 460 HTML pages, 459 indexable URLs, 406 complete article schemas, 459 breadcrumb schemas and 1,243 dimensioned image references.
- Affiliate pipeline: PASS — 448 active of 448 commercial links sitewide, including three new Amazon category links; zero fallbacks.
- Inventory: 460 HTML pages and 482 credited assets; complete-site and previous-14-day duplicate review persisted in `reports/inventory-2026-11-04.json`.
- Discovery: homepage, Gear and Journal hubs, sitemap, RSS, `llms.txt`, catalog, image credits and six reciprocal links contain the batch.
- Image QA pass 1: PASS — 6 unique editorial assets; 0 affiliate/product images. One rejected draft was not published.

## Production and live verification

- Publication commit: `09e7137eceab08254ad67371b1c72dba17fbd483`
- Pages regeneration-order fix: `f183e5e4c1c775308fcb31fa49e768fd95c74990`
- Corrected deployment workflows: custom publication run `41877440090` PASS; static-site audit run `41877440144` PASS; visitor-beacon run `41877440111` PASS; GitHub Pages build/deployment run `41877440132` PASS.
- Custom-domain pages: PASS — all three URLs returned the intended title, canonical, Article/Breadcrumb/FAQ schema, internal links and credited hero asset.
- Monetization: PASS — the canvas-snap guide exposed three active category-specific Amazon links with the repository-configured tracking, visible disclosure and `sponsored nofollow noopener noreferrer`; the other two guides contained no commercial links.
- Discovery: PASS — the live homepage, Gear hub, Journal hub, sitemap, RSS, `llms.txt`, editorial catalog and image-credit page contain the batch.
- Reciprocal links: PASS — all six established supporting pages link to their intended new guide after the corrected deployment.
- Image QA pass 2: PASS — six unique editorial images visually checked across nine live placements; zero affiliate/product images; no wrong association, fallback, broken source or crop conflict.

