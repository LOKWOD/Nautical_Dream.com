import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260925 } from "../content/publication-2026-09-25.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260925.length !== 3) throw new Error("The 2026-09-25 publication must contain exactly three pages.");
for (const page of publication20260925) {
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

update("gear.html", (html) => card(html, "boat-trailer-brakes-surge-electric-hydraulic-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-trailer-brake-system-photo-card.webp" alt="Illustrative unbranded surge actuator, disc brake assembly and electric-over-hydraulic actuator shown disconnected" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Trailer brake compatibility</small><h3>Match the Loaded System</h3><p>Compare surge, electric-over-hydraulic and electric brakes only after weight, axle, controller and law match.</p><a class="button" href="boat-trailer-brakes-surge-electric-hydraulic-guide.html">Build the fit card</a></div></article>`));
update("destinations.html", (html) => card(html, "piseco-lake-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/piseco-lake-family-photo-card.webp" alt="Illustrative life-jacketed family in a generic runabout near an Adirondack public launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Hamilton County</small><h3>Piseco Lake by Boat</h3><p>Use Poplar Point, keep three launch records separate and make the first loop reversible.</p><a class="button" href="piseco-lake-family-boating.html">Open the family plan</a></div></article>`));
update("journal.html", (html) => card(html, "letting-someone-else-operate-your-boat-handoff-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-guest-operator-handoff-photo-card.webp" alt="Illustrative owner and guest reviewing a blank handoff card and life jacket beside a secured runabout" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Ownership and guest operation</small><h3>Permission Follows Evidence</h3><p>Verify credential, insurance, boat-specific skill and boundaries before handing over control.</p><a class="button" href="letting-someone-else-operate-your-boat-handoff-guide.html">Use the handoff card</a></div></article>`));

const cards = [
  ["boat-trailer-brakes-surge-electric-hydraulic-guide.html", "assets/editorial/boat-trailer-brake-system-photo-card.webp", "Illustrative unbranded boat-trailer brake components shown disconnected", "Trailer brakes", "Match the Loaded System", "Choose architecture only after weight, axle, controller, immersion and law match.", "Open the buying guide"],
  ["piseco-lake-family-boating.html", "assets/editorial/piseco-lake-family-photo-card.webp", "Illustrative life-jacketed family on a generic Adirondack lake", "Hamilton County", "Piseco Starts at Poplar Point", "Keep three launch records separate, prove the boat nearby and protect the return.", "Open the family plan"],
  ["letting-someone-else-operate-your-boat-handoff-guide.html", "assets/editorial/boat-guest-operator-handoff-photo-card.webp", "Illustrative owner and guest reviewing a boat handoff card", "Boat ownership", "Permission Follows Evidence", "Verify the person, policy, controls and limits before the key changes hands.", "Open the handoff guide"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Match the load. Keep access facts separate. Hand over with evidence.</h2></div><p>Three distinct decisions for road-safe trailer braking, a conservative Piseco Lake family day and responsible guest operation.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-fuel-filter-water-separator-guide.html">fuel-filter fit</a>, <a href="long-lake-family-boating.html">Long Lake</a>, and <a href="boat-recall-hin-mic-safety-defect-guide.html">boat-recall evidence</a>. Earlier: <a href="boat-moisture-meter-pinless-pin-guide.html">moisture meters</a>, <a href="canadarago-lake-family-boating.html">Canadarago Lake</a>, and <a href="boat-capacity-plate-persons-weight-horsepower-guide.html">capacity plates</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n</main>`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-09-25"')) return html;
  const recent = `<section class="section" data-recent-library="2026-09-25"><div class="shell"><h2>Recent practical guides</h2><p class="lede"><a href="boat-trailer-brakes-surge-electric-hydraulic-guide.html">trailer brake systems</a>, <a href="piseco-lake-family-boating.html">Piseco Lake</a>, <a href="letting-someone-else-operate-your-boat-handoff-guide.html">guest-operator handoff</a>, <a href="boat-fuel-filter-water-separator-guide.html">fuel-filter fit</a>, <a href="long-lake-family-boating.html">Long Lake</a>, <a href="boat-recall-hin-mic-safety-defect-guide.html">boat-recall evidence</a>, <a href="boat-moisture-meter-pinless-pin-guide.html">moisture-meter evidence</a>, <a href="canadarago-lake-family-boating.html">Canadarago Lake</a>, <a href="boat-capacity-plate-persons-weight-horsepower-guide.html">capacity plates</a>, <a href="boat-drain-plug-transom-garboard-guide.html">drain-plug fit</a>, <a href="butterfield-lake-family-boating.html">Butterfield Lake</a>, <a href="new-york-boat-registration-documents-guide.html">New York boat documents</a>, <a href="boat-spare-propeller-kit-guide.html">spare propellers</a>, <a href="oswego-harbor-family-boating.html">Oswego Harbor</a>, <a href="swimming-from-boat-with-kids-safety-plan.html">swimming from the boat</a>, <a href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html">battery monitors</a>, <a href="little-falls-erie-canal-family-boating.html">Little Falls</a>, <a href="boat-tow-vs-salvage-assistance-guide.html">tow versus salvage</a>, <a href="boat-engine-cutoff-switch-lanyard-wireless-guide.html">engine-cutoff links</a>, <a href="schroon-lake-family-boating.html">Schroon Lake</a>, <a href="boat-runs-aground-response.html">grounding response</a>, <a href="boat-trailer-security-coupler-wheel-lock-guide.html">trailer security</a>, <a href="saratoga-lake-family-boating.html">Saratoga Lake</a>, <a href="used-boat-title-hin-paperwork-guide.html">used-boat paperwork</a>, <a href="boat-trailer-spare-tire-system-guide.html">trailer spare tires</a>, <a href="black-lake-family-boating.html">Black Lake</a>, <a href="rope-in-boat-propeller-response.html">propeller-line response</a>, <a href="boat-battery-box-tray-hold-down-guide.html">battery securement</a>, <a href="cranberry-lake-family-boating.html">Cranberry Lake</a>, <a href="gasoline-odor-boat-response.html">gasoline-odor response</a>, <a href="outboard-engine-flushing-methods-guide.html">outboard flushing</a>, <a href="tupper-lake-family-boating.html">Tupper Lake</a>, and <a href="towing-tube-with-kids-safety-plan.html">family tubing</a>.</p></div></section>`;
  if (!html.includes("</main>")) throw new Error("Homepage closing main missing");
  return html.replace("</main>", `${recent}\n</main>`);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Fri, 25 Sep 2026 15:55:00 GMT</lastBuildDate>");
  const items = publication20260925.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Fri, 25 Sep 2026 15:50:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20260925) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-09-25</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20260925) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["snowbird-boat-trailering-guide.html", "trailer-brake-weight-2026-09-25", `<p>After weighing the loaded trailer, use the <a href="boat-trailer-brakes-surge-electric-hydraulic-guide.html">trailer-brake fit card</a> to match the legal floor, axles, actuator and tow-vehicle controls.</p>`],
  ["boat-trailer-safety-checklist.html", "trailer-brake-system-2026-09-25", `<p>A controller light is not a wheel-by-wheel brake test. The <a href="boat-trailer-brakes-surge-electric-hydraulic-guide.html">brake-system guide</a> documents architecture, immersion and technician boundaries.</p>`],
  ["long-lake-family-boating.html", "piseco-launch-choice-2026-09-25", `<p>For a separate Hamilton County choice, the <a href="piseco-lake-family-boating.html">Piseco Lake plan</a> uses Poplar Point and keeps three launch records from being blended.</p>`],
  ["schroon-lake-family-boating.html", "piseco-separate-access-2026-09-25", `<p>Compare the distinct <a href="piseco-lake-family-boating.html">Piseco Lake family plan</a> without transferring ramp, parking, fee or weather facts between waters.</p>`],
  ["boat-insurance-explained.html", "guest-operator-coverage-2026-09-25", `<p>Before a friend takes control, use the <a href="letting-someone-else-operate-your-boat-handoff-guide.html">guest-operator handoff card</a> to verify the named person, policy, boat-specific skill and boundaries.</p>`],
  ["boat-records-and-logbook.html", "guest-operator-record-2026-09-25", `<p>Add a completed <a href="letting-someone-else-operate-your-boat-handoff-guide.html">owner-to-operator handoff record</a> when someone else will operate the boat.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-09-25 publication.");
