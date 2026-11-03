# Publication validation — November 3, 2026

- Source of record: `content/publication-2026-11-03.mjs`
- Generator: `scripts/build-publication-2026-11-03.mjs`
- Daily audit: `scripts/audit-daily-2026-11-03.mjs`
- Inventory: `scripts/inventory-2026-11-03.mjs`
- Expected new pages: exactly 3
- Expected new affiliate links: 3 text-only Amazon category links on the steering guide
- Expected new editorial assets: 6 unique credited WebP files
- Expected reciprocal links: 6

## Local release gate

- Daily publication audit: PASS — three unique pages above the 1,400-word gate, six unique credited editorial assets, zero product images, three protected paid links and six reciprocal cluster links.
- Static-site audit: PASS — 457 HTML pages, 20 long-form thresholds and 458 unique image assets checked.
- SEO audit: PASS — 457 HTML pages, 456 indexable URLs, 403 complete article schemas, 456 breadcrumb schemas and 1,234 dimensioned image references.
- Affiliate pipeline: PASS — 445 active of 445 commercial links sitewide, including three new Amazon category links; zero fallbacks.
- Inventory: 457 HTML pages and 476 credited assets; complete-site and previous-14-day duplicate review persisted in `reports/inventory-2026-11-03.json`.
- Discovery: homepage, Gear, Destinations and Journal hubs, sitemap, RSS, `llms.txt`, catalog, image credits and six reciprocal links contain the batch.
- Image QA pass 1: PASS — 6 unique editorial assets; 0 affiliate/product images.

## Production and live verification

- Publication commit: `4bae029b831f6267aef539c362febef87f06494b` on `main`.
- GitHub Pages deployment: PASS — Pages build/deployment run `41681558369` completed successfully.
- Repository workflows: PASS — static publication deploy `41681560222`, static-site audit `41681560271` and visitor-beacon preservation `41681560254` all completed successfully.
- Custom-domain pages: PASS — all three canonical URLs returned their final titles, headings, schema and internal links on `https://nauticaldream.com/`.
- Monetization: PASS — the steering guide exposes three descriptive category-level Amazon links with the configured Associate tag, visible disclosure, `_blank` target and `sponsored nofollow noopener noreferrer`; the other two pages contain no commercial links.
- Discovery: PASS — the November 3 homepage module and the Gear, Destinations and Journal cards render the correct linked titles and images; the sitemap, RSS, catalog, `llms.txt` and image-credit records are live.
- Image QA pass 2: PASS — 6 unique editorial assets across 9 live placements; 0 affiliate/product images. No broken source, fallback substitution, misleading crop or card association was found.
