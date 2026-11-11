# Publication validation — 2026-11-11

## Scope

Exactly three new source-driven pages, six unique editorial images, homepage and three hub placements, feed, sitemap, catalog, llms index, image credits and six reciprocal contextual links.

## Local validation

Passed: source generator, image-credit generator, affiliate injection, complete inventory, daily publication audit, static-site audit, SEO/schema audit, hub-image duplicate scan and `git diff --check`.

- 481 HTML pages; 480 indexable URLs.
- 469 commercial links and 469 active affiliate links; the new hatch guide contributes three protected paid category links.
- Six unique new editorial assets, zero product images, no missing assets or duplicate page-level images.
- Exactly three new pages, complete discovery surfaces and six reciprocal links.

## Production validation

The publication deployed successfully from `main`. The custom deployment, static-site audit and Visitor Light workflows all completed successfully for production commit `6a36b3269d6a946cb37bc59a373e31021cbc19ce`; the subsequent GitHub Pages publication/Visitor Light commit `d6f0b02cbe0790914a0ca58efff020995795b6da` also completed successfully. A redundant native Pages run on the earlier production commit was cancelled by the repository's deployment concurrency group after the custom deploy took ownership; it did not represent a publication failure.

All three canonical pages returned live with the intended title, metadata, structured data and internal links. The hatch guide exposed three active Amazon category links with the approved tag, visible Associate disclosure and `sponsored nofollow noopener noreferrer`; the two noncommercial pages exposed no paid links. The sitewide affiliate report remained **469 active links out of 469 commercial links, with zero fallbacks**.

Live visual QA confirmed all three heroes, all three homepage cards and the matching Gear, Destinations and Journal hub cards. The six credited editorial assets rendered in nine placements with the correct subjects, crops, alt text and destination associations; there were no affiliate/product images.

Final deployment result: **PASS**. Production generation, affiliate injection, duplicate checks, image-credit checks, broken-link/asset checks, metadata/schema checks, static-site audit, SEO audit, custom deployment, GitHub Pages publication and visitor-beacon verification all passed.
