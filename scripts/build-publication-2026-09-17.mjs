import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260917 } from "../content/publication-2026-09-17.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260917.length !== 3) throw new Error(`The 2026-09-17 publication must contain exactly three pages; found ${publication20260917.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260917) {
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

updateFile("gear.html", (html) => insertCard(html, "boat-engine-cutoff-switch-lanyard-wireless-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-engine-cutoff-switch-photo-card.webp" alt="Generic runabout helm with a coiled engine-cutoff lanyard clipped to an unbranded life jacket and a separate wireless fob" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Propulsion safety gear</small><h3>Lanyard vs Wireless Engine Cutoff</h3><p>Match the installed switch, operator handoff and recovery procedure before buying.</p><a class="button" href="boat-engine-cutoff-switch-lanyard-wireless-guide.html">Choose the cutoff link</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "schroon-lake-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/schroon-lake-family-plan-photo-card.webp" alt="Life-jacketed family reviewing a map aboard a generic runabout at an illustrative Adirondack mountain-lake launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Adirondacks</small><h3>Schroon Lake</h3><p>Use the municipal launch, keep the first hour close and protect an early return.</p><a class="button" href="schroon-lake-family-boating.html">Open the family plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "boat-runs-aground-response.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-grounding-response-photo-card.webp" alt="Life-jacketed family seated aboard a generic runabout resting on a soft sandy shoal while adults communicate and inspect from aboard" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Grounding response</small><h3>Stop Before Refloating</h3><p>Protect people, check water and damage, then choose the recovery path deliberately.</p><a class="button" href="boat-runs-aground-response.html">Open the grounding protocol</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Wear the link. Keep Schroon close. Stop before refloating.</h2></div><p>Three new photo-led guides for engine-cutoff choices, a first-hour-close Adirondack day and a conservative grounding response.</p></div><div class="gear-grid"><a class="gear-card" href="boat-engine-cutoff-switch-lanyard-wireless-guide.html"><div class="gear-photo"><img alt="Generic runabout helm with a coiled engine-cutoff lanyard clipped to an unbranded life jacket and a separate wireless fob" src="assets/editorial/boat-engine-cutoff-switch-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Propulsion safety gear</small><h3>The Link Belongs on the Operator</h3><p>Choose physical or wireless by installed-system compatibility and handoff procedure.</p><span class="price">Open the buying guide →</span></div></a><a class="gear-card" href="schroon-lake-family-boating.html"><div class="gear-photo"><img alt="Life-jacketed family reviewing a map aboard a generic runabout at an illustrative Adirondack mountain-lake launch" src="assets/editorial/schroon-lake-family-plan-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Adirondacks</small><h3>Schroon, First Hour Close</h3><p>Plan around the municipal launch, limited trailer parking and an early return.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="boat-runs-aground-response.html"><div class="gear-photo"><img alt="Life-jacketed family seated aboard a generic runabout resting on a soft sandy shoal while adults communicate and inspect from aboard" src="assets/editorial/boat-grounding-response-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Grounding response</small><h3>Neutral Before Reverse</h3><p>Check people, water and bottom before forcing the boat free.</p><span class="price">Open the response matrix →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-security-coupler-wheel-lock-guide.html">trailer security layers</a>, <a href="saratoga-lake-family-boating.html">Saratoga Lake</a>, and <a href="used-boat-title-hin-paperwork-guide.html">the used-boat paperwork gate</a>. Earlier: <a href="boat-trailer-spare-tire-system-guide.html">the trailer spare system</a>, <a href="black-lake-family-boating.html">Black Lake</a>, and <a href="rope-in-boat-propeller-response.html">the rope-entanglement response</a>. Also preserved: <a href="boat-battery-box-tray-hold-down-guide.html">battery securement</a>, <a href="cranberry-lake-family-boating.html">Cranberry Lake</a>, <a href="gasoline-odor-boat-response.html">the gasoline-odor response</a>, <a href="outboard-engine-flushing-methods-guide.html">outboard flushing</a>, <a href="tupper-lake-family-boating.html">Tupper Lake</a>, and <a href="towing-tube-with-kids-safety-plan.html">the family tubing plan</a>.</p></div></section>`;

updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Thu, 17 Sep 2026 15:45:00 GMT</lastBuildDate>");
  const missing = [];
  for (const page of publication20260917) {
    const description = page.description.replaceAll("&", "&amp;");
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) missing.push(`<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Thu, 17 Sep 2026 15:40:00 GMT</pubDate><description>${description}</description></item>`);
  }
  return missing.length ? next.replace("<item>", `${missing.join("")}<item>`) : next;
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260917) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-17</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260917) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return `${next.trimEnd()}\n`;
});

console.log("Built exactly three pages and their discovery surfaces for the 2026-09-17 publication.");
