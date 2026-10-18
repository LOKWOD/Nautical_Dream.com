import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const date = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) throw new Error("Pass inventory date YYYY-MM-DD");
const clean = s => (s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const rows = readdirSync(".").filter(f => f.endsWith(".html")).sort().map(slug => {
  const html = readFileSync(slug, "utf8");
  return { slug, title: clean(html.match(/<title>(.*?)<\/title>/s)?.[1]), heading: clean(html.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1]), description: html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "", keywords: html.match(/<meta name="keywords" content="([^"]*)"/)?.[1] || "", angles: [...html.matchAll(/<h2\b[^>]*>(.*?)<\/h2>/gs)].map(m => clean(m[1])), images: [...html.matchAll(/<img\b[^>]*>/g)].map(m => ({src:m[0].match(/src="([^"]+)"/)?.[1],alt:m[0].match(/alt="([^"]*)"/)?.[1]})), backgroundImages: [...html.matchAll(/(?:--hero:url\('([^']+)'\)|url\(['"]?([^)'"\s]+)['"]?\))/g)].map(m=>m[1] || m[2]), commercialCategories: [...html.matchAll(/data-affiliate-product="([^"]+)"/g)].map(m=>m[1]) };
});
writeFileSync(`reports/inventory-${date}.json`, JSON.stringify({date,stage:"pre-publication",pageCount:rows.length,pages:rows},null,2)+"\n");
console.log(`Inventoried ${rows.length} pages: titles, slugs, descriptions/search intent, explicit keywords, section angles, image associations and commercial categories.`);
