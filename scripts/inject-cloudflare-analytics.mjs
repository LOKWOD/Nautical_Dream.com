import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const token = "7d34e78ef7f14920a113c9c7564e42ea";
const beaconSrc = "https://static.cloudflareinsights.com/beacon.min.js";
const beacon = `<!-- Cloudflare Web Analytics --><script type='module' src='${beaconSrc}' data-cf-beacon='{"token": "${token}"}'></script><!-- End Cloudflare Web Analytics -->`;
const existingBeaconPattern = /(?:<!--\s*Cloudflare Web Analytics\s*-->)?\s*<script\b[^>]*\bsrc=["']https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js["'][^>]*><\/script>\s*(?:<!--\s*End Cloudflare Web Analytics\s*-->)?/gi;

let updated = 0;
let alreadyCorrect = 0;

for (const file of readdirSync(".").filter((name) => name.endsWith(".html"))) {
  const original = readFileSync(file, "utf8");

  if (!original.includes("</body>")) {
    throw new Error(`Cannot inject analytics into ${file}: missing </body>`);
  }

  // Remove any stale or duplicate Cloudflare Web Analytics beacon first, then
  // insert exactly one known-good beacon immediately before </body>.
  const cleaned = original.replace(existingBeaconPattern, "").replace(/\s+<\/body>/, "</body>");
  const next = cleaned.replace("</body>", `\n${beacon}\n</body>`);

  const beaconCount = (next.match(/static\.cloudflareinsights\.com\/beacon\.min\.js/g) || []).length;
  if (beaconCount !== 1 || !next.includes(token)) {
    throw new Error(`Analytics verification failed for ${file}`);
  }

  if (next === original) {
    alreadyCorrect += 1;
    continue;
  }

  writeFileSync(file, next);
  updated += 1;
}

console.log(`Cloudflare Web Analytics: normalized ${updated} page(s); already correct on ${alreadyCorrect} page(s).`);
