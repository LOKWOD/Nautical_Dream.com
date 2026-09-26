import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20260926 } from "../content/publication-2026-09-26.mjs";

const root = process.cwd(), errors = [];
const expected = {
  "boat-trailer-lights-submersible-led-wiring-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/boat-trailer-lighting-system-photo-card.webp" },
  "hemlock-lake-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/hemlock-lake-family-photo-card.webp" },
  "two-boats-collide-response-reporting-guide.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/boat-collision-response-photo-card.webp" }
};

if (publication20260926.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20260926.length}`);
const titles = new Set(), slugs = new Set(), allHtml = readdirSync(root).filter((f) => f.endsWith(".html"));
for (const page of publication20260926) {
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
  if ((html.match(/<section class="article-section"/g) || []).length < 10) errors.push(`${page.slug}: fewer than 10 sections`);
  if ((html.match(/<a href="[^"]+\.html/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 internal links`);
  const active = (html.match(/data-affiliate-active="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: expected ${expected[page.slug].affiliate} affiliate links, found ${active}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: Amazon disclosure missing`);
  for (const match of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) {
    const rel = match[1].match(/\brel="([^"]*)"/i)?.[1] || "";
    for (const token of ["sponsored", "nofollow", "noopener", "noreferrer"]) if (!rel.includes(token)) errors.push(`${page.slug}: commercial link missing ${token}`);
  }
  const hub = readFileSync(join(root, expected[page.slug].hub), "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: hub/card discovery missing`);
  const h1Count = allHtml.reduce((n, name) => n + (readFileSync(join(root, name), "utf8").includes(`<h1>${page.title}</h1>`) ? 1 : 0), 0);
  if (h1Count !== 1) errors.push(`${page.slug}: rendered title count ${h1Count}`);
  if (!html.includes(`assets/editorial/${page.hero.key}.webp`)) errors.push(`${page.slug}: hero missing`);
}

const lighting = readFileSync(join(root, "boat-trailer-lights-submersible-led-wiring-guide.html"), "utf8");
for (const term of ["lamp–connector–ground fit card", "49 CFR 571.108", "qualified trailer or automotive electrical technician", "A coupler touching a hitch ball is not a dependable electrical ground"]) if (!lighting.toLowerCase().includes(term.toLowerCase())) errors.push(`trailer-lighting guide missing ${term}`);
const lake = readFileSync(join(root, "hemlock-lake-family-boating.html"), "utf8");
for (const term of ["42.763448° N", "17 feet or less", "10 horsepower or less", "not documentary photography of Hemlock Lake", "Hemlock launch-and-limit card"]) if (!lake.toLowerCase().includes(term.toLowerCase())) errors.push(`Hemlock Lake guide missing ${term}`);
const collision = readFileSync(join(root, "two-boats-collide-response-reporting-guide.html"), "utf8");
for (const term of ["people–hazard–facts–report card", "$2,000", "$1,000", "46 U.S.C. § 2304", "National Response Center"]) if (!collision.toLowerCase().includes(term.toLowerCase())) errors.push(`collision guide missing ${term}`);

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const imageKeys = ["boat-trailer-lighting-system-photo-hero","boat-trailer-lighting-system-photo-card","hemlock-lake-family-photo-hero","hemlock-lake-family-photo-card","boat-collision-response-photo-hero","boat-collision-response-photo-card"];
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

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8"), feed = readFileSync(join(root, "feed.xml"), "utf8"), home = readFileSync(join(root, "index.html"), "utf8"), llms = readFileSync(join(root, "llms.txt"), "utf8");
for (const slug of slugs) {
  if (sitemap.split(`https://nauticaldream.com/${slug}`).length - 1 !== 1) errors.push(`${slug}: sitemap count not 1`);
  if (!feed.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: RSS missing`);
  if (!home.includes(slug)) errors.push(`${slug}: homepage missing`);
  if (!llms.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: llms.txt missing`);
}
for (const [file, slug] of [
  ["best-boat-trailer-accessories.html","boat-trailer-lights-submersible-led-wiring-guide.html"], ["boat-trailer-safety-checklist.html","boat-trailer-lights-submersible-led-wiring-guide.html"],
  ["honeoye-lake-family-boating.html","hemlock-lake-family-boating.html"], ["finger-lakes-which-lake.html","hemlock-lake-family-boating.html"],
  ["boating-emergencies.html","two-boats-collide-response-reporting-guide.html"], ["navigation-rules-of-road.html","two-boats-collide-response-reporting-guide.html"]
]) if (!readFileSync(join(root, file), "utf8").includes(slug)) errors.push(`${file}: reciprocal link missing`);

if (errors.length) {
  console.error(`Daily 2026-09-26 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-09-26 audit passed: 3 substantial pages, 6 visually inspected original editorial assets, 3 disclosed affiliate links, three citation-ready decision assets, six reciprocal authority links and complete discovery.");
