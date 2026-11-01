# Publication validation — November 1, 2026

- Source-of-record pages: `content/publication-2026-11-01.mjs`
- Generator: `scripts/build-publication-2026-11-01.mjs`
- Daily audit: `scripts/audit-daily-2026-11-01.mjs`
- Inventory: `scripts/inventory-2026-11-01.mjs`
- Expected new pages: exactly 3
- Expected new affiliate links: 3 text-only Amazon category links on the bimini guide
- Expected new editorial assets: 6 unique credited WebP files
- Expected reciprocal links: 6

## Local release gate

- Daily publication audit: PASS — three unique long-form pages, six unique credited editorial assets, zero product images, three protected paid links and six reciprocal cluster links.
- Static-site audit: PASS — 451 HTML pages, 20 long-form thresholds and 446 unique image assets checked.
- SEO audit: PASS — 451 HTML pages, 450 indexable URLs, 397 complete article schemas, 450 breadcrumb schemas and 1,216 dimensioned images.
- Affiliate pipeline: PASS — 439 active of 439 commercial links sitewide, including three new Amazon category links; zero fallbacks.
- Inventory: 451 HTML pages and 464 credited image associations; complete-site and previous-14-day duplicate review persisted in `reports/inventory-2026-11-01.json`.

## Production and live verification

- Production content commit: `2039913a248e41609becb140dee25c4368788a3e` on `main`.
- GitHub checks: static audit `41325631375`, Pages `41325631207`, deploy `41325631460`, and visitor beacon `41325631726` all completed successfully.
- Live custom domain: all three article URLs returned their exact canonical URL, title and H1; all article heroes loaded at 1600×900; all six asset URLs loaded at their intended dimensions.
- Commercial verification: exactly three new category links are active on the bimini guide, carry `sponsored nofollow noopener noreferrer`, open in a new tab, use the configured site tag, and sit behind the visible affiliate disclosure.
- Discovery verification: homepage cards and the Gear, Destinations and Journal hub cards point to the correct new URLs and images. Sitemap, RSS, `llms.txt`, catalog, image-credit manifest/page and six reciprocal cluster links include the batch.
- Image-credit correction: all six new AI-assisted records now name “OpenAI image generation” as their linked source instead of inheriting the credit builder's Wikimedia default label.
- Image QA: PASS in both required passes — 6 unique editorial assets across 9 live placements; 0 affiliate/product images.
