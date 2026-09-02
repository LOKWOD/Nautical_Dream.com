import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20260902 } from "../content/publication-2026-09-02.mjs";

const root = process.cwd();
const errors = [];
const expected = {
  "boat-dry-bag-waterproof-case-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/boat-dry-storage-photo-card.webp" },
  "cayuga-lake-state-park-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/cayuga-lake-state-park-photo-card.webp" },
  "boating-in-fog-restricted-visibility.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/boat-fog-response-photo-card.webp" },
};
if (publication20260902.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20260902.length}`);
const newTitles = new Set();
const newSlugs = new Set();
const allHtml = readdirSync(root).filter((file) => file.endsWith(".html"));
for (const page of publication20260902) {
  if (newSlugs.has(page.slug)) errors.push(`duplicate source slug ${page.slug}`);
  if (newTitles.has(page.title.toLowerCase())) errors.push(`duplicate source title ${page.title}`);
  newSlugs.add(page.slug); newTitles.add(page.title.toLowerCase());
  const file = join(root, page.slug);
  if (!existsSync(file)) { errors.push(`missing generated page ${page.slug}`); continue; }
  const html = readFileSync(file, "utf8");
  const words = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
  if (words < 1300) errors.push(`${page.slug}: only ${words} rendered words`);
  if (!html.includes(`https://nauticaldream.com/${page.slug}`)) errors.push(`${page.slug}: missing canonical URL`);
  if (!/FAQPage/.test(html) || !/twitter:card/.test(html)) errors.push(`${page.slug}: missing schema/social metadata`);
  if ((html.match(/<section class="article-section"/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 sections`);
  if ((html.match(/<aside class="related-content"/g) || []).length !== 1) errors.push(`${page.slug}: related module count is not 1`);
  if ((html.match(/<a href="[^"]+\.html"/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 internal links`);
  const active = (html.match(/data-affiliate-active="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: expected ${expected[page.slug].affiliate} affiliate links, found ${active}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: missing Amazon disclosure`);
  const hub = readFileSync(join(root, expected[page.slug].hub), "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: missing hub/card discovery`);
  const titleCount = allHtml.reduce((count, name) => count + ((readFileSync(join(root, name), "utf8").match(new RegExp(`<h1[^>]*>${page.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h1>`, "g")) || []).length), 0);
  if (titleCount !== 1) errors.push(`${page.slug}: rendered h1/title collision count ${titleCount}`);
}

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const photoKeys = ["boat-dry-storage-photo-hero", "boat-dry-storage-photo-card", "cayuga-lake-state-park-photo-hero", "cayuga-lake-state-park-photo-card", "boat-fog-response-photo-hero", "boat-fog-response-photo-card"];
for (const key of photoKeys) {
  const record = attribution[key];
  if (!record || !existsSync(join(root, record.localPath))) errors.push(`missing credited visual ${key}`);
  if (/cayuga/.test(key) && (record?.creator !== "Cayuga Outrigger" || !record?.license?.startsWith("CC BY 2.0") || !record?.sourceUrl?.includes("Cayuga_Lake_State_Park.jpg"))) errors.push(`${key}: incorrect exact-place license record`);
  if (!/cayuga/.test(key) && record?.license !== "Original AI-assisted editorial image") errors.push(`${key}: incorrect editorial-image license record`);
  if (record?.width !== (/card/.test(key) ? 1200 : 1600) || record?.height !== 900) errors.push(`${key}: incorrect dimensions in manifest`);
}
const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
for (const slug of newSlugs) {
  const count = sitemap.split(`https://nauticaldream.com/${slug}`).length - 1;
  if (count !== 1) errors.push(`${slug}: sitemap count ${count}`);
}
const home = readFileSync(join(root, "index.html"), "utf8");
for (const slug of newSlugs) if (!home.includes(slug)) errors.push(`${slug}: missing homepage discovery`);
for (const page of publication20260902) {
  const html = readFileSync(join(root, page.slug), "utf8");
  if (/\.svg|diagram|chart/i.test(page.hero.key) || /\.svg|diagram|chart/i.test(html.match(/og:image[^>]+/i)?.[0] || "")) errors.push(`${page.slug}: non-photographic hero detected`);
}

if (errors.length) {
  console.error(`Daily 2026-09-02 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-09-02 audit passed: 3 substantial pages, 6 photographic assets, 3 disclosed affiliate links, exact-place licensing and complete discovery.");
