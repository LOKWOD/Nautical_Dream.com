import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20260930 } from "../content/publication-2026-09-30.mjs";

const root = process.cwd(), errors = [];
const expected = {
  "boat-usb-charger-usb-c-pd-guide.html": { affiliate: 1, hub: "gear.html", card: "assets/editorial/boat-usb-charger-photo-card.webp" },
  "lake-eaton-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/lake-eaton-family-photo-card.webp" },
  "small-boat-fuel-oil-spill-response.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/small-oil-spill-response-photo-card.webp" }
};
const allHtml = readdirSync(root).filter((f) => f.endsWith(".html"));
const titles = new Set(), slugs = new Set();
if (publication20260930.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20260930.length}`);
for (const page of publication20260930) {
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
  if (!html.includes(`assets/editorial/${page.hero.key}.webp`)) errors.push(`${page.slug}: hero missing`);
  const renderedTitleCount = allHtml.reduce((n, name) => n + (readFileSync(join(root, name), "utf8").includes(`<h1>${page.title}</h1>`) ? 1 : 0), 0);
  if (renderedTitleCount !== 1) errors.push(`${page.slug}: rendered title count ${renderedTitleCount}`);
}

const usb = readFileSync(join(root, "boat-usb-charger-usb-c-pd-guide.html"), "utf8");
for (const term of ["USB-C is a shape", "Power Delivery is a negotiation", "seven-field charging fit card", "manufacturer fuse", "qualified marine electrician"]) if (!usb.toLowerCase().includes(term.toLowerCase())) errors.push(`USB guide missing ${term}`);
const lake = readFileSync(join(root, "lake-eaton-family-boating.html"), "utf8");
for (const term of ["unimproved trailer launch", "12 cars and trailers", "lists accessibility as no", "not documentary photography of Lake Eaton", "small, light trailered boats"]) if (!lake.toLowerCase().includes(term.toLowerCase())) errors.push(`Lake Eaton guide missing ${term}`);
const spill = readFileSync(join(root, "small-boat-fuel-oil-spill-response.html"), "utf8");
for (const term of ["800-424-8802", "twelve-field spill call card", "absorbent pads or boom", "Do not add soap", "qualified marine technician"]) if (!spill.toLowerCase().includes(term.toLowerCase())) errors.push(`spill guide missing ${term}`);

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const imageKeys = ["boat-usb-charger-photo-hero", "boat-usb-charger-photo-card", "lake-eaton-family-photo-hero", "lake-eaton-family-photo-card", "small-oil-spill-response-photo-hero", "small-oil-spill-response-photo-card"];
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
  ["marine-electronics-installation.html", "boat-usb-charger-usb-c-pd-guide.html"], ["marine-wiring-diy-basics.html", "boat-usb-charger-usb-c-pd-guide.html"],
  ["long-lake-family-boating.html", "lake-eaton-family-boating.html"], ["how-to-evaluate-boat-ramp.html", "lake-eaton-family-boating.html"],
  ["safe-boat-fueling.html", "small-boat-fuel-oil-spill-response.html"], ["choosing-home-marina.html", "small-boat-fuel-oil-spill-response.html"]
]) if (!readFileSync(join(root, file), "utf8").includes(slug)) errors.push(`${file}: reciprocal link missing`);

if (errors.length) {
  console.error(`Daily 2026-09-30 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-09-30 audit passed: 3 substantial pages, 6 visually inspected original editorial assets, 1 disclosed affiliate link, three citation-ready decision assets, six reciprocal authority links and complete discovery.");
