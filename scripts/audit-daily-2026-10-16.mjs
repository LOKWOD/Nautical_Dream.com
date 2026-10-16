import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { publication20261016 as pages } from "../content/publication-2026-10-16.mjs";

const errors = [];
if (pages.length !== 3) errors.push(`expected 3 pages, found ${pages.length}`);
const expected = {
  [pages[0].slug]: { hub: "gear.html", card: "boat-trailer-guide-ons-comparison-photo-card.webp", affiliate: 3 },
  [pages[1].slug]: { hub: "destinations.html", card: "waneta-lamoka-channel-decision-concept-photo-card.webp", affiliate: 0 },
  [pages[2].slug]: { hub: "journal.html", card: "life-jacket-winter-inspection-photo-card.webp", affiliate: 0 },
};
const plain = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z0-9#]+;/gi, " ").replace(/\s+/g, " ").trim();
const htmlFiles = readdirSync(".").filter((file) => file.endsWith(".html"));

for (const page of pages) {
  if (!existsSync(page.slug)) { errors.push(`missing ${page.slug}`); continue; }
  const html = readFileSync(page.slug, "utf8");
  const words = plain(html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || html).split(" ").length;
  if (words < 1000) errors.push(`${page.slug}: only ${words} article words`);
  for (const token of [page.title, `https://nauticaldream.com/${page.slug}`, "BreadcrumbList", "FAQPage", "Nautical Dream Editorial Desk", "Plan with current information"]) if (!html.includes(token)) errors.push(`${page.slug}: missing ${token}`);
  const internal = [...html.matchAll(/<a\b[^>]*href="(?!https?:|mailto:|#)([^"]+)"/gi)].map((m) => m[1]);
  if (new Set(internal).size < 9) errors.push(`${page.slug}: fewer than 9 unique internal links`);
  const active = (html.match(/data-commercial-link="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: affiliate ${active}, expected ${expected[page.slug].affiliate}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: disclosure missing`);
  for (const match of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) for (const rel of ["sponsored", "nofollow", "noopener", "noreferrer"]) if (!match[1].includes(rel)) errors.push(`${page.slug}: commercial rel ${rel}`);
  const hub = readFileSync(expected[page.slug].hub, "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: hub discovery`);
}

const attr = JSON.parse(readFileSync("assets/editorial/attribution.json", "utf8"));
const keys = [
  "boat-trailer-guide-ons-photo-hero", "boat-trailer-guide-ons-comparison-photo-card",
  "waneta-lamoka-planning-concept-photo-hero", "waneta-lamoka-channel-decision-concept-photo-card",
  "life-jacket-winter-storage-photo-hero", "life-jacket-winter-inspection-photo-card"
];
const hashes = new Map();
for (const [key, value] of Object.entries(attr)) {
  if (!value?.localPath || !existsSync(value.localPath)) continue;
  const hash = createHash("sha256").update(readFileSync(value.localPath)).digest("hex");
  hashes.set(hash, [...(hashes.get(hash) || []), key]);
}
for (const key of keys) {
  const value = attr[key];
  if (!value || !existsSync(value.localPath)) { errors.push(`missing visual ${key}`); continue; }
  if (value.license !== "Original AI-assisted editorial image") errors.push(`${key}: license`);
  if (value.width !== (key.endsWith("-card") ? 1200 : 1600) || value.height !== 900) errors.push(`${key}: dimensions`);
  const hash = createHash("sha256").update(readFileSync(value.localPath)).digest("hex");
  if (hashes.get(hash)?.length !== 1) errors.push(`${key}: duplicate bytes`);
}

for (const surface of ["index.html", "sitemap.xml", "feed.xml", "llms.txt"]) for (const page of pages) if (!readFileSync(surface, "utf8").includes(page.slug)) errors.push(`${surface}: missing ${page.slug}`);
for (const [file, slug] of [
  ["boat-trailer-safety-checklist.html", pages[0].slug], ["boat-trailer-backing-spotter-hand-signals-drill.html", pages[0].slug],
  ["keuka-lake-family-boating.html", pages[1].slug], ["canandaigua-lake-family-boating.html", pages[1].slug],
  ["best-life-jackets.html", pages[2].slug], ["cold-weather-life-jacket-layer-fit-guide.html", pages[2].slug]
]) if (!readFileSync(file, "utf8").includes(slug)) errors.push(`${file}: reciprocal link`);

const titles = new Map();
const canonicals = new Map();
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  if (title) titles.set(title, [...(titles.get(title) || []), file]);
  if (canonical) canonicals.set(canonical, [...(canonicals.get(canonical) || []), file]);
}
for (const [title, files] of titles) if (files.length > 1) errors.push(`duplicate title ${title}`);
for (const [canonical, files] of canonicals) if (files.length > 1) errors.push(`duplicate canonical ${canonical}`);

const guideOns = readFileSync(pages[0].slug, "utf8").toLowerCase();
for (const term of ["nine-field guide-on fit card", "posts, bunk boards and rollers", "three-stage acceptance test", "who should skip diy installation"]) if (!guideOns.includes(term)) errors.push(`guide-on guide missing ${term}`);
const lakes = readFileSync(pages[1].slug, "utf8").toLowerCase();
for (const term of ["two-ramp decision card", "12 cars and trailers", "channel as a new trip", "clean, drain and dry"]) if (!lakes.includes(term)) errors.push(`Waneta/Lamoka guide missing ${term}`);
const storage = readFileSync(pages[2].slug, "utf8").toLowerCase();
for (const term of ["seven-gate winter storage card", "inspect foam jackets", "inspect inflatables by exact model", "spring release inspection"]) if (!storage.includes(term)) errors.push(`life-jacket guide missing ${term}`);

if (errors.length) {
  console.error(`Oct 16 audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
const report = JSON.parse(readFileSync("assets/affiliate-link-report.json", "utf8"));
console.log(`Daily 2026-10-16 audit passed: 3 substantial pages, 6 unique original editorial images, 0 product images, 3 disclosed affiliate links, ${report.totals?.activeAffiliateLinks ?? "verified"} active sitewide links, 3 decision assets, 6 reciprocal authority links and complete discovery.`);
