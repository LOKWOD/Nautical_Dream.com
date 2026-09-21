import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260921 } from "../content/publication-2026-09-21.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260921.length !== 3) throw new Error(`The 2026-09-21 publication must contain exactly three pages; found ${publication20260921.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260921) {
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
  if (html.includes("</article>")) return html.replace("</article>", `${note}</article>`);
  throw new Error(`Reciprocal-link insertion point not found for ${marker}`);
}

updateFile("gear.html", (html) => insertCard(html, "boat-moisture-meter-pinless-pin-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-moisture-meter-comparison-photo-card.webp" alt="Illustrative unbranded pinless and pin-probe moisture meters with a calibration check block" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Used-boat inspection tools</small><h3>A Reading Is Not a Diagnosis</h3><p>Choose the mode, control the conditions and map a repeatable pattern before escalating.</p><a class="button" href="boat-moisture-meter-pinless-pin-guide.html">Build the reading record</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "canadarago-lake-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/canadarago-lake-family-photo-card.webp" alt="Illustrative life-jacketed family seated in a generic runabout near a two-lane inland-lake launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Otsego County</small><h3>Canadarago Lake by Boat</h3><p>Use the state ramps, protect the proof loop and recover with margin.</p><a class="button" href="canadarago-lake-family-boating.html">Open the family plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "boat-capacity-plate-persons-weight-horsepower-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-capacity-plate-loading-photo-card.webp" alt="Illustrative adults organizing a cooler, bags and life jackets in a trailered runabout" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Small-boat loading limits</small><h3>Read Every Line on the Plate</h3><p>People, pounds, motor, gear and horsepower are separate constraints.</p><a class="button" href="boat-capacity-plate-persons-weight-horsepower-guide.html">Build the load budget</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Map the reading. Protect the return. Budget the load.</h2></div><p>Three distinct systems for moisture evidence, a conservative Otsego County family day and small-boat capacity limits.</p></div><div class="gear-grid"><a class="gear-card" href="boat-moisture-meter-pinless-pin-guide.html"><div class="gear-photo"><img alt="Illustrative unbranded pinless and pin-probe moisture meters with a calibration check block" src="assets/editorial/boat-moisture-meter-comparison-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Used-boat inspection tools</small><h3>One Number Proves Very Little</h3><p>Choose the mode, control the conditions and map a repeatable pattern.</p><span class="price">Open the buying guide →</span></div></a><a class="gear-card" href="canadarago-lake-family-boating.html"><div class="gear-photo"><img alt="Illustrative life-jacketed family seated in a generic runabout near a two-lane inland-lake launch" src="assets/editorial/canadarago-lake-family-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Otsego County</small><h3>Canadarago Stays Close</h3><p>Launch, prove the boat nearby and recover before margin disappears.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="boat-capacity-plate-persons-weight-horsepower-guide.html"><div class="gear-photo"><img alt="Illustrative adults organizing a cooler, bags and life jackets in a trailered runabout" src="assets/editorial/boat-capacity-plate-loading-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Small-boat loading limits</small><h3>Every Limit Applies</h3><p>Separate people, pounds, motor, gear and horsepower before loading.</p><span class="price">Open the capacity guide →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-drain-plug-transom-garboard-guide.html">drain-plug fit</a>, <a href="butterfield-lake-family-boating.html">Butterfield Lake</a>, and <a href="new-york-boat-registration-documents-guide.html">New York boat documents</a>. Earlier: <a href="boat-spare-propeller-kit-guide.html">spare propellers</a>, <a href="oswego-harbor-family-boating.html">Oswego Harbor</a>, <a href="swimming-from-boat-with-kids-safety-plan.html">family swimming</a>, <a href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html">battery monitors</a>, <a href="little-falls-erie-canal-family-boating.html">Little Falls</a>, and <a href="boat-tow-vs-salvage-assistance-guide.html">tow versus salvage</a>.</p></div></section>`;

updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("index.html", (html) => {
  const recent = `<section class="section" data-recent-library="2026-09-21"><div class="shell"><h2>Recent practical guides</h2><p class="lede"><a href="outboard-engine-flushing-methods-guide.html">outboard flushing</a>, <a href="tupper-lake-family-boating.html">Tupper Lake</a>, <a href="towing-tube-with-kids-safety-plan.html">family tubing</a>, <a href="boat-battery-box-tray-hold-down-guide.html">battery securement</a>, <a href="cranberry-lake-family-boating.html">Cranberry Lake</a>, <a href="gasoline-odor-boat-response.html">gasoline-odor response</a>, <a href="boat-trailer-spare-tire-system-guide.html">trailer spare tires</a>, <a href="black-lake-family-boating.html">Black Lake</a>, <a href="rope-in-boat-propeller-response.html">propeller-line response</a>, <a href="boat-trailer-security-coupler-wheel-lock-guide.html">trailer security</a>, <a href="saratoga-lake-family-boating.html">Saratoga Lake</a>, <a href="used-boat-title-hin-paperwork-guide.html">used-boat paperwork</a>, <a href="boat-engine-cutoff-switch-lanyard-wireless-guide.html">engine-cutoff links</a>, <a href="schroon-lake-family-boating.html">Schroon Lake</a>, <a href="boat-runs-aground-response.html">grounding response</a>, <a href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html">battery monitors</a>, <a href="little-falls-erie-canal-family-boating.html">Little Falls</a>, <a href="boat-tow-vs-salvage-assistance-guide.html">tow versus salvage</a>, <a href="boat-spare-propeller-kit-guide.html">spare propellers</a>, <a href="oswego-harbor-family-boating.html">Oswego Harbor</a>, <a href="swimming-from-boat-with-kids-safety-plan.html">swimming from the boat</a>, <a href="boat-drain-plug-transom-garboard-guide.html">drain-plug fit</a>, <a href="butterfield-lake-family-boating.html">Butterfield Lake</a>, and <a href="new-york-boat-registration-documents-guide.html">New York boat documents</a>.</p></div></section>`;
  const pattern = /<section class="section" data-recent-library="[^"]+">[\s\S]*?<\/section>/;
  if (pattern.test(html)) return html.replace(pattern, recent);
  return html.replace("</main>", `${recent}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Mon, 21 Sep 2026 16:35:00 GMT</lastBuildDate>");
  const missing = [];
  for (const page of publication20260921) {
    const description = page.description.replaceAll("&", "&amp;");
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) missing.push(`<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Mon, 21 Sep 2026 16:30:00 GMT</pubDate><description>${description}</description></item>`);
  }
  return missing.length ? next.replace("<item>", `${missing.join("")}<item>`) : next;
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260921) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-21</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260921) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return `${next.trimEnd()}\n`;
});

updateFile("used-boat-inspection-checklist.html", (html) => addClusterNote(html, "moisture-map-2026-09-21", `<p>A meter reading is useful only with its measurement context. Use the <a href="boat-moisture-meter-pinless-pin-guide.html">boat moisture-meter guide</a> to separate comparative scanning from pin measurements and build a repeatable grid.</p>`));
updateFile("used-boat-sea-trial-checklist.html", (html) => addClusterNote(html, "moisture-pattern-2026-09-21", `<p>Keep one unexplained moisture number out of the verdict column. The <a href="boat-moisture-meter-pinless-pin-guide.html">moisture-reading record</a> captures construction, conditions, baseline and corroborating evidence for the surveyor.</p>`));
updateFile("otsego-lake-family-boating.html", (html) => addClusterNote(html, "canadarago-nearby-plan-2026-09-21", `<p>For a separate Otsego County option, the <a href="canadarago-lake-family-boating.html">Canadarago Lake plan</a> uses the state marine park's two concrete ramps and a close proof loop. It requires its own same-day checks.</p>`));
updateFile("oneida-lake-family-boating.html", (html) => addClusterNote(html, "canadarago-smaller-water-2026-09-21", `<p>When Oneida's exposed water is outside the family limit, compare the <a href="canadarago-lake-family-boating.html">Canadarago Lake short-day plan</a>. A smaller lake still needs fresh weather, ramp and capacity decisions.</p>`));
updateFile("family-boat-packing-list.html", (html) => addClusterNote(html, "capacity-budget-2026-09-21", `<p>A packing list is subordinate to the boat's limits. Use the <a href="boat-capacity-plate-persons-weight-horsepower-guide.html">capacity-plate load budget</a> to count people, pounds, motor and gear before optional equipment comes aboard.</p>`));
updateFile("pontoon-horsepower-guide.html", (html) => addClusterNote(html, "capacity-horsepower-2026-09-21", `<p>Horsepower is only one boundary. The <a href="boat-capacity-plate-persons-weight-horsepower-guide.html">capacity-plate guide</a> separates the horsepower line from persons, load and distribution limits.</p>`));

console.log("Built exactly three pages, three citation-ready decision assets, reciprocal cluster links and complete discovery for the 2026-09-21 publication.");
