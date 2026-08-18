# Nautical Dream affiliate setup

The publication pipeline now identifies commercial buttons in buyer guides, applies compliant link attributes, injects click tracking, creates a link inventory, and converts eligible buttons into affiliate links when a program is configured.

## Current safe behavior

`affiliate-config.json` ships with no Amazon Associates tag and no direct retailer overrides. Until a real account is connected, the site keeps its existing manufacturer links. It never publishes a fake tag or pretends a normal link earns commission.

Every build writes `assets/affiliate-link-report.json`. The report lists each detected product button, its stable key, its current destination, and whether it is an active affiliate link.

## Turn on Amazon Associates

1. Apply to Amazon Associates using `https://nauticaldream.com` as the website.
2. Copy the US Associate/Tracking ID issued by Amazon, such as `example-20`.
3. In GitHub, open **Settings → Secrets and variables → Actions → Variables**.
4. Create a repository variable named `AMAZON_ASSOCIATE_TAG` and paste the ID as its value.
5. Run the **Deploy Nautical Dream static publication** workflow, or push any commit to `main`.

When the variable exists, eligible buyer-guide buttons without a direct retailer override become Amazon product-search links tagged to that Associate ID. The build also inserts Amazon’s required Associate disclosure beside the existing editorial disclosure.

The same value can be placed in `amazon.associateTag` inside `affiliate-config.json`, but the repository variable is easier to change without another code edit.

## Add West Marine or another direct affiliate program

Direct deep links take priority over Amazon. Generate the complete tracked deep link in the retailer’s affiliate portal, then add an entry to the `overrides` array in `affiliate-config.json`:

```json
{
  "key": "best-chartplotters.html::garmin-echomap-uhd2-7-or-9-inch",
  "url": "PASTE_THE_COMPLETE_TRACKED_HTTPS_DEEP_LINK_HERE",
  "retailer": "West Marine",
  "label": "Check West Marine price"
}
```

Use the exact `key` from `assets/affiliate-link-report.json`. An override may instead use `matchUrl` to replace every occurrence of one existing manufacturer URL.

Only paste links created by the approved affiliate account. A normal product URL does not become commission-bearing merely because it appears in this file.

## What the build does

- Scans `best-*.html`, `*-guide.html`, and `beginner-boat-diy.html`.
- Targets external shopping-style buttons with approved CSS classes.
- Preserves the original manufacturer URL as a safe fallback.
- Gives direct retailer overrides first priority and Amazon second priority.
- Adds `rel="sponsored nofollow noopener noreferrer"` to active affiliate links.
- Places the affiliate disclosure near the article’s existing disclosure.
- Records `affiliate_click` and `product_outbound_click` events through the site’s existing analytics layer.
- Generates `assets/affiliate-link-report.json` on every build.

## Local verification

```bash
npm run build:affiliate
cat assets/affiliate-link-report.json
node scripts/audit-static-site.mjs
```

The injector is idempotent, validates HTTPS destinations, and fails the build if an Amazon tag is configured but no eligible buttons are converted.

## Important account rule

Do not purchase through your own Amazon affiliate links or ask relatives, employees, or close associates to do so. Use the Amazon Associates dashboard and Link Checker to confirm tracking after deployment.
