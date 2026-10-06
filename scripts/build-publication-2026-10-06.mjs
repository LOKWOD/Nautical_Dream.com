import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261006 } from "../content/publication-2026-10-06.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20261006.length !== 3) throw new Error("The 2026-10-06 publication must contain exactly three pages.");
for (const page of publication20261006) {
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

update("gear.html", (html) => card(html, "boat-trailer-portable-tire-inflator-buying-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-trailer-tire-inflator-system-photo-card.webp" alt="Unbranded portable tire inflator, hose and gauge beside a boat-trailer tire" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Trailer pressure-control gear</small><h3>Match the Inflator to the Entire Tire Set</h3><p>Compare work pressure, duty cycle, power draw, reach and independent verification.</p><a class="button" href="boat-trailer-portable-tire-inflator-buying-guide.html">Open the inflator guide</a></div></article>`));
update("journal.html", (html) => card(html, "boat-ramp-no-courtesy-dock-launch-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/no-courtesy-dock-autumn-launch-photo-card.webp" alt="Two adults in life jackets reviewing lines beside a trailered boat at a dockless autumn ramp" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Shoulder-season launch system</small><h3>Rebuild the Launch When the Dock Leaves</h3><p>Use seven go/no-go gates and a two-adult choreography that keeps everyone out of cold water.</p><a class="button" href="boat-ramp-no-courtesy-dock-launch-guide.html">Use the no-dock plan</a></div></article>`));
update("journal.html", (html) => card(html, "kids-marina-dock-safety-arrival-protocol.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/marina-kids-safe-waiting-zone-photo-card.webp" alt="Adult supervising two children in fitted life jackets at a marina waiting area" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Family marina protocol</small><h3>Give the Dock Four Clear States</h3><p>Assign one adult, one waiting place and one controlled transition from land to boat and back.</p><a class="button" href="kids-marina-dock-safety-arrival-protocol.html">Use the four-state card</a></div></article>`));

const cards = [
  ["boat-trailer-portable-tire-inflator-buying-guide.html", "assets/editorial/boat-trailer-tire-inflator-system-photo-card.webp", "Unbranded portable tire inflator, hose and gauge beside a boat-trailer tire", "High-intent trailer gear", "Buy Enough Compressor for the Whole Job", "Match pressure, duty cycle, power and reach before comparing battery colors.", "Open the inflator guide"],
  ["boat-ramp-no-courtesy-dock-launch-guide.html", "assets/editorial/no-courtesy-dock-autumn-launch-photo-card.webp", "Two adults in life jackets reviewing lines beside a trailered boat at a dockless autumn ramp", "Shoulder-season launch plan", "Treat Dock Removal as a System Change", "Confirm the facility, cold-water margin and dry-side choreography before backing.", "Use the no-dock plan"],
  ["kids-marina-dock-safety-arrival-protocol.html", "assets/editorial/marina-kids-safe-waiting-zone-photo-card.webp", "Adult supervising two children in fitted life jackets at a marina waiting area", "Family marina system", "Land. Wait. Board. Return.", "A four-state card keeps the edge, gear path and supervision assignment clear.", "Use the marina protocol"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Control the pressure. Rebuild the launch. Own the dock transition.</h2></div><p>Three different failure points: a compressor that cannot finish, a ramp that lost its summer infrastructure and the family handoff at the water's edge.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-cleaning-brush-soft-medium-stiff-guide.html">boat-brush surface control</a>, <a href="raquette-lake-golden-beach-small-boat-family-guide.html">Raquette Lake from Golden Beach</a>, and the <a href="boatyard-winter-storage-handoff-work-order-guide.html">boatyard winter handoff</a>. Earlier: <a href="boat-footwear-deck-water-shoe-guide.html">boat-footwear fit</a>, <a href="sacandaga-lake-moffitt-beach-family-boating.html">Moffitt Beach on Sacandaga Lake</a>, and the <a href="post-boat-day-15-minute-reset.html">15-minute post-boat reset</a>. Still useful: <a href="boat-battery-switch-on-off-selector-dual-circuit-guide.html">battery-switch fit</a>, <a href="cazenovia-lake-family-boating.html">Cazenovia Lake launch choices</a>, and <a href="seasickness-on-small-boat-prevention-response-guide.html">small-boat seasickness response</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-06"')) return html;
  const existing = html.match(/<section class="section" data-recent-library="2026-10-05"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!existing) throw new Error("Previous recent library not found");
  const prefix = cards.map(([href, , , , title]) => `<a href="${href}">${title}</a>`).join(", ");
  const recent = `<section class="section" data-recent-library="2026-10-06"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${prefix}, ${existing[1]}</p></div></section>`;
  return html.replace(existing[0], recent);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Tue, 06 Oct 2026 15:49:00 GMT</lastBuildDate>");
  const items = publication20261006.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Tue, 06 Oct 2026 15:49:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20261006) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-10-06</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20261006) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["best-boat-trailer-accessories.html", "trailer-inflator-selection-2026-10-06", `<p>Move beyond a single product mention with the <a href="boat-trailer-portable-tire-inflator-buying-guide.html">pressure, duty-cycle, power and reach matrix for trailer inflators</a>.</p>`],
  ["boat-trailering.html", "trailer-inflator-system-2026-10-06", `<p>Pair the cold-pressure record with the <a href="boat-trailer-portable-tire-inflator-buying-guide.html">portable inflator system guide</a>—and remember that adding air cannot repair damage.</p>`],
  ["launching-boat-from-trailer.html", "no-courtesy-dock-launch-2026-10-06", `<p>When seasonal infrastructure is gone, use the <a href="boat-ramp-no-courtesy-dock-launch-guide.html">two-adult no-courtesy-dock launch plan</a> instead of extending the summer routine.</p>`],
  ["family-boating-weather-plan.html", "dockless-cold-water-launch-2026-10-06", `<p>Carry the weather gate onto the ramp with the <a href="boat-ramp-no-courtesy-dock-launch-guide.html">cold-water, dockless-launch decision matrix</a>.</p>`],
  ["family-boating.html", "kids-marina-arrival-protocol-2026-10-06", `<p>Control the minutes before boarding and after return with the <a href="kids-marina-dock-safety-arrival-protocol.html">four-state family marina protocol</a>.</p>`],
  ["life-jackets-for-kids-guide.html", "kids-marina-pfd-waiting-zone-2026-10-06", `<p>Extend proper fit to the water's edge with the <a href="kids-marina-dock-safety-arrival-protocol.html">land, wait, board and return dock protocol</a>.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-10-06 publication.");
