import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261007 } from "../content/publication-2026-10-07.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20261007.length !== 3) throw new Error("The 2026-10-07 publication must contain exactly three pages.");
if (!process.env.SKIP_PAGE_RENDER) {
  for (const page of publication20261007) {
    writeFileSync(join(root, page.slug), renderPage(page));
    console.log(`built ${page.slug}`);
  }
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

update("gear.html", (html) => card(html, "floating-waterproof-phone-pouch-boating-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/floating-phone-pouch-system-photo-card.webp" alt="Three unbranded waterproof phone-pouch styles on a boat deck" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Waterproof phone storage</small><h3>Buy the Seal, Not the Lifestyle Photo</h3><p>Match internal fit, closure evidence, buoyancy and tether routing before the phone goes inside.</p><a class="button" href="floating-waterproof-phone-pouch-boating-guide.html">Use the six-field match card</a></div></article>`));
update("destinations.html", (html) => card(html, "lake-harris-small-boat-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/lake-harris-small-boat-concept-photo-card.webp" alt="Conceptual family in life jackets beside a small aluminum boat on an Adirondack lake shore" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Adirondack launch planning</small><h3>Pick the Lake Harris Launch First</h3><p>Choose between the campground beach launch and Newcomb's larger-boat access before towing.</p><a class="button" href="lake-harris-small-boat-family-boating.html">Plan the small-boat day</a></div></article>`));
update("journal.html", (html) => card(html, "post-storm-boat-dock-inspection-protocol.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/post-storm-boat-inspection-photo-card.webp" alt="Adult inspecting lines beside a secured runabout after rain while another records observations" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Storm recovery protocol</small><h3>Inspect Before the First Switch</h3><p>Start from land, treat utilities as unknown and clear every red or yellow condition before starting.</p><a class="button" href="post-storm-boat-dock-inspection-protocol.html">Use the no-go-first card</a></div></article>`));

const cards = [
  ["floating-waterproof-phone-pouch-boating-guide.html", "assets/editorial/floating-phone-pouch-system-photo-card.webp", "Three unbranded waterproof phone-pouch styles on a boat deck", "Commercial storage decision", "Prove the Phone Pouch Before the Phone", "Measure the loaded device, inspect the closure, test with paper and route the tether safely.", "Use the match card"],
  ["lake-harris-small-boat-family-boating.html", "assets/editorial/lake-harris-small-boat-concept-photo-card.webp", "Conceptual family beside a small aluminum boat on an Adirondack lake shore", "Adirondack small-boat plan", "Choose the Lake Harris Launch First", "Match the campground beach launch or Newcomb access to the actual boat and retrieval margin.", "Plan the day"],
  ["post-storm-boat-dock-inspection-protocol.html", "assets/editorial/post-storm-boat-inspection-photo-card.webp", "Adult inspecting dock lines beside a secured boat after rain", "Ownership protocol", "Earn the First Start After a Storm", "Use red, yellow and green gates for access, utilities, structure, bilge, fuel and propulsion.", "Open the protocol"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Protect the phone. Choose the launch. Inspect before the first switch.</h2></div><p>Three different decisions: a commercial storage system, a compact Adirondack day and a conservative post-storm recovery sequence.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-portable-tire-inflator-buying-guide.html">trailer inflator fit</a>, the <a href="boat-ramp-no-courtesy-dock-launch-guide.html">no-courtesy-dock launch plan</a>, and the <a href="kids-marina-dock-safety-arrival-protocol.html">family marina arrival protocol</a>. Earlier: <a href="boat-cleaning-brush-soft-medium-stiff-guide.html">boat-brush surface control</a>, <a href="raquette-lake-golden-beach-small-boat-family-guide.html">Raquette Lake from Golden Beach</a>, and the <a href="boatyard-winter-storage-handoff-work-order-guide.html">boatyard winter handoff</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-07"')) return html;
  const existing = html.match(/<section class="section" data-recent-library="2026-10-06"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!existing) throw new Error("Previous recent library not found");
  const prefix = cards.map(([href, , , , title]) => `<a href="${href}">${title}</a>`).join(", ");
  return html.replace(existing[0], `<section class="section" data-recent-library="2026-10-07"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${prefix}, ${existing[1]}</p></div></section>`);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Wed, 07 Oct 2026 15:26:30 GMT</lastBuildDate>");
  const items = publication20261007.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Wed, 07 Oct 2026 15:26:30 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20261007) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-10-07</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20261007) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["boat-dry-bag-waterproof-case-guide.html", "phone-pouch-fit-seal-2026-10-07", `<p>For the device-sized decision, use the <a href="floating-waterproof-phone-pouch-boating-guide.html">six-field phone-pouch fit, seal, buoyancy and tether matrix</a>.</p>`],
  ["choosing-vhf-radio.html", "phone-pouch-communications-limit-2026-10-07", `<p>A protected phone remains a coverage- and battery-dependent device; pair this radio decision with the <a href="floating-waterproof-phone-pouch-boating-guide.html">phone-pouch acceptance test and communications stop lines</a>.</p>`],
  ["raquette-lake-golden-beach-small-boat-family-guide.html", "lake-harris-launch-choice-2026-10-07", `<p>For another compact Adirondack plan with two different launch capabilities, compare the <a href="lake-harris-small-boat-family-boating.html">Lake Harris launch-first guide</a>.</p>`],
  ["lake-eaton-family-boating.html", "lake-harris-small-boat-cluster-2026-10-07", `<p>Keep the small-water cluster moving with the <a href="lake-harris-small-boat-family-boating.html">Lake Harris two-launch decision and retrieval-margin plan</a>.</p>`],
  ["boat-insurance-explained.html", "post-storm-evidence-sequence-2026-10-07", `<p>When weather damage is possible, use the <a href="post-storm-boat-dock-inspection-protocol.html">post-storm access, evidence and first-start protocol</a> before cleanup changes the scene.</p>`],
  ["shore-power-pedestal-safety.html", "post-storm-utilities-stop-2026-10-07", `<p>After severe weather, treat dock electricity as unknown and follow the <a href="post-storm-boat-dock-inspection-protocol.html">red-yellow-green post-storm inspection card</a>.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-10-07 publication.");
