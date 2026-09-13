import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260913 } from "../content/publication-2026-09-13.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260913.length !== 3) throw new Error(`The 2026-09-13 publication must contain exactly three pages; found ${publication20260913.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260913) {
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

updateFile("gear.html", (html) => insertCard(html, "boat-battery-box-tray-hold-down-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-battery-securement-photo-card.webp" alt="Boat owner reviewing an installation manual with an unbranded battery box, rigid tray and terminal boots staged separately" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Marine electrical installation gear</small><h3>Boat Battery Securement</h3><p>Choose a box, tray and hold-down by the actual battery, structure, terminal protection and ventilation.</p><a class="button" href="boat-battery-box-tray-hold-down-guide.html">Compare securement systems</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "cranberry-lake-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/cranberry-lake-family-planning-photo-card.webp" alt="Family in fitted life jackets reviewing a chart beside a runabout at a generic wooded Adirondack lake launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Adirondacks</small><h3>Cranberry Lake</h3><p>Use the verified Columbian Road launch, prove the boat close and protect the return.</p><a class="button" href="cranberry-lake-family-boating.html">Open the family plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "gasoline-odor-boat-response.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/gasoline-odor-response-photo-card.webp" alt="Family moving away from a docked runabout while the operator keeps the engine off" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Fuel-vapor response</small><h3>You Smell Gasoline</h3><p>Create no spark, do not start the engine or pump fuel overboard, and get people clear.</p><a class="button" href="gasoline-odor-boat-response.html">Open the response plan</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Secure the battery. Keep Cranberry short. Treat fuel odor as real.</h2></div><p>Three new photo-led guides for battery installation decisions, a conservative Adirondack launch day and a no-spark gasoline-vapor response.</p></div><div class="gear-grid"><a class="gear-card" href="boat-battery-box-tray-hold-down-guide.html"><div class="gear-photo"><img alt="Boat owner reviewing an installation manual with an unbranded battery box, rigid tray and terminal boots staged separately" src="assets/editorial/boat-battery-securement-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Marine electrical installation gear</small><h3>Box, Tray or Hold-Down?</h3><p>Restrain the mass, shield the terminals and preserve the required ventilation.</p><span class="price">Compare securement systems →</span></div></a><a class="gear-card" href="cranberry-lake-family-boating.html"><div class="gear-photo"><img alt="Family in fitted life jackets reviewing a chart beside a runabout at a generic wooded Adirondack lake launch" src="assets/editorial/cranberry-lake-family-planning-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Adirondacks</small><h3>Cranberry, Short Return</h3><p>Launch at Columbian Road, prove the boat nearby and turn before distance owns the day.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="gasoline-odor-boat-response.html"><div class="gear-photo"><img alt="Family moving away from a docked runabout while the operator keeps the engine off" src="assets/editorial/gasoline-odor-response-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Fuel-vapor response</small><h3>No Spark. No Start.</h3><p>Get people clear, communicate precisely and leave diagnosis to qualified help.</p><span class="price">Open the response plan →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="outboard-engine-flushing-methods-guide.html">manual-first outboard flushing</a>, <a href="tupper-lake-family-boating.html">a short-return Tupper plan</a>, and <a href="towing-tube-with-kids-safety-plan.html">the family tubing brief</a>. Earlier: <a href="boat-trailer-transom-straps-guide.html">transom-strap fit</a>, <a href="otsego-lake-family-boating.html">a short Otsego plan</a>, and <a href="boat-engine-overheat-warning-response.html">the overheat-warning response</a>. More: <a href="boat-trailer-tongue-jack-guide.html">trailer tongue-jack fit</a>, <a href="great-sacandaga-lake-family-boating.html">a Great Sacandaga family plan</a>, and <a href="boat-engine-stall-response.html">the engine-stall response</a>.</p></div></section>`;
updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sun, 13 Sep 2026 16:00:00 GMT</lastBuildDate>");
  const missing = [];
  for (const page of publication20260913) {
    const description = page.description.replaceAll("&", "&amp;");
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) missing.push(`<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Sun, 13 Sep 2026 15:30:00 GMT</pubDate><description>${description}</description></item>`);
  }
  return missing.length ? next.replace("<item>", `${missing.join("")}<item>`) : next;
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260913) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260913) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return `${next.trimEnd()}\n`;
});

console.log("Built exactly three pages and their discovery surfaces for the 2026-09-13 publication.");
