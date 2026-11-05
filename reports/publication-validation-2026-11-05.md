# Publication validation — November 5, 2026

Status: production validation, deployment and live custom-domain checks passed.

- Source of record: exactly three new pages.
- Full production-order dry run: daily source generation, image-credit generation, contextual-product injector, affiliate injector, SEO optimizer, Cloudflare analytics injector and visitor-beacon injector completed successfully on the complete site.
- Final stored publication: generated from the November 5 source, with three protected commercial links on the propeller page and no paid links on the other two pages.
- Inventory: 463 HTML pages, 488 credited asset records and a persisted full-site/title/slug/intent/image/category hash set plus the fourteen-day window.
- Daily audit: passed — three distinct long-form pages, six unique editorial assets, zero affiliate/product images, three protected paid links, 451 active affiliate links sitewide, full discovery and six reciprocal links.
- Image audit: passed predeployment — 463 HTML pages, 1,708 display references and no same-page local image reuse.
- Static-site audit: passed — 463 HTML pages, 20 long-form thresholds and 470 unique image assets checked.
- SEO audit: passed — 462 indexable URLs, 409 complete article schemas, 462 breadcrumb schemas and 1,252 dimensioned images.
- `git diff --check`: passed.

- GitHub Pages: workflow 42070956028 completed successfully for production commit `bd438e6dd2fa9708907d43288bad48b4013db539`; build and deploy jobs both passed.
- Live URLs: all three custom-domain pages rendered the expected title, H1, canonical and Article schema.
- Monetization: the propeller guide exposes three relevant Amazon category links with the configured tag and `sponsored nofollow noopener noreferrer`; the other two pages contain no paid links. The publication audit reports 451 active affiliate links sitewide.
- Image QA: six unique editorial assets were visually checked before commit and again across nine live placements (three heroes, three homepage cards and three hub cards); zero affiliate/product images. All six live image-credit records were present and correct.
