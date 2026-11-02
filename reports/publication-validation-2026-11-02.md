# Publication validation — November 2, 2026

- Source of record: `content/publication-2026-11-02.mjs`
- Generator: `scripts/build-publication-2026-11-02.mjs`
- Daily audit: `scripts/audit-daily-2026-11-02.mjs`
- Inventory: `scripts/inventory-2026-11-02.mjs`
- Expected new pages: exactly 3
- Expected new affiliate links: 3 text-only Amazon category links on the beacon guide
- Expected new editorial assets: 6 unique credited WebP files
- Expected reciprocal links: 6

## Local release gate

- Daily publication audit: PASS — three unique pages above the 1,400-word long-form gate, six unique credited editorial assets, zero product images, three protected paid links and six reciprocal cluster links.
- Static-site audit: PASS — 454 HTML pages, 20 long-form thresholds and 452 unique image assets checked.
- SEO audit: PASS — 454 HTML pages, 453 indexable URLs, 400 complete article schemas, 453 breadcrumb schemas and 1,225 dimensioned image references.
- Affiliate pipeline: PASS — 442 active of 442 commercial links sitewide, including three new Amazon category links; zero fallbacks.
- Inventory: 454 HTML pages and 470 credited image associations; complete-site and previous-14-day duplicate review persisted in `reports/inventory-2026-11-02.json`.
- Discovery: homepage, Gear, Destinations and Journal hubs, sitemap, RSS, `llms.txt`, catalog, image credits and six reciprocal links contain the batch.
- Image QA pass 1: PASS — 6 unique editorial assets; 0 affiliate/product images.

## Production and live verification

- Content publication commit: `81c61eed02b2ad7e61b25d9b9f1ae8c3ac7c5e63`.
- The first workflow run exposed stale historical tests that required old daily cards to remain on the rotating homepage. The audit-only correction retained permanent hub, sitemap, RSS, catalog and `llms.txt` discovery requirements; the full historical suite then passed locally with `bash -e`.
- Audit correction commit: `ca09ae0c61abf6241c548c003bfbd64e0b230e29`.
- Final GitHub workflows: PASS — static site audit, production deployment, GitHub Pages build/deployment and visitor-beacon normalization all completed successfully.
- Live page checks: PASS — all 3 canonical custom-domain pages render the expected titles, article content, primary-source sections and related-guide modules.
- Live monetization: PASS — the beacon guide exposes exactly 3 descriptive Amazon category links, the visible Associate/editorial disclosure and protected paid-link markup; sitewide report remains 442 active of 442 commercial links with zero fallbacks.
- Live discovery: PASS — the current homepage shows all 3 new cards, and the correct new card appears on each of Gear, Destinations and Journal. Sitemap/RSS/catalog discovery was also validated by the publication audits.
- Image QA pass 2: PASS — 6 unique editorial assets across 9 live placements; 0 affiliate/product images; no broken source, fallback substitution, misleading crop or card mismatch.
