import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260912 } from "../content/publication-2026-09-12.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260912.length !== 3) throw new Error(`The 2026-09-12 publication must contain exactly three pages; found ${publication20260912.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260912) {
  if (slugs.has(page.slug)) throw new Error(`Duplicate publication slug: ${page.slug}`);
  if (titles.has(page.title)) throw new Error(`Duplicate publication title: ${page.title}`);
  slugs.add(page.slug);
  titles.add(page.title);
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

updateFile("gear.html", (html) => insertCard(html, "outboard-engine-flushing-methods-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/outboard-flushing-methods-photo-card.webp" alt="Boat owner reading an engine manual beside an off outboard with three unbranded flushing-tool categories staged separately" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Outboard maintenance gear</small><h3>Outboard Flushing Methods</h3><p>Choose a flush port, motor muffs or tank by the exact manual, inlet layout and engine-state rule.</p><a class="button" href="outboard-engine-flushing-methods-guide.html">Compare flushing methods</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "tupper-lake-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/tupper-lake-family-planning-photo-card.webp" alt="Family in fitted life jackets reviewing a chart beside a runabout at a generic wooded Adirondack lake dock" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Adirondacks</small><h3>Tupper Lake</h3><p>Use the verified Moody launch, run a close proof loop and protect the long tow home.</p><a class="button" href="tupper-lake-family-boating.html">Open the family plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "towing-tube-with-kids-safety-plan.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/family-tubing-spotter-photo-card.webp" alt="Powerboat operator and dedicated observer towing one life-jacketed child on a tube across open water" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Family tow-sports seamanship</small><h3>Towing a Tube With Kids</h3><p>Assign the observer, fit the PFD, agree on signals and protect every pickup.</p><a class="button" href="towing-tube-with-kids-safety-plan.html">Open the tubing plan</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Flush by the manual. Keep Tupper short. Tow with a spotter.</h2></div><p>Three new photo-led guides for outboard cooling-system care, a conservative Adirondack launch day and family tubing with clear crew roles.</p></div><div class="gear-grid"><a class="gear-card" href="outboard-engine-flushing-methods-guide.html"><div class="gear-photo"><img alt="Boat owner reading an engine manual beside an off outboard with three unbranded flushing-tool categories staged separately" src="assets/editorial/outboard-flushing-methods-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Outboard maintenance gear</small><h3>Port, Muffs or Tank?</h3><p>Match the method to the exact manual and inlet layout before the hose comes out.</p><span class="price">Compare flushing methods →</span></div></a><a class="gear-card" href="tupper-lake-family-boating.html"><div class="gear-photo"><img alt="Family in fitted life jackets reviewing a chart beside a runabout at a generic wooded Adirondack lake dock" src="assets/editorial/tupper-lake-family-planning-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Adirondacks</small><h3>Tupper, Short Return</h3><p>Launch at Moody, prove the boat nearby and turn before distance owns the day.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="towing-tube-with-kids-safety-plan.html"><div class="gear-photo"><img alt="Powerboat operator and dedicated observer towing one life-jacketed child on a tube across open water" src="assets/editorial/family-tubing-spotter-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Family tow-sports seamanship</small><h3>Driver. Observer. Rider.</h3><p>Brief the signals, inspect the system and secure propulsion for every pickup.</p><span class="price">Open the tubing plan →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-transom-straps-guide.html">transom-strap strap fit</a>, <a href="otsego-lake-family-boating.html">a short-return Otsego plan</a>, and <a href="boat-engine-overheat-warning-response.html">the overheat-warning response</a>. Earlier: <a href="boat-trailer-tongue-jack-guide.html">trailer tongue-jack fit</a>, <a href="great-sacandaga-lake-family-boating.html">a Great Sacandaga family plan</a>, and <a href="boat-engine-stall-response.html">the engine-stall response</a>.</p></div></section>`;
updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sat, 12 Sep 2026 16:00:00 GMT</lastBuildDate>");
  const missing = [];
  for (const page of publication20260912) {
    const description = page.description.replaceAll("&", "&amp;");
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) {
      missing.push(`<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Sat, 12 Sep 2026 15:30:00 GMT</pubDate><description>${description}</description></item>`);
    }
  }
  return missing.length ? next.replace("<item>", `${missing.join("")}<item>`) : next;
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260912) {
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-12</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  }
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260912) {
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  }
  return `${next.trimEnd()}\n`;
});

console.log("Built exactly three pages and their discovery surfaces for the 2026-09-12 publication.");
