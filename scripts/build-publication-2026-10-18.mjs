import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261018 as pages } from "../content/publication-2026-10-18.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (pages.length !== 3) throw new Error("October 18 batch must contain exactly three pages");
const attrEsc = text => text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
for (const page of pages) {
  const alt = attrEsc(page.hero.alt);
  const html = renderPage(page)
    .replace('<meta property="og:image:width"', `<meta property="og:image:alt" content="${alt}"><meta name="twitter:image:alt" content="${alt}">\n  <meta property="og:image:width"`);
  writeFileSync(join(root, page.slug), html);
}
const update = (file, transform) => {
  const path = join(root, file), before = readFileSync(path, "utf8"), after = transform(before);
  if (before !== after) writeFileSync(path, after);
};
const cards = [
  [pages[0].slug, "rod-holder-fit-card", "Conceptual rod handles, unbranded spinning reel, ruler and blank fit notebook", "Fishing accessory fit", "Choose the Mount Before the Holder", "Measure the boat, match the mounting system and rehearse the actual rod-and-reel clearance.", "Build the fit card"],
  [pages[1].slug, "lake-colby-access-card", "Conceptual small-boat planning kit with paddle, life jacket, dry bag and blank checklist; not a Lake Colby photograph", "Small-boat access", "Lake Colby: Power and Carry-In First", "Check the 10 hp restriction and hand-launch practicality before loading the boat.", "Check Lake Colby access"],
  [pages[2].slug, "rental-boat-handover-card", "Conceptual rental handover kit with floating key fob, blank papers, phone and life jacket", "Family rental planning", "Photograph. Demonstrate. Agree.", "Accept a rental boat only after condition, operating instructions and return terms are clear.", "Use the acceptance record"]
];
const hubs = [["gear.html", '<div class="grid">'], ["destinations.html", '<div class="all-grid ny-grid">'], ["journal.html", '<div class="grid">']];
for (const [i, [file, marker]] of hubs.entries()) update(file, html => {
  const [slug, key, alt, category, title, summary, label] = cards[i];
  if (html.includes(slug)) return html;
  if (!html.includes(marker)) throw new Error(`${file}: card insertion marker missing`);
  return html.replace(marker, `${marker}\n<article class="card"><img src="assets/editorial/${key}.webp" alt="${alt}" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>${category}</small><h3>${title}</h3><p>${summary}</p><a class="button" href="${slug}">${label}</a></div></article>`);
});
const homeCards = cards.map(([slug, key, alt, category, title, summary, label]) => `<a class="gear-card" href="${slug}"><div class="gear-photo"><img alt="${alt}" src="assets/editorial/${key}.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${category}</small><h3>${title}</h3><p>${summary}</p><span class="price">${label} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides · October 18, 2026</div><h2 id="latest-guides">Fit the mount. Check the access. Accept the boat.</h2></div><p>Three different decisions before the day starts: buy compatible fishing hardware, bring an eligible hand-launchable boat to Lake Colby, and get a rental handover that leaves no essential question unanswered.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-swim-platform-floating-mat-inflatable-dock-buying-guide.html">swim-platform fit and reboarding</a>, <a href="brant-lake-public-boat-launch-family-guide.html">Brant Lake's 11-space launch plan</a>, and <a href="selling-boat-electronics-mmsi-personal-data-handoff-guide.html">electronics and personal-data sale handoff</a>. Earlier: <a href="boat-trailer-guide-ons-post-bunk-roller-buying-guide.html">trailer guide-ons</a>, <a href="waneta-lamoka-lakes-family-boating-launch-guide.html">Waneta and Lamoka</a>, and <a href="life-jacket-winter-storage-inspection-guide.html">winter life-jacket storage</a>.</p></div></section>`;
update("index.html", html => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest guide marker missing");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", html => {
  const existing = html.match(/data-recent-library="(\d{4}-\d{2}-\d{2})"/);
  if (existing && existing[1] >= "2026-10-18") return html;
  const match = html.match(/<section class="section" data-recent-library="2026-10-17"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!match) throw new Error("Oct 17 recent library missing");
  return html.replace(match[0], `<section class="section" data-recent-library="2026-10-18"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${cards.map(c => `<a href="${c[0]}">${c[4]}</a>`).join(", ")}, ${match[1]}</p></div></section>`);
});
const xmlEsc = s => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
update("feed.xml", xml => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sun, 18 Oct 2026 16:00:00 GMT</lastBuildDate>");
  const items = pages.filter(p => !next.includes(p.slug)).map(p => `<item><title>${xmlEsc(p.title)}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Sun, 18 Oct 2026 16:00:00 GMT</pubDate><description>${xmlEsc(p.description)}</description></item>`);
  return items.length ? next.replace("<item>", items.join("") + "<item>") : next;
});
update("sitemap.xml", xml => {
  for (const p of pages) if (!xml.includes(p.slug)) xml = xml.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-10-18</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return xml;
});
update("llms.txt", text => {
  for (const p of pages) if (!text.includes(p.slug)) text += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return text.trimEnd() + "\n";
});
for (const [file, marker, body] of [
  ["installing-boat-accessories.html", "rod-holder-fit-2026-10-18", `<p>For fishing hardware, complete the <a href="${pages[0].slug}">eight-field rod-holder fit card</a> before choosing a clamp, rail adapter or permanent base.</p>`],
  ["boat-tool-kit-guide.html", "rod-holder-clearance-2026-10-18", `<p>Do the <a href="${pages[0].slug}">rod-and-reel clearance rehearsal</a> before turning accessory selection into an installation job.</p>`],
  ["lower-saranac-lake-family-boating.html", "colby-power-access-2026-10-18", `<p>A different small-craft option requires a different gate: <a href="${pages[1].slug}">Lake Colby's power restriction and hand-launch access card</a>.</p>`],
  ["lake-eaton-family-boating.html", "colby-carry-in-2026-10-18", `<p>Compare access constraints with <a href="${pages[1].slug}">Lake Colby's 10 hp and carry-in eligibility plan</a>; neither lake's rules substitute for the other's.</p>`],
  ["green-lakes-state-park-boat-rental-guide.html", "rental-acceptance-2026-10-18", `<p>Before accepting any self-operated rental, use the separate <a href="${pages[2].slug}">photograph-demonstrate-agree handover framework</a>, adapted to that boat and operator's terms.</p>`],
  ["boating-with-children-safely.html", "rental-family-handover-2026-10-18", `<p>Occasional boaters can prepare with the <a href="${pages[2].slug}">family rental acceptance record</a>: fit the children, understand the boat and agree on the return before departure.</p>`]
]) update(file, html => html.includes(marker) ? html : html.replace('<aside class="related-content"', `<aside class="editor-note" data-cluster-note="${marker}"><strong>Related decision</strong>${body}</aside><aside class="related-content"`));
console.log("Built exactly three October 18 pages, three decision assets and complete discovery.");
