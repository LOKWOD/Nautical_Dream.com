# Publication validation — 2026-10-18

## Pre-publication gates

- Exactly three new article sources and generated pages, with distinct titles, slugs and primary decisions. No October 18 batch existed at the starting production revision.
- Full production Pages workflow command sequence executed locally, including all dated generation and publication audits, image credits, contextual products, affiliate injection, SEO optimization, Cloudflare and visitor beacon integration, image audit, static audit and SEO audit. All passed.
- Final static/SEO/image/daily checks pass: 409 HTML pages, 408 indexable URLs, 362 image assets, 355 complete article schemas, 408 breadcrumb schemas, 1,090 dimensioned image uses. Every new article exceeds the 1,000-word audit floor; no broken internal link, missing asset, duplicate title/canonical or same-page duplicate display image was reported.
- Three new category-specific affiliate anchors, all using the existing approved injector and tag, visible Amazon Associate disclosure and sponsored/nofollow/noopener/noreferrer markup. Sitewide report: 395 configured active affiliate links, zero fallback-only commercial links. No partner approval or product test is invented.
- Six new unique editorial WebP images inspected as actual assets against final copy, alt descriptions and credit records before publication; zero affiliate/product images. They are expressly conceptual, not Lake Colby location photography or exact commercial products.
- Homepage latest-guide module, three hubs, catalog, sitemap, RSS feed, llms.txt, image credits and six reciprocal contextual links updated. Existing custom domain, affiliate configuration, newsletter behavior, visitor beacon and analytics preserved.
- Older October 17 generator made forward-idempotent so a later recent-library date does not cause a rebuild failure. Full historical sequence passes against October 18 state.
- Incidental normalization and historical SEO drift from the local full-generation check were removed from unrelated generated HTML before staging. The new batch and required discovery/cluster output remain regenerated from source.

## External checks and limitations

Direct requests returned HTTP 200 for Scotty's three model-reference pages and manuals, New York's Lake Colby statute, both National Weather Service pages, USCG FAQ and Transport Canada rental practices. NYSDEC and State Parks returned HTTP 403 to direct requests; their current official content was separately retrieved and read through the research service. Those responses do not establish broken reader links or closure.

All three Amazon category destinations returned HTTP 503 to direct checks. Their query destinations and approved tagging/markup are structurally valid, and independent manufacturer references are available, but successful Amazon destination loading is not claimed. Prices, stock, ratings and checkout availability are not asserted.

## Deployment and rendered verification

Publication commit 327d84d34ead27e1c85630ef793a4585a8afe824 reached main. All four triggered workflows succeeded: Static site audit, Deploy Nautical Dream static publication, Keep Visitor Light beacon in published HTML, and pages build and deployment. The production build regenerated the source and passed all publication checks before deployment.

All three custom-domain article URLs returned HTTP 200 with October 18 metadata. The homepage root and index.html show the new dated lead after a normal browser refresh. The three category hubs, sitemap and new image-credit titles were verified live. Commercial-link DOM checks confirm three category-specific Amazon links, approved tagging and all four paid-link rel values, with visible disclosures.

The 35 unique internal destinations linked by the three live pages were requested from the custom domain; all returned HTTP 200. Live canonicals, Article/TravelGuide, BreadcrumbList and FAQPage data were parsed successfully. New article lengths are approximately 1,557, 1,682 and 1,812 rendered article words.

Post-deployment image QA completed: six unique page/editorial images and zero affiliate/product images, in addition to the pre-commit pass. Each live article hero was visually opened and matched to its final title/copy. All three homepage card images and their corresponding gear, destination and journal hub crops were visually checked. All six deployed WebP files returned HTTP 200 and exactly matched the locally inspected assets by SHA-256. No incorrect fallback, broken source or substituted image was found.

Amazon remains a verification limitation: the browser returned an Amazon page saying it does not support this session/client, after the earlier direct HTTP 503 results. No attempt was made to evade that restriction. Successful retail loading, stock or checkout is not claimed. Independent manufacturer references returned HTTP 200. The main publication is live; the limitation concerns the external retailer's response to this verification environment, not missing tracking or disclosure markup.
