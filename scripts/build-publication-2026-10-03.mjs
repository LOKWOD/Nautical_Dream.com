import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261003 } from "../content/publication-2026-10-03.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20261003.length !== 3) throw new Error("The 2026-10-03 publication must contain exactly three pages.");
for (const page of publication20261003) {
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

update("gear.html", (html) => card(html, "boat-first-aid-kit-buying-packing-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-first-aid-kit-photo-card.webp" alt="Open unbranded waterproof first-aid case with organized baseline supplies" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Safety gear decision</small><h3>Buy the Base. Build the Boat Layer.</h3><p>Compare contents, waterproofing, crew needs and access with a five-layer fit card.</p><a class="button" href="boat-first-aid-kit-buying-packing-guide.html">Build the kit</a></div></article>`));
update("destinations.html", (html) => card(html, "conesus-lake-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/conesus-lake-concept-family-photo-card.webp" alt="Conceptual life-jacketed family moving slowly on a narrow Western New York lake" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Western Finger Lakes plan</small><h3>Conesus Starts With the State Launch</h3><p>Use the current dock notice, winch-only retrieval rule and an easy-return first hour.</p><a class="button" href="conesus-lake-family-boating.html">Open the launch plan</a></div></article>`));
update("journal.html", (html) => card(html, "boat-cooler-food-safety-packing-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-food-safety-cooler-photo-card.webp" alt="Separate drink and food coolers with frozen packs and a thermometer reading 34 degrees Fahrenheit" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Family food system</small><h3>Measure the Cooler. Write the Discard Time.</h3><p>Use USDA and FDA gates for temperature, time, separation and hand cleaning aboard.</p><a class="button" href="boat-cooler-food-safety-packing-guide.html">Use the control card</a></div></article>`));

const cards = [
  ["boat-first-aid-kit-buying-packing-guide.html", "assets/editorial/boat-first-aid-kit-photo-card.webp", "Open unbranded waterproof first-aid case with organized baseline supplies", "High-intent safety gear", "Build a First-Aid Kit That Still Works Afloat", "Start with published contents, then add crew, trip, waterproofing and access layers.", "Open the buying guide"],
  ["conesus-lake-family-boating.html", "assets/editorial/conesus-lake-concept-family-photo-card.webp", "Conceptual life-jacketed family moving slowly on a narrow Western New York lake", "Western Finger Lakes plan", "Protect the First Hour on Conesus", "Check the 2026 dock notice, use the state launch and winch onto the trailer.", "Open the family plan"],
  ["boat-cooler-food-safety-packing-guide.html", "assets/editorial/boat-food-safety-cooler-photo-card.webp", "Separate drink and food coolers with frozen packs and a thermometer reading 34 degrees Fahrenheit", "Family food system", "Keep the Food Cooler at 40°F or Below", "Separate drinks, measure temperature and decide leftovers with evidence.", "Open the food-safety guide"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Pack the kit. Protect the first hour. Measure the cooler.</h2></div><p>Three different family decisions: reachable medical supplies, a Western Finger Lakes launch day, and food that stays safe afloat.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-battery-switch-on-off-selector-dual-circuit-guide.html">battery-switch architecture</a>, <a href="cazenovia-lake-family-boating.html">Cazenovia Lake</a>, and <a href="seasickness-on-small-boat-prevention-response-guide.html">motion-sickness response</a>. Earlier: <a href="portable-boat-fuel-tank-connector-vent-guide.html">portable fuel systems</a>, <a href="cross-lake-family-boating.html">Cross Lake</a>, and <a href="boat-passenger-seating-boarding-movement-guide.html">passenger movement</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-03"')) return html;
  const latest = [
    ["boat-first-aid-kit-buying-packing-guide.html", "boat first-aid kits"], ["conesus-lake-family-boating.html", "Conesus Lake"], ["boat-cooler-food-safety-packing-guide.html", "boat food safety"],
    ["boat-battery-switch-on-off-selector-dual-circuit-guide.html", "battery-switch architecture"], ["cazenovia-lake-family-boating.html", "Cazenovia Lake"], ["seasickness-on-small-boat-prevention-response-guide.html", "motion-sickness response"]
  ];
  const existing = html.match(/<section class="section" data-recent-library="2026-10-02"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!existing) throw new Error("Previous recent library not found");
  const prefix = latest.map(([href, label]) => `<a href="${href}">${label}</a>`).join(", ");
  const old = existing[1].replace(/^.*?small-boat motion sickness<\/a>,\s*/, "");
  const recent = `<section class="section" data-recent-library="2026-10-03"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${prefix}, ${old}</p></div></section>`;
  return html.replace(existing[0], recent);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sat, 03 Oct 2026 15:48:00 GMT</lastBuildDate>");
  const items = publication20261003.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Sat, 03 Oct 2026 15:48:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20261003) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-10-03</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20261003) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["marine-first-aid-planning.html", "first-aid-kit-fit-card-2026-10-03", `<p>Turn the emergency plan into reachable supplies with the <a href="boat-first-aid-kit-buying-packing-guide.html">five-layer boat first-aid-kit fit card</a>.</p>`],
  ["boat-dry-bag-waterproof-case-guide.html", "first-aid-kit-waterproofing-2026-10-03", `<p>Apply the bag-versus-case decision to a critical use with the <a href="boat-first-aid-kit-buying-packing-guide.html">boat first-aid-kit guide</a>.</p>`],
  ["honeoye-lake-family-boating.html", "conesus-lake-western-finger-lakes-2026-10-03", `<p>For a larger Western Finger Lakes option, compare this plan with the <a href="conesus-lake-family-boating.html">current Conesus state-launch matrix</a>.</p>`],
  ["canandaigua-lake-family-boating.html", "conesus-lake-state-launch-2026-10-03", `<p>The <a href="conesus-lake-family-boating.html">Conesus family plan</a> offers a distinct state-launch day built around a close proof loop and winch-only retrieval.</p>`],
  ["best-boat-coolers.html", "boat-food-safety-control-card-2026-10-03", `<p>Insulation is only one variable; use the <a href="boat-cooler-food-safety-packing-guide.html">USDA/FDA boat-food control card</a> for temperature, time, separation and discard decisions.</p>`],
  ["family-boat-packing-list.html", "boat-food-safety-two-cooler-2026-10-03", `<p>Add the <a href="boat-cooler-food-safety-packing-guide.html">two-cooler food-safety protocol</a> when the family brings perishables aboard.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-10-03 publication.");
