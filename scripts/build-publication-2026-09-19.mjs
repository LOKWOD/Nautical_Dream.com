import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260919 } from "../content/publication-2026-09-19.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260919.length !== 3) throw new Error(`The 2026-09-19 publication must contain exactly three pages; found ${publication20260919.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260919) {
  if (slugs.has(page.slug)) throw new Error(`Duplicate publication slug: ${page.slug}`);
  if (titles.has(page.title)) throw new Error(`Duplicate publication title: ${page.title}`);
  slugs.add(page.slug); titles.add(page.title);
  writeFileSync(join(root, page.slug), renderPage(page));
  console.log(`built ${page.slug}`);
}

function updateFile(name, transform) {
  const path = join(root, name);
  const before = readFileSync(path, "utf8");
  const after = transform(before);
  if (after === before) return;
  writeFileSync(path, after);
  console.log(`updated ${name}`);
}

function insertCard(html, slug, marker, card) {
  if (html.includes(slug)) return html;
  if (!html.includes(marker)) throw new Error(`Discovery marker not found for ${slug}`);
  return html.replace(marker, `${marker}\n${card}`);
}

function addClusterNote(html, marker, body) {
  if (html.includes(marker)) return html;
  const note = `<aside class="editor-note" data-cluster-note="${marker}"><strong>Related decision</strong>${body}</aside>`;
  if (html.includes('<aside class="related-content"')) return html.replace('<aside class="related-content"', `${note}<aside class="related-content"`);
  if (html.includes('</article>')) return html.replace('</article>', `${note}</article>`);
  throw new Error(`Reciprocal-link insertion point not found for ${marker}`);
}

updateFile("gear.html", (html) => insertCard(html, "boat-spare-propeller-kit-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-spare-prop-kit-photo-card.webp" alt="Illustrative unbranded boat propeller, hub parts, retaining hardware and hand tools on a workshop bench" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Propulsion spares</small><h3>Build the Whole Spare-Prop System</h3><p>Match the propeller, hub, rotation, hardware, tools and manual procedure.</p><a class="button" href="boat-spare-propeller-kit-guide.html">Build the compatibility card</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "oswego-harbor-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/oswego-harbor-family-photo-card.webp" alt="Illustrative life-jacketed family aboard a generic runabout inside a protected freshwater harbor" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Lake Ontario</small><h3>Oswego Harbor by Boat</h3><p>Prove the boat inside the harbor and make Lake Ontario earn a separate yes.</p><a class="button" href="oswego-harbor-family-boating.html">Open the family plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "swimming-from-boat-with-kids-safety-plan.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/family-swim-from-boat-photo-card.webp" alt="Illustrative supervised family swim beside a stopped boat with life jackets, ladder deployed and one adult aboard" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Family water safety</small><h3>The Six-Gate Swim Plan</h3><p>Place, water, propulsion, reboarding, supervision and count all must pass.</p><a class="button" href="swimming-from-boat-with-kids-safety-plan.html">Open the swim protocol</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Match the spare. Protect the harbor. Count every swimmer.</h2></div><p>Three distinct systems for propulsion readiness, a conservative Lake Ontario family day and deliberate in-water safety.</p></div><div class="gear-grid"><a class="gear-card" href="boat-spare-propeller-kit-guide.html"><div class="gear-photo"><img alt="Illustrative unbranded boat propeller, hub parts and retaining hardware on a workshop bench" src="assets/editorial/boat-spare-prop-kit-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Propulsion spares</small><h3>A Prop Alone Is Not a Kit</h3><p>Match the hub, rotation, hardware, tools and exact manual procedure.</p><span class="price">Open the buying guide →</span></div></a><a class="gear-card" href="oswego-harbor-family-boating.html"><div class="gear-photo"><img alt="Illustrative life-jacketed family aboard a generic runabout inside a protected freshwater harbor" src="assets/editorial/oswego-harbor-family-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Lake Ontario</small><h3>Oswego Works Inside</h3><p>Use Wright’s Landing and make the open lake strictly optional.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="swimming-from-boat-with-kids-safety-plan.html"><div class="gear-photo"><img alt="Illustrative supervised family swim beside a stopped boat with life jackets and a deployed ladder" src="assets/editorial/family-swim-from-boat-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Family water safety</small><h3>Six Gates Before the Splash</h3><p>Engine off is one gate; place, recovery, supervision and count matter too.</p><span class="price">Open the swim protocol →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html">battery monitors</a>, <a href="little-falls-erie-canal-family-boating.html">Little Falls</a>, and <a href="boat-tow-vs-salvage-assistance-guide.html">tow versus salvage</a>. Earlier: <a href="boat-engine-cutoff-switch-lanyard-wireless-guide.html">engine-cutoff links</a>, <a href="schroon-lake-family-boating.html">Schroon Lake</a>, <a href="boat-runs-aground-response.html">the grounding response</a>, <a href="boat-trailer-security-coupler-wheel-lock-guide.html">trailer security layers</a>, <a href="saratoga-lake-family-boating.html">Saratoga Lake</a>, and <a href="used-boat-title-hin-paperwork-guide.html">the used-boat paperwork gate</a>.</p></div></section>`;

updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("index.html", (html) => {
  if (html.includes('data-recent-library="2026-09-19"')) return html;
  const recent = `<section class="section" data-recent-library="2026-09-19"><div class="shell"><p class="lede"><strong>More recent field guides:</strong> <a href="boat-trailer-spare-tire-system-guide.html">trailer spare systems</a>, <a href="black-lake-family-boating.html">Black Lake</a>, <a href="rope-in-boat-propeller-response.html">rope on the propeller</a>, <a href="boat-battery-box-tray-hold-down-guide.html">battery securement</a>, <a href="cranberry-lake-family-boating.html">Cranberry Lake</a>, <a href="gasoline-odor-boat-response.html">gasoline-odor response</a>, <a href="outboard-engine-flushing-methods-guide.html">outboard flushing</a>, <a href="tupper-lake-family-boating.html">Tupper Lake</a>, and <a href="towing-tube-with-kids-safety-plan.html">family tubing safety</a>.</p></div></section>`;
  return html.replace("</main>", `${recent}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sat, 19 Sep 2026 15:50:00 GMT</lastBuildDate>");
  const missing = [];
  for (const page of publication20260919) {
    const description = page.description.replaceAll("&", "&amp;");
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) missing.push(`<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Sat, 19 Sep 2026 15:45:00 GMT</pubDate><description>${description}</description></item>`);
  }
  return missing.length ? next.replace("<item>", `${missing.join("")}<item>`) : next;
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260919) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-19</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260919) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return `${next.trimEnd()}\n`;
});

updateFile("propeller-damage-vibration-guide.html", (html) => addClusterNote(html, "spare-prop-system-2026-09-19", `<p>Replacement starts with compatibility, not the nearest propeller-shaped object. Use the <a href="boat-spare-propeller-kit-guide.html">spare-prop system matrix</a> to match the engine, prop, hub, retaining hardware, tools and manual procedure before an emergency.</p>`));
updateFile("boat-tool-kit-guide.html", (html) => addClusterNote(html, "spare-prop-tools-2026-09-19", `<p>For remote propulsion readiness, the <a href="boat-spare-propeller-kit-guide.html">spare-prop guide</a> turns tool size, hardware stack and model-specific procedure into one compatibility card.</p>`));
updateFile("fair-haven-little-sodus-bay-family-boating.html", (html) => addClusterNote(html, "oswego-harbor-2026-09-19", `<p>The <a href="oswego-harbor-family-boating.html">Oswego Harbor family plan</a> adds a separate Lake Ontario base at Wright’s Landing and keeps open water optional until both observed conditions and crew pass.</p>`));
updateFile("boating-with-children-safely.html", (html) => addClusterNote(html, "family-swim-six-gates-2026-09-19", `<p>Before anyone enters the water, use the <a href="swimming-from-boat-with-kids-safety-plan.html">six-gate family swim card</a> for place, conditions, propulsion, reboarding, supervision and count.</p>`));
updateFile("boat-boarding-ladder-buying-guide.html", (html) => addClusterNote(html, "ladder-to-family-swim-2026-09-19", `<p>A ladder is one part of the larger <a href="swimming-from-boat-with-kids-safety-plan.html">family swim-off-boat protocol</a>, which also controls location, exhaust, keys, adult supervision and restart.</p>`));

console.log("Built exactly three pages, reciprocal cluster links and discovery surfaces for the 2026-09-19 publication.");
