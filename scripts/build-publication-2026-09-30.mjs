import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260930 } from "../content/publication-2026-09-30.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260930.length !== 3) throw new Error("The 2026-09-30 publication must contain exactly three pages.");
for (const page of publication20260930) {
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

update("gear.html", (html) => card(html, "boat-usb-charger-usb-c-pd-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-usb-charger-photo-card.webp" alt="Illustrative unbranded USB-A and USB-C panel charger with cable, phone and tablet at a boat helm" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Marine charging compatibility</small><h3>Match the Whole USB Power Path</h3><p>Check input range, PD profiles, shared load, protection and installation before cutting the panel.</p><a class="button" href="boat-usb-charger-usb-c-pd-guide.html">Build the fit card</a></div></article>`));
update("destinations.html", (html) => card(html, "lake-eaton-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/lake-eaton-family-photo-card.webp" alt="Illustrative life-jacketed family in a small aluminum outboard on a generic wooded Adirondack lake" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Central Adirondack small-boat plan</small><h3>Lake Eaton Starts With the Access</h3><p>Match a small, light boat to the unimproved launch and keep the proof loop close.</p><a class="button" href="lake-eaton-family-boating.html">Open the family plan</a></div></article>`));
update("journal.html", (html) => card(html, "small-boat-fuel-oil-spill-response.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/small-oil-spill-response-photo-card.webp" alt="Illustrative absorbent pads and boom containing a small sheen beside a secured recreational boat" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Small-vessel pollution response</small><h3>Contain, Report, Document</h3><p>Protect people, stop the source when safe and call without waiting for a perfect estimate.</p><a class="button" href="small-boat-fuel-oil-spill-response.html">Use the response card</a></div></article>`));

const cards = [
  ["boat-usb-charger-usb-c-pd-guide.html", "assets/editorial/boat-usb-charger-photo-card.webp", "Illustrative unbranded USB-A and USB-C panel charger with cable, phone and tablet at a boat helm", "Marine charging compatibility", "USB-C Is Not a Power Promise", "Match the boat input, device profile, shared output, circuit and location.", "Open the buying guide"],
  ["lake-eaton-family-boating.html", "assets/editorial/lake-eaton-family-photo-card.webp", "Illustrative life-jacketed family in a small aluminum outboard on a generic wooded Adirondack lake", "Central Adirondack day plan", "Lake Eaton Fits Small Boats", "Use the unimproved launch, prove the boat nearby and protect the early return.", "Open the family plan"],
  ["small-boat-fuel-oil-spill-response.html", "assets/editorial/small-oil-spill-response-photo-card.webp", "Illustrative absorbent pads and boom containing a small sheen beside a secured recreational boat", "Pollution response", "A Sheen Is a Discharge", "Protect people, contain the spread and report with the facts available.", "Open the response plan"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Match the power path. Match the launch. Report the sheen.</h2></div><p>Three distinct decisions for marine device charging, a small-boat Adirondack day and immediate spill control.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="inflatable-life-jacket-rearming-kit-guide.html">inflatable PFD rearming</a>, <a href="whitney-point-reservoir-family-boating.html">Whitney Point Reservoir</a>, and <a href="boat-holding-tank-pumpout-no-discharge-guide.html">holding-tank pumpouts</a>. Earlier: <a href="boat-trailer-coupler-hitch-ball-fit-guide.html">trailer connection fit</a>, <a href="fourth-lake-family-boating.html">Fourth Lake</a>, and <a href="carbon-monoxide-alarm-boat-response.html">CO alarm response</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-09-30"')) return html;
  const latest = [
    ["boat-usb-charger-usb-c-pd-guide.html", "marine USB charging"], ["lake-eaton-family-boating.html", "Lake Eaton"], ["small-boat-fuel-oil-spill-response.html", "small-vessel spill response"],
    ["inflatable-life-jacket-rearming-kit-guide.html", "inflatable PFD rearming"], ["whitney-point-reservoir-family-boating.html", "Whitney Point Reservoir"], ["boat-holding-tank-pumpout-no-discharge-guide.html", "holding-tank pumpouts"]
  ];
  const existing = html.match(/<section class="section" data-recent-library="2026-09-28"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!existing) throw new Error("Previous recent library not found");
  const prefix = latest.map(([href, label]) => `<a href="${href}">${label}</a>`).join(", ");
  const old = existing[1].replace(/^.*?holding-tank pumpouts<\/a>,\s*/, "");
  const recent = `<section class="section" data-recent-library="2026-09-30"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${prefix}, ${old}</p></div></section>`;
  return html.replace(existing[0], recent);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Wed, 30 Sep 2026 15:20:00 GMT</lastBuildDate>");
  const items = publication20260930.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Wed, 30 Sep 2026 15:18:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20260930) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-09-30</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20260930) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["marine-electronics-installation.html", "usb-power-path-2026-09-30", `<p>For the charging branch behind the screen, use the <a href="boat-usb-charger-usb-c-pd-guide.html">boat USB fit card</a> to match input voltage, negotiated output, shared load and circuit protection.</p>`],
  ["marine-wiring-diy-basics.html", "usb-installation-boundary-2026-09-30", `<p>A USB-C opening is not proof of a suitable circuit. The <a href="boat-usb-charger-usb-c-pd-guide.html">marine USB charger guide</a> sets the input, fuse, location and technician stop conditions.</p>`],
  ["long-lake-family-boating.html", "lake-eaton-access-match-2026-09-30", `<p>Nearby <a href="lake-eaton-family-boating.html">Lake Eaton</a> is a separate small-boat plan: its unimproved trailer access does not offer the hard-surface capability listed here.</p>`],
  ["how-to-evaluate-boat-ramp.html", "lake-eaton-unimproved-example-2026-09-30", `<p>The <a href="lake-eaton-family-boating.html">Lake Eaton plan</a> applies this inspection to an official unimproved launch intended for small, light trailer boats.</p>`],
  ["safe-boat-fueling.html", "spill-reporting-sequence-2026-09-30", `<p>If fuel reaches the water despite prevention, use the <a href="small-boat-fuel-oil-spill-response.html">small-vessel spill response</a>: people first, stop the source when safe, contain, report and document.</p>`],
  ["choosing-home-marina.html", "spill-response-infrastructure-2026-09-30", `<p>Ask how the facility responds when oil or fuel reaches water; the <a href="small-boat-fuel-oil-spill-response.html">spill call card</a> shows the containment, reporting and waste-handling facts that matter.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-09-30 publication.");
