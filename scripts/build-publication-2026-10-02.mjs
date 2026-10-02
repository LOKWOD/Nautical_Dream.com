import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261002 } from "../content/publication-2026-10-02.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20261002.length !== 3) throw new Error("The 2026-10-02 publication must contain exactly three pages.");
for (const page of publication20261002) {
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

update("gear.html", (html) => card(html, "boat-battery-switch-on-off-selector-dual-circuit-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/marine-battery-switch-types-photo-card.webp" alt="Three generic disconnected marine battery switch categories arranged for comparison" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Marine battery management</small><h3>Match the Switch to the Architecture</h3><p>Compare On/Off, selector and dual-circuit functions only after mapping banks, loads and charging paths.</p><a class="button" href="boat-battery-switch-on-off-selector-dual-circuit-guide.html">Build the fit card</a></div></article>`));
update("destinations.html", (html) => card(html, "cazenovia-lake-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/cazenovia-launch-choice-photo-card.webp" alt="Conceptual comparison of a trailer ramp, cartop carry and kayak carry launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Central New York launch plan</small><h3>Cazenovia Lake Has Three Different Starts</h3><p>Match the boat to the municipal ramp or one of two hand-launch approaches before leaving home.</p><a class="button" href="cazenovia-lake-family-boating.html">Compare the launches</a></div></article>`));
update("journal.html", (html) => card(html, "seasickness-on-small-boat-prevention-response-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/small-boat-seasickness-response-photo-card.webp" alt="Life-jacketed passenger seated securely and looking at the horizon on a generic small boat" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Family health and helm workload</small><h3>Respond Early—and Run the CO Gate</h3><p>Prevent predictable motion sickness, turn back early and treat overlapping symptoms as possible carbon monoxide exposure.</p><a class="button" href="seasickness-on-small-boat-prevention-response-guide.html">Use the response card</a></div></article>`));

const cards = [
  ["boat-battery-switch-on-off-selector-dual-circuit-guide.html", "assets/editorial/marine-battery-switch-types-photo-card.webp", "Three generic disconnected marine battery switch categories arranged for comparison", "Marine battery management", "Map the Banks Before Buying the Switch", "Separate On/Off, selector and dual-circuit functions with an eight-field fit card.", "Open the buying guide"],
  ["cazenovia-lake-family-boating.html", "assets/editorial/cazenovia-launch-choice-photo-card.webp", "Conceptual comparison of a trailer ramp, cartop carry and kayak carry launch", "Central New York launch plan", "Cazenovia Lake Starts Three Ways", "Choose the municipal ramp, short hand launch or 75-yard cartop carry by the official record.", "Open the family plan"],
  ["seasickness-on-small-boat-prevention-response-guide.html", "assets/editorial/small-boat-seasickness-response-photo-card.webp", "Life-jacketed passenger seated securely and looking at the horizon on a generic small boat", "Family health and helm workload", "Motion Sickness Needs a Return Plan", "Use early countermeasures, shorten the route and never skip the carbon-monoxide screen.", "Open the response guide"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Map the current. Choose the launch. Protect the passenger.</h2></div><p>Three distinct decisions: battery architecture, a Central New York family day, and a health event that can change the helm plan.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="portable-boat-fuel-tank-connector-vent-guide.html">portable fuel systems</a>, <a href="cross-lake-family-boating.html">Cross Lake</a>, and <a href="boat-passenger-seating-boarding-movement-guide.html">family passenger movement</a>. Earlier: <a href="boat-usb-charger-usb-c-pd-guide.html">marine USB charging</a>, <a href="lake-eaton-family-boating.html">Lake Eaton</a>, and <a href="small-boat-fuel-oil-spill-response.html">small-vessel spill response</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-02"')) return html;
  const latest = [
    ["boat-battery-switch-on-off-selector-dual-circuit-guide.html", "marine battery switches"], ["cazenovia-lake-family-boating.html", "Cazenovia Lake"], ["seasickness-on-small-boat-prevention-response-guide.html", "small-boat motion sickness"],
    ["portable-boat-fuel-tank-connector-vent-guide.html", "portable fuel systems"], ["cross-lake-family-boating.html", "Cross Lake"], ["boat-passenger-seating-boarding-movement-guide.html", "family passenger movement"]
  ];
  const existing = html.match(/<section class="section" data-recent-library="2026-10-01"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!existing) throw new Error("Previous recent library not found");
  const prefix = latest.map(([href, label]) => `<a href="${href}">${label}</a>`).join(", ");
  const old = existing[1].replace(/^.*?family passenger protocol<\/a>,\s*/, "");
  const recent = `<section class="section" data-recent-library="2026-10-02"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${prefix}, ${old}</p></div></section>`;
  return html.replace(existing[0], recent);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Fri, 02 Oct 2026 15:05:00 GMT</lastBuildDate>");
  const items = publication20261002.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Fri, 02 Oct 2026 15:05:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20261002) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-10-02</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20261002) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["boat-battery-bank-sizing.html", "battery-switch-architecture-2026-10-02", `<p>After sizing the banks, use the <a href="boat-battery-switch-on-off-selector-dual-circuit-guide.html">battery-switch architecture card</a> to choose among On/Off, selector and dual-circuit functions without inventing a charging path.</p>`],
  ["boat-battery-charging.html", "battery-switch-charging-path-2026-10-02", `<p>The switch must preserve the documented alternator and charger behavior; compare those paths with the <a href="boat-battery-switch-on-off-selector-dual-circuit-guide.html">marine battery-switch guide</a>.</p>`],
  ["how-to-evaluate-boat-ramp.html", "cazenovia-three-launches-2026-10-02", `<p>The <a href="cazenovia-lake-family-boating.html">Cazenovia Lake launch matrix</a> shows why a hard-surface ramp, a boulder carry and a 75-yard cartop carry are three different access decisions.</p>`],
  ["otisco-lake-family-boating.html", "cazenovia-lake-access-alternative-2026-10-02", `<p>For another Central New York option, compare Otisco's access constraints with the <a href="cazenovia-lake-family-boating.html">three official Cazenovia Lake launch records</a>.</p>`],
  ["marine-first-aid-planning.html", "motion-sickness-co-gate-2026-10-02", `<p>Add the <a href="seasickness-on-small-boat-prevention-response-guide.html">small-boat motion-sickness and carbon-monoxide gate</a> to the passenger health section of the first-aid plan.</p>`],
  ["carbon-monoxide-alarm-boat-response.html", "co-versus-seasickness-2026-10-02", `<p>Because nausea, headache, weakness and dizziness can overlap, the <a href="seasickness-on-small-boat-prevention-response-guide.html">motion-sickness response</a> treats carbon monoxide as a required safety check.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-10-02 publication.");
