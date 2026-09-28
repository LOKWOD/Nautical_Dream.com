import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260928 } from "../content/publication-2026-09-28.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260928.length !== 3) throw new Error("The 2026-09-28 publication must contain exactly three pages.");
for (const page of publication20260928) {
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

update("gear.html", (html) => card(html, "inflatable-life-jacket-rearming-kit-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/inflatable-pfd-rearm-kit-photo-card.webp" alt="Illustrative inflatable life jacket with separate cylinders and inflator components" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Inflatable PFD compatibility</small><h3>Match the Exact Rearming Kit</h3><p>Use the jacket model, inflator architecture, cylinder specification and component dates.</p><a class="button" href="inflatable-life-jacket-rearming-kit-guide.html">Build the fit card</a></div></article>`));
update("destinations.html", (html) => card(html, "whitney-point-reservoir-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/whitney-point-reservoir-family-photo-card.webp" alt="Illustrative life-jacketed family returning to a generic reservoir launch at idle" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Southern Tier family plan</small><h3>Whitney Point at 10 mph</h3><p>Use Dorchester Park, reconcile the official access record and keep the first loop close.</p><a class="button" href="whitney-point-reservoir-family-boating.html">Open the family plan</a></div></article>`));
update("journal.html", (html) => card(html, "boat-holding-tank-pumpout-no-discharge-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-holding-tank-pumpout-photo-card.webp" alt="Illustrative sanitary pumpout hose connected to a secured cabin boat" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Marine sanitation protocol</small><h3>Pump Out Without Guessing</h3><p>Identify the waste fitting, protect the vent and read no-discharge rules literally.</p><a class="button" href="boat-holding-tank-pumpout-no-discharge-guide.html">Use the decision card</a></div></article>`));

const cards = [
  ["inflatable-life-jacket-rearming-kit-guide.html", "assets/editorial/inflatable-pfd-rearm-kit-photo-card.webp", "Illustrative inflatable life jacket with separate cylinders and inflator components", "PFD compatibility", "Read the Jacket Before the Kit", "Match model, inflator, cylinder and date before returning an inflatable PFD to service.", "Open the buying guide"],
  ["whitney-point-reservoir-family-boating.html", "assets/editorial/whitney-point-reservoir-family-photo-card.webp", "Illustrative life-jacketed family returning to a generic reservoir launch at idle", "Southern Tier day plan", "Whitney Point at 10 mph", "Use Dorchester Park, prove the boat nearby and protect the slow return.", "Open the family plan"],
  ["boat-holding-tank-pumpout-no-discharge-guide.html", "assets/editorial/boat-holding-tank-pumpout-photo-card.webp", "Illustrative sanitary pumpout hose connected to a secured cabin boat", "Sanitation protocol", "Pump Out Without Guessing", "Identify the fitting, protect the vent and read no-discharge rules literally.", "Open the protocol"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Match the kit. Protect the slow return. Pump out without guessing.</h2></div><p>Three distinct decisions for serviceable safety gear, a speed-limited family reservoir day and compliant marine sanitation.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-coupler-hitch-ball-fit-guide.html">trailer connection fit</a>, <a href="fourth-lake-family-boating.html">Fourth Lake</a>, and <a href="carbon-monoxide-alarm-boat-response.html">CO alarm response</a>. Earlier: <a href="boat-trailer-lights-submersible-led-wiring-guide.html">trailer lighting</a>, <a href="hemlock-lake-family-boating.html">Hemlock Lake</a>, and <a href="two-boats-collide-response-reporting-guide.html">collision response</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-09-28"')) return html;
  const latest = [
    ["inflatable-life-jacket-rearming-kit-guide.html", "inflatable PFD rearming"], ["whitney-point-reservoir-family-boating.html", "Whitney Point Reservoir"], ["boat-holding-tank-pumpout-no-discharge-guide.html", "holding-tank pumpouts"],
    ["boat-trailer-coupler-hitch-ball-fit-guide.html", "trailer connection fit"], ["fourth-lake-family-boating.html", "Fourth Lake"], ["carbon-monoxide-alarm-boat-response.html", "CO alarm response"]
  ];
  const existing = html.match(/<section class="section" data-recent-library="2026-09-27"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!existing) throw new Error("Previous recent library not found");
  const prefix = latest.map(([href, label]) => `<a href="${href}">${label}</a>`).join(", ");
  const old = existing[1].replace(/^.*?CO alarm response<\/a>,\s*/, "");
  const recent = `<section class="section" data-recent-library="2026-09-28"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${prefix}, ${old}</p></div></section>`;
  return html.replace(existing[0], recent);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Mon, 28 Sep 2026 16:00:00 GMT</lastBuildDate>");
  const items = publication20260928.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Mon, 28 Sep 2026 15:58:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20260928) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-09-28</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20260928) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["best-life-jackets.html", "inflatable-rearm-fit-2026-09-28", `<p>For an inflatable model already aboard, use the <a href="inflatable-life-jacket-rearming-kit-guide.html">model–inflator–cylinder fit card</a> before buying or installing a rearming kit.</p>`],
  ["predeparture-safety-checklist.html", "inflatable-service-proof-2026-09-28", `<p>A green window is not the entire inspection. The <a href="inflatable-life-jacket-rearming-kit-guide.html">inflatable PFD rearming guide</a> records the exact kit, cylinder, activation parts and return-to-service proof.</p>`],
  ["canadarago-lake-family-boating.html", "whitney-point-slow-plan-2026-09-28", `<p>For another central–Southern Tier family day, <a href="whitney-point-reservoir-family-boating.html">Whitney Point Reservoir</a> adds a published 10-mph ceiling and a close Dorchester Park proof loop.</p>`],
  ["otisco-lake-family-boating.html", "whitney-point-return-margin-2026-09-28", `<p>The <a href="whitney-point-reservoir-family-boating.html">Whitney Point plan</a> uses the same conservative rule: verify the ramp, prove the boat close and preserve the slow return.</p>`],
  ["marine-head-holding-tank-troubleshooting.html", "pumpout-vent-rule-2026-09-28", `<p>Before applying suction, use the <a href="boat-holding-tank-pumpout-no-discharge-guide.html">holding-tank pumpout protocol</a> to identify the waste fitting, verify the vent path and set stop conditions.</p>`],
  ["choosing-home-marina.html", "pumpout-infrastructure-2026-09-28", `<p>Evaluate sanitation service with the <a href="boat-holding-tank-pumpout-no-discharge-guide.html">pumpout and no-discharge guide</a>: compatible adapters, operating instructions, rinse policy and qualified help all matter.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-09-28 publication.");
