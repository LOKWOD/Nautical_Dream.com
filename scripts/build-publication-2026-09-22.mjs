import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260922 } from "../content/publication-2026-09-22.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260922.length !== 3) throw new Error("The 2026-09-22 publication must contain exactly three pages.");
for (const page of publication20260922) {
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

update("gear.html", (html) => card(html, "boat-fuel-filter-water-separator-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-fuel-filter-system-photo-card.webp" alt="Illustrative unbranded spin-on marine fuel filter, inline filter, hose samples and maintenance log" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Marine fuel-system compatibility</small><h3>Match the Whole Fuel Path</h3><p>Separate the filter jobs, then match fuel, micron basis, flow, restriction and housing.</p><a class="button" href="boat-fuel-filter-water-separator-guide.html">Build the fit card</a></div></article>`));
update("destinations.html", (html) => card(html, "long-lake-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/long-lake-family-photo-card.webp" alt="Illustrative life-jacketed family in a generic runabout on a calm Adirondack lake near a hard-surface launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Hamilton County</small><h3>Long Lake by Boat</h3><p>Use the verified DEC launch, keep the first turn close and recover before margin narrows.</p><a class="button" href="long-lake-family-boating.html">Open the family plan</a></div></article>`));
update("journal.html", (html) => card(html, "boat-recall-hin-mic-safety-defect-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-recall-record-photo-card.webp" alt="Illustrative boat stern, unreadable identification plate, recall checklist and abstract search screen" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Boat ownership evidence</small><h3>A Search Is Not a Repair Record</h3><p>Match the HIN, MIC, model and year, then preserve proof of the remedy.</p><a class="button" href="boat-recall-hin-mic-safety-defect-guide.html">Build the recall record</a></div></article>`));

const cards = [
  ["boat-fuel-filter-water-separator-guide.html", "assets/editorial/boat-fuel-filter-system-photo-card.webp", "Illustrative unbranded marine fuel-filter components and maintenance log", "Fuel-system compatibility", "Filter Fit Is a System", "Match fuel, flow, restriction, micron basis and housing before purchase.", "Open the buying guide"],
  ["long-lake-family-boating.html", "assets/editorial/long-lake-family-photo-card.webp", "Illustrative life-jacketed family on a generic Adirondack lake", "Hamilton County", "Long Lake Starts Close", "Use the state launch, prove the boat nearby and protect the return.", "Open the family plan"],
  ["boat-recall-hin-mic-safety-defect-guide.html", "assets/editorial/boat-recall-record-photo-card.webp", "Illustrative boat recall checklist beside an unreadable hull-identification plate", "Ownership evidence", "Match the Recall to the Hull", "Search broadly, verify scope and keep proof of the completed remedy.", "Open the recall guide"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Match the system. Keep the turn close. Preserve the proof.</h2></div><p>Three distinct decisions for fuel-filtration compatibility, a conservative Hamilton County family day and boat-recall evidence.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-moisture-meter-pinless-pin-guide.html">moisture meters</a>, <a href="canadarago-lake-family-boating.html">Canadarago Lake</a>, and <a href="boat-capacity-plate-persons-weight-horsepower-guide.html">capacity plates</a>. Earlier: <a href="boat-drain-plug-transom-garboard-guide.html">drain-plug fit</a>, <a href="butterfield-lake-family-boating.html">Butterfield Lake</a>, and <a href="new-york-boat-registration-documents-guide.html">New York boat documents</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n</main>`);
});
update("index.html", (html) => {
  const recent = `<section class="section" data-recent-library="2026-09-22"><div class="shell"><h2>Recent practical guides</h2><p class="lede"><a href="outboard-engine-flushing-methods-guide.html">outboard flushing</a>, <a href="tupper-lake-family-boating.html">Tupper Lake</a>, <a href="towing-tube-with-kids-safety-plan.html">family tubing</a>, <a href="boat-battery-box-tray-hold-down-guide.html">battery securement</a>, <a href="cranberry-lake-family-boating.html">Cranberry Lake</a>, <a href="gasoline-odor-boat-response.html">gasoline-odor response</a>, <a href="boat-trailer-spare-tire-system-guide.html">trailer spare tires</a>, <a href="black-lake-family-boating.html">Black Lake</a>, <a href="rope-in-boat-propeller-response.html">propeller-line response</a>, <a href="boat-trailer-security-coupler-wheel-lock-guide.html">trailer security</a>, <a href="saratoga-lake-family-boating.html">Saratoga Lake</a>, <a href="used-boat-title-hin-paperwork-guide.html">used-boat paperwork</a>, <a href="boat-engine-cutoff-switch-lanyard-wireless-guide.html">engine-cutoff links</a>, <a href="schroon-lake-family-boating.html">Schroon Lake</a>, <a href="boat-runs-aground-response.html">grounding response</a>, <a href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html">battery monitors</a>, <a href="little-falls-erie-canal-family-boating.html">Little Falls</a>, <a href="boat-tow-vs-salvage-assistance-guide.html">tow versus salvage</a>, <a href="boat-spare-propeller-kit-guide.html">spare propellers</a>, <a href="oswego-harbor-family-boating.html">Oswego Harbor</a>, <a href="swimming-from-boat-with-kids-safety-plan.html">swimming from the boat</a>, <a href="boat-drain-plug-transom-garboard-guide.html">drain-plug fit</a>, <a href="butterfield-lake-family-boating.html">Butterfield Lake</a>, <a href="new-york-boat-registration-documents-guide.html">New York boat documents</a>, <a href="boat-moisture-meter-pinless-pin-guide.html">moisture-meter evidence</a>, <a href="canadarago-lake-family-boating.html">Canadarago Lake</a>, and <a href="boat-capacity-plate-persons-weight-horsepower-guide.html">capacity plates</a>.</p></div></section>`;
  const pattern = /<section class="section" data-recent-library="[^"]+">[\s\S]*?<\/section>/;
  return pattern.test(html) ? html.replace(pattern, recent) : html.replace("</main>", `${recent}\n</main>`);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Tue, 22 Sep 2026 15:45:00 GMT</lastBuildDate>");
  const items = publication20260922.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Tue, 22 Sep 2026 15:40:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20260922) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-09-22</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20260922) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["marine-fuel-management.html", "fuel-filter-fit-2026-09-22", `<p>Before adding a filtration stage, use the <a href="boat-fuel-filter-water-separator-guide.html">marine fuel-filter fit card</a> to match fuel, flow, restriction, micron basis and housing.</p>`],
  ["water-in-boat-fuel.html", "fuel-filter-water-2026-09-22", `<p>Repeated water is a system finding, not a reason to buy the smallest micron number. The <a href="boat-fuel-filter-water-separator-guide.html">fuel-filter guide</a> separates filtration from contamination diagnosis.</p>`],
  ["tupper-lake-family-boating.html", "long-lake-option-2026-09-22", `<p>For a separate Hamilton County decision, the <a href="long-lake-family-boating.html">Long Lake plan</a> starts at the verified DEC hard-surface launch and protects a close first turn.</p>`],
  ["cranberry-lake-family-boating.html", "long-lake-adirondack-2026-09-22", `<p>Compare the distinct <a href="long-lake-family-boating.html">Long Lake family plan</a> without transferring launch facts, notices or weather between waters.</p>`],
  ["used-boat-title-hin-paperwork-guide.html", "recall-hin-2026-09-22", `<p>After identity matches, use the <a href="boat-recall-hin-mic-safety-defect-guide.html">boat-recall evidence record</a> to connect HIN, MIC, model, year and repair proof.</p>`],
  ["used-boat-inspection-checklist.html", "recall-scope-2026-09-22", `<p>A no-result search is not a safety certificate. The <a href="boat-recall-hin-mic-safety-defect-guide.html">recall guide</a> documents queries, scope and completed remedies before purchase.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-09-22 publication.");
