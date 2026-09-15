import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20260915 } from "../content/publication-2026-09-15.mjs";

const root = process.cwd();
const errors = [];
const expected = {
  "boat-trailer-spare-tire-system-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/boat-trailer-spare-system-photo-card.webp" },
  "black-lake-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/black-lake-family-planning-photo-card.webp" },
  "rope-in-boat-propeller-response.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/rope-propeller-response-photo-card.webp" },
};

if (publication20260915.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20260915.length}`);
const newTitles = new Set();
const newSlugs = new Set();
const allHtml = readdirSync(root).filter((file) => file.endsWith(".html"));

for (const page of publication20260915) {
  if (newSlugs.has(page.slug)) errors.push(`duplicate source slug ${page.slug}`);
  if (newTitles.has(page.title.toLowerCase())) errors.push(`duplicate source title ${page.title}`);
  newSlugs.add(page.slug); newTitles.add(page.title.toLowerCase());
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
  if (page.slug === "boat-trailer-spare-tire-system-guide.html") {
    for (const label of ["Compare ST boat-trailer tire-and-wheel assemblies on Amazon", "Compare galvanized boat-trailer spare-tire carriers on Amazon", "Compare trailer lug-wrench and socket sets on Amazon"]) if (!html.includes(label)) errors.push(`${page.slug}: missing category-specific affiliate label: ${label}`);
    if (!/weakest documented limit/i.test(html) || !/traffic/i.test(html)) errors.push(`${page.slug}: capacity or roadside safety boundary missing`);
  }
  if (page.slug === "black-lake-family-boating.html" && (!html.includes("44.510060") || !html.includes("eight-foot mean depth") || !html.includes("illustrative, not documentary"))) errors.push(`${page.slug}: launch, shallow-water or illustrative-image boundary missing`);
  if (page.slug === "rope-in-boat-propeller-response.html" && (!/Neutral is not off/i.test(html) || !/No family outing justifies a swimmer beneath the boat/i.test(html))) errors.push(`${page.slug}: shutdown or no-water-entry boundary missing`);
  const hub = readFileSync(join(root, expected[page.slug].hub), "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: missing hub/card discovery`);
  const titleCount = allHtml.reduce((count, name) => count + (readFileSync(join(root, name), "utf8").includes(`<h1>${page.title}</h1>`) ? 1 : 0), 0);
  if (titleCount !== 1) errors.push(`${page.slug}: rendered h1/title collision count ${titleCount}`);
  if (!html.includes(`assets/editorial/${page.hero.key}.webp`)) errors.push(`${page.slug}: missing photographic hero`);
}

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const photoKeys = [
  "boat-trailer-spare-system-photo-hero", "boat-trailer-spare-system-photo-card",
  "black-lake-family-planning-photo-hero", "black-lake-family-planning-photo-card",
  "rope-propeller-response-photo-hero", "rope-propeller-response-photo-card",
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
  console.error(`Daily 2026-09-15 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-09-15 audit passed: 3 substantial pages, 6 photographic assets, 3 disclosed affiliate links and complete discovery.");
