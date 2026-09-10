import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260910 } from "../content/publication-2026-09-10.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260910.length !== 3) throw new Error(`The 2026-09-10 publication must contain exactly three pages; found ${publication20260910.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260910) {
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

updateFile("gear.html", (html) => insertCard(html, "boat-trailer-transom-straps-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-transom-straps-photo-card.webp" alt="Adult attaching an unbranded black transom tie-down strap between a runabout stern eye and its trailer" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Trailer securement gear</small><h3>Boat Trailer Transom Straps</h3><p>Compare fixed ratchet, retractable ratchet and cam-buckle straps by fit, geometry and working-load limit.</p><a class="button" href="boat-trailer-transom-straps-guide.html">Compare strap types</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "otsego-lake-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/otsego-lake-family-planning-photo-card.webp" alt="Family in fitted life jackets reviewing a map beside a trailer boat at an illustrative inland lake launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Central New York</small><h3>Otsego Lake</h3><p>Use the correct Cooperstown trailer launch, prove the boat nearby and protect an early south-end return.</p><a class="button" href="otsego-lake-family-boating.html">Open the family plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "boat-engine-overheat-warning-response.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-engine-overheat-response-photo-card.webp" alt="Family seated in fitted life jackets aboard a stopped runabout while the operator checks a generic warning display" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Engine-temperature response</small><h3>When the Overheat Warning Sounds</h3><p>Reduce load, protect the crew, control drift and keep diagnosis inside the exact engine manual.</p><a class="button" href="boat-engine-overheat-warning-response.html">Open the response plan</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Secure the stern. Keep Otsego short. Respect the alarm.</h2></div><p>Three new photo-led guides for trailer securement, a conservative Cooperstown launch day and a safe engine-temperature response.</p></div><div class="gear-grid"><a class="gear-card" href="boat-trailer-transom-straps-guide.html"><div class="gear-photo"><img alt="Adult attaching an unbranded black transom tie-down strap between a runabout stern eye and its trailer" src="assets/editorial/boat-transom-straps-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Trailer securement gear</small><h3>Ratchet or Cam Buckle?</h3><p>Match working-load limit, length, hook fit and load path instead of shopping by break strength.</p><span class="price">Compare transom straps →</span></div></a><a class="gear-card" href="otsego-lake-family-boating.html"><div class="gear-photo"><img alt="Family in fitted life jackets reviewing a map beside a trailer boat at an illustrative inland lake launch" src="assets/editorial/otsego-lake-family-planning-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Central New York</small><h3>Otsego, Short Return</h3><p>Launch a trailer boat at Cooperstown—not the Glimmerglass hand launch—and keep the first route south.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="boat-engine-overheat-warning-response.html"><div class="gear-photo"><img alt="Family seated in fitted life jackets aboard a stopped runabout while the operator checks a generic warning display" src="assets/editorial/boat-engine-overheat-response-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Engine-temperature response</small><h3>Reduce Load. Read the Manual.</h3><p>Control the boat and protect people before any model-specific inspection or restart.</p><span class="price">Open the response plan →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-tongue-jack-guide.html">trailer tongue-jack fit</a>, <a href="great-sacandaga-lake-family-boating.html">a short-return Great Sacandaga plan</a>, and <a href="boat-engine-stall-response.html">the engine-stall response</a>. Earlier: <a href="boat-trailer-winch-strap-guide.html">winch and strap fit</a>, <a href="sodus-bay-family-boating.html">a sheltered Sodus Bay plan</a>, and <a href="crossing-boat-wakes-family.html">wake-crossing with family aboard</a>.</p></div></section>`;
updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Thu, 10 Sep 2026 15:30:00 GMT</lastBuildDate>");
  const missing = [];
  for (const page of publication20260910) {
    const description = page.description.replaceAll("&", "&amp;");
    const escapedSlug = page.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (next.includes(`https://nauticaldream.com/${page.slug}`)) {
      const item = new RegExp(`(<item>(?:(?!<\\/item>)[\\s\\S])*?<link>https:\\/\\/nauticaldream\\.com\\/${escapedSlug}<\\/link>(?:(?!<\\/item>)[\\s\\S])*?<description>)[\\s\\S]*?(<\\/description><\\/item>)`);
      next = next.replace(item, `$1${description}$2`);
    } else {
      missing.push(`<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Thu, 10 Sep 2026 12:00:00 GMT</pubDate><description>${description}</description></item>`);
    }
  }
  return missing.length ? next.replace("<item>", `${missing.join("")}<item>`) : next;
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260910) {
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  }
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260910) {
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  }
  return `${next.trimEnd()}\n`;
});

console.log("Built exactly three pages and their discovery surfaces for the 2026-09-10 publication.");
