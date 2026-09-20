import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260920 } from "../content/publication-2026-09-20.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260920.length !== 3) throw new Error(`The 2026-09-20 publication must contain exactly three pages; found ${publication20260920.length}.`);
const slugs = new Set();
const titles = new Set();
for (const page of publication20260920) {
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
  if (html.includes("</article>")) return html.replace("</article>", `${note}</article>`);
  throw new Error(`Reciprocal-link insertion point not found for ${marker}`);
}

updateFile("gear.html", (html) => insertCard(html, "boat-drain-plug-transom-garboard-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/boat-drain-plug-system-photo-card.webp" alt="Illustrative unbranded T-handle, lever-lock and threaded boat drain plugs on a marine workbench" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Hull opening compatibility</small><h3>Match the Whole Drain-Plug System</h3><p>Identify the opening, size, thread, material and proof method before buying the spare.</p><a class="button" href="boat-drain-plug-transom-garboard-guide.html">Build the fit card</a></div></article>`));

updateFile("destinations.html", (html) => insertCard(html, "butterfield-lake-family-boating.html", '<div class="all-grid ny-grid">', `
<article class="card"><img src="assets/editorial/butterfield-lake-family-photo-card.webp" alt="Illustrative life-jacketed family seated in a runabout near a forested inland-lake launch" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Jefferson County</small><h3>Butterfield Lake by Boat</h3><p>Use the state launch, keep the proof loop close and recover with margin.</p><a class="button" href="butterfield-lake-family-boating.html">Open the family plan</a></div></article>`));

updateFile("journal.html", (html) => insertCard(html, "new-york-boat-registration-documents-guide.html", '<div class="grid">', `
<article class="card"><img src="assets/editorial/new-york-boat-documents-photo-card.webp" alt="Illustrative boater reviewing generic documents beside a trailer boat with unreadable bow numbers" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>New York ownership system</small><h3>The Launch Document Card</h3><p>Separate hull identity, registration, stickers, ownership and operator proof.</p><a class="button" href="new-york-boat-registration-documents-guide.html">Open the document guide</a></div></article>`));

const homeSection = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Fit the plug. Keep the lake day short. Carry the right proof.</h2></div><p>Three distinct systems for hull-opening compatibility, a conservative Jefferson County family day and New York boat documents.</p></div><div class="gear-grid"><a class="gear-card" href="boat-drain-plug-transom-garboard-guide.html"><div class="gear-photo"><img alt="Illustrative unbranded T-handle, lever-lock and threaded boat drain plugs on a marine workbench" src="assets/editorial/boat-drain-plug-system-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Hull opening compatibility</small><h3>A Plug Is Not a Universal Part</h3><p>Match the opening, style, size, thread, material and proof method.</p><span class="price">Open the buying guide →</span></div></a><a class="gear-card" href="butterfield-lake-family-boating.html"><div class="gear-photo"><img alt="Illustrative life-jacketed family seated in a runabout near a forested inland-lake launch" src="assets/editorial/butterfield-lake-family-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>Jefferson County</small><h3>Butterfield Stays Short</h3><p>Launch, prove the boat nearby and recover before margin disappears.</p><span class="price">Open the family plan →</span></div></a><a class="gear-card" href="new-york-boat-registration-documents-guide.html"><div class="gear-photo"><img alt="Illustrative boater reviewing generic documents beside a trailer boat with unreadable bow numbers" src="assets/editorial/new-york-boat-documents-photo-card.webp" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>New York ownership system</small><h3>Five Records, Five Jobs</h3><p>Separate the HIN, registration number, stickers, ownership and operator card.</p><span class="price">Open the document guide →</span></div></a></div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-spare-propeller-kit-guide.html">the spare-prop system</a>, <a href="oswego-harbor-family-boating.html">Oswego Harbor</a>, and <a href="swimming-from-boat-with-kids-safety-plan.html">the family swim protocol</a>. Earlier: <a href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html">battery monitors</a>, <a href="little-falls-erie-canal-family-boating.html">Little Falls</a>, <a href="boat-tow-vs-salvage-assistance-guide.html">tow versus salvage</a>, <a href="boat-trailer-security-coupler-wheel-lock-guide.html">trailer security</a>, <a href="saratoga-lake-family-boating.html">Saratoga Lake</a>, and <a href="used-boat-title-hin-paperwork-guide.html">the used-boat paperwork gate</a>.</p></div></section>`;

updateFile("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${homeSection}\n</main>`);
});

updateFile("index.html", (html) => {
  const recent = `<section class="section" data-recent-library="2026-09-20"><div class="shell"><h2>Recent practical guides</h2><p class="lede"><a href="outboard-engine-flushing-methods-guide.html">outboard flushing</a>, <a href="tupper-lake-family-boating.html">Tupper Lake</a>, <a href="towing-tube-with-kids-safety-plan.html">family tubing</a>, <a href="boat-battery-box-tray-hold-down-guide.html">battery securement</a>, <a href="cranberry-lake-family-boating.html">Cranberry Lake</a>, <a href="gasoline-odor-boat-response.html">gasoline-odor response</a>, <a href="boat-trailer-spare-tire-system-guide.html">trailer spare tires</a>, <a href="black-lake-family-boating.html">Black Lake</a>, <a href="rope-in-boat-propeller-response.html">propeller-line response</a>, <a href="boat-trailer-security-coupler-wheel-lock-guide.html">trailer security</a>, <a href="saratoga-lake-family-boating.html">Saratoga Lake</a>, <a href="used-boat-title-hin-paperwork-guide.html">used-boat paperwork</a>, <a href="boat-engine-cutoff-switch-lanyard-wireless-guide.html">engine-cutoff links</a>, <a href="schroon-lake-family-boating.html">Schroon Lake</a>, <a href="boat-runs-aground-response.html">grounding response</a>, <a href="boat-battery-monitor-shunt-voltage-bluetooth-guide.html">battery monitors</a>, <a href="little-falls-erie-canal-family-boating.html">Little Falls</a>, <a href="boat-tow-vs-salvage-assistance-guide.html">tow versus salvage</a>, <a href="boat-spare-propeller-kit-guide.html">spare propellers</a>, <a href="oswego-harbor-family-boating.html">Oswego Harbor</a>, and <a href="swimming-from-boat-with-kids-safety-plan.html">swimming from the boat</a>.</p></div></section>`;
  const pattern = /<section class="section" data-recent-library="[^"]+">[\s\S]*?<\/section>/;
  if (pattern.test(html)) return html.replace(pattern, recent);
  return html.replace("</main>", `${recent}\n</main>`);
});

updateFile("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sun, 20 Sep 2026 16:20:00 GMT</lastBuildDate>");
  const missing = [];
  for (const page of publication20260920) {
    const description = page.description.replaceAll("&", "&amp;");
    if (!next.includes(`https://nauticaldream.com/${page.slug}`)) missing.push(`<item><title>${page.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${page.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${page.slug}</guid><pubDate>Sun, 20 Sep 2026 16:15:00 GMT</pubDate><description>${description}</description></item>`);
  }
  return missing.length ? next.replace("<item>", `${missing.join("")}<item>`) : next;
});

updateFile("sitemap.xml", (xml) => {
  let next = xml;
  for (const page of publication20260920) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${page.slug}</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});

updateFile("llms.txt", (txt) => {
  let next = txt;
  for (const page of publication20260920) if (!next.includes(`https://nauticaldream.com/${page.slug}`)) next += `\n- [${page.title}](https://nauticaldream.com/${page.slug}): ${page.description}`;
  return `${next.trimEnd()}\n`;
});

updateFile("boat-ramp-launch-checklist.html", (html) => addClusterNote(html, "drain-plug-fit-card-2026-09-20", `<p>The plug check only works when the part is known. Use the <a href="boat-drain-plug-transom-garboard-guide.html">drain-plug fit card</a> to identify the opening, style, size, thread, material and approved proof method before arriving at the ramp.</p>`));
updateFile("boat-tool-kit-guide.html", (html) => addClusterNote(html, "drain-plug-spare-2026-09-20", `<p>A spare drain plug belongs in the tool system only after it is matched. The <a href="boat-drain-plug-transom-garboard-guide.html">drain-plug guide</a> separates expanding and threaded systems and records the exact opening.</p>`));
updateFile("black-lake-family-boating.html", (html) => addClusterNote(html, "butterfield-nearby-plan-2026-09-20", `<p>For a distinct Jefferson County small-water alternative, the <a href="butterfield-lake-family-boating.html">Butterfield Lake plan</a> uses the DEC hard-surface launch, a close proof loop and an early return.</p>`));
updateFile("thousand-islands-guide.html", (html) => addClusterNote(html, "butterfield-inland-option-2026-09-20", `<p>When exposed river conditions are not the right family fit, compare the <a href="butterfield-lake-family-boating.html">Butterfield Lake short-day plan</a>; it is a separate inland outing, not a river fallback without new checks.</p>`));
updateFile("used-boat-title-hin-paperwork-guide.html", (html) => addClusterNote(html, "ny-launch-documents-2026-09-20", `<p>After purchase, the <a href="new-york-boat-registration-documents-guide.html">New York launch document card</a> separates HIN, state number, stickers, registration certificate, ownership evidence and operator proof.</p>`));
updateFile("boat-records-and-logbook.html", (html) => addClusterNote(html, "ny-document-layers-2026-09-20", `<p>The <a href="new-york-boat-registration-documents-guide.html">New York document guide</a> turns hull identity, registration, ownership and operator credentials into aboard and shore-side layers.</p>`));

console.log("Built exactly three pages, three citation-ready reference assets, reciprocal cluster links and discovery surfaces for the 2026-09-20 publication.");
