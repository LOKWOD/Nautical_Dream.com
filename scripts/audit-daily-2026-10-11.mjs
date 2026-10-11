import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20261011 as pages } from "../content/publication-2026-10-11.mjs";

const root = process.cwd();
const errors = [];
const expected = {
  "boat-trailer-wheel-bearing-hub-inspection-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/boat-trailer-hub-inspection-photo-card.webp" },
  "hinckley-reservoir-family-boating-launch-guide.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/hinckley-reservoir-concept-photo-card.webp" },
  "winter-stored-boat-cover-snow-wind-inspection-guide.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/winter-boat-cover-inspection-photo-card.webp" }
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
  "boat-trailer-hub-inspection-photo-hero", "boat-trailer-hub-inspection-photo-card",
  "hinckley-reservoir-concept-photo-hero", "hinckley-reservoir-concept-photo-card",
  "winter-boat-cover-inspection-photo-hero", "winter-boat-cover-inspection-photo-card"
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
  ["boat-trailer-portable-tire-inflator-buying-guide.html", pages[0].slug], ["boat-trailer-brakes-surge-electric-hydraulic-guide.html", pages[0].slug],
  ["cazenovia-lake-family-boating.html", pages[1].slug], ["choosing-weekend-boating-destination.html", pages[1].slug],
  ["boat-storage-ventilation.html", pages[2].slug], ["boatyard-winter-storage-handoff-work-order-guide.html", pages[2].slug]
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

const hubHtml = readFileSync(pages[0].slug, "utf8").toLowerCase();
for (const term of ["hub identity card", "comparison, not a magic number", "reject the almost-right spare", "never mix types", "who should not do roadside hub work"]) if (!hubHtml.includes(term)) errors.push(`hub guide missing ${term}`);
for (const label of ["Compare infrared thermometers with adjustable emissivity", "Compare exact-fit boat-trailer spare hub kit categories", "Compare heavy-duty trailer wheel chocks"]) if (!readFileSync(pages[0].slug, "utf8").includes(`>${label}</a>`)) errors.push(`hub guide missing specific commercial anchor: ${label}`);
const hinckleyHtml = readFileSync(pages[1].slug, "utf8").toLowerCase();
for (const term of ["two-access card", "250 feet", "may 23 through september 7", "water-level gate", "five miles west"]) if (!hinckleyHtml.includes(term)) errors.push(`Hinckley missing ${term}`);
const coverHtml = readFileSync(pages[2].slug, "utf8").toLowerCase();
for (const term of ["seven-zone perimeter card", "never make yourself part of the load path", "treat fitted covers and shrink wrap differently", "do not improvise snow removal", "escalation ladder"]) if (!coverHtml.includes(term)) errors.push(`cover guide missing ${term}`);

if (errors.length) {
  console.error(`Oct 11 audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-10-11 audit passed: 3 substantial pages, 6 unique original editorial images, 3 disclosed affiliate links, 3 decision assets, 6 reciprocal authority links and complete discovery.");
