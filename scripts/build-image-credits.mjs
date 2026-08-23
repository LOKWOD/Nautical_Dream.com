import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, "assets", "editorial", "attribution.json"), "utf8"));
const html = readdirSync(root)
  .filter((file) => file.endsWith(".html") && file !== "image-credits.html")
  .map((file) => readFileSync(join(root, file), "utf8"))
  .join("\n");

const used = Object.values(manifest)
  .filter((item) => html.includes(item.localPath))
  .sort((a, b) => a.title.localeCompare(b.title));

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const rows = used.map((item) => {
  const source = item.sourceUrl
    ? `<a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener">${esc(item.sourceLabel || "Wikimedia Commons")}</a>`
    : esc(item.sourceLabel || "Nautical Dream original");
  return `<tr><td>${esc(item.title)}</td><td>${esc(item.creator || "Source record")}</td><td>${source}</td><td>${item.licenseUrl ? `<a href="${esc(item.licenseUrl)}" target="_blank" rel="noopener">${esc(item.license)}</a>` : esc(item.license)}</td></tr>`;
}).join("");

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Image Credits | Nautical Dream</title>
  <meta name="description" content="Sources, creators and licenses for documentary photographs and original editorial illustrations published by Nautical Dream.">
  <link rel="canonical" href="https://nauticaldream.com/image-credits.html">
  <meta property="og:type" content="website"><meta property="og:site_name" content="Nautical Dream"><meta property="og:title" content="Nautical Dream Photography Credits"><meta property="og:description" content="Traceable sources and licenses for photography used across Nautical Dream."><meta property="og:url" content="https://nauticaldream.com/image-credits.html">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="site-header"><div class="shell nav"><a class="brand" href="index.html">NAUTICAL <span>DREAM</span></a><nav class="links" aria-label="Primary navigation"><a href="destinations.html">Destinations</a><a href="gear.html">Gear</a><a href="weather.html">Weather</a><a href="journal.html">Journal</a><a href="about.html">About</a></nav></div></header>
<main><section class="hero" style="--hero:url('assets/editorial/newport-harbor.jpg')"><div class="shell"><div class="eyebrow">Editorial record</div><h1>Image credits.</h1><p>Documentary photographs need a traceable source. Original illustrations need a clear creator and purpose.</p></div></section>
<section class="section"><div class="shell copy"><h2>How images are selected</h2><p>Nautical Dream uses licensed documentary photography, public-domain archival material and clearly identified illustrative graphics. Article captions provide nearby attribution where practical; this page supplies a consolidated record for photographs used across cards, heroes and editorial features.</p><p>Images may be cropped, resized or compressed for responsive web presentation. Those technical changes do not alter the underlying license. Questions or corrections can be sent through the <a href="contact.html">contact page</a>.</p>
<div class="table-wrap"><table class="comparison"><thead><tr><th>Image</th><th>Creator</th><th>Source</th><th>License</th></tr></thead><tbody>${rows}<tr><td>Boldt Castle and Power House, Heart Island</td><td>remundo</td><td><a href="https://commons.wikimedia.org/wiki/File:Boldt_Castle_and_Power_House,_Heart_Island,_1000_Islands_(30211977530).jpg" target="_blank" rel="noopener">Wikimedia Commons</a></td><td><a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noopener">CC BY-SA 2.0</a></td></tr></tbody></table></div>
<p><a class="back-link" href="privacy.html">← Privacy, disclosure and editorial policy</a></p></div></section></main>
<footer class="footer"><div class="shell footer-row"><div><div class="brand">NAUTICAL <span>DREAM</span></div><p>Premium inspiration, practical planning and trusted recommendations for life on the water.</p></div><div class="legal">© 2026 Nautical Dream · <a href="privacy.html">Privacy &amp; Disclosure</a></div></div></footer>
<!-- Cloudflare Web Analytics --><script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"7d34e78ef7f14920a113c9c7564e42ea"}'></script><!-- End Cloudflare Web Analytics -->
<!-- LOKWOD Website Visitor Beacon --><script defer src="https://lokwod-visitor-beacon.syracuseappraiser.workers.dev/beacon.js" data-site="nautical-dream"></script><!-- End LOKWOD Website Visitor Beacon -->
</body></html>\n`;

writeFileSync(join(root, "image-credits.html"), page);
console.log(`Built image-credits.html with ${used.length + 1} credited images.`);
