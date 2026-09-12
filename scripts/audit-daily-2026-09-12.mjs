import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20260912 } from "../content/publication-2026-09-12.mjs";

const root = process.cwd();
const errors = [];
const expected = {
  "outboard-engine-flushing-methods-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/outboard-flushing-methods-photo-card.webp" },
  "tupper-lake-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/tupper-lake-family-planning-photo-card.webp" },
  "towing-tube-with-kids-safety-plan.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/family-tubing-spotter-photo-card.webp" },
};

if (publication20260912.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20260912.length}`);
const newTitles = new Set();
const newSlugs = new Set();
const allHtml = readdirSync(root).filter((file) => file.endsWith(".html"));

for (const page of publication20260912) {
  if (newSlugs.has(page.slug)) errors.push(`duplicate source slug ${page.slug}`);
  if (newTitles.has(page.title.toLowerCase())) errors.push(`duplicate source title ${page.title}`);
  newSlugs.add(page.slug);
  newTitles.add(page.title.toLowerCase());
  const file = join(root, page.slug);
  if (!existsSync(file)) { errors.push(`missing generated page ${page.slug}`); continue; }
  const html = readFileSync(file, "utf8");
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || "";
  const words = article.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
  if (words < 1500) errors.push(`${page.slug}: only ${words} article words`);
  if (!html.includes(`<link rel="canonical" href="https://nauticaldream.com/${page.slug}">`)) errors.push(`${page.slug}: missing canonical URL`);
  if (!/FAQPage/.test(html) || !/twitter:card/.test(html)) errors.push(`${page.slug}: missing FAQ/social metadata`);
  if ((html.match(/<section class="article-section"/g) || []).length < 10) errors.push(`${page.slug}: fewer than 10 sections`);
  if ((html.match(/<a href="[^"]+\.html"/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 internal links`);
  const active = (html.match(/data-affiliate-active="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: expected ${expected[page.slug].affiliate} affiliate links, found ${active}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: missing Amazon disclosure`);
  if (active && /<a\b[^>]*data-commercial-link="true"[^>]*>\s*<img/i.test(html)) errors.push(`${page.slug}: unverified affiliate product image found`);
  for (const match of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) {
    const rel = match[1].match(/\brel="([^"]*)"/i)?.[1] || "";
    if (!/\bsponsored\b/i.test(rel) || !/\bnofollow\b/i.test(rel) || !/\bnoopener\b/i.test(rel) || !/\bnoreferrer\b/i.test(rel)) errors.push(`${page.slug}: commercial link missing required rel values`);
  }
  if (page.slug === "outboard-engine-flushing-methods-guide.html") {
    for (const label of ["Compare single-feed outboard motor flushing muffs on Amazon", "Compare dual-feed outboard motor flushing muffs on Amazon", "Compare outboard motor flushing bags and tanks on Amazon"]) {
      if (!html.includes(label)) errors.push(`${page.slug}: missing category-specific affiliate label: ${label}`);
    }
  }
  if (page.slug === "tupper-lake-family-boating.html" && (!html.includes("44.195388") || !html.includes("35 cars and trailers") || !html.includes("illustrative, not documentary"))) errors.push(`${page.slug}: launch facts or illustrative-image label missing`);
  if (page.slug === "towing-tube-with-kids-safety-plan.html" && (!html.includes("at least ten years old") || !html.includes("sunset to sunrise"))) errors.push(`${page.slug}: current New York towing-law boundary missing`);
  const hub = readFileSync(join(root, expected[page.slug].hub), "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: missing hub/card discovery`);
  const titleCount = allHtml.reduce((count, name) => count + (readFileSync(join(root, name), "utf8").includes(`<h1>${page.title}</h1>`) ? 1 : 0), 0);
  if (titleCount !== 1) errors.push(`${page.slug}: rendered h1/title collision count ${titleCount}`);
  if (!html.includes(`assets/editorial/${page.hero.key}.webp`)) errors.push(`${page.slug}: missing photographic hero`);
}

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const photoKeys = [
  "outboard-flushing-methods-photo-hero", "outboard-flushing-methods-photo-card",
  "tupper-lake-family-planning-photo-hero", "tupper-lake-family-planning-photo-card",
  "family-tubing-spotter-photo-hero", "family-tubing-spotter-photo-card",
];
for (const key of photoKeys) {
  const record = attribution[key];
  if (!record || !existsSync(join(root, record.localPath))) errors.push(`missing credited visual ${key}`);
  if (record?.license !== "Original AI-assisted editorial image") errors.push(`${key}: incorrect editorial-image license record`);
  if (record?.width !== (/card/.test(key) ? 1200 : 1600) || record?.height !== 900) errors.push(`${key}: incorrect dimensions in manifest`);
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

if (errors.length) {
  console.error(`Daily 2026-09-12 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-09-12 audit passed: 3 substantial pages, 6 photographic assets, 3 disclosed affiliate links and complete discovery.");
