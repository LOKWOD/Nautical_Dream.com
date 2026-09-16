import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260916 } from "../content/publication-2026-09-16.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260916.length !== 3) throw new Error(`The 2026-09-16 publication must contain exactly three pages; found ${publication20260916.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260916) {
  if (slugs.has(page.slug)) throw new Error(`Duplicate publication slug: ${page.slug}`);
  if (titles.has(page.title)) throw new Error(`Duplicate publication title: ${page.title}`);
  slugs.add(page.slug); titles.add(page.title);
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

updateFile("gear.html", (html) => insertCard(html, "boat-trailer-security-coupler-wheel-lock-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-trailer-security-layers-photo-card.webp" alt="Unbranded boat trailer secured by a fitted coupler lock and wheel clamp with separate receiver-style security hardware nearby" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Trailer security gear</small><h3>Coupler Lock vs Receiver Lock vs Wheel Clamp</h3><p>Match independent deterrence layers to the way the trailer is actually parked.</p><a class="button" href="boat-trailer-security-coupler-wheel-lock-guide.html">Build the security system</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "saratoga-lake-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/saratoga-lake-family-plan-photo-card.webp" alt="Life-jacketed family reviewing a lake chart beside a runabout at an illustrative inland New York launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Capital Region</small><h3>Saratoga Lake</h3><p>Use the Route 9P state launch, protect the first hour and earn any extension.</p><a class="button" href="saratoga-lake-family-boating.html">Open the family plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "used-boat-title-hin-paperwork-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/used-boat-paperwork-photo-card.webp" alt="Buyer and seller comparing a generic hull identification plate with title, registration and bill-of-sale paperwork" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Used-boat ownership</small><h3>Match the HIN Before Paying</h3><p>Reconcile the physical boat, ownership document, seller and lien before money moves.</p><a class="button" href="used-boat-title-hin-paperwork-guide.html">Open the paperwork protocol</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Layer the lock. Keep Saratoga short. Match the HIN.</h2></div><p>Three new photo-led guides for trailer security, a state-launch family day and a document-first used-boat purchase.</p></div><div class="gear-grid"><a class="gear-card" href="boat-trailer-security-coupler-wheel-lock-guide.html"><div class="gear-photo"><img alt="Unbranded boat trailer secured by a fitted coupler lock and wheel clamp with separate receiver-style security hardware nearby" src="assets/editorial/boat-trailer-security-layers-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Trailer security gear</small><h3>One Lock Is One Layer</h3><p>Match coupler, receiver and wheel deterrence to the real parked state.</p><span class="price">Build the layered system →</span></div></a><a class="gear-card" href="saratoga-lake-family-boating.html"><div class="gear-photo"><img alt="Life-jacketed family reviewing a lake chart beside a runabout at an illustrative inland New York launch" src="assets/editorial/saratoga-lake-family-plan-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Capital Region</small><h3>Saratoga, First Hour Protected</h3><p>Launch from Route 9P, prove the boat close and earn one modest extension.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="used-boat-title-hin-paperwork-guide.html"><div class="gear-photo"><img alt="Buyer and seller comparing a generic hull identification plate with title, registration and bill-of-sale paperwork" src="assets/editorial/used-boat-paperwork-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Used-boat ownership</small><h3>The HIN Is the Gate</h3><p>Match boat, document, seller and lien before payment.</p><span class="price">Open the purchase protocol →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-spare-tire-system-guide.html">the trailer spare system</a>, <a href="black-lake-family-boating.html">a short Black Lake plan</a>, and <a href="rope-in-boat-propeller-response.html">the rope-entanglement response</a>. Earlier: <a href="boat-battery-box-tray-hold-down-guide.html">battery securement</a>, <a href="cranberry-lake-family-boating.html">Cranberry Lake</a>, and <a href="gasoline-odor-boat-response.html">the gasoline-odor response</a>. Also preserved: <a href="outboard-engine-flushing-methods-guide.html">outboard flushing</a>, <a href="tupper-lake-family-boating.html">Tupper Lake</a>, and <a href="towing-tube-with-kids-safety-plan.html">the family tubing plan</a>.</p></div></section>`;

updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Wed, 16 Sep 2026 15:00:00 GMT</lastBuildDate>");
  const missing = [];
  for (const page of publication20260916) {
    const description = page.description.replaceAll("&", "&amp;");
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) missing.push(`<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Wed, 16 Sep 2026 14:55:00 GMT</pubDate><description>${description}</description></item>`);
  }
  return missing.length ? next.replace("<item>", `${missing.join("")}<item>`) : next;
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260916) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-16</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260916) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return `${next.trimEnd()}\n`;
});

console.log("Built exactly three pages and their discovery surfaces for the 2026-09-16 publication.");
