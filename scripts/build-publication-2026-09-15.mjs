import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260915 } from "../content/publication-2026-09-15.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260915.length !== 3) throw new Error(`The 2026-09-15 publication must contain exactly three pages; found ${publication20260915.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260915) {
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

updateFile("gear.html", (html) => insertCard(html, "boat-trailer-spare-tire-system-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-trailer-spare-system-photo-card.webp" alt="Unbranded spare tire mounted on a galvanized boat trailer with a chocked wheel and compatible roadside tools nearby" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Trailer reliability gear</small><h3>Boat-Trailer Spare-Tire System</h3><p>Match the tire, wheel, carrier, lift points and lug tools before the shoulder decides for you.</p><a class="button" href="boat-trailer-spare-tire-system-guide.html">Build the complete spare system</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "black-lake-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/black-lake-family-planning-photo-card.webp" alt="Life-jacketed family reviewing a lake chart beside a runabout at an illustrative northern New York launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>St. Lawrence County</small><h3>Black Lake</h3><p>Use the verified Morristown launch, prove the boat close and respect an eight-foot mean depth.</p><a class="button" href="black-lake-family-boating.html">Open the family plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "rope-in-boat-propeller-response.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/rope-propeller-response-photo-card.webp" alt="Life-jacketed family seated in a stopped runabout while the operator uses a VHF and a loose rope floats behind the stern" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Propulsion entanglement response</small><h3>A Rope Wraps the Propeller</h3><p>Shut down fully, control the crew and drift, and call before attempting any inspection.</p><a class="button" href="rope-in-boat-propeller-response.html">Open the response plan</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Build the spare. Keep Black Lake short. Stop the propeller.</h2></div><p>Three new photo-led guides for trailer roadside readiness, a shallow-water family route and a controlled line-entanglement response.</p></div><div class="gear-grid"><a class="gear-card" href="boat-trailer-spare-tire-system-guide.html"><div class="gear-photo"><img alt="Unbranded spare tire mounted on a galvanized boat trailer with a chocked wheel and compatible roadside tools nearby" src="assets/editorial/boat-trailer-spare-system-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Trailer reliability gear</small><h3>A Spare Is a System</h3><p>Match tire, wheel, mount and tools before the highway exposes the weak part.</p><span class="price">Build the complete system →</span></div></a><a class="gear-card" href="black-lake-family-boating.html"><div class="gear-photo"><img alt="Life-jacketed family reviewing a lake chart beside a runabout at an illustrative northern New York launch" src="assets/editorial/black-lake-family-planning-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>St. Lawrence County</small><h3>Black Lake, Short Return</h3><p>Use the Morristown launch, a close proof loop and a hard early turnaround.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="rope-in-boat-propeller-response.html"><div class="gear-photo"><img alt="Life-jacketed family seated in a stopped runabout while the operator uses a VHF and loose rope floats behind the stern" src="assets/editorial/rope-propeller-response-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Propulsion entanglement response</small><h3>Neutral Is Not Off</h3><p>Control people, propulsion and drift before diagnosing the rope.</p><span class="price">Open the response plan →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-battery-box-tray-hold-down-guide.html">battery securement</a>, <a href="cranberry-lake-family-boating.html">a short Cranberry Lake plan</a>, and <a href="gasoline-odor-boat-response.html">the gasoline-odor response</a>. Earlier: <a href="outboard-engine-flushing-methods-guide.html">manual-first outboard flushing</a>, <a href="tupper-lake-family-boating.html">a Tupper Lake family plan</a>, and <a href="towing-tube-with-kids-safety-plan.html">the family tubing brief</a>.</p></div></section>`;
updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Tue, 15 Sep 2026 16:00:00 GMT</lastBuildDate>");
  const missing = [];
  for (const page of publication20260915) {
    const description = page.description.replaceAll("&", "&amp;");
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) missing.push(`<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Tue, 15 Sep 2026 15:45:00 GMT</pubDate><description>${description}</description></item>`);
  }
  return missing.length ? next.replace("<item>", `${missing.join("")}<item>`) : next;
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260915) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260915) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return `${next.trimEnd()}\n`;
});

console.log("Built exactly three pages and their discovery surfaces for the 2026-09-15 publication.");
