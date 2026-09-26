import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260926 } from "../content/publication-2026-09-26.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260926.length !== 3) throw new Error("The 2026-09-26 publication must contain exactly three pages.");
for (const page of publication20260926) {
  writeFileSync(join(root, page.slug), renderPage(page));
  console.log(`built ${page.slug}`);
}

function update(name, transform) {
  const path = join(root, name), before = readFileSync(path, "utf8"), after = transform(before);
  if (after !== before) { writeFileSync(path, after); console.log(`updated ${name}`); }
}
function card(html, slug, marker, markup) {
  if (html.includes(slug)) return html;
  if (!html.includes(marker)) throw new Error(`Missing discovery marker for ${slug}`);
  return html.replace(marker, `${marker}\n${markup}`);
}
function note(html, marker, body) {
  if (html.includes(marker)) return html;
  const markup = `<aside class="editor-note" data-cluster-note="${marker}"><strong>Related decision</strong>${body}</aside>`;
  if (html.includes('<aside class="related-content"')) return html.replace('<aside class="related-content"', `${markup}<aside class="related-content"`);
  if (html.includes("</article>")) return html.replace("</article>", `${markup}</article>`);
  throw new Error(`Missing reciprocal-link marker for ${marker}`);
}

update("gear.html", (html) => card(html, "boat-trailer-lights-submersible-led-wiring-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-trailer-lighting-system-photo-card.webp" alt="Illustrative unbranded trailer lamps, connector samples and wire terminals shown disconnected" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Trailer lighting compatibility</small><h3>Match the Whole Light Circuit</h3><p>Preserve every required function, then match the lamps, connector, ground and immersion procedure.</p><a class="button" href="boat-trailer-lights-submersible-led-wiring-guide.html">Build the fit card</a></div></article>`));
update("destinations.html", (html) => card(html, "hemlock-lake-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/hemlock-lake-family-photo-card.webp" alt="Illustrative life-jacketed family in a small low-horsepower runabout on a generic forested Finger Lake" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Western Finger Lakes</small><h3>Hemlock Lake by Boat</h3><p>Use the north gravel launch, respect the 10-horsepower ceiling and keep the closed water north of the ramp.</p><a class="button" href="hemlock-lake-family-boating.html">Open the family plan</a></div></article>`));
update("journal.html", (html) => card(html, "two-boats-collide-response-reporting-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-collision-response-photo-card.webp" alt="Illustrative occupants in life jackets aboard two stopped boats recording facts after minor contact" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Collision response</small><h3>People Before Fault</h3><p>Account, control hazards, exchange facts and meet every applicable reporting duty.</p><a class="button" href="two-boats-collide-response-reporting-guide.html">Use the response card</a></div></article>`));

const cards = [
  ["boat-trailer-lights-submersible-led-wiring-guide.html", "assets/editorial/boat-trailer-lighting-system-photo-card.webp", "Illustrative unbranded trailer lighting components shown disconnected", "Trailer lighting", "Match the Whole Circuit", "Choose lamps only after functions, connector, ground and water procedure match.", "Open the buying guide"],
  ["hemlock-lake-family-boating.html", "assets/editorial/hemlock-lake-family-photo-card.webp", "Illustrative life-jacketed family in a small boat on a generic wooded Finger Lake", "Western Finger Lakes", "Hemlock Stays Small", "Respect the gravel launch, 17-foot boat limit, 10-horsepower ceiling and north boundary.", "Open the family plan"],
  ["two-boats-collide-response-reporting-guide.html", "assets/editorial/boat-collision-response-photo-card.webp", "Illustrative crews in life jackets recording facts after minor boat contact", "Collision response", "People Before Fault", "Control injury, flooding, fuel and drift before evidence and reporting.", "Open the response card"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Make the circuit visible. Keep the lake small. Put people before fault.</h2></div><p>Three distinct decisions for road-safe trailer lighting, a regulated western Finger Lake day and a calm post-collision response.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-brakes-surge-electric-hydraulic-guide.html">trailer brakes</a>, <a href="piseco-lake-family-boating.html">Piseco Lake</a>, and <a href="letting-someone-else-operate-your-boat-handoff-guide.html">guest-operator handoff</a>. Earlier: <a href="boat-fuel-filter-water-separator-guide.html">fuel-filter fit</a>, <a href="long-lake-family-boating.html">Long Lake</a>, and <a href="boat-recall-hin-mic-safety-defect-guide.html">boat-recall evidence</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n</main>`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-09-26"')) return html;
  const recent = `<section class="section" data-recent-library="2026-09-26"><div class="shell"><h2>Recent practical guides</h2><p class="lede"><a href="boat-trailer-lights-submersible-led-wiring-guide.html">trailer lighting systems</a>, <a href="hemlock-lake-family-boating.html">Hemlock Lake</a>, <a href="two-boats-collide-response-reporting-guide.html">collision response</a>, <a href="boat-trailer-brakes-surge-electric-hydraulic-guide.html">trailer brake systems</a>, <a href="piseco-lake-family-boating.html">Piseco Lake</a>, <a href="letting-someone-else-operate-your-boat-handoff-guide.html">guest-operator handoff</a>, <a href="boat-fuel-filter-water-separator-guide.html">fuel-filter fit</a>, <a href="long-lake-family-boating.html">Long Lake</a>, <a href="boat-recall-hin-mic-safety-defect-guide.html">boat-recall evidence</a>, <a href="boat-moisture-meter-pinless-pin-guide.html">moisture-meter evidence</a>, <a href="canadarago-lake-family-boating.html">Canadarago Lake</a>, <a href="boat-capacity-plate-persons-weight-horsepower-guide.html">capacity plates</a>, <a href="boat-drain-plug-transom-garboard-guide.html">drain-plug fit</a>, <a href="butterfield-lake-family-boating.html">Butterfield Lake</a>, <a href="new-york-boat-registration-documents-guide.html">New York boat documents</a>, <a href="boat-spare-propeller-kit-guide.html">spare propellers</a>, <a href="oswego-harbor-family-boating.html">Oswego Harbor</a>, <a href="swimming-from-boat-with-kids-safety-plan.html">swimming from the boat</a>, <a href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html">battery monitors</a>, <a href="little-falls-erie-canal-family-boating.html">Little Falls</a>, <a href="boat-tow-vs-salvage-assistance-guide.html">tow versus salvage</a>, <a href="boat-engine-cutoff-switch-lanyard-wireless-guide.html">engine-cutoff links</a>, <a href="schroon-lake-family-boating.html">Schroon Lake</a>, <a href="boat-runs-aground-response.html">grounding response</a>, <a href="boat-trailer-security-coupler-wheel-lock-guide.html">trailer security</a>, <a href="saratoga-lake-family-boating.html">Saratoga Lake</a>, <a href="used-boat-title-hin-paperwork-guide.html">used-boat paperwork</a>, <a href="boat-trailer-spare-tire-system-guide.html">trailer spare tires</a>, <a href="black-lake-family-boating.html">Black Lake</a>, <a href="rope-in-boat-propeller-response.html">propeller-line response</a>, <a href="boat-battery-box-tray-hold-down-guide.html">battery securement</a>, <a href="cranberry-lake-family-boating.html">Cranberry Lake</a>, <a href="gasoline-odor-boat-response.html">gasoline-odor response</a>, <a href="outboard-engine-flushing-methods-guide.html">outboard flushing</a>, <a href="tupper-lake-family-boating.html">Tupper Lake</a>, and <a href="towing-tube-with-kids-safety-plan.html">family tubing</a>.</p></div></section>`;
  if (!html.includes("</main>")) throw new Error("Homepage closing main missing");
  return html.replace("</main>", `${recent}\n</main>`);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sat, 26 Sep 2026 15:40:00 GMT</lastBuildDate>");
  const items = publication20260926.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Sat, 26 Sep 2026 15:35:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20260926) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-09-26</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20260926) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["best-boat-trailer-accessories.html", "trailer-lighting-system-2026-09-26", `<p>Before buying a replacement kit, use the <a href="boat-trailer-lights-submersible-led-wiring-guide.html">trailer-lighting fit card</a> to preserve required functions and match the connector, ground and water procedure.</p>`],
  ["boat-trailer-safety-checklist.html", "trailer-lighting-proof-2026-09-26", `<p>A glowing lamp is not a complete circuit test. The <a href="boat-trailer-lights-submersible-led-wiring-guide.html">lighting-system guide</a> checks each required function under load.</p>`],
  ["honeoye-lake-family-boating.html", "hemlock-small-boat-choice-2026-09-26", `<p>For a quieter regulated alternative, the <a href="hemlock-lake-family-boating.html">Hemlock Lake plan</a> begins with the 17-foot boat limit, 10-horsepower ceiling and gravel launch.</p>`],
  ["finger-lakes-which-lake.html", "hemlock-water-supply-lake-2026-09-26", `<p>Add <a href="hemlock-lake-family-boating.html">Hemlock Lake</a> only when the small boat, low-horsepower limit and drinking-water protections fit the crew.</p>`],
  ["boating-emergencies.html", "collision-response-sequence-2026-09-26", `<p>After two boats collide, use the <a href="two-boats-collide-response-reporting-guide.html">people–hazard–facts–report card</a> before fault arguments or hurried separation.</p>`],
  ["navigation-rules-of-road.html", "collision-assistance-reporting-2026-09-26", `<p>Collision avoidance remains the goal; if contact occurs, the <a href="two-boats-collide-response-reporting-guide.html">collision response and reporting guide</a> separates immediate assistance from later documentation.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-09-26 publication.");
