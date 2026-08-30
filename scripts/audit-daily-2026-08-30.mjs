import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260830 } from "../content/publication-2026-08-30.mjs";

const root = process.cwd();
const errors = [];
const expected = {
  "boat-anchor-rode-buying-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/anchor-rode-photo-card.webp" },
  "fair-haven-little-sodus-bay-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/fair-haven-harbor-card.webp" },
  "marine-carbon-monoxide-alarm-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/marine-co-alarm-photo-card.webp" },
};
if (publication20260830.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20260830.length}`);
const titles = new Set();
const slugs = new Set();
for (const page of publication20260830) {
  if (slugs.has(page.slug)) errors.push(`duplicate slug ${page.slug}`);
  if (titles.has(page.title.toLowerCase())) errors.push(`duplicate title ${page.title}`);
  slugs.add(page.slug); titles.add(page.title.toLowerCase());
  const file = join(root, page.slug);
  if (!existsSync(file)) { errors.push(`missing generated page ${page.slug}`); continue; }
  const html = readFileSync(file, "utf8");
  const words = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
  if (words < 1600) errors.push(`${page.slug}: only ${words} rendered words`);
  if (!html.includes(`https://nauticaldream.com/${page.slug}`)) errors.push(`${page.slug}: missing canonical URL`);
  if (!/FAQPage/.test(html) || !/twitter:card/.test(html)) errors.push(`${page.slug}: missing schema/social metadata`);
  if ((html.match(/<section class="article-section"/g) || []).length < 8) errors.push(`${page.slug}: fewer than 8 sections`);
  if ((html.match(/<aside class="related-content"/g) || []).length !== 1) errors.push(`${page.slug}: related module count is not 1`);
  const active = (html.match(/data-affiliate-active="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: expected ${expected[page.slug].affiliate} affiliate links, found ${active}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: missing affiliate disclosure`);
  const hub = readFileSync(join(root, expected[page.slug].hub), "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: missing hub/card discovery`);
}
const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const illustrations = ["anchor-rode-system", "anchor-rode-card", "fair-haven-family-plan", "fair-haven-family-card", "marine-co-defense", "marine-co-card"];
const generatedPhotos = ["anchor-rode-photo-hero", "anchor-rode-photo-card", "marine-co-alarm-photo-hero", "marine-co-alarm-photo-card"];
const publicDomainPhotos = ["fair-haven-harbor-hero", "fair-haven-harbor-card"];
for (const key of [...illustrations, ...generatedPhotos, ...publicDomainPhotos]) {
  const record = attribution[key];
  if (!record || !existsSync(join(root, record.localPath))) errors.push(`missing credited visual ${key}`);
  if (illustrations.includes(key) && record?.license !== "Original editorial illustration") errors.push(`${key}: unexpected illustration license record`);
  if (generatedPhotos.includes(key) && record?.license !== "Original AI-assisted editorial image") errors.push(`${key}: unexpected generated-photo license record`);
  if (publicDomainPhotos.includes(key) && (record?.license !== "Public domain" || !record?.sourceUrl?.includes("dvidshub.net/image/6320062"))) errors.push(`${key}: unexpected public-domain source record`);
}
const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
for (const slug of slugs) {
  const count = sitemap.split(`https://nauticaldream.com/${slug}`).length - 1;
  if (count !== 1) errors.push(`${slug}: sitemap count ${count}`);
}
const home = readFileSync(join(root, "index.html"), "utf8");
for (const slug of slugs) if (!home.includes(slug)) errors.push(`${slug}: missing homepage discovery`);

if (errors.length) {
  console.error(`Daily 2026-08-30 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-08-30 audit passed: 3 substantial pages, 6 photographic discovery assets, 6 in-article diagrams, 6 disclosed affiliate links, and complete discovery.");
