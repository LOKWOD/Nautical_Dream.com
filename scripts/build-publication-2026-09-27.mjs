import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260927 } from "../content/publication-2026-09-27.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();
if (publication20260927.length !== 3) throw new Error("The 2026-09-27 publication must contain exactly three pages.");
for (const page of publication20260927) {
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

update("gear.html", (html) => card(html, "boat-trailer-coupler-hitch-ball-fit-guide.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-trailer-coupler-hitch-ball-photo-card.webp" alt="Illustrative unbranded trailer coupler, hitch balls and ball mount shown disconnected" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Trailer connection compatibility</small><h3>Match the Whole Connection</h3><p>Match ball diameter, loaded ratings, shank, receiver and rise or drop before coupling.</p><a class="button" href="boat-trailer-coupler-hitch-ball-fit-guide.html">Build the fit card</a></div></article>`));
update("destinations.html", (html) => card(html, "fourth-lake-family-boating.html", '<div class="all-grid ny-grid">', `<article class="card"><img src="assets/editorial/fourth-lake-family-photo-card.webp" alt="Illustrative family of four wearing life jackets on a generic wooded Adirondack lake" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>Adirondack family plan</small><h3>Fourth Lake by Boat</h3><p>Use the official Inlet launch, prove the boat close and add distance only when margin remains.</p><a class="button" href="fourth-lake-family-boating.html">Open the family plan</a></div></article>`));
update("journal.html", (html) => card(html, "carbon-monoxide-alarm-boat-response.html", '<div class="grid">', `<article class="card"><img src="assets/editorial/boat-carbon-monoxide-alarm-response-photo-card.webp" alt="Illustrative adults moving from a boat cabin into fresh air after a carbon-monoxide alarm" loading="lazy" width="1200" height="900" decoding="async"><div class="card-body"><small>CO alarm response</small><h3>Fresh Air Before Troubleshooting</h3><p>Evacuate, account, call and prevent re-entry until responders and qualified service clear the boat.</p><a class="button" href="carbon-monoxide-alarm-boat-response.html">Use the response card</a></div></article>`));

const cards = [
  ["boat-trailer-coupler-hitch-ball-fit-guide.html", "assets/editorial/boat-trailer-coupler-hitch-ball-photo-card.webp", "Illustrative unbranded coupler, hitch balls and ball mount shown disconnected", "Trailer connection", "Match the Whole Connection", "Size, rating, shank, receiver and height must agree before the latch closes.", "Open the buying guide"],
  ["fourth-lake-family-boating.html", "assets/editorial/fourth-lake-family-photo-card.webp", "Illustrative life-jacketed family on a generic Adirondack lake", "Adirondack day plan", "Fourth Lake Stays Close", "Use the Inlet launch, prove the boat nearby and make farther water optional.", "Open the family plan"],
  ["carbon-monoxide-alarm-boat-response.html", "assets/editorial/boat-carbon-monoxide-alarm-response-photo-card.webp", "Illustrative adults leaving a boat cabin after a carbon-monoxide alarm", "CO alarm response", "Fresh Air First", "Move people, account, call and stay out until the atmosphere and source are cleared.", "Open the response card"]
];
const homeCards = cards.map(([href, src, alt, small, title, copy, cta]) => `<a class="gear-card" href="${href}"><div class="gear-photo"><img alt="${alt}" src="${src}" width="1200" height="900" decoding="async"></div><div class="gear-copy"><small>${small}</small><h3>${title}</h3><p>${copy}</p><span class="price">${cta} →</span></div></a>`).join("");
const home = `<section class="gear" aria-labelledby="latest-guides"><div class="shell"><div class="section-head"><div><div class="eyebrow">New practical guides</div><h2 id="latest-guides">Match the connection. Keep the first turn close. Move people before equipment.</h2></div><p>Three distinct decisions for trailer compatibility, a conservative Adirondack family day and a carbon-monoxide alarm response.</p></div><div class="gear-grid">${homeCards}</div><p class="lede" style="margin-top:24px">Also recent: <a href="boat-trailer-lights-submersible-led-wiring-guide.html">trailer lighting</a>, <a href="hemlock-lake-family-boating.html">Hemlock Lake</a>, and <a href="two-boats-collide-response-reporting-guide.html">collision response</a>. Earlier: <a href="boat-trailer-brakes-surge-electric-hydraulic-guide.html">trailer brakes</a>, <a href="piseco-lake-family-boating.html">Piseco Lake</a>, and <a href="letting-someone-else-operate-your-boat-handoff-guide.html">guest-operator handoff</a>.</p></div></section>`;
update("index.html", (html) => {
  const pattern = /<section class="gear" aria-labelledby="latest-guides">[\s\S]*?<\/section>\s*<\/main>/;
  if (!pattern.test(html)) throw new Error("Homepage latest-guides section not found");
  return html.replace(pattern, `${home}\n</main>`);
});
update("index.html", (html) => {
  const recentLinks = [
    ["boat-trailer-coupler-hitch-ball-fit-guide.html", "trailer connection fit"], ["fourth-lake-family-boating.html", "Fourth Lake"], ["carbon-monoxide-alarm-boat-response.html", "CO alarm response"],
    ["boat-trailer-lights-submersible-led-wiring-guide.html", "trailer lighting systems"], ["hemlock-lake-family-boating.html", "Hemlock Lake"], ["two-boats-collide-response-reporting-guide.html", "collision response"],
    ["boat-trailer-brakes-surge-electric-hydraulic-guide.html", "trailer brake systems"], ["piseco-lake-family-boating.html", "Piseco Lake"], ["letting-someone-else-operate-your-boat-handoff-guide.html", "guest-operator handoff"],
    ["boat-fuel-filter-water-separator-guide.html", "fuel-filter fit"], ["long-lake-family-boating.html", "Long Lake"], ["boat-recall-hin-mic-safety-defect-guide.html", "boat-recall evidence"],
    ["boat-moisture-meter-pinless-pin-guide.html", "moisture-meter evidence"], ["canadarago-lake-family-boating.html", "Canadarago Lake"], ["boat-capacity-plate-persons-weight-horsepower-guide.html", "capacity plates"],
    ["boat-drain-plug-transom-garboard-guide.html", "drain-plug fit"], ["butterfield-lake-family-boating.html", "Butterfield Lake"], ["new-york-boat-registration-documents-guide.html", "New York boat documents"],
    ["boat-spare-propeller-kit-guide.html", "spare propellers"], ["oswego-harbor-family-boating.html", "Oswego Harbor"], ["swimming-from-boat-with-kids-safety-plan.html", "swimming from the boat"],
    ["boat-battery-monitor-shunt-voltage-bluetooth-guide.html", "battery monitors"], ["little-falls-erie-canal-family-boating.html", "Little Falls"], ["boat-tow-vs-salvage-assistance-guide.html", "tow versus salvage"],
    ["boat-engine-cutoff-switch-lanyard-wireless-guide.html", "engine-cutoff links"], ["schroon-lake-family-boating.html", "Schroon Lake"], ["boat-runs-aground-response.html", "grounding response"],
    ["boat-trailer-security-coupler-wheel-lock-guide.html", "trailer security"], ["saratoga-lake-family-boating.html", "Saratoga Lake"], ["used-boat-title-hin-paperwork-guide.html", "used-boat paperwork"],
    ["boat-trailer-spare-tire-system-guide.html", "trailer spare tires"], ["black-lake-family-boating.html", "Black Lake"], ["rope-in-boat-propeller-response.html", "propeller-line response"],
    ["boat-battery-box-tray-hold-down-guide.html", "battery securement"], ["cranberry-lake-family-boating.html", "Cranberry Lake"], ["gasoline-odor-boat-response.html", "gasoline-odor response"],
    ["outboard-engine-flushing-methods-guide.html", "outboard flushing"], ["tupper-lake-family-boating.html", "Tupper Lake"], ["towing-tube-with-kids-safety-plan.html", "family tubing"]
  ];
  const recent = `<section class="section" data-recent-library="2026-09-27"><div class="shell"><h2>Recent practical guides</h2><p class="lede">${recentLinks.map(([href, label]) => `<a href="${href}">${label}</a>`).join(", ")}.</p></div></section>`;
  if (html.includes('data-recent-library="2026-09-27"')) return html.replace(/<section class="section" data-recent-library="2026-09-27">[\s\S]*?<\/section>/, recent);
  if (!html.includes("</main>")) throw new Error("Homepage closing main missing");
  return html.replace("</main>", `${recent}\n</main>`);
});

update("feed.xml", (xml) => {
  let next = xml.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, "<lastBuildDate>Sun, 27 Sep 2026 15:55:00 GMT</lastBuildDate>");
  const items = publication20260927.filter((p) => !next.includes(`https://nauticaldream.com/${p.slug}`)).map((p) => `<item><title>${p.title.replaceAll("&", "&amp;")}</title><link>https://nauticaldream.com/${p.slug}</link><guid isPermaLink="true">https://nauticaldream.com/${p.slug}</guid><pubDate>Sun, 27 Sep 2026 15:50:00 GMT</pubDate><description>${p.description.replaceAll("&", "&amp;")}</description></item>`);
  return items.length ? next.replace("<item>", `${items.join("")}<item>`) : next;
});
update("sitemap.xml", (xml) => {
  let next = xml;
  for (const p of publication20260927) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next = next.replace("</urlset>", `  <url><loc>https://nauticaldream.com/${p.slug}</loc><lastmod>2026-09-27</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
  return next;
});
update("llms.txt", (txt) => {
  let next = txt;
  for (const p of publication20260927) if (!next.includes(`https://nauticaldream.com/${p.slug}`)) next += `\n- [${p.title}](https://nauticaldream.com/${p.slug}): ${p.description}`;
  return `${next.trimEnd()}\n`;
});

for (const [file, marker, body] of [
  ["boat-trailering.html", "trailer-connection-fit-2026-09-27", `<p>Before towing, use the <a href="boat-trailer-coupler-hitch-ball-fit-guide.html">coupler–ball–mount fit card</a> to match exact size, loaded ratings, shank, receiver and height.</p>`],
  ["boat-trailer-safety-checklist.html", "coupler-proof-2026-09-27", `<p>A closed latch is not the whole proof. The <a href="boat-trailer-coupler-hitch-ball-fit-guide.html">trailer connection guide</a> documents ball diameter, weakest rating and loaded geometry.</p>`],
  ["long-lake-family-boating.html", "fourth-lake-option-2026-09-27", `<p>For another Hamilton County hard-surface access plan, <a href="fourth-lake-family-boating.html">Fourth Lake from Inlet</a> uses a close proof loop and makes farther chain travel optional.</p>`],
  ["tupper-lake-family-boating.html", "fourth-lake-proof-loop-2026-09-27", `<p>The <a href="fourth-lake-family-boating.html">Fourth Lake plan</a> uses the same family-first discipline: verify the public launch, prove the boat close and preserve an early return.</p>`],
  ["marine-carbon-monoxide-alarm-guide.html", "co-alarm-response-2026-09-27", `<p>If the alarm sounds or symptoms appear, use the <a href="carbon-monoxide-alarm-boat-response.html">fresh-air–account–call–stay-out response card</a>; do not troubleshoot before evacuating.</p>`],
  ["boating-emergencies.html", "co-evacuation-sequence-2026-09-27", `<p>A carbon-monoxide warning needs a distinct sequence: <a href="carbon-monoxide-alarm-boat-response.html">move people to fresh air, account, call and prevent re-entry</a>.</p>`]
]) update(file, (html) => note(html, marker, body));

console.log("Built exactly three pages, three citation-ready decision assets, six reciprocal cluster links and complete discovery for the 2026-09-27 publication.");
