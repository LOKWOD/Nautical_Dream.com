# Publication validation — October 25, 2026

Exactly three new source-backed pages were generated from `content/publication-2026-10-25.mjs`. Local source syntax, generation, image-credit build, affiliate injection, full inventory, static-site audit, SEO audit, hub-image audit and batch-specific audit passed. The generated site contains 430 HTML pages. All 49 dated daily audits pass after correcting the October 23 audit’s obsolete expectation that a dated batch remain in the rotating homepage lead.

Monetization: three text-only Amazon category links are active on the seat-pedestal guide. Each carries the configured Associate tag, sponsored/nofollow/noopener, tracking attributes and a visible disclosure. The destination and reservoir-level pages have no paid links. Sitewide report: 418 active affiliate links and zero fallbacks.

Production publication commit: `81d93e48fc314bac36f6a5a61d411ec18acae21b`. A live check found that the Pages workflow regenerated only through October 24 and therefore served the previous homepage lead even though `main` contained the October 25 source and output. Both `.github/workflows/pages.yml` and `.github/workflows/static-site-audit.yml` now run the October 25 builder and batch audit; corrective commit `e8615fc3cea11f3d89109391262c3b7cc48e7839` deployed successfully.

All four Actions workflows passed for the corrective commit: custom Pages publication, GitHub Pages build/deployment, static-site audit and visitor-beacon normalization. The three clean custom-domain article URLs returned the intended current pages. Live DOM verification found exactly three Amazon links on the seat-pedestal page with `sponsored nofollow noopener noreferrer`, a visible Associate disclosure and the configured tag; the other two pages contained no Amazon links.

Second-pass visual QA passed on the three live article heroes, three homepage cards and three matching hub cards: 6 unique editorial assets across 9 rendered placements, with no swap, fallback or broken source. Affiliate/product images checked: 0.
