import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261010 as pages } from "../content/publication-2026-10-10.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (pages.length !== 3) throw new Error("October 10 batch must contain exactly three pages");
for (const page of pages) writeFileSync(join(root, page.slug), renderPage(page));

const update = (name, fn) => {
  const path = join(root, name);
  const before = readFileSync(path, "utf8");
  const after = fn(before);
  if (before !== after) writeFileSync(path, after);
};
const insert = (html, slug, marker, markup) => html.includes(slug) ? html : html.replace(marker, `${marker}\n${markup}`);
const note = (html, marker, body) => html.includes(marker) ? html : html.replace('<aside class="related-content"', `<aside class="editor-note" data-cluster-note="${marker}"><strong>Related decision</strong>${body}</aside><aside class="related-content"`);

const cards = [
  [pages[0].slug, "assets/editorial/boat-deck-flooring-comparison-photo-card.webp", "Unbranded marine foam, woven vinyl and snap-in carpet samples on a fiberglass cockpit deck", "Flooring decision system", "EVA Foam, Woven Vinyl or Carpet?", "Compare attachment, drainage, substrate, access and eventual removal.", "Use the five-gate matrix"],
  [pages[1].slug, "assets/editorial/stillwater-reservoir-concept-photo-card.webp", "Conceptual small aluminum boat at a remote forested Adirondack reservoir ramp in autumn", "Western Adirondack plan", "Launch Stillwater With Margin", "Start with the one official ramp, a short proof loop and the east-west wind gate.", "Plan the reservoir day"],
  [pages[2].slug, "assets/editorial/cold-weather-life-jacket-fit-photo-card.webp", "Gloved adult checking an unbranded foam life-jacket strap over cold-weather boat clothing", "Cold-water fit protocol", "Refit the Life Jacket Over Layers", "Close, lift, reach, turn, sit and recover before the boat leaves the trailer.", "Run the six motions"]
];

update("gear.html", (html) => insert(html, pages[0].slug, '<div class="grid">', `<article class="card"><img src="${cards[0][1]}" alt="${cards[0][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[0][3]}</small><h3>${cards[0][4]}</h3><p>${cards[0][5]}</p><a class="button" href="${pages[0].slug}">${cards[0][6]}</a></div></article>`));
update("destinations.html", (html) => insert(html, pages[1].slug, '<div class="all-grid ny-grid">', `<article class="card"><img src="${cards[1][1]}" alt="${cards[1][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[1][3]}</small><h3>${cards[1][4]}</h3><p>${cards[1][5]}</p><a class="button" href="${pages[1].slug}">${cards[1][6]}</a></div></article>`));
update("journal.html", (html) => insert(html, pages[2].slug, '<div class="grid">', `<article class="card"><img src="${cards[2][1]}" alt="${cards[2][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[2][3]}</small><h3>${cards[2][4]}</h3><p>${cards[2][5]}</p><a class="button" href="${pages[2].slug}">${cards[2][6]}</a></div></article>`));

const homeCards = cards.map((card) => `<a class="gear-card" href="${card[0]}"><div class="gear-photo"><img alt="${card[2]}" src="${card[1]}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${card[3]}</small><h3>${card[4]}</h3><p>${card[5]}</p><span class="price">${card[6]} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Choose the surface. Prove the route. Refit the layers.</h2></div><p>Three different owner decisions: a reversible deck-flooring system, a remote Adirondack reservoir day and a cold-weather life-jacket fit check.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-emergency-line-cutter-rescue-shears-guide.html">emergency cutting tools</a>, <a href="salmon-river-reservoir-family-boating-launch-guide.html">Salmon River Reservoir access</a>, and the <a href="shoulder-season-boat-return-margin-protocol.html">shoulder-season return margin</a>. Earlier: <a href="boat-oil-only-absorbent-pad-bilge-sock-guide.html">oil-only sorbent fit</a>, <a href="canadice-lake-small-boat-family-boating.html">Canadice Lake access</a>, the <a href="boat-medication-heat-water-storage-guide.html">boat medication protocol</a>, <a href="floating-waterproof-phone-pouch-boating-guide.html">phone-pouch fit</a>, <a href="lake-harris-small-boat-family-boating.html">Lake Harris launch choice</a>, the <a href="post-storm-boat-dock-inspection-protocol.html">post-storm inspection protocol</a>, the <a href="boat-trailer-portable-tire-inflator-buying-guide.html">trailer inflator fit</a>, and the <a href="boat-ramp-no-courtesy-dock-launch-guide.html">no-courtesy-dock launch plan</a>.</p></div></section>`;
update("index.html", (html) => html.replace(/<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/, `${home}\n<section class="section" data-recent-library=`));
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-10"')) return html;
  const match = html.match(/<section class="section" data-recent-library="2026-10-09"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!match) throw new Error("Oct 9 recent library missing");
  return html.replace(match[0], `<section class="section" data-recent-library="2026-10-10"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${cards.map((card) => `<a href="${card[0]}">${card[4]}</a>`).join(", ")}, ${match[1]}</p></div></section>`);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sat, 10 Oct 2026 15:06:18 GMT</lastBuildDate>");
  const items = pages.filter((page) => !next.includes(page.slug)).map((page) => `<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Sat, 10 Oct 2026 15:06:18 GMT</pubDate><description>${page.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", items.join("") + "<item>") : next;
});
update("sitemap.xml", (xml) => {
  for (const page of pages) if (!xml.includes(page.slug)) xml = xml.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-10-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return xml;
});
update("llms.txt", (text) => {
  for (const page of pages) if (!text.includes(page.slug)) text += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return text.trimEnd() + "\n";
});

for (const [file, marker, body] of [
  ["boat-vinyl-cleaning.html", "deck-flooring-system-2026-10-10", `<p>Choose the surface before choosing the cleaner with the <a href="${pages[0].slug}">five-gate deck-flooring matrix</a>.</p>`],
  ["boat-interior-cleaning.html", "flooring-removal-gate-2026-10-10", `<p>Add drainage and eventual removal to the <a href="${pages[0].slug}">boat-flooring decision</a>.</p>`],
  ["long-lake-family-boating.html", "stillwater-wind-plan-2026-10-10", `<p>Compare this plan with the <a href="${pages[1].slug}">Stillwater Reservoir launch-and-wind gate</a>.</p>`],
  ["choosing-weekend-boating-destination.html", "stillwater-proof-loop-2026-10-10", `<p>Apply the framework to the <a href="${pages[1].slug}">Stillwater Reservoir proof loop</a>.</p>`],
  ["cold-water-boating.html", "cold-layer-pfd-fit-2026-10-10", `<p>Run the <a href="${pages[2].slug}">six-motion life-jacket layer check</a> before launch.</p>`],
  ["best-life-jackets.html", "cold-weather-fit-boundary-2026-10-10", `<p>Refit the selected device with the <a href="${pages[2].slug}">cold-weather layer protocol</a>.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three October 10 pages and complete discovery.");
