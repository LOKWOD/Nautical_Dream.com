import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20261004 } from "../content/publication-2026-10-04.mjs";

const root = process.cwd(), errors = [];
const expected = {
  "boat-footwear-deck-water-shoe-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/boat-footwear-comparison-photo-card.webp" },
  "sacandaga-lake-moffitt-beach-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/sacandaga-lake-moffitt-concept-photo-card.webp" },
  "post-boat-day-15-minute-reset.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/post-boat-reset-photo-card.webp" }
};
const allHtml = readdirSync(root).filter((file) => file.endsWith(".html"));
const sourceTitles = new Set(), sourceSlugs = new Set();
if (publication20261004.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20261004.length}`);
for (const page of publication20261004) {
  if (sourceTitles.has(page.title.toLowerCase()) || sourceSlugs.has(page.slug)) errors.push(`duplicate source identity ${page.slug}`);
  sourceTitles.add(page.title.toLowerCase()); sourceSlugs.add(page.slug);
  const path = join(root, page.slug);
  if (!existsSync(path)) { errors.push(`missing generated page ${page.slug}`); continue; }
  const html = readFileSync(path, "utf8");
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || "";
  const words = article.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
  if (words < 1400) errors.push(`${page.slug}: only ${words} article words`);
  if (!html.includes(`<link rel="canonical" href="https://nauticaldream.com/${page.slug}">`)) errors.push(`${page.slug}: canonical missing`);
  if (!html.includes("FAQPage") || !html.includes("twitter:card")) errors.push(`${page.slug}: FAQ/social metadata missing`);
  if (!html.includes('"@type":"Article"') && !html.includes('"@type":["Article"')) errors.push(`${page.slug}: primary Article/Guide schema missing`);
  if ((html.match(/<section class="article-section"/g) || []).length < 10) errors.push(`${page.slug}: fewer than 10 sections`);
  if ((html.match(/<a href="[^"]+\.html/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 internal links`);
  for (const href of html.matchAll(/href="((?!https?:\/\/)[^"#?]+\.html)"/g)) if (!existsSync(join(root, href[1]))) errors.push(`${page.slug}: missing internal target ${href[1]}`);
  const active = (html.match(/data-affiliate-active="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: expected ${expected[page.slug].affiliate} affiliate links, found ${active}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: Amazon disclosure missing`);
  for (const match of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) {
    const rel = match[1].match(/\brel="([^"]*)"/i)?.[1] || "";
    for (const token of ["sponsored", "nofollow", "noopener", "noreferrer"]) if (!rel.includes(token)) errors.push(`${page.slug}: commercial link missing ${token}`);
  }
  const hub = readFileSync(join(root, expected[page.slug].hub), "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: hub/card discovery missing`);
  if (!html.includes(`assets/editorial/${page.hero.key}.webp`)) errors.push(`${page.slug}: hero missing`);
  const renderedTitleCount = allHtml.reduce((count, name) => count + (readFileSync(join(root, name), "utf8").includes(`<h1>${page.title}</h1>`) ? 1 : 0), 0);
  if (renderedTitleCount !== 1) errors.push(`${page.slug}: rendered title count ${renderedTitleCount}`);
}

const footwear = readFileSync(join(root, "boat-footwear-deck-water-shoe-guide.html"), "utf8");
for (const term of ["seven-field wet-deck fit card", "non-marking", "closed-toe", "No shoe overcomes", "not ranked products"]) if (!footwear.toLowerCase().includes(term.toLowerCase())) errors.push(`footwear guide missing ${term}`);
const sacandaga = readFileSync(join(root, "sacandaga-lake-moffitt-beach-family-boating.html"), "utf8");
for (const term of ["Moffitt decision matrix", "205 Page Street", "30 cars and trailers", "year-round", "not Great Sacandaga", "conceptual Adirondack family-boating image"]) if (!sacandaga.toLowerCase().includes(term.toLowerCase())) errors.push(`Sacandaga guide missing ${term}`);
const reset = readFileSync(join(root, "post-boat-day-15-minute-reset.html"), "utf8");
for (const term of ["15-minute reset card", "inside now", "dry now", "hold for decision", "Clean, Drain, Dry", "qualified technician"]) if (!reset.toLowerCase().includes(term.toLowerCase())) errors.push(`reset guide missing ${term}`);

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const imageKeys = ["boat-footwear-comparison-photo-hero", "boat-footwear-comparison-photo-card", "sacandaga-lake-moffitt-concept-photo-hero", "sacandaga-lake-moffitt-concept-photo-card", "post-boat-reset-photo-hero", "post-boat-reset-photo-card"];
const hashes = new Map();
for (const [key, record] of Object.entries(attribution)) {
  if (!record?.localPath || !existsSync(join(root, record.localPath))) continue;
  const hash = createHash("sha256").update(readFileSync(join(root, record.localPath))).digest("hex");
  hashes.set(hash, [...(hashes.get(hash) || []), key]);
}
for (const key of imageKeys) {
  const record = attribution[key];
  if (!record || !existsSync(join(root, record.localPath))) { errors.push(`missing credited visual ${key}`); continue; }
  if (record.license !== "Original AI-assisted editorial image") errors.push(`${key}: license record wrong`);
  if (record.width !== (key.endsWith("-card") ? 1200 : 1600) || record.height !== 900) errors.push(`${key}: dimensions wrong`);
  const hash = createHash("sha256").update(readFileSync(join(root, record.localPath))).digest("hex");
  if ((hashes.get(hash) || []).length !== 1) errors.push(`${key}: duplicate image bytes`);
}

const titleMap = new Map(), canonicalMap = new Map();
for (const name of allHtml) {
  const html = readFileSync(join(root, name), "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  if (title) titleMap.set(title, [...(titleMap.get(title) || []), name]);
  if (canonical) canonicalMap.set(canonical, [...(canonicalMap.get(canonical) || []), name]);
}
for (const [title, files] of titleMap) if (files.length > 1) errors.push(`duplicate title ${title}: ${files.join(", ")}`);
for (const [canonical, files] of canonicalMap) if (files.length > 1) errors.push(`duplicate canonical ${canonical}: ${files.join(", ")}`);

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8"), feed = readFileSync(join(root, "feed.xml"), "utf8"), llms = readFileSync(join(root, "llms.txt"), "utf8"), credits = readFileSync(join(root, "image-credits.html"), "utf8");
for (const slug of sourceSlugs) {
  if (sitemap.split(`https://nauticaldream.com/${slug}`).length - 1 !== 1) errors.push(`${slug}: sitemap count not 1`);
  if (!feed.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: RSS missing`);
  if (!llms.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: llms.txt missing`);
}
for (const key of imageKeys) if (!credits.includes(attribution[key].title)) errors.push(`${key}: image credits page missing`);
for (const [file, slug] of [
  ["boarding-aids-for-boats.html", "boat-footwear-deck-water-shoe-guide.html"], ["boating-with-children-safely.html", "boat-footwear-deck-water-shoe-guide.html"],
  ["great-sacandaga-lake-family-boating.html", "sacandaga-lake-moffitt-beach-family-boating.html"], ["piseco-lake-family-boating.html", "sacandaga-lake-moffitt-beach-family-boating.html"],
  ["boat-cleaning-schedule.html", "post-boat-day-15-minute-reset.html"], ["boat-records-and-logbook.html", "post-boat-day-15-minute-reset.html"]
]) if (!readFileSync(join(root, file), "utf8").includes(slug)) errors.push(`${file}: reciprocal link missing`);

if (errors.length) {
  console.error(`Daily 2026-10-04 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-10-04 audit passed: 3 substantial pages, 6 visually inspected original editorial assets, 3 disclosed affiliate links, three citation-ready decision assets, six reciprocal authority links and complete discovery.");
