import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261015 as pages } from "../content/publication-2026-10-15.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (pages.length !== 3) throw new Error("October 15 batch must contain exactly three pages");
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
  [pages[0].slug, "assets/editorial/dock-line-chafe-guard-options-photo-card.webp", "Three unbranded dock-line chafe-protection categories: tubular sleeve, wraparound guard and smooth flexible tube", "Mooring gear", "Guard the Contact—Then Inspect the Line", "Map movement first; a sleeve that hides a worn rope is not protection.", "Build the chafe map"],
  [pages[1].slug, "assets/editorial/onoville-family-planning-concept-photo-card.webp", "Conceptual Onoville family trip-planning kit with four life jackets, dock line, map and binoculars", "Western New York access", "Onoville: Eight Gates Before the Ramp", "Confirm the season, fee, parking, weather and fishing boundary before towing.", "Plan the proof loop"],
  [pages[2].slug, "assets/editorial/family-marine-forecast-kit-photo-card.webp", "Abstract marine forecast tablet beside a handheld radio, compass, pencil and blank decision card", "No-spend family drill", "Turn a Forecast Into Six Decisions", "Twenty minutes ashore teaches source, time, wind, waves, thunder and the no-go call.", "Run the forecast drill"]
];

update("gear.html", (html) => insert(html, pages[0].slug, '<div class="grid">', `<article class="card"><img src="${cards[0][1]}" alt="${cards[0][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[0][3]}</small><h3>${cards[0][4]}</h3><p>${cards[0][5]}</p><a class="button" href="${pages[0].slug}">${cards[0][6]}</a></div></article>`));
update("destinations.html", (html) => insert(html, pages[1].slug, '<div class="all-grid ny-grid">', `<article class="card"><img src="${cards[1][1]}" alt="${cards[1][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[1][3]}</small><h3>${cards[1][4]}</h3><p>${cards[1][5]}</p><a class="button" href="${pages[1].slug}">${cards[1][6]}</a></div></article>`));
update("journal.html", (html) => insert(html, pages[2].slug, '<div class="grid">', `<article class="card"><img src="${cards[2][1]}" alt="${cards[2][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[2][3]}</small><h3>${cards[2][4]}</h3><p>${cards[2][5]}</p><a class="button" href="${pages[2].slug}">${cards[2][6]}</a></div></article>`));

const homeCards = cards.map((card) => `<a class="gear-card" href="${card[0]}"><div class="gear-photo"><img alt="${card[2]}" src="${card[1]}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${card[3]}</small><h3>${card[4]}</h3><p>${card[5]}</p><span class="price">${card[6]} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Protect the line. Prove the route. Read the trend.</h2></div><p>Three different jobs: map dock-line chafe before buying a guard, screen Onoville through eight access and operating gates, and teach a six-decision family forecast drill.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="marine-grease-gun-hose-coupler-buying-guide.html">marine grease-gun fit</a>, <a href="indian-lake-public-boat-launch-family-guide.html">Indian Lake access</a>, and <a href="boat-trailer-backing-spotter-hand-signals-drill.html">the trailer-spotter drill</a>. Earlier: <a href="marina-cart-folding-wagon-dock-cart-buying-guide.html">marina-cart route testing</a>, <a href="fish-creek-pond-family-boating-launch-guide.html">Fish Creek Pond access</a>, and <a href="teach-kids-three-boat-knots-20-minute-practice.html">the family knot drill</a>.</p></div></section>`;
update("index.html", (html) => html.replace(/<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/, `${home}\n<section class="section" data-recent-library=`));
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-15"')) return html;
  const match = html.match(/<section class="section" data-recent-library="2026-10-14"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!match) throw new Error("Oct 14 recent library missing");
  return html.replace(match[0], `<section class="section" data-recent-library="2026-10-15"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${cards.map((card) => `<a href="${card[0]}">${card[4]}</a>`).join(", ")}, ${match[1]}</p></div></section>`);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Thu, 15 Oct 2026 15:35:00 GMT</lastBuildDate>");
  const items = pages.filter((page) => !next.includes(page.slug)).map((page) => `<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Thu, 15 Oct 2026 15:35:00 GMT</pubDate><description>${page.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", items.join("") + "<item>") : next;
});
update("sitemap.xml", (xml) => {
  for (const page of pages) if (!xml.includes(page.slug)) xml = xml.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-10-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return xml;
});
update("llms.txt", (content) => {
  for (const page of pages) if (!content.includes(page.slug)) content += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return content.trimEnd() + "\n";
});

for (const [file, marker, body] of [
  ["dock-line-buying-guide.html", "dock-line-chafe-map-2026-10-15", `<p>Protect the installed line with the <a href="${pages[0].slug}">seven-point chafe map and 24-hour acceptance test</a>.</p>`],
  ["dock-lines-explained.html", "chafe-guard-inspection-2026-10-15", `<p>Keep the rope visible with the <a href="${pages[0].slug}">sleeve, wrap and tube tradeoff guide</a>.</p>`],
  ["chautauqua-lake-long-point-family-boating.html", "onoville-eight-gate-2026-10-15", `<p>Compare this trip with the <a href="${pages[1].slug}">Onoville eight-gate access and proof-loop plan</a>.</p>`],
  ["black-lake-family-boating.html", "onoville-reservoir-proof-loop-2026-10-15", `<p>For another large-water decision model, use the <a href="${pages[1].slug}">Onoville reservoir proof-loop plan</a>.</p>`],
  ["family-boating-weather-plan.html", "kids-forecast-six-box-card-2026-10-15", `<p>Teach the sequence ashore with the <a href="${pages[2].slug}">six-box family forecast card</a>.</p>`],
  ["wind-waves-and-fetch.html", "forecast-drill-wind-wave-2026-10-15", `<p>Practice turning wind and wave language into a route decision with the <a href="${pages[2].slug}">20-minute family forecast drill</a>.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three October 15 pages and complete discovery.");
