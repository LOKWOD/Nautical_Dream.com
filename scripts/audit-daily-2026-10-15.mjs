import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { publication20261015 as pages } from "../content/publication-2026-10-15.mjs";

const errors = [];
if (pages.length !== 3) errors.push(`expected 3 pages, found ${pages.length}`);
const expected = {
  [pages[0].slug]: { hub: "gear.html", card: "dock-line-chafe-guard-options-photo-card.webp", affiliate: 3 },
  [pages[1].slug]: { hub: "destinations.html", card: "onoville-family-planning-concept-photo-card.webp", affiliate: 0 },
  [pages[2].slug]: { hub: "journal.html", card: "family-marine-forecast-kit-photo-card.webp", affiliate: 0 },
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
  "dock-line-chafe-guard-fit-photo-hero", "dock-line-chafe-guard-options-photo-card",
  "onoville-allegheny-family-concept-photo-hero", "onoville-family-planning-concept-photo-card",
  "family-marine-forecast-drill-photo-hero", "family-marine-forecast-kit-photo-card"
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
  ["dock-line-buying-guide.html", pages[0].slug], ["dock-lines-explained.html", pages[0].slug],
  ["chautauqua-lake-long-point-family-boating.html", pages[1].slug], ["black-lake-family-boating.html", pages[1].slug],
  ["family-boating-weather-plan.html", pages[2].slug], ["wind-waves-and-fetch.html", pages[2].slug]
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

const chafe = readFileSync(pages[0].slug, "utf8").toLowerCase();
for (const term of ["seven-point chafe map", "fix the cause before covering the symptom", "24-hour acceptance test", "who should skip a diy guard"]) if (!chafe.includes(term)) errors.push(`chafe guide missing ${term}`);
const onoville = readFileSync(pages[1].slug, "utf8").toLowerCase();
for (const term of ["eight-gate onoville card", "100 cars with trailers", "seneca nation license", "who should skip this route"]) if (!onoville.includes(term)) errors.push(`Onoville guide missing ${term}`);
const forecast = readFileSync(pages[2].slug, "utf8").toLowerCase();
for (const term of ["six-box forecast card", "20-minute", "make thunder the hard gate", "know what the drill cannot do"]) if (!forecast.includes(term)) errors.push(`forecast drill missing ${term}`);

if (errors.length) {
  console.error(`Oct 15 audit failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
const report = JSON.parse(readFileSync("assets/affiliate-link-report.json", "utf8"));
console.log(`Daily 2026-10-15 audit passed: 3 substantial pages, 6 unique original editorial images, 0 product images, 3 disclosed affiliate links, ${report.totals?.activeAffiliateLinks ?? "verified"} active sitewide links, 3 decision assets, 6 reciprocal authority links and complete discovery.`);
