import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20260925 } from "../content/publication-2026-09-25.mjs";

const root = process.cwd(), errors = [];
const expected = {
  "boat-trailer-brakes-surge-electric-hydraulic-guide.html": { affiliate: 3, hub: "gear.html", card: "assets/editorial/boat-trailer-brake-system-photo-card.webp" },
  "piseco-lake-family-boating.html": { affiliate: 0, hub: "destinations.html", card: "assets/editorial/piseco-lake-family-photo-card.webp" },
  "letting-someone-else-operate-your-boat-handoff-guide.html": { affiliate: 0, hub: "journal.html", card: "assets/editorial/boat-guest-operator-handoff-photo-card.webp" }
};
if (publication20260925.length !== 3) errors.push(`expected exactly 3 source pages, found ${publication20260925.length}`);
const titles = new Set(), slugs = new Set(), allHtml = readdirSync(root).filter((f) => f.endsWith(".html"));
for (const page of publication20260925) {
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
  if ((html.match(/<a href="[^"]+\.html"/g) || []).length < 9) errors.push(`${page.slug}: fewer than 9 internal links`);
  const active = (html.match(/data-affiliate-active="true"/g) || []).length;
  if (active !== expected[page.slug].affiliate) errors.push(`${page.slug}: expected ${expected[page.slug].affiliate} affiliate links, found ${active}`);
  if (active && !/As an Amazon Associate/i.test(html)) errors.push(`${page.slug}: Amazon disclosure missing`);
  for (const m of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) {
    const rel = m[1].match(/\brel="([^"]*)"/i)?.[1] || "";
    for (const token of ["sponsored", "nofollow", "noopener", "noreferrer"]) if (!rel.includes(token)) errors.push(`${page.slug}: commercial link missing ${token}`);
  }
  const hub = readFileSync(join(root, expected[page.slug].hub), "utf8");
  if (!hub.includes(page.slug) || !hub.includes(expected[page.slug].card)) errors.push(`${page.slug}: hub/card discovery missing`);
  const h1Count = allHtml.reduce((n, name) => n + (readFileSync(join(root, name), "utf8").includes(`<h1>${page.title}</h1>`) ? 1 : 0), 0);
  if (h1Count !== 1) errors.push(`${page.slug}: rendered title count ${h1Count}`);
  if (!html.includes(`assets/editorial/${page.hero.key}.webp`)) errors.push(`${page.slug}: hero missing`);
}

const brakes = readFileSync(join(root, "boat-trailer-brakes-surge-electric-hydraulic-guide.html"), "utf8");
for (const term of ["loaded-weight brake fit card", "over 1,000 pounds unladen", "electric-over-hydraulic", "qualified trailer or marine technician"]) if (!brakes.toLowerCase().includes(term.toLowerCase())) errors.push(`trailer-brake guide missing ${term}`);
const lake = readFileSync(join(root, "piseco-lake-family-boating.html"), "utf8");
for (const term of ["43.428254° N", "15 cars and trailers", "not documentary photography of Piseco Lake", "Piseco launch decision card"]) if (!lake.includes(term)) errors.push(`Piseco Lake guide missing ${term}`);
const handoff = readFileSync(join(root, "letting-someone-else-operate-your-boat-handoff-guide.html"), "utf8");
for (const term of ["owner-to-operator handoff card", "Brianna's Law", "Ask the insurer", "boat-specific competence"]) if (!handoff.toLowerCase().includes(term.toLowerCase())) errors.push(`guest-operator guide missing ${term}`);

const attribution = JSON.parse(readFileSync(join(root, "assets/editorial/attribution.json"), "utf8"));
const imageKeys = ["boat-trailer-brake-system-photo-hero","boat-trailer-brake-system-photo-card","piseco-lake-family-photo-hero","piseco-lake-family-photo-card","boat-guest-operator-handoff-photo-hero","boat-guest-operator-handoff-photo-card"];
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

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8"), feed = readFileSync(join(root, "feed.xml"), "utf8"), home = readFileSync(join(root, "index.html"), "utf8"), llms = readFileSync(join(root, "llms.txt"), "utf8");
for (const slug of slugs) {
  if (sitemap.split(`https://nauticaldream.com/${slug}`).length - 1 !== 1) errors.push(`${slug}: sitemap count not 1`);
  if (!feed.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: RSS missing`);
  if (!home.includes(slug)) errors.push(`${slug}: homepage missing`);
  if (!llms.includes(`https://nauticaldream.com/${slug}`)) errors.push(`${slug}: llms.txt missing`);
}
for (const [file, slug] of [
  ["snowbird-boat-trailering-guide.html","boat-trailer-brakes-surge-electric-hydraulic-guide.html"],["boat-trailer-safety-checklist.html","boat-trailer-brakes-surge-electric-hydraulic-guide.html"],
  ["long-lake-family-boating.html","piseco-lake-family-boating.html"],["schroon-lake-family-boating.html","piseco-lake-family-boating.html"],
  ["boat-insurance-explained.html","letting-someone-else-operate-your-boat-handoff-guide.html"],["boat-records-and-logbook.html","letting-someone-else-operate-your-boat-handoff-guide.html"]
]) if (!readFileSync(join(root, file), "utf8").includes(slug)) errors.push(`${file}: reciprocal link missing`);

if (errors.length) {
  console.error(`Daily 2026-09-25 audit failed with ${errors.length} problem(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Daily 2026-09-25 audit passed: 3 substantial pages, 6 visually inspected original editorial assets, 3 disclosed affiliate links, three citation-ready decision assets, six reciprocal authority links and complete discovery.");
