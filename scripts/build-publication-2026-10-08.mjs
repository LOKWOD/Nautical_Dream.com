import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20261008 } from "../content/publication-2026-10-08.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20261008.length !== 3) throw new Error("The 2026-10-08 publication must contain exactly three pages.");
if (!process.env.SKIP_PAGE_RENDER) for (const page of publication20261008) {
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

update("gear.html", (html) => card(html, "boat-oil-only-absorbent-pad-bilge-sock-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-oil-sorbent-kit-photo-card.webp" alt="Unbranded oil-only absorbent pads and sock with gloves and disposal supplies" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Pollution-prevention gear</small><h3>Pad, Bilge Sock or Boom?</h3><p>Match the sorbent form to the job, fit, retrieval route and disposal plan.</p><a class="button" href="boat-oil-only-absorbent-pad-bilge-sock-guide.html">Use the decision card</a></div></article>`));
update("destinations.html", (html) => card(html, "canadice-lake-small-boat-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/canadice-lake-small-boat-concept-photo-card.webp" alt="Conceptual family in life jackets beside a small aluminum boat on a forested lake shore" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Finger Lakes small-boat access</small><h3>Choose the Canadice Access First</h3><p>Match the unimproved trailer ramp or hand launch to the legal boat and the crew.</p><a class="button" href="canadice-lake-small-boat-family-boating.html">Plan the proof loop</a></div></article>`));
update("journal.html", (html) => card(html, "boat-medication-heat-water-storage-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-medication-storage-system-photo-card.webp" alt="Conceptual medication containers in a clear pouch, insulated carrier and hard case" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Crew health protocol</small><h3>Protect Medication From the Boat</h3><p>Use the label, pharmacist and a five-field manifest to manage heat, water, access and delay.</p><a class="button" href="boat-medication-heat-water-storage-guide.html">Build the storage plan</a></div></article>`));

const cards = [
  ["boat-oil-only-absorbent-pad-bilge-sock-guide.html", "assets/editorial/boat-oil-sorbent-kit-photo-card.webp", "Unbranded oil-only pads and sock with gloves and disposal supplies", "Commercial spill-prevention decision", "Choose the Sorbent Form Before the Spill", "Match pads, bilge socks, pillows and booms to one defined job and a legal waste route.", "Use the decision card"],
  ["canadice-lake-small-boat-family-boating.html", "assets/editorial/canadice-lake-small-boat-concept-photo-card.webp", "Conceptual family beside a small aluminum boat on a forested lake shore", "Finger Lakes access plan", "Choose the Canadice Access First", "Compare the unimproved trailer launch and hand launch, then run a restrained proof loop.", "Plan the lake day"],
  ["boat-medication-heat-water-storage-guide.html", "assets/editorial/boat-medication-storage-system-photo-card.webp", "Conceptual medication storage pouches and cases on a boat table", "Crew health protocol", "Protect Medication From Heat, Water and Delay", "Build a five-field manifest around the exact label, pharmacist advice and responsible-adult access.", "Build the protocol"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Contain the drip. Choose the access. Protect the medicine.</h2></div><p>Three separate owner decisions: pollution-prevention gear, a quiet Finger Lakes small-boat day and a label-led crew-health protocol.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="floating-waterproof-phone-pouch-boating-guide.html">phone-pouch fit and seal</a>, <a href="lake-harris-small-boat-family-boating.html">Lake Harris launch choice</a>, and the <a href="post-storm-boat-dock-inspection-protocol.html">post-storm inspection protocol</a>. Earlier: <a href="boat-trailer-portable-tire-inflator-buying-guide.html">trailer inflator fit</a>, the <a href="boat-ramp-no-courtesy-dock-launch-guide.html">no-courtesy-dock launch plan</a>, and the <a href="kids-marina-dock-safety-arrival-protocol.html">family marina arrival protocol</a>. Still discoverable: the <a href="boat-cleaning-brush-soft-medium-stiff-guide.html">boat-brush surface system</a>, <a href="raquette-lake-golden-beach-small-boat-family-guide.html">Raquette Lake from Golden Beach</a>, and the <a href="boatyard-winter-storage-handoff-work-order-guide.html">boatyard winter handoff</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<section class="section" data-recent-library=/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n<section class="section" data-recent-library=`);
});
update("index.html", (html) => {
  if (html.includes('data-recent-library="2026-10-08"')) return html;
  const existing = html.match(/<section class="section" data-recent-library="2026-10-07"><div class="shell"><h2>Recent practical guides<\/h2><p class="lede">([\s\S]*?)<\/p><\/div><\/section>/);
  if (!existing) throw new Error("Previous recent library not found");
  const prefix = cards.map(([href, , , , title]) => `<a href="${href}">${title}</a>`).join(", ");
  return html.replace(existing[0], `<section class="section" data-recent-library="2026-10-08"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${prefix}, ${existing[1]}</p></div></section>`);
});
update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Thu, 08 Oct 2026 15:24:53 GMT</lastBuildDate>");
  const items = publication20261008.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Thu, 08 Oct 2026 15:24:53 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20261008) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-10-08</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20261008) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});
for (const [file, marker, body] of [
  ["small-boat-fuel-oil-spill-response.html", "sorbent-format-decision-2026-10-08", `<p>Prepare the capture equipment before an incident with the <a href="boat-oil-only-absorbent-pad-bilge-sock-guide.html">pad, bilge-sock, pillow and boom decision card</a>.</p>`],
  ["marine-fuel-management.html", "sorbent-prevention-cluster-2026-10-08", `<p>Pair fuel prevention with the <a href="boat-oil-only-absorbent-pad-bilge-sock-guide.html">oil-only sorbent fit, retrieval and disposal plan</a>.</p>`],
  ["hemlock-lake-family-boating.html", "canadice-two-access-2026-10-08", `<p>For the neighboring watershed lake, use the <a href="canadice-lake-small-boat-family-boating.html">Canadice two-access and ninety-minute proof-loop plan</a>.</p>`],
  ["finger-lakes-boating.html", "canadice-small-boat-cluster-2026-10-08", `<p>Add a quieter small-boat option with the <a href="canadice-lake-small-boat-family-boating.html">Canadice ramp-versus-hand-launch decision card</a>.</p>`],
  ["boat-first-aid-kit-buying-packing-guide.html", "medication-storage-protocol-2026-10-08", `<p>Keep personal prescriptions separate but cross-referenced through the <a href="boat-medication-heat-water-storage-guide.html">five-field boat medication manifest</a>.</p>`],
  ["seasickness-on-small-boat-prevention-response-guide.html", "medication-label-stop-lines-2026-10-08", `<p>For any medicine carried aboard, follow the <a href="boat-medication-heat-water-storage-guide.html">label-led heat, water, access and delay protocol</a>.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-10-08 publication.");
