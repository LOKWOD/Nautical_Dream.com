import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] || ".");
const origin = "https://nauticaldream.com";
const files = readdirSync(root).filter((file) => file.endsWith(".html")).sort();
const problems = [];
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
const inbound = new Map(files.map((file) => [file, 0]));
const paragraphs = new Map();
const indexable = [];
let images = 0;
let articleSchemas = 0;
let breadcrumbSchemas = 0;

const decode = (value = "") => String(value).replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const strip = (value = "") => decode(String(value).replace(/<[^>]+>/g, " ").replace(/&[a-z0-9#]+;/gi, " ").replace(/\s+/g, " ").trim());
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"))?.[2] || "");
const expectedCanonical = (file) => file === "index.html" ? `${origin}/` : `${origin}/${file}`;

function collectSchema(node, out = []) {
  if (Array.isArray(node)) for (const item of node) collectSchema(item, out);
  else if (node && typeof node === "object") {
    if (node["@type"]) out.push(node);
    if (node["@graph"]) collectSchema(node["@graph"], out);
  }
  return out;
}

for (const file of files) {
  const html = readFileSync(join(root, file), "utf8");
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  if (!noindex) indexable.push(file);

  const title = strip(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
  if (!title) problems.push(`${file}: missing title`);
  else {
    if (title.length < 30 || title.length > 65) problems.push(`${file}: title length ${title.length}`);
    if (titles.has(title)) problems.push(`${file}: duplicate title from ${titles.get(title)}`);
    titles.set(title, file);
  }

  const description = attr(html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] || "", "content");
  if (!description && !noindex) problems.push(`${file}: missing description`);
  else if (description) {
    if (description.length < 110 || description.length > 165) problems.push(`${file}: description length ${description.length}`);
    if (descriptions.has(description)) problems.push(`${file}: duplicate description from ${descriptions.get(description)}`);
    descriptions.set(description, file);
  }

  const canonical = attr(html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] || "", "href");
  if (!canonical && !noindex) problems.push(`${file}: missing canonical`);
  else if (canonical) {
    if (canonical !== expectedCanonical(file)) problems.push(`${file}: canonical is ${canonical}`);
    if (canonicals.has(canonical)) problems.push(`${file}: duplicate canonical from ${canonicals.get(canonical)}`);
    canonicals.set(canonical, file);
  }

  if ((html.match(/<h1\b/gi) || []).length !== 1) problems.push(`${file}: requires exactly one h1`);
  for (const property of ["og:title","og:description","og:url","og:image","og:image:width","og:image:height"]) {
    if (!new RegExp(`<meta\\b[^>]*property=["']${property}["']`, "i").test(html)) problems.push(`${file}: missing ${property}`);
  }
  for (const name of ["twitter:card","twitter:title","twitter:description","twitter:image"]) {
    if (!new RegExp(`<meta\\b[^>]*name=["']${name}["']`, "i").test(html)) problems.push(`${file}: missing ${name}`);
  }
  if (!/<link\b[^>]*rel=["']alternate["'][^>]*application\/rss\+xml/i.test(html)) problems.push(`${file}: missing RSS discovery`);
  if (!/<link\b[^>]*rel=["']manifest["']/i.test(html)) problems.push(`${file}: missing web manifest`);
  if (!noindex && file !== "index.html" && !/<nav\b[^>]*class=["'][^"']*\bseo-breadcrumbs\b[^"']*["'][^>]*aria-label=["']Breadcrumb["']/i.test(html)) problems.push(`${file}: missing visible breadcrumbs`);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    images += 1;
    const tag = match[0];
    if (!/\balt\s*=/.test(tag) || !attr(tag, "alt").trim()) problems.push(`${file}: image missing alt text`);
    if (!/\bwidth\s*=/.test(tag) || !/\bheight\s*=/.test(tag)) problems.push(`${file}: image missing dimensions`);
    if (!/\bdecoding=["']async["']/i.test(tag)) problems.push(`${file}: image missing async decoding`);
  }

  let hasBreadcrumb = false;
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      for (const schema of collectSchema(JSON.parse(match[1]))) {
        const types = Array.isArray(schema["@type"]) ? schema["@type"] : [schema["@type"]];
        if (types.includes("BreadcrumbList")) { hasBreadcrumb = true; breadcrumbSchemas += 1; }
        if (types.some((type) => ["Article","NewsArticle","BlogPosting","TechArticle"].includes(type))) {
          articleSchemas += 1;
          const required = ["headline","description","image","datePublished","dateModified","author","publisher","mainEntityOfPage","url","inLanguage"];
          const missing = required.filter((key) => !schema[key]);
          if (missing.length) problems.push(`${file}: Article schema missing ${missing.join(", ")}`);
        }
      }
    } catch (error) { problems.push(`${file}: invalid JSON-LD (${error.message})`); }
  }
  if (!noindex && file !== "index.html" && !hasBreadcrumb) problems.push(`${file}: missing BreadcrumbList schema`);

  for (const match of html.matchAll(/<a\b[^>]*href=(["'])(.*?)\1[^>]*>/gi)) {
    const href = decode(match[2]).trim();
    if (href === "#") { problems.push(`${file}: dead placeholder link`); continue; }
    if (!href || /^(?:https?:|mailto:|tel:|javascript:|\/\/)/i.test(href)) continue;
    const clean = href.split(/[?#]/)[0];
    if (!clean) continue;
    let target = normalize(join(dirname(file), clean.replace(/^\//, "")));
    if (target === "." || target === "") target = "index.html";
    if (target.endsWith("/")) target += "index.html";
    if (!existsSync(join(root, target))) problems.push(`${file}: broken local target ${href}`);
    if (inbound.has(target) && target !== file) inbound.set(target, inbound.get(target) + 1);
  }

  for (const match of html.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const text = strip(match[2]);
    if (text.split(/\s+/).length < 18) continue;
    if (!paragraphs.has(text)) paragraphs.set(text, new Set());
    paragraphs.get(text).add(file);
  }

  for (const retired of [
    "Next, remove the part of the plan that depends on the unknown.",
    "Preserve daylight and an alternate whenever the work moves away from the home dock.",
    "Another common mistake is measuring success only by whether the boat returned or the component worked once.",
  ]) if (html.includes(retired)) problems.push(`${file}: retired generic authority copy remains`);
}

for (const [file, count] of inbound) {
  if (count === 0 && !["index.html","thanks.html"].includes(file)) problems.push(`${file}: no incoming internal link`);
}

for (const [text, pageSet] of paragraphs) {
  if (pageSet.size < 20) continue;
  if (/affiliate disclosure|paid links|manufacturer instructions take priority/i.test(text)) continue;
  problems.push(`boilerplate paragraph repeated on ${pageSet.size} pages: ${text.slice(0, 100)}…`);
}

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const sitemapEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
  loc: decode(match[1].match(/<loc>(.*?)<\/loc>/)?.[1] || ""),
  lastmod: match[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1] || "",
}));
const expectedUrls = new Set(indexable.map(expectedCanonical));
const actualUrls = new Set(sitemapEntries.map((entry) => entry.loc));
for (const url of expectedUrls) if (!actualUrls.has(url)) problems.push(`sitemap missing ${url}`);
for (const url of actualUrls) if (!expectedUrls.has(url)) problems.push(`sitemap contains non-indexable ${url}`);
for (const entry of sitemapEntries) if (!/^20\d{2}-\d{2}-\d{2}$/.test(entry.lastmod)) problems.push(`sitemap entry missing valid lastmod: ${entry.loc}`);

for (const required of ["feed.xml","llms.txt","humans.txt","site.webmanifest","robots.txt","sitemap.xml"]) {
  if (!existsSync(join(root, required))) problems.push(`missing discovery file ${required}`);
}
if (!readFileSync(join(root, "feed.xml"), "utf8").includes("<rss version=\"2.0\">")) problems.push("feed.xml is not RSS 2.0");
if ((readFileSync(join(root, "llms.txt"), "utf8").match(/^- \[/gm) || []).length < indexable.length - 10) problems.push("llms.txt does not contain the complete index");

if (problems.length) {
  console.error(`SEO audit failed with ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`SEO audit passed: ${files.length} HTML pages, ${indexable.length} indexable URLs, ${articleSchemas} complete article schemas, ${breadcrumbSchemas} breadcrumb schemas and ${images} dimensioned images.`);
