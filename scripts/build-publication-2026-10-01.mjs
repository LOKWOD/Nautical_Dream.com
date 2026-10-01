import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261001 } from "../content/publication-2026-10-01.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20261001.length !== 3) throw new Error("The 2026-10-01 publication must contain exactly three pages.");
for (const page of publication20261001) {
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

update("gear.html", (html) => card(html, "portable-boat-fuel-tank-connector-vent-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/portable-fuel-tank-system-photo-card.webp" alt="Illustrative unbranded portable marine fuel tank, hose, primer bulb and different connector fittings" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Portable outboard fuel systems</small><h3>Match the Whole Portable Fuel System</h3><p>Fit the tank, connector, hose, venting and storage to the exact engine and boat manuals.</p><a class="button" href="portable-boat-fuel-tank-connector-vent-guide.html">Build the fit card</a></div></article>`));
update("destinations.html", (html) => card(html, "cross-lake-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/cross-lake-family-photo-card.webp" alt="Illustrative life-jacketed family on a generic lowland Central New York river-to-lake route" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Central New York access plan</small><h3>Cross Lake Starts With the Launch</h3><p>Separate the public hand launch from private fee trailer access before promising the day.</p><a class="button" href="cross-lake-family-boating.html">Open the access plan</a></div></article>`));
update("journal.html", (html) => card(html, "boat-passenger-seating-boarding-movement-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/family-passenger-briefing-photo-card.webp" alt="Illustrative adult supervising a child boarding a secured runabout while passengers remain seated" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Family passenger protocol</small><h3>Name the State Before Anyone Moves</h3><p>Use assigned seats and four clear states for boarding, departure, movement and arrival.</p><a class="button" href="boat-passenger-seating-boarding-movement-guide.html">Use the passenger brief</a></div></article>`));

const cards = [
  ["portable-boat-fuel-tank-connector-vent-guide.html", "assets/editorial/portable-fuel-tank-system-photo-card.webp", "Illustrative unbranded portable marine fuel tank, hose, primer bulb and different connector fittings", "Portable fuel-system fit", "The Tank Is Only One Part", "Match capacity, connectors, line, pressure behavior and storage to the manuals.", "Open the buying guide"],
  ["cross-lake-family-boating.html", "assets/editorial/cross-lake-family-photo-card.webp", "Illustrative life-jacketed family on a generic lowland Central New York river-to-lake route", "Central New York access plan", "Cross Lake Has Two Different Starts", "Use the public hand launch only for a suitable carry-in plan; confirm private trailer access.", "Open the family plan"],
  ["boat-passenger-seating-boarding-movement-guide.html", "assets/editorial/family-passenger-briefing-photo-card.webp", "Illustrative adult supervising a child boarding a secured runabout while passengers remain seated", "Family passenger protocol", "Seats First, Movement by Permission", "Replace shouted corrections with four named states and assigned seats.", "Open the protocol"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Match the fuel path. Choose the access. Seat the crew.</h2></div><p>Three different decisions: equipment compatibility, a Central New York route, and the human system aboard.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-usb-charger-usb-c-pd-guide.html">marine USB charging</a>, <a href="lake-eaton-family-boating.html">Lake Eaton</a>, and <a href="small-boat-fuel-oil-spill-response.html">small-vessel spill response</a>. Earlier: <a href="inflatable-life-jacket-rearming-kit-guide.html">inflatable PFD rearming</a>, <a href="whitney-point-reservoir-family-boating.html">Whitney Point Reservoir</a>, and <a href="boat-holding-tank-pumpout-no-discharge-guide.html">holding-tank pumpouts</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-01"')) return html;
  const latest = [
    ["portable-boat-fuel-tank-connector-vent-guide.html", "portable fuel-tank systems"], ["cross-lake-family-boating.html", "Cross Lake"], ["boat-passenger-seating-boarding-movement-guide.html", "family passenger protocol"],
    ["boat-usb-charger-usb-c-pd-guide.html", "marine USB charging"], ["lake-eaton-family-boating.html", "Lake Eaton"], ["small-boat-fuel-oil-spill-response.html", "small-vessel spill response"]
  ];
  const existing = html.match(/<section class="section" data-recent-library="2026-09-30"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!existing) throw new Error("Previous recent library not found");
  const prefix = latest.map(([href, label]) => `<a href="${href}">${label}</a>`).join(", ");
  const old = existing[1].replace(/^.*?small-vessel spill response<\/a>,\s*/, "");
  const recent = `<section class="section" data-recent-library="2026-10-01"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${prefix}, ${old}</p></div></section>`;
  return html.replace(existing[0], recent);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Thu, 01 Oct 2026 15:48:00 GMT</lastBuildDate>");
  const items = publication20261001.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Thu, 01 Oct 2026 15:46:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20261001) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-10-01</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20261001) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["safe-boat-fueling.html", "portable-fuel-system-fit-2026-10-01", `<p>Before fuel reaches the dock, use the <a href="portable-boat-fuel-tank-connector-vent-guide.html">portable fuel-tank fit card</a> to match the tank, connectors, hose, venting and storage to the exact manuals.</p>`],
  ["marine-fuel-management.html", "portable-tank-range-weight-2026-10-01", `<p>A portable tank's useful range begins with system fit and filled weight; the <a href="portable-boat-fuel-tank-connector-vent-guide.html">portable fuel-system guide</a> records both before purchase.</p>`],
  ["erie-canal-guide.html", "cross-lake-access-route-2026-10-01", `<p>For a smaller canal-system decision, the <a href="cross-lake-family-boating.html">Cross Lake access plan</a> separates a Seneca River hand launch from private fee trailer ramps.</p>`],
  ["how-to-evaluate-boat-ramp.html", "cross-lake-private-ramp-check-2026-10-01", `<p>Cross Lake demonstrates why “access” is not enough: the <a href="cross-lake-family-boating.html">official record distinguishes a public hand launch from private fee trailer access</a>.</p>`],
  ["family-docking-crew-briefing.html", "passenger-four-state-protocol-2026-10-01", `<p>Before line roles, use the <a href="boat-passenger-seating-boarding-movement-guide.html">four-state passenger protocol</a> to assign seats and control boarding, movement and arrival.</p>`],
  ["boating-with-children-safely.html", "family-seats-movement-protocol-2026-10-01", `<p>Turn general supervision into a repeatable system with the <a href="boat-passenger-seating-boarding-movement-guide.html">family seating, boarding and movement brief</a>.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-10-01 publication.");
