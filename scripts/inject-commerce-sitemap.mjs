import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.argv[2] || ".");
const sitemapPath = resolve(root, "sitemap.xml");
const lastmod = "2026-08-18";
const commercePages = [
  { file: "best-boat-winterization-gear.html", priority: "0.9" },
  { file: "best-boat-trailer-accessories.html", priority: "0.9" },
  { file: "snowbird-boat-trailering-guide.html", priority: "0.8" },
];

if (!existsSync(sitemapPath)) throw new Error("sitemap.xml not found");

let sitemap = readFileSync(sitemapPath, "utf8");
let added = 0;

for (const page of commercePages) {
  const filePath = resolve(root, page.file);
  if (!existsSync(filePath)) throw new Error(`Commerce page missing: ${page.file}`);
  const loc = `https://nauticaldream.com/${page.file}`;
  if (sitemap.includes(`<loc>${loc}</loc>`)) continue;
  const entry = `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${page.priority}</priority></url>\n`;
  if (!sitemap.includes("</urlset>")) throw new Error("sitemap.xml is missing </urlset>");
  sitemap = sitemap.replace("</urlset>", `${entry}</urlset>`);
  added += 1;
}

writeFileSync(sitemapPath, sitemap);
console.log(`Commerce sitemap injection complete: ${added} URL${added === 1 ? "" : "s"} added.`);
