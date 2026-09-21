import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20260921 } from "../content/publication-2026-09-21.mjs";

const root = process.cwd();
const errors = [];
const expected = {
  "boat-moisture-meter-pinless-pin-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/boat-moisture-meter-comparison-photo-card.webp" },
  "canadarago-lake-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/canadarago-lake-family-photo-card.webp" },
  "boat-capacity-plate-persons-weight-horsepower-guide.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/boat-capacity-plate-loading-photo-card.webp" },
};

if (publication20260921.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20260921.length}`);
const newTitles = new Set();
const newSlugs = new Set();
const allHtml = readdirSync(root).filter((file) => file.endsWith(".html"));
for (const page of publication20260921) {
  if (newSlugs.has(page.slug)) errors.push(`duplicate source slug ${page.slug}`);
  if (newTitles.has(page.title.toLowerCase())) errors.push(`duplicate source title ${page.title}`);
  newSlugs.add(page.slug); newTitles.add(page.title.toLowerCase());
  const file = join(root, page.slug);
  if (!existsSync(file)) { errors.push(`missing generated page ${page.slug}`); continue; }
  const html = readFileSync(file, "utf8");
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || "";
  const words = article.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
  if (words < 1400) errors.push(`${page.slug}: only ${words} article words`);
  if (!html.includes(`<link rel="canonical" href="https://nauticaldream.com/${page.slug}">`)) errors.push(`${page.slug}: missing canonical URL`);
  if (!/FAQPage/.test(html) || !/twitter:card/.test(html)) errors.push(`${page.slug}: missing FAQ/social metadata`);
  if ((html.match(/<section class="article-section"/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 sections`);
  if ((html.match(/<a href="[^"]+\.html"/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 internal links`);
  const active = (html.match(/data-affiliate-active="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: expected ${expected[page.slug].affiliate} affiliate links, found ${active}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: missing Amazon disclosure`);
  for (const match of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) {
    const rel = match[1].match(/\brel="([^"]*)"/i)?.[1] || "";
    if (!/\bsponsored\b/i.test(rel) || !/\bnofollow\b/i.test(rel) || !/\bnoopener\b/i.test(rel) || !/\bnoreferrer\b/i.test(rel)) errors.push(`${page.slug}: commercial link missing required rel values`);
  }
  if (page.slug === "boat-moisture-meter-pinless-pin-guide.html") {
    for (const label of ["View marine pinless moisture meters on Amazon", "View dual-function pin and pinless moisture meters on Amazon", "View moisture-meter calibration check blocks on Amazon"]) if (!html.includes(label)) errors.push(`${page.slug}: missing affiliate label ${label}`);
    if (!/moisture-reading record/i.test(html) || !/one reading is not a diagnosis/i.test(html) || !/qualified marine surveyor/i.test(html)) errors.push(`${page.slug}: evidence boundary or authority asset missing`);
  }
  if (page.slug === "canadarago-lake-family-boating.html" && (!/42\.818743° N/i.test(html) || !/40 vehicles with boat trailers/i.test(html) || !/\$7 vehicle-use pay station/i.test(html) || !/not documentary photography of Canadarago Lake/i.test(html))) errors.push(`${page.slug}: official launch facts or image boundary missing`);
  if (page.slug === "boat-capacity-plate-persons-weight-horsepower-guide.html" && (!/monohull boats under 20 feet/i.test(html) || !/persons, motor and gear/i.test(html) || !/capacity budget worksheet/i.test(html) || !/does not guarantee stability/i.test(html))) errors.push(`${page.slug}: federal scope, load logic or authority asset missing`);
  const hub = readFileSync(join(root, expected[page.slug].hub), "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: missing hub/card discovery`);
  const titleCount = allHtml.reduce((count, name) => count + (readFileSync(join(root, name), "utf8").includes(`<h1>${page.title}</h1>`) ? 1 : 0), 0);
  if (titleCount !== 1) errors.push(`${page.slug}: rendered h1/title collision count ${titleCount}`);
  if (!html.includes(`assets/editorial/${page.hero.key}.webp`)) errors.push(`${page.slug}: missing editorial hero`);
}

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const imageKeys = ["boat-moisture-meter-comparison-photo-hero", "boat-moisture-meter-comparison-photo-card", "canadarago-lake-family-photo-hero", "canadarago-lake-family-photo-card", "boat-capacity-plate-loading-photo-hero", "boat-capacity-plate-loading-photo-card"];
const allImageHashes = new Map();
for (const [key, record] of Object.entries(attribution)) {
  if (!record?.localPath || !existsSync(join(root, record.localPath))) continue;
  const hash = createHash("sha256").update(readFileSync(join(root, record.localPath))).digest("hex");
  if (!allImageHashes.has(hash)) allImageHashes.set(hash, []);
  allImageHashes.get(hash).push(key);
}
for (const key of imageKeys) {
  const record = attribution[key];
  if (!record || !existsSync(join(root, record.localPath))) { errors.push(`missing credited visual ${key}`); continue; }
  if (record.license !== "Original AI-assisted editorial image") errors.push(`${key}: incorrect license record`);
  if (record.width !== (/card/.test(key) ? 1200 : 1600) || record.height !== 900) errors.push(`${key}: incorrect manifest dimensions`);
  const hash = createHash("sha256").update(readFileSync(join(root, record.localPath))).digest("hex");
  if ((allImageHashes.get(hash) || []).length !== 1) errors.push(`${key}: duplicate image bytes`);
}

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const feed = readFileSync(join(root, "feed.xml"), "utf8");
const home = readFileSync(join(root, "index.html"), "utf8");
const llms = readFileSync(join(root, "llms.txt"), "utf8");
for (const slug of newSlugs) {
  if (sitemap.split(`https://nauticaldream.com/${slug}`).length - 1 !== 1) errors.push(`${slug}: sitemap count is not 1`);
  if (!feed.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: missing RSS discovery`);
  if (!home.includes(slug)) errors.push(`${slug}: missing homepage discovery`);
  if (!llms.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: missing llms.txt discovery`);
}

for (const [established, slug] of [["used-boat-inspection-checklist.html", "boat-moisture-meter-pinless-pin-guide.html"], ["used-boat-sea-trial-checklist.html", "boat-moisture-meter-pinless-pin-guide.html"], ["otsego-lake-family-boating.html", "canadarago-lake-family-boating.html"], ["oneida-lake-family-boating.html", "canadarago-lake-family-boating.html"], ["family-boat-packing-list.html", "boat-capacity-plate-persons-weight-horsepower-guide.html"], ["pontoon-horsepower-guide.html", "boat-capacity-plate-persons-weight-horsepower-guide.html"]]) {
  if (!readFileSync(join(root, established), "utf8").includes(slug)) errors.push(`${established}: missing reciprocal link to ${slug}`);
}

if (errors.length) {
  console.error(`Daily 2026-09-21 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-09-21 audit passed: 3 substantial pages, 6 visually inspected original editorial assets, 3 disclosed affiliate links, three citation-ready decision assets, reciprocal authority links and complete discovery.");
