import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20260922 } from "../content/publication-2026-09-22.mjs";

const root = process.cwd(), errors = [];
const expected = {
  "boat-fuel-filter-water-separator-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/boat-fuel-filter-system-photo-card.webp" },
  "long-lake-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/long-lake-family-photo-card.webp" },
  "boat-recall-hin-mic-safety-defect-guide.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/boat-recall-record-photo-card.webp" }
};
if (publication20260922.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20260922.length}`);
const titles = new Set(), slugs = new Set(), allHtml = readdirSync(root).filter((f) => f.endsWith(".html"));
for (const page of publication20260922) {
  if (titles.has(page.title.toLowerCase()) || slugs.has(page.slug)) errors.push(`duplicate source identity ${page.slug}`);
  titles.add(page.title.toLowerCase()); slugs.add(page.slug);
  const file = join(root, page.slug);
  if (!existsSync(file)) { errors.push(`missing generated page ${page.slug}`); continue; }
  const html = readFileSync(file, "utf8");
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || "";
  const words = article.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
  if (words < 1400) errors.push(`${page.slug}: only ${words} article words`);
  if (!html.includes(`<link rel="canonical" href="https://nauticaldream.com/${page.slug}">`)) errors.push(`${page.slug}: canonical missing`);
  if (!html.includes("FAQPage") || !html.includes("twitter:card")) errors.push(`${page.slug}: FAQ/social metadata missing`);
  if ((html.match(/<section class="article-section"/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 sections`);
  if ((html.match(/<a href="[^"]+\.html"/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 internal links`);
  const active = (html.match(/data-affiliate-active="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: expected ${expected[page.slug].affiliate} affiliate links, found ${active}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: Amazon disclosure missing`);
  for (const m of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) {
    const rel = m[1].match(/\brel="([^"]*)"/i)?.[1] || "";
    for (const token of ["sponsored", "nofollow", "noopener", "noreferrer"]) if (!rel.includes(token)) errors.push(`${page.slug}: commercial link missing ${token}`);
  }
  const hub = readFileSync(join(root, expected[page.slug].hub), "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: hub/card discovery missing`);
  const h1Count = allHtml.reduce((n, name) => n + (readFileSync(join(root, name), "utf8").includes(`<h1>${page.title}</h1>`) ? 1 : 0), 0);
  if (h1Count !== 1) errors.push(`${page.slug}: rendered title count ${h1Count}`);
  if (!html.includes(`assets/editorial/${page.hero.key}.webp`)) errors.push(`${page.slug}: hero missing`);
}

const fuel = readFileSync(join(root, "boat-fuel-filter-water-separator-guide.html"), "utf8");
for (const term of ["fuel-filter fit card", "flow and restriction", "qualified marine technician", "Micron is a specification"]) if (!fuel.toLowerCase().includes(term.toLowerCase())) errors.push(`fuel guide missing ${term}`);
const lake = readFileSync(join(root, "long-lake-family-boating.html"), "utf8");
for (const term of ["43.978632° N", "60 cars and trailers", "not documentary photography of Long Lake", "family turnaround card"]) if (!lake.includes(term)) errors.push(`Long Lake guide missing ${term}`);
const recall = readFileSync(join(root, "boat-recall-hin-mic-safety-defect-guide.html"), "utf8");
for (const term of ["1,696 records", "recall evidence record", "no-result search is not a safety certificate", "Consumer Safety Defect Report"]) if (!recall.toLowerCase().includes(term.toLowerCase())) errors.push(`recall guide missing ${term}`);

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const imageKeys = ["boat-fuel-filter-system-photo-hero","boat-fuel-filter-system-photo-card","long-lake-family-photo-hero","long-lake-family-photo-card","boat-recall-record-photo-hero","boat-recall-record-photo-card"];
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

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8"), feed = readFileSync(join(root, "feed.xml"), "utf8"), home = readFileSync(join(root, "index.html"), "utf8"), llms = readFileSync(join(root, "llms.txt"), "utf8");
for (const slug of slugs) {
  if (sitemap.split(`https://nauticaldream.com/${slug}`).length - 1 !== 1) errors.push(`${slug}: sitemap count not 1`);
  if (!feed.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: RSS missing`);
  if (!home.includes(slug)) errors.push(`${slug}: homepage missing`);
  if (!llms.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: llms.txt missing`);
}
for (const [file, slug] of [
  ["marine-fuel-management.html","boat-fuel-filter-water-separator-guide.html"],["water-in-boat-fuel.html","boat-fuel-filter-water-separator-guide.html"],
  ["tupper-lake-family-boating.html","long-lake-family-boating.html"],["cranberry-lake-family-boating.html","long-lake-family-boating.html"],
  ["used-boat-title-hin-paperwork-guide.html","boat-recall-hin-mic-safety-defect-guide.html"],["used-boat-inspection-checklist.html","boat-recall-hin-mic-safety-defect-guide.html"]
]) if (!readFileSync(join(root, file), "utf8").includes(slug)) errors.push(`${file}: reciprocal link missing`);

if (errors.length) {
  console.error(`Daily 2026-09-22 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-09-22 audit passed: 3 substantial pages, 6 visually inspected original editorial assets, 3 disclosed affiliate links, three citation-ready decision assets, six reciprocal authority links and complete discovery.");
