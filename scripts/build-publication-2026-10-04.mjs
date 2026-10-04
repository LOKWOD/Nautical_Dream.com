import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261004 } from "../content/publication-2026-10-04.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20261004.length !== 3) throw new Error("The 2026-10-04 publication must contain exactly three pages.");
for (const page of publication20261004) {
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

update("gear.html", (html) => card(html, "boat-footwear-deck-water-shoe-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-footwear-comparison-photo-card.webp" alt="Three unbranded footwear categories for boat use: deck shoe, water shoe and closed-toe sport sandal" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Wet-deck fit system</small><h3>Choose Boat Footwear by Seven Fields</h3><p>Compare fit, closure, sole, deck effect, drainage, protection and care—not a generic nonslip claim.</p><a class="button" href="boat-footwear-deck-water-shoe-guide.html">Use the fit card</a></div></article>`));
update("destinations.html", (html) => card(html, "sacandaga-lake-moffitt-beach-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/sacandaga-lake-moffitt-concept-photo-card.webp" alt="Conceptual life-jacketed family in a runabout on a calm wooded Adirondack lake" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Adirondack launch plan</small><h3>Sacandaga Lake, Not Great Sacandaga</h3><p>Save the correct Moffitt Beach launch, prove the boat close to shore and keep a dry-land fallback.</p><a class="button" href="sacandaga-lake-moffitt-beach-family-boating.html">Open the family plan</a></div></article>`));
update("journal.html", (html) => card(html, "post-boat-day-15-minute-reset.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/post-boat-reset-photo-card.webp" alt="Family sorting wet boat-day gear into three bins beside a secured trailer boat" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Ownership system</small><h3>Reset the Boat in 15 Controlled Minutes</h3><p>Unload perishables, open wet gear, recharge approved portable devices and route every defect.</p><a class="button" href="post-boat-day-15-minute-reset.html">Run the reset</a></div></article>`));

const cards = [
  ["boat-footwear-deck-water-shoe-guide.html", "assets/editorial/boat-footwear-comparison-photo-card.webp", "Three unbranded footwear categories for boat use: deck shoe, water shoe and closed-toe sport sandal", "High-intent family gear", "Fit the Shoe to the Wet-Deck Job", "Compare seven fields before trusting a marine, nonslip or non-marking label.", "Open the fit guide"],
  ["sacandaga-lake-moffitt-beach-family-boating.html", "assets/editorial/sacandaga-lake-moffitt-concept-photo-card.webp", "Conceptual life-jacketed family in a runabout on a calm wooded Adirondack lake", "Adirondack launch plan", "Save the Right Sacandaga Lake", "Moffitt Beach is on Sacandaga Lake near Speculator—not Great Sacandaga Lake.", "Open the family plan"],
  ["post-boat-day-15-minute-reset.html", "assets/editorial/post-boat-reset-photo-card.webp", "Family sorting wet boat-day gear into three bins beside a secured trailer boat", "Ownership system", "End the Day With a 15-Minute Reset", "Unload, dry, recharge and record before fatigue edits the evidence.", "Run the reset"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Fit the shoe. Save the right lake. Reset the boat.</h2></div><p>Three different decisions: wet-deck footwear, a precisely identified Adirondack launch day and the fifteen minutes that protect the next trip.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-first-aid-kit-buying-packing-guide.html">boat first-aid kits</a>, <a href="conesus-lake-family-boating.html">Conesus Lake</a>, and <a href="boat-cooler-food-safety-packing-guide.html">boat food safety</a>. Earlier: <a href="boat-battery-switch-on-off-selector-dual-circuit-guide.html">battery-switch architecture</a>, <a href="cazenovia-lake-family-boating.html">Cazenovia Lake</a>, and <a href="seasickness-on-small-boat-prevention-response-guide.html">motion-sickness response</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-04"')) return html;
  const existing = html.match(/<section class="section" data-recent-library="2026-10-03"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!existing) throw new Error("Previous recent library not found");
  const prefix = cards.map(([href, , , , title]) => `<a href="${href}">${title}</a>`).join(", ");
  const old = existing[1].replace(/^.*?motion-sickness response<\/a>,\s*/, "");
  const recent = `<section class="section" data-recent-library="2026-10-04"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${prefix}, ${old}</p></div></section>`;
  return html.replace(existing[0], recent);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sun, 04 Oct 2026 15:42:00 GMT</lastBuildDate>");
  const items = publication20261004.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Sun, 04 Oct 2026 15:42:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20261004) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-10-04</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20261004) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["boarding-aids-for-boats.html", "boat-footwear-wet-deck-fit-2026-10-04", `<p>Finish the boarding system with the <a href="boat-footwear-deck-water-shoe-guide.html">seven-field wet-deck footwear fit card</a>.</p>`],
  ["boating-with-children-safely.html", "children-boat-footwear-fit-2026-10-04", `<p>Fit and retention matter before the dock step; use the <a href="boat-footwear-deck-water-shoe-guide.html">family boat-footwear decision guide</a>.</p>`],
  ["great-sacandaga-lake-family-boating.html", "moffitt-sacandaga-distinction-2026-10-04", `<p>Do not confuse this waterbody with the smaller <a href="sacandaga-lake-moffitt-beach-family-boating.html">Sacandaga Lake at Moffitt Beach</a>.</p>`],
  ["piseco-lake-family-boating.html", "moffitt-beach-nearby-plan-2026-10-04", `<p>Compare another Hamilton County option with the <a href="sacandaga-lake-moffitt-beach-family-boating.html">Moffitt Beach Sacandaga Lake plan</a>.</p>`],
  ["boat-cleaning-schedule.html", "post-boat-reset-2026-10-04", `<p>Protect the first cleanup decision with the <a href="post-boat-day-15-minute-reset.html">timed post-boat unloading, drying and evidence reset</a>.</p>`],
  ["boat-records-and-logbook.html", "post-boat-reset-log-2026-10-04", `<p>Capture observations before memory edits them with the <a href="post-boat-day-15-minute-reset.html">15-minute post-boat reset</a>.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-10-04 publication.");
