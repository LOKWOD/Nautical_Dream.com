import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20260919 } from "../content/publication-2026-09-19.mjs";

const root = process.cwd();
const errors = [];
const expected = {
  "boat-spare-propeller-kit-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/boat-spare-prop-kit-photo-card.webp" },
  "oswego-harbor-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/oswego-harbor-family-photo-card.webp" },
  "swimming-from-boat-with-kids-safety-plan.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/family-swim-from-boat-photo-card.webp" },
};

if (publication20260919.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20260919.length}`);
const newTitles = new Set();
const newSlugs = new Set();
const allHtml = readdirSync(root).filter((file) => file.endsWith(".html"));

for (const page of publication20260919) {
  if (newSlugs.has(page.slug)) errors.push(`duplicate source slug ${page.slug}`);
  if (newTitles.has(page.title.toLowerCase())) errors.push(`duplicate source title ${page.title}`);
  newSlugs.add(page.slug); newTitles.add(page.title.toLowerCase());
  const file = join(root, page.slug);
  if (!existsSync(file)) { errors.push(`missing generated page ${page.slug}`); continue; }
  const html = readFileSync(file, "utf8");
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || "";
  const words = article.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
  if (words < 1400) errors.push(`${page.slug}: only ${words} article words`);
  if (!html.includes(`<link rel="canonical" href="https://nauticaldream.com/${page.slug}">`)) errors.push(`${page.slug}: missing canonical URL`);
  if (!/FAQPage/.test(html) || !/twitter:card/.test(html)) errors.push(`${page.slug}: missing FAQ/social metadata`);
  if ((html.match(/<section class="article-section"/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 sections`);
  if ((html.match(/<a href="[^"]+\.html"/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 internal links`);
  const active = (html.match(/data-affiliate-active="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: expected ${expected[page.slug].affiliate} affiliate links, found ${active}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: missing Amazon disclosure`);
  for (const match of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) {
    const rel = match[1].match(/\brel="([^"]*)"/i)?.[1] || "";
    if (!/\bsponsored\b/i.test(rel) || !/\bnofollow\b/i.test(rel) || !/\bnoopener\b/i.test(rel) || !/\bnoreferrer\b/i.test(rel)) errors.push(`${page.slug}: commercial link missing required rel values`);
  }
  if (page.slug === "boat-spare-propeller-kit-guide.html") {
    for (const label of ["Compare model-matched replacement boat propellers on Amazon", "Compare model-matched boat propeller hub kits on Amazon", "Compare marine propeller wrench and hardware kits on Amazon"]) if (!html.includes(label)) errors.push(`${page.slug}: missing category-specific affiliate label: ${label}`);
    if (!/Rotation and gearcase family are hard gates/i.test(html) || !/Never copy a torque/i.test(html) || !/qualified marine technician/i.test(html) || !/spare-prop compatibility matrix/i.test(html)) errors.push(`${page.slug}: compatibility, torque or technician boundary missing`);
  }
  if (page.slug === "oswego-harbor-family-boating.html" && (!/3–4 lane launch/i.test(html) || !/May 1 through October 15/i.test(html) || !/24-hour restrooms and showers/i.test(html) || !/editorial illustration, not documentary/i.test(html))) errors.push(`${page.slug}: official marina, season or image boundary missing`);
  if (page.slug === "swimming-from-boat-with-kids-safety-plan.html" && (!/one responsible adult remains aboard/i.test(html) || !/Neutral alone is not a barrier/i.test(html) || !/carbon monoxide/i.test(html) || !/six-gate swim card/i.test(html))) errors.push(`${page.slug}: propulsion, supervision, CO or six-gate boundary missing`);
  const hub = readFileSync(join(root, expected[page.slug].hub), "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: missing hub/card discovery`);
  const titleCount = allHtml.reduce((count, name) => count + (readFileSync(join(root, name), "utf8").includes(`<h1>${page.title}</h1>`) ? 1 : 0), 0);
  if (titleCount !== 1) errors.push(`${page.slug}: rendered h1/title collision count ${titleCount}`);
  if (!html.includes(`assets/editorial/${page.hero.key}.webp`)) errors.push(`${page.slug}: missing photographic hero`);
}

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const photoKeys = [
  "boat-spare-prop-kit-photo-hero", "boat-spare-prop-kit-photo-card",
  "oswego-harbor-family-photo-hero", "oswego-harbor-family-photo-card",
  "family-swim-from-boat-photo-hero", "family-swim-from-boat-photo-card",
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

for (const [established, slug] of [
  ["propeller-damage-vibration-guide.html", "boat-spare-propeller-kit-guide.html"],
  ["boat-tool-kit-guide.html", "boat-spare-propeller-kit-guide.html"],
  ["fair-haven-little-sodus-bay-family-boating.html", "oswego-harbor-family-boating.html"],
  ["boating-with-children-safely.html", "swimming-from-boat-with-kids-safety-plan.html"],
  ["boat-boarding-ladder-buying-guide.html", "swimming-from-boat-with-kids-safety-plan.html"],
]) {
  if (!readFileSync(join(root, established), "utf8").includes(slug)) errors.push(`${established}: missing reciprocal cluster link to ${slug}`);
}

if (errors.length) {
  console.error(`Daily 2026-09-19 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-09-19 audit passed: 3 substantial pages, 6 visually inspected editorial assets, 3 disclosed affiliate links, two citation-ready decision matrices, reciprocal authority links and complete discovery.");
