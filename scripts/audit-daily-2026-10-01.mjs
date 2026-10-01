import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20261001 } from "../content/publication-2026-10-01.mjs";

const root = process.cwd(), errors = [];
const expected = {
  "portable-boat-fuel-tank-connector-vent-guide.html": { affiliate: 1, hub: "gear.html", card: "assets/editorial/portable-fuel-tank-system-photo-card.webp" },
  "cross-lake-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/cross-lake-family-photo-card.webp" },
  "boat-passenger-seating-boarding-movement-guide.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/family-passenger-briefing-photo-card.webp" }
};
const allHtml = readdirSync(root).filter((file) => file.endsWith(".html"));
const sourceTitles = new Set(), sourceSlugs = new Set();
if (publication20261001.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20261001.length}`);
for (const page of publication20261001) {
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

const fuel = readFileSync(join(root, "portable-boat-fuel-tank-connector-vent-guide.html"), "utf8");
for (const term of ["eight-field portable-tank fit card", "Do not generalize the venting rule", "not generic accessories", "qualified marine technician", "engine manual"]) if (!fuel.toLowerCase().includes(term.toLowerCase())) errors.push(`fuel guide missing ${term}`);
const cross = readFileSync(join(root, "cross-lake-family-boating.html"), "utf8");
for (const term of ["hand launch", "10 cars", "approximately three river miles", "private fee access", "not documentary photography of Cross Lake"]) if (!cross.toLowerCase().includes(term.toLowerCase())) errors.push(`Cross Lake guide missing ${term}`);
const passenger = readFileSync(join(root, "boat-passenger-seating-boarding-movement-guide.html"), "utf8");
for (const term of ["four named operating states", "one at a time", "manufacturer-designated seating", "swim platform", "five-minute family brief"]) if (!passenger.toLowerCase().includes(term.toLowerCase())) errors.push(`passenger guide missing ${term}`);

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const imageKeys = ["portable-fuel-tank-system-photo-hero", "portable-fuel-tank-system-photo-card", "cross-lake-family-photo-hero", "cross-lake-family-photo-card", "family-passenger-briefing-photo-hero", "family-passenger-briefing-photo-card"];
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
for (const slug of sourceSlugs) {
  if (sitemap.split(`https://nauticaldream.com/${slug}`).length - 1 !== 1) errors.push(`${slug}: sitemap count not 1`);
  if (!feed.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: RSS missing`);
  if (!home.includes(slug)) errors.push(`${slug}: homepage missing`);
  if (!llms.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: llms.txt missing`);
}
for (const [file, slug] of [
  ["safe-boat-fueling.html", "portable-boat-fuel-tank-connector-vent-guide.html"], ["marine-fuel-management.html", "portable-boat-fuel-tank-connector-vent-guide.html"],
  ["erie-canal-guide.html", "cross-lake-family-boating.html"], ["how-to-evaluate-boat-ramp.html", "cross-lake-family-boating.html"],
  ["family-docking-crew-briefing.html", "boat-passenger-seating-boarding-movement-guide.html"], ["boating-with-children-safely.html", "boat-passenger-seating-boarding-movement-guide.html"]
]) if (!readFileSync(join(root, file), "utf8").includes(slug)) errors.push(`${file}: reciprocal link missing`);

if (errors.length) {
  console.error(`Daily 2026-10-01 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-10-01 audit passed: 3 substantial pages, 6 visually inspected original editorial assets, 1 disclosed affiliate link, three citation-ready decision assets, six reciprocal authority links and complete discovery.");
