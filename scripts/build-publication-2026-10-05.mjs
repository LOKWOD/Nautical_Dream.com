import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261005 } from "../content/publication-2026-10-05.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20261005.length !== 3) throw new Error("The 2026-10-05 publication must contain exactly three pages.");
for (const page of publication20261005) {
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

update("gear.html", (html) => card(html, "boat-cleaning-brush-soft-medium-stiff-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-cleaning-brush-system-photo-card.webp" alt="Three unbranded soft, medium and stiff boat brush heads with a telescoping handle" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Surface-safe maintenance gear</small><h3>Choose the Brush by Surface, Not Color</h3><p>Build a three-head wash map and keep grit from crossing onto delicate panels.</p><a class="button" href="boat-cleaning-brush-soft-medium-stiff-guide.html">Open the brush guide</a></div></article>`));
update("destinations.html", (html) => card(html, "raquette-lake-golden-beach-small-boat-family-guide.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/raquette-lake-small-boat-concept-photo-card.webp" alt="Conceptual life-jacketed family carrying a small aluminum boat at a shallow Adirondack hand launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Adirondack hand-launch plan</small><h3>Raquette Lake From Golden Beach</h3><p>Match the craft to the hand-launch limit and keep the first family route deliberately small.</p><a class="button" href="raquette-lake-golden-beach-small-boat-family-guide.html">Open the small-boat plan</a></div></article>`));
update("journal.html", (html) => card(html, "boatyard-winter-storage-handoff-work-order-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boatyard-storage-handoff-photo-card.webp" alt="Boat owner and marine service advisor documenting a runabout in an indoor storage bay" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Seasonal ownership system</small><h3>Hand the Boatyard a Complete Record</h3><p>Match identity, condition, scope, approval and spring return before custody changes.</p><a class="button" href="boatyard-winter-storage-handoff-work-order-guide.html">Use the handoff system</a></div></article>`));

const cards = [
  ["boat-cleaning-brush-soft-medium-stiff-guide.html", "assets/editorial/boat-cleaning-brush-system-photo-card.webp", "Three unbranded soft, medium and stiff boat brush heads with a telescoping handle", "High-intent maintenance gear", "Stop One Dirty Brush From Touching Everything", "Assign soft, medium and stiff heads by surface—and prohibit the dangerous crossovers.", "Open the brush guide"],
  ["raquette-lake-golden-beach-small-boat-family-guide.html", "assets/editorial/raquette-lake-small-boat-concept-photo-card.webp", "Conceptual life-jacketed family carrying a small boat at a shallow Adirondack hand launch", "Adirondack small-boat plan", "Treat Golden Beach as a Hand Launch", "The parking count does not turn shallow small-boat access into a trailer ramp.", "Open the family plan"],
  ["boatyard-winter-storage-handoff-work-order-guide.html", "assets/editorial/boatyard-storage-handoff-photo-card.webp", "Boat owner and marine service advisor documenting a runabout in storage", "Winter-storage ownership system", "Make Scope and Condition Observable", "Use twelve repeatable photo zones, written authorization and a spring acceptance gate.", "Use the handoff record"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Protect the surface. Match the launch. Document the handoff.</h2></div><p>Three separate jobs: a controlled cleaning system, a true small-boat Adirondack day and a winter-storage record that survives until spring.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-footwear-deck-water-shoe-guide.html">boat-footwear fit</a>, <a href="sacandaga-lake-moffitt-beach-family-boating.html">Moffitt Beach on Sacandaga Lake</a>, and the <a href="post-boat-day-15-minute-reset.html">15-minute post-boat reset</a>. Earlier: <a href="boat-first-aid-kit-buying-packing-guide.html">boat first-aid kits</a>, <a href="conesus-lake-family-boating.html">Conesus Lake</a>, and <a href="boat-cooler-food-safety-packing-guide.html">boat food safety</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-05"')) return html;
  const existing = html.match(/<section class="section" data-recent-library="2026-10-04"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!existing) throw new Error("Previous recent library not found");
  const prefix = cards.map(([href, , , , title]) => `<a href="${href}">${title}</a>`).join(", ");
  const recent = `<section class="section" data-recent-library="2026-10-05"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${prefix}, ${existing[1]}</p></div></section>`;
  return html.replace(existing[0], recent);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Mon, 05 Oct 2026 15:34:00 GMT</lastBuildDate>");
  const items = publication20261005.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Mon, 05 Oct 2026 15:34:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20261005) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-10-05</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20261005) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["boat-cleaning-schedule.html", "cleaning-brush-surface-map-2026-10-05", `<p>Assign tools as carefully as intervals with the <a href="boat-cleaning-brush-soft-medium-stiff-guide.html">three-head boat-brush surface map</a>.</p>`],
  ["boat-vinyl-cleaning.html", "cleaning-brush-vinyl-boundary-2026-10-05", `<p>Keep contaminated deck tools away from vinyl with the <a href="boat-cleaning-brush-soft-medium-stiff-guide.html">surface-first brush guide</a>.</p>`],
  ["lake-eaton-family-boating.html", "raquette-golden-beach-small-boat-2026-10-05", `<p>Compare another Hamilton County small-boat day with the <a href="raquette-lake-golden-beach-small-boat-family-guide.html">Golden Beach hand-launch plan for Raquette Lake</a>.</p>`],
  ["long-lake-family-boating.html", "raquette-hand-launch-comparison-2026-10-05", `<p>Before assuming nearby access works the same way, read the <a href="raquette-lake-golden-beach-small-boat-family-guide.html">Raquette Lake Golden Beach hand-launch guide</a>.</p>`],
  ["marina-contract-questions.html", "boatyard-storage-work-order-2026-10-05", `<p>Turn contract answers into an observable handoff with the <a href="boatyard-winter-storage-handoff-work-order-guide.html">winter-storage work-order and condition record</a>.</p>`],
  ["boat-records-and-logbook.html", "boatyard-storage-handoff-record-2026-10-05", `<p>Use the <a href="boatyard-winter-storage-handoff-work-order-guide.html">twelve-zone owner-to-boatyard handoff</a> to preserve condition, authorization and return evidence.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-10-05 publication.");
