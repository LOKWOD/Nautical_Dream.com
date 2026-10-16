import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261016 as pages } from "../content/publication-2026-10-16.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (pages.length !== 3) throw new Error("October 16 batch must contain exactly three pages");
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
  [pages[0].slug, "assets/editorial/boat-trailer-guide-ons-comparison-photo-card.webp", "Unbranded post, carpeted bunk-board and roller boat-trailer guide-on categories shown separately", "Trailer setup", "Guide the Approach—Never Carry the Hull", "Choose posts, bunks or rollers by frame, hull and ramp geometry, then prove the fit in three stages.", "Build the fit card"],
  [pages[1].slug, "assets/editorial/waneta-lamoka-channel-decision-concept-photo-card.webp", "Conceptual two-lake launch kit with two ramp choices and a conditional shallow channel", "Finger Lakes access", "Waneta or Lamoka: Pick One First", "Two hard-surface ramps, one shared parking plan and a channel that must remain conditional.", "Choose the launch"],
  [pages[2].slug, "assets/editorial/life-jacket-winter-inspection-photo-card.webp", "Unbranded foam and inflatable life jackets separated for a dry indoor winter inspection", "Seasonal safety", "Dry, Inspect, Separate, Release", "Store foam without compression and make every inflatable follow its exact manual.", "Use the seven gates"]
];

update("gear.html", (html) => insert(html, pages[0].slug, '<div class="grid">', `<article class="card"><img src="${cards[0][1]}" alt="${cards[0][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[0][3]}</small><h3>${cards[0][4]}</h3><p>${cards[0][5]}</p><a class="button" href="${pages[0].slug}">${cards[0][6]}</a></div></article>`));
update("destinations.html", (html) => insert(html, pages[1].slug, '<div class="all-grid ny-grid">', `<article class="card"><img src="${cards[1][1]}" alt="${cards[1][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[1][3]}</small><h3>${cards[1][4]}</h3><p>${cards[1][5]}</p><a class="button" href="${pages[1].slug}">${cards[1][6]}</a></div></article>`));
update("journal.html", (html) => insert(html, pages[2].slug, '<div class="grid">', `<article class="card"><img src="${cards[2][1]}" alt="${cards[2][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[2][3]}</small><h3>${cards[2][4]}</h3><p>${cards[2][5]}</p><a class="button" href="${pages[2].slug}">${cards[2][6]}</a></div></article>`));

const homeCards = cards.map((card) => `<a class="gear-card" href="${card[0]}"><div class="gear-photo"><img alt="${card[2]}" src="${card[1]}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${card[3]}</small><h3>${card[4]}</h3><p>${card[5]}</p><span class="price">${card[6]} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Fit the trailer. Pick the water. Store the safety gear.</h2></div><p>Three separate reader jobs: measure guide-ons before buying, choose one of two neighboring lake ramps without promising the channel, and release life jackets from winter storage only after they pass construction-specific checks.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="dock-line-chafe-guard-sleeve-buying-guide.html">dock-line chafe protection</a>, <a href="onoville-marina-allegheny-reservoir-family-guide.html">Onoville access</a>, and <a href="teach-kids-read-marine-forecast-20-minute-drill.html">the family forecast drill</a>. Earlier: <a href="marine-grease-gun-hose-coupler-buying-guide.html">marine grease-gun fit</a>, <a href="indian-lake-public-boat-launch-family-guide.html">Indian Lake access</a>, and <a href="boat-trailer-backing-spotter-hand-signals-drill.html">the trailer-spotter drill</a>.</p></div></section>`;
update("index.html", (html) => html.replace(/<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/, `${home}\n<section class="section" data-recent-library=`));
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-16"')) return html;
  const match = html.match(/<section class="section" data-recent-library="2026-10-15"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!match) throw new Error("Oct 15 recent library missing");
  return html.replace(match[0], `<section class="section" data-recent-library="2026-10-16"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${cards.map((card) => `<a href="${card[0]}">${card[4]}</a>`).join(", ")}, ${match[1]}</p></div></section>`);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Fri, 16 Oct 2026 15:45:00 GMT</lastBuildDate>");
  const items = pages.filter((page) => !next.includes(page.slug)).map((page) => `<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Fri, 16 Oct 2026 15:45:00 GMT</pubDate><description>${page.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", items.join("") + "<item>") : next;
});
update("sitemap.xml", (xml) => {
  for (const page of pages) if (!xml.includes(page.slug)) xml = xml.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-10-16</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return xml;
});
update("llms.txt", (content) => {
  for (const page of pages) if (!content.includes(page.slug)) content += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return content.trimEnd() + "\n";
});

for (const [file, marker, body] of [
  ["boat-trailer-safety-checklist.html", "guide-on-fit-card-2026-10-16", `<p>Add alignment aids only after using the <a href="${pages[0].slug}">nine-field guide-on fit card and three-stage acceptance test</a>.</p>`],
  ["boat-trailer-backing-spotter-hand-signals-drill.html", "guide-on-empty-lot-test-2026-10-16", `<p>Keep the spotter protocol separate from the <a href="${pages[0].slug}">guide-on empty-lot, dry-fit and calm-ramp test</a>.</p>`],
  ["keuka-lake-family-boating.html", "waneta-lamoka-two-ramp-2026-10-16", `<p>For a smaller nearby decision, use the <a href="${pages[1].slug}">Waneta/Lamoka two-ramp and conditional-channel card</a>.</p>`],
  ["canandaigua-lake-family-boating.html", "waneta-lamoka-one-lake-2026-10-16", `<p>Compare this route with the <a href="${pages[1].slug}">one-lake-first Waneta and Lamoka proof loop</a>.</p>`],
  ["best-life-jackets.html", "winter-storage-seven-gates-2026-10-16", `<p>Protect the purchase through the <a href="${pages[2].slug}">seven-gate winter storage and spring release protocol</a>.</p>`],
  ["cold-weather-life-jacket-layer-fit-guide.html", "winter-storage-foam-inflatable-2026-10-16", `<p>After the layer-fit check, separate foam and inflatable care with the <a href="${pages[2].slug}">construction-specific winter storage guide</a>.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three October 16 pages and complete discovery.");
