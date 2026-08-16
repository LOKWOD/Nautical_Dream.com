import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const beacon = `<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "7d34e78ef7f14920a113c9c7564e42ea"}'></script><!-- End Cloudflare Web Analytics -->`;
const token = "7d34e78ef7f14920a113c9c7564e42ea";

let updated = 0;
let alreadyPresent = 0;

for (const file of readdirSync(".").filter((name) => name.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");

  if (html.includes(token)) {
    alreadyPresent += 1;
    continue;
  }

  if (!html.includes("</body>")) {
    throw new Error(`Cannot inject analytics into ${file}: missing </body>`);
  }

  writeFileSync(file, html.replace("</body>", `${beacon}</body>`));
  updated += 1;
}

console.log(`Cloudflare Web Analytics: injected into ${updated} page(s); already present on ${alreadyPresent} page(s).`);
