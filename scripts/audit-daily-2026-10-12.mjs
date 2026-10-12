import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20261012 as pages } from "../content/publication-2026-10-12.mjs";

const root = process.cwd();
const errors = [];
const expected = {
  "boat-winterizing-antifreeze-propylene-glycol-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/boat-winterizing-antifreeze-photo-card.webp" },
  "green-lakes-state-park-boat-rental-guide.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/green-lakes-rental-only-concept-photo-card.webp" },
  "responsible-wildlife-viewing-from-boat-guide.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/responsible-boat-wildlife-viewing-photo-card.webp" }
};
const htmlFiles = readdirSync(root).filter((file) => file.endsWith(".html"));
if (pages.length !== 3) errors.push(`expected 3 pages, found ${pages.length}`);

for (const page of pages) {
  const path = join(root, page.slug);
  if (!existsSync(path)) { errors.push(`missing ${page.slug}`); continue; }
  const html = readFileSync(path, "utf8");
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || "";
  const words = article.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").trim().split(/\s+/).length;
  if (words < 1450) errors.push(`${page.slug}: ${words} words`);
  if ((html.match(/<section class="article-section"/g) || []).length < 12) errors.push(`${page.slug}: fewer than 12 sections`);
  if (!html.includes(`<link rel="canonical" href="https://nauticaldream.com/${page.slug}">`)) errors.push(`${page.slug}: canonical`);
  for (const token of ["FAQPage", "twitter:card", `assets/editorial/${page.hero.key}.webp`]) if (!html.includes(token)) errors.push(`${page.slug}: missing ${token}`);
  if (!html.includes('"@type":"Article"') && !html.includes('"@type":["Article"')) errors.push(`${page.slug}: primary Article schema`);
  if ((html.match(/href="[^"]+\.html/g) || []).length < 9) errors.push(`${page.slug}: internal links`);
  for (const match of html.matchAll(/href="((?!https?:\/\/)[^"#?]+\.html)"/g)) if (!existsSync(join(root, match[1]))) errors.push(`${page.slug}: broken ${match[1]}`);
  const active = (html.match(/data-affiliate-active="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: affiliate ${active}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: disclosure`);
  for (const match of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) for (const rel of ["sponsored", "nofollow", "noopener", "noreferrer"]) if (!match[1].includes(rel)) errors.push(`${page.slug}: commercial rel ${rel}`);
  const hub = readFileSync(expected[page.slug].hub, "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: hub discovery`);
}

const attr = JSON.parse(readFileSync("assets/editorial/attribution.json", "utf8"));
const keys = [
  "boat-winterizing-antifreeze-photo-hero", "boat-winterizing-antifreeze-photo-card",
  "green-lakes-rental-only-concept-photo-hero", "green-lakes-rental-only-concept-photo-card",
  "responsible-boat-wildlife-viewing-photo-hero", "responsible-boat-wildlife-viewing-photo-card"
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
  if (hashes.get(hash).length !== 1) errors.push(`${key}: duplicate bytes`);
}

for (const surface of ["index.html", "sitemap.xml", "feed.xml", "llms.txt"]) for (const page of pages) if (!readFileSync(surface, "utf8").includes(page.slug)) errors.push(`${surface}: missing ${page.slug}`);
for (const [file, slug] of [
  ["boat-winterization.html", pages[0].slug], ["boatyard-winter-storage-handoff-work-order-guide.html", pages[0].slug],
  ["cazenovia-lake-family-boating.html", pages[1].slug], ["choosing-weekend-boating-destination.html", pages[1].slug],
  ["marine-binoculars-buying-guide.html", pages[2].slug], ["family-docking-crew-briefing.html", pages[2].slug]
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

const antifreeze = readFileSync(pages[0].slug, "utf8").toLowerCase();
for (const term of ["antifreeze decision card", "freeze point with burst protection", "separate potable-water winterizing from engine coolant", "automatic technician triggers", "six-line purchase test"]) if (!antifreeze.includes(term)) errors.push(`antifreeze guide missing ${term}`);
for (const label of ["Compare labeled non-toxic marine/RV propylene-glycol antifreeze", "Compare propylene-glycol refractometers with the correct scale", "Compare marine potable-water winterizing pump-kit categories"]) if (!readFileSync(pages[0].slug, "utf8").includes(`>${label}</a>`)) errors.push(`antifreeze guide missing specific commercial anchor: ${label}`);
const greenLakes = readFileSync(pages[1].slug, "utf8").toLowerCase();
for (const term of ["three-option access card", "no outside watercraft", "closed for the season", "meromictic", "who should skip the rental plan"]) if (!greenLakes.includes(term)) errors.push(`Green Lakes guide missing ${term}`);
const wildlife = readFileSync(pages[2].slug, "utf8").toLowerCase();
for (const term of ["no-pressure card", "species-specific distances", "never feed or lure wildlife", "protect nests", "seven-word callout"]) if (!wildlife.includes(term)) errors.push(`wildlife guide missing ${term}`);

if (errors.length) {
  console.error(`Oct 12 audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-10-12 audit passed: 3 substantial pages, 6 unique original editorial images, 3 disclosed affiliate links, 3 decision assets, 6 reciprocal authority links and complete discovery.");
