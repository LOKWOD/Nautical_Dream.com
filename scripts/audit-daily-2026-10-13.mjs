import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20261013 as pages } from "../content/publication-2026-10-13.mjs";

const root = process.cwd();
const errors = [];
const expected = {
  "marina-cart-folding-wagon-dock-cart-buying-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/marina-cart-comparison-photo-card.webp" },
  "fish-creek-pond-family-boating-launch-guide.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/fish-creek-pond-planning-concept-photo-card.webp" },
  "teach-kids-three-boat-knots-20-minute-practice.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/kids-boat-knots-practice-photo-card.webp" }
};
const htmlFiles = readdirSync(root).filter((file) => file.endsWith(".html"));
if (pages.length !== 3) errors.push(`expected 3 pages, found ${pages.length}`);

for (const page of pages) {
  const path = join(root, page.slug);
  if (!existsSync(path)) { errors.push(`missing ${page.slug}`); continue; }
  const html = readFileSync(path, "utf8");
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || "";
  const words = article.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").trim().split(/\s+/).length;
  if (words < 1450) errors.push(`${page.slug}: only ${words} words`);
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
  "marina-cart-route-test-photo-hero", "marina-cart-comparison-photo-card",
  "fish-creek-pond-launch-concept-photo-hero", "fish-creek-pond-planning-concept-photo-card",
  "kids-boat-knots-practice-photo-hero", "kids-boat-knots-practice-photo-card"
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
  ["dock-box-essentials.html", pages[0].slug], ["family-boat-packing-list.html", pages[0].slug],
  ["lower-saranac-lake-family-boating.html", pages[1].slug], ["choosing-weekend-boating-destination.html", pages[1].slug],
  ["kids-jobs-on-a-boat.html", pages[2].slug], ["dock-lines-explained.html", pages[2].slug]
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

const cart = readFileSync(pages[0].slug, "utf8").toLowerCase();
for (const term of ["six-field route card", "advertised capacity as a ceiling", "garage acceptance test", "know when to skip the cart"]) if (!cart.includes(term)) errors.push(`cart guide missing ${term}`);
for (const label of ["Compare folding utility wagons with published folded dimensions", "Compare folding platform carts with restraint points", "Compare folding hand trucks for compact vertical loads"]) if (!readFileSync(pages[0].slug, "utf8").includes(`>${label}</a>`)) errors.push(`cart guide missing specific commercial anchor: ${label}`);
const fish = readFileSync(pages[1].slug, "utf8").toLowerCase();
for (const term of ["four-gate access card", "open year-round", "2027 campground opening of may 24", "who should skip this plan"]) if (!fish.includes(term)) errors.push(`Fish Creek guide missing ${term}`);
const knots = readFileSync(pages[2].slug, "utf8").toLowerCase();
for (const term of ["three-knot job card", "20-minute", "adult inspection", "name. tie. check."]) if (!knots.includes(term)) errors.push(`knot guide missing ${term}`);

if (errors.length) {
  console.error(`Oct 13 audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-10-13 audit passed: 3 substantial pages, 6 unique original editorial images, 3 disclosed affiliate links, 3 decision assets, 6 reciprocal authority links and complete discovery.");
