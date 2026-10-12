import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261012 as pages } from "../content/publication-2026-10-12.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (pages.length !== 3) throw new Error("October 12 batch must contain exactly three pages");
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
  [pages[0].slug, "assets/editorial/boat-winterizing-antifreeze-photo-card.webp", "Unbranded pink marine and RV antifreeze jugs beside gloves, absorbent pads, a blank label card and a propylene-glycol refractometer", "Winterizing-fluid system", "Match the Label to the System", "Separate potable plumbing, raw-water circuits and closed coolant before buying a jug.", "Build the antifreeze card"],
  [pages[1].slug, "assets/editorial/green-lakes-rental-only-concept-photo-card.webp", "Life-jacketed family at a conceptual park rental counter beside kayaks and rowboats", "Central New York access", "Rent There. Do Not Tow a Kayak.", "Green Lakes prohibits outside watercraft; verify its seasonal rentals and carry a shore-first backup.", "Plan Green Lakes"],
  [pages[2].slug, "assets/editorial/responsible-boat-wildlife-viewing-photo-card.webp", "Life-jacketed family quietly viewing distant generic water birds through binoculars from a stopped boat", "Family seamanship", "Give Wildlife the Exit", "Use a no-pressure protocol: slow, stay predictable, never feed and leave at the first disturbance cue.", "Use the viewing protocol"]
];

update("gear.html", (html) => insert(html, pages[0].slug, '<div class="grid">', `<article class="card"><img src="${cards[0][1]}" alt="${cards[0][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[0][3]}</small><h3>${cards[0][4]}</h3><p>${cards[0][5]}</p><a class="button" href="${pages[0].slug}">${cards[0][6]}</a></div></article>`));
update("destinations.html", (html) => insert(html, pages[1].slug, '<div class="all-grid ny-grid">', `<article class="card"><img src="${cards[1][1]}" alt="${cards[1][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[1][3]}</small><h3>${cards[1][4]}</h3><p>${cards[1][5]}</p><a class="button" href="${pages[1].slug}">${cards[1][6]}</a></div></article>`));
update("journal.html", (html) => insert(html, pages[2].slug, '<div class="grid">', `<article class="card"><img src="${cards[2][1]}" alt="${cards[2][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[2][3]}</small><h3>${cards[2][4]}</h3><p>${cards[2][5]}</p><a class="button" href="${pages[2].slug}">${cards[2][6]}</a></div></article>`));

const homeCards = cards.map((card) => `<a class="gear-card" href="${card[0]}"><div class="gear-photo"><img alt="${card[2]}" src="${card[1]}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${card[3]}</small><h3>${card[4]}</h3><p>${card[5]}</p><span class="price">${card[6]} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Match the system. Respect the lake. Give wildlife room.</h2></div><p>Three different boating decisions: a manual-first winterizing-fluid card, a rental-only Central New York lake plan and a no-pressure family wildlife protocol.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-wheel-bearing-hub-inspection-guide.html">boat-trailer wheel bearings</a>, <a href="hinckley-reservoir-family-boating-launch-guide.html">Hinckley Reservoir access</a>, and the <a href="winter-stored-boat-cover-snow-wind-inspection-guide.html">stored-cover weather check</a>. Earlier: <a href="boat-deck-flooring-eva-woven-vinyl-carpet-guide.html">boat deck-flooring choices</a>, <a href="stillwater-reservoir-family-boating-launch-guide.html">Stillwater Reservoir</a>, and the <a href="cold-weather-life-jacket-layer-fit-guide.html">cold-layer life-jacket check</a>.</p></div></section>`;
update("index.html", (html) => html.replace(/<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/, `${home}\n<section class="section" data-recent-library=`));
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-12"')) return html;
  const match = html.match(/<section class="section" data-recent-library="2026-10-11"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!match) throw new Error("Oct 11 recent library missing");
  return html.replace(match[0], `<section class="section" data-recent-library="2026-10-12"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${cards.map((card) => `<a href="${card[0]}">${card[4]}</a>`).join(", ")}, ${match[1]}</p></div></section>`);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Mon, 12 Oct 2026 16:15:02 GMT</lastBuildDate>");
  const items = pages.filter((page) => !next.includes(page.slug)).map((page) => `<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Mon, 12 Oct 2026 16:15:02 GMT</pubDate><description>${page.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", items.join("") + "<item>") : next;
});
update("sitemap.xml", (xml) => {
  for (const page of pages) if (!xml.includes(page.slug)) xml = xml.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-10-12</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return xml;
});
update("llms.txt", (content) => {
  for (const page of pages) if (!content.includes(page.slug)) content += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return content.trimEnd() + "\n";
});

for (const [file, marker, body] of [
  ["boat-winterization.html", "antifreeze-system-card-2026-10-12", `<p>Choose fluid with the <a href="${pages[0].slug}">system, label and manual antifreeze card</a> before any jug is opened.</p>`],
  ["boatyard-winter-storage-handoff-work-order-guide.html", "antifreeze-traceability-2026-10-12", `<p>Add the <a href="${pages[0].slug}">winterizing-fluid system map and traceability record</a> to the work order.</p>`],
  ["cazenovia-lake-family-boating.html", "green-lakes-rental-only-2026-10-12", `<p>For a nearby day without trailering, use the <a href="${pages[1].slug}">Green Lakes rental-only access plan</a>.</p>`],
  ["choosing-weekend-boating-destination.html", "green-lakes-access-gate-2026-10-12", `<p>Green Lakes is the hard-rule example: <a href="${pages[1].slug}">outside watercraft are prohibited and rentals are seasonal</a>.</p>`],
  ["marine-binoculars-buying-guide.html", "wildlife-no-pressure-protocol-2026-10-12", `<p>Pair the optics with the <a href="${pages[2].slug}">no-pressure wildlife-viewing protocol</a>.</p>`],
  ["family-docking-crew-briefing.html", "wildlife-seven-word-callout-2026-10-12", `<p>Extend the crew briefing with the <a href="${pages[2].slug}">seven-word wildlife callout and exit rule</a>.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three October 12 pages and complete discovery.");
