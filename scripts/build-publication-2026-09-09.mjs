import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260909 } from "../content/publication-2026-09-09.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260909.length !== 3) throw new Error(`The 2026-09-09 publication must contain exactly three pages; found ${publication20260909.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260909) {
  if (slugs.has(page.slug)) throw new Error(`Duplicate publication slug: ${page.slug}`);
  if (titles.has(page.title)) throw new Error(`Duplicate publication title: ${page.title}`);
  slugs.add(page.slug);
  titles.add(page.title);
  writeFileSync(join(root, page.slug), renderPage(page));
  console.log(`built ${page.slug}`);
}

function updateFile(name, transform) {
  const path = join(root, name);
  const before = readFileSync(path, "utf8");
  const after = transform(before);
  if (after === before) return;
  writeFileSync(path, after);
  console.log(`updated ${name}`);
}

function insertCard(html, slug, marker, card) {
  if (html.includes(slug)) return html;
  if (!html.includes(marker)) throw new Error(`Discovery marker not found for ${slug}`);
  return html.replace(marker, `${marker}\n${card}`);
}

updateFile("gear.html", (html) => insertCard(html, "boat-trailer-tongue-jack-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-trailer-tongue-jack-photo-card.webp" alt="Unbranded galvanized single-wheel tongue jack supporting a chocked boat trailer" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Trailer support gear</small><h3>Boat Trailer Tongue Jacks</h3><p>Choose single wheel, dual wheel or fixed foot by measured tongue load, travel, frame fit and surface.</p><a class="button" href="boat-trailer-tongue-jack-guide.html">Compare jack types</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "great-sacandaga-lake-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/great-sacandaga-family-planning-photo-card.webp" alt="Family in fitted life jackets reviewing a map beside a trailer boat at a generic Adirondack reservoir launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Adirondack foothills</small><h3>Great Sacandaga Lake</h3><p>Launch early at Northville, prove the boat nearby and protect a short return before the day stretches.</p><a class="button" href="great-sacandaga-lake-family-boating.html">Open the family plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "boat-engine-stall-response.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-engine-stall-response-photo-card.webp" alt="Family seated in life jackets aboard a stopped powerboat while an adult uses a handheld VHF" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Loss of propulsion</small><h3>When the Engine Stops</h3><p>Secure people, read the drift, communicate early and keep diagnosis inside the operator manual.</p><a class="button" href="boat-engine-stall-response.html">Open the response plan</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Support the tongue. Protect the return. Control the drift.</h2></div><p>Three new photo-led guides for trailer-jack fit, a conservative Great Sacandaga family day and a calm loss-of-propulsion response.</p></div><div class="gear-grid"><a class="gear-card" href="boat-trailer-tongue-jack-guide.html"><div class="gear-photo"><img alt="Unbranded galvanized single-wheel tongue jack supporting a chocked boat trailer" src="assets/editorial/boat-trailer-tongue-jack-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Trailer support gear</small><h3>Wheel, Dual Wheel, or Foot?</h3><p>Match measured tongue load, height, frame fit, surface and road clearance before choosing capacity.</p><span class="price">Compare trailer jacks →</span></div></a><a class="gear-card" href="great-sacandaga-lake-family-boating.html"><div class="gear-photo"><img alt="Family in fitted life jackets reviewing a map beside a trailer boat at a generic Adirondack reservoir launch" src="assets/editorial/great-sacandaga-family-planning-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Adirondack foothills</small><h3>Great Sacandaga, Short Return</h3><p>Use the verified Northville launch, prove the boat nearby and turn while weather and crew still agree.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="boat-engine-stall-response.html"><div class="gear-photo"><img alt="Family seated in fitted life jackets aboard a stopped powerboat while an adult uses a handheld VHF" src="assets/editorial/boat-engine-stall-response-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Loss of propulsion</small><h3>Drift. Anchor. Communicate.</h3><p>Stabilize people and the boat before one controlled, manual-approved restart sequence.</p><span class="price">Open the response plan →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-winch-strap-guide.html">trailer winches and bow restraint</a>, <a href="sodus-bay-family-boating.html">a sheltered Sodus Bay family plan</a>, and <a href="crossing-boat-wakes-family.html">the family wake-crossing protocol</a>.</p></div></section>`;
updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  if (xml.includes("boat-trailer-tongue-jack-guide.html")) return xml;
  const items = publication20260909.map((page) => `<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Wed, 09 Sep 2026 12:00:00 GMT</pubDate><description>${page.description.replaceAll("&", "&amp;")}</description></item>`).join("");
  return xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Wed, 09 Sep 2026 16:00:00 GMT</lastBuildDate>").replace("<item>", `${items}<item>`);
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260909) {
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-09</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  }
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260909) {
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  }
  return `${next.trimEnd()}\n`;
});

console.log("Built exactly three pages and their discovery surfaces for the 2026-09-09 publication.");
