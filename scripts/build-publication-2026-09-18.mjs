import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260918 } from "../content/publication-2026-09-18.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260918.length !== 3) throw new Error(`The 2026-09-18 publication must contain exactly three pages; found ${publication20260918.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260918) {
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

function addClusterNote(html, marker, body) {
  if (html.includes(marker)) return html;
  const note = `<aside class="editor-note" data-cluster-note="${marker}"><strong>Related decision</strong>${body}</aside>`;
  if (html.includes('<aside class="related-content"')) return html.replace('<aside class="related-content"', `${note}<aside class="related-content"`);
  if (html.includes('</article>')) return html.replace('</article>', `${note}</article>`);
  throw new Error(`Reciprocal-link insertion point not found for ${marker}`);
}

updateFile("gear.html", (html) => insertCard(html, "boat-battery-monitor-shunt-voltage-bluetooth-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-battery-monitor-photo-card.webp" alt="Illustrative clean marine battery compartment with secured batteries, a generic negative-side shunt and an unlabeled display" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>House-bank monitoring</small><h3>Voltage vs Shunt vs Smart App</h3><p>Choose the sensor by the question it can actually answer.</p><a class="button" href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html">Choose the monitor</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "little-falls-erie-canal-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/little-falls-canal-family-photo-card.webp" alt="Illustrative family wearing life jackets aboard a generic runabout moving slowly through a green canal valley" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Mohawk Valley</small><h3>Little Falls by Boat</h3><p>Launch, prove the boat and make Lock E-17 an optional schedule choice.</p><a class="button" href="little-falls-erie-canal-family-boating.html">Open the canal plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "boat-tow-vs-salvage-assistance-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-tow-salvage-photo-card.webp" alt="Illustrative disabled runabout communicating with a generic professional assistance vessel before any towline is loaded" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Ownership and assistance</small><h3>Tow, Salvage, or Distress?</h3><p>Protect people first, then identify the proposed service and written terms.</p><a class="button" href="boat-tow-vs-salvage-assistance-guide.html">Open the decision card</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Measure the bank. Keep the lock optional. Name the assistance.</h2></div><p>Three distinct guides for house-bank truth, a short Mohawk Valley canal day and the tow-versus-salvage conversation.</p></div><div class="gear-grid"><a class="gear-card" href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html"><div class="gear-photo"><img alt="Illustrative clean marine battery compartment with secured batteries, a generic shunt and an unlabeled display" src="assets/editorial/boat-battery-monitor-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>House-bank monitoring</small><h3>A Percentage Is a Model</h3><p>Match voltage, shunt or BMS data to the decision the crew needs.</p><span class="price">Open the buying guide →</span></div></a><a class="gear-card" href="little-falls-erie-canal-family-boating.html"><div class="gear-photo"><img alt="Illustrative family wearing life jackets aboard a generic runabout moving slowly through a green canal valley" src="assets/editorial/little-falls-canal-family-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Mohawk Valley</small><h3>Little Falls, No Deadline</h3><p>Use the municipal ramp and make Lock E-17 an optional decision.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="boat-tow-vs-salvage-assistance-guide.html"><div class="gear-photo"><img alt="Illustrative disabled runabout communicating with a generic professional assistance vessel before a towline is loaded" src="assets/editorial/boat-tow-salvage-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Ownership and assistance</small><h3>Ask Before the Line Loads</h3><p>Life safety first; service, written terms and insurance path when stable.</p><span class="price">Open the decision card →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-engine-cutoff-switch-lanyard-wireless-guide.html">engine-cutoff links</a>, <a href="schroon-lake-family-boating.html">Schroon Lake</a>, and <a href="boat-runs-aground-response.html">the grounding response</a>. Earlier: <a href="boat-trailer-security-coupler-wheel-lock-guide.html">trailer security layers</a>, <a href="saratoga-lake-family-boating.html">Saratoga Lake</a>, and <a href="used-boat-title-hin-paperwork-guide.html">the used-boat paperwork gate</a>. Also preserved: <a href="boat-trailer-spare-tire-system-guide.html">the trailer spare system</a>, <a href="black-lake-family-boating.html">Black Lake</a>, <a href="rope-in-boat-propeller-response.html">the rope-entanglement response</a>, <a href="boat-battery-box-tray-hold-down-guide.html">battery securement</a>, <a href="cranberry-lake-family-boating.html">Cranberry Lake</a>, <a href="gasoline-odor-boat-response.html">the gasoline-odor response</a>, <a href="outboard-engine-flushing-methods-guide.html">outboard flushing</a>, <a href="tupper-lake-family-boating.html">Tupper Lake</a>, and <a href="towing-tube-with-kids-safety-plan.html">the family tubing plan</a>.</p></div></section>`;

updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Fri, 18 Sep 2026 15:35:00 GMT</lastBuildDate>");
  const missing = [];
  for (const page of publication20260918) {
    const description = page.description.replaceAll("&", "&amp;");
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) missing.push(`<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Fri, 18 Sep 2026 15:30:00 GMT</pubDate><description>${description}</description></item>`);
  }
  return missing.length ? next.replace("<item>", `${missing.join("")}<item>`) : next;
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260918) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-18</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260918) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return `${next.trimEnd()}\n`;
});

updateFile("marine-battery-maintenance-guide.html", (html) => addClusterNote(html, "battery-monitor-2026-09-18", `<p>A maintenance reading and a state-of-charge estimate answer different questions. Use the <a href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html">battery-monitor selection matrix</a> to separate voltage, shunt current and manufacturer app data.</p>`));
updateFile("boat-engine-stall-response.html", (html) => addClusterNote(html, "tow-salvage-2026-09-18", `<p>Once people and drift are controlled, use the <a href="boat-tow-vs-salvage-assistance-guide.html">tow-versus-salvage decision card</a> to identify the proposed service, written terms and insurance path before property work begins.</p>`));
updateFile("boat-runs-aground-response.html", (html) => addClusterNote(html, "grounding-tow-salvage-2026-09-18", `<p>A stable grounding can still move beyond routine assistance. The <a href="boat-tow-vs-salvage-assistance-guide.html">tow-versus-salvage guide</a> supplies the questions to ask before a recovery line or contract changes the situation.</p>`));
updateFile("erie-canal-guide.html", (html) => addClusterNote(html, "little-falls-2026-09-18", `<p>For a short trailer-boat version of the canal, the <a href="little-falls-erie-canal-family-boating.html">Little Falls family plan</a> uses the municipal ramp and makes the current Lock E-17 schedule an optional gate.</p>`));

console.log("Built exactly three pages, reciprocal cluster links and discovery surfaces for the 2026-09-18 publication.");
