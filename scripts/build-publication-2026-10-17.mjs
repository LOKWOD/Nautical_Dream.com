import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261017 as pages } from "../content/publication-2026-10-17.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (pages.length !== 3) throw new Error("October 17 batch must contain exactly three pages");
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
  [pages[0].slug, "assets/editorial/boat-swim-platform-category-comparison-photo-card.webp", "Unbranded rolled foam mat, inflatable dock and compact floating pad shown as three distinct swim-platform categories", "Family boat gear", "Recovery First. Then Pick the Platform.", "Compare foam mats, inflatable docks and compact pads only after the ladder and reboarding route pass.", "Build the fit card"],
  [pages[1].slug, "assets/editorial/brant-lake-proof-loop-planning-photo-card.webp", "Conceptual Brant Lake planning kit with life jackets, dock line, binoculars and a blank proof-loop checklist", "Adirondack access", "Eleven Spaces Change the Day", "Use the verified launch card, a short proof loop and an early wind gate—without assuming services.", "Plan Brant Lake"],
  [pages[2].slug, "assets/editorial/boat-electronics-retain-transfer-remove-photo-card.webp", "Unbranded VHF, chartplotter, memory card, keys and blank checklist arranged for a retain transfer remove handoff", "Boat ownership", "Sell the Boat, Not Your Data", "Separate vessel safety, transferable records and personal access before resetting any electronics.", "Use the handoff matrix"]
];

update("gear.html", (html) => insert(html, pages[0].slug, '<div class="grid">', `<article class="card"><img src="${cards[0][1]}" alt="${cards[0][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[0][3]}</small><h3>${cards[0][4]}</h3><p>${cards[0][5]}</p><a class="button" href="${pages[0].slug}">${cards[0][6]}</a></div></article>`));
update("destinations.html", (html) => insert(html, pages[1].slug, '<div class="all-grid ny-grid">', `<article class="card"><img src="${cards[1][1]}" alt="${cards[1][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[1][3]}</small><h3>${cards[1][4]}</h3><p>${cards[1][5]}</p><a class="button" href="${pages[1].slug}">${cards[1][6]}</a></div></article>`));
update("journal.html", (html) => insert(html, pages[2].slug, '<div class="grid">', `<article class="card"><img src="${cards[2][1]}" alt="${cards[2][2]}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${cards[2][3]}</small><h3>${cards[2][4]}</h3><p>${cards[2][5]}</p><a class="button" href="${pages[2].slug}">${cards[2][6]}</a></div></article>`));

const homeCards = cards.map((card) => `<a class="gear-card" href="${card[0]}"><div class="gear-photo"><img alt="${card[2]}" src="${card[1]}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${card[3]}</small><h3>${card[4]}</h3><p>${card[5]}</p><span class="price">${card[6]} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Recover the swimmer. Prove the lake. Transfer the boat.</h2></div><p>Three distinct jobs: choose a floating platform around reboarding, make Brant Lake's small lot the first gate, and clear personal electronics data without erasing the vessel's safety handoff.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-guide-ons-post-bunk-roller-buying-guide.html">boat-trailer guide-ons</a>, <a href="waneta-lamoka-lakes-family-boating-launch-guide.html">Waneta and Lamoka Lakes</a>, and <a href="life-jacket-winter-storage-inspection-guide.html">winter life-jacket storage</a>. Earlier: <a href="dock-line-chafe-guard-sleeve-buying-guide.html">dock-line chafe protection</a>, <a href="onoville-marina-allegheny-reservoir-family-guide.html">Onoville access</a>, and <a href="teach-kids-read-marine-forecast-20-minute-drill.html">the family forecast drill</a>.</p></div></section>`;
update("index.html", (html) => html.replace(/<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/, `${home}\n<section class="section" data-recent-library=`));
update("index.html", (html) => {
  const currentDate = html.match(/data-recent-library="(\d{4}-\d{2}-\d{2})"/)?.[1];
  if (currentDate && currentDate >= "2026-10-17") return html;
  const match = html.match(/<section class="section" data-recent-library="2026-10-16"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!match) throw new Error("Oct 16 recent library missing");
  return html.replace(match[0], `<section class="section" data-recent-library="2026-10-17"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${cards.map((card) => `<a href="${card[0]}">${card[4]}</a>`).join(", ")}, ${match[1]}</p></div></section>`);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sat, 17 Oct 2026 15:55:00 GMT</lastBuildDate>");
  const items = pages.filter((page) => !next.includes(page.slug)).map((page) => `<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Sat, 17 Oct 2026 15:55:00 GMT</pubDate><description>${page.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", items.join("") + "<item>") : next;
});
update("sitemap.xml", (xml) => {
  for (const page of pages) if (!xml.includes(page.slug)) xml = xml.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-10-17</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return xml;
});
update("llms.txt", (content) => {
  for (const page of pages) if (!content.includes(page.slug)) content += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return content.trimEnd() + "\n";
});

for (const [file, marker, body] of [
  ["swimming-from-boat-with-kids-safety-plan.html", "swim-platform-reboarding-gate-2026-10-17", `<p>Choose recreational surfaces only after the <a href="${pages[0].slug}">eight-field swim-platform fit card and reboarding gate</a> pass.</p>`],
  ["boat-boarding-ladder-buying-guide.html", "swim-platform-ladder-clearance-2026-10-17", `<p>Keep the accepted ladder route clear with the <a href="${pages[0].slug}">foam-mat, inflatable-dock and floating-pad decision system</a>.</p>`],
  ["schroon-lake-family-boating.html", "brant-lake-proof-loop-2026-10-17", `<p>For a smaller nearby launch constraint, use the <a href="${pages[1].slug}">Brant Lake 11-space launch and proof-loop card</a>.</p>`],
  ["indian-lake-public-boat-launch-family-guide.html", "brant-lake-small-lot-gate-2026-10-17", `<p>Compare this plan with the <a href="${pages[1].slug}">Brant Lake small-lot and early-wind-gate guide</a>.</p>`],
  ["boat-records-and-logbook.html", "electronics-sale-handoff-2026-10-17", `<p>When the boat changes hands, use the <a href="${pages[2].slug}">retain-transfer-remove electronics and personal-data matrix</a>.</p>`],
  ["used-boat-title-hin-paperwork-guide.html", "mmsi-data-transfer-2026-10-17", `<p>Add the <a href="${pages[2].slug}">MMSI, accounts, electronics and personal-data handoff</a> to the title and HIN file.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three October 17 pages and complete discovery.");
