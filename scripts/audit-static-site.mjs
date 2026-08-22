import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { authorityHubs } from "../content/authority-batch.mjs";
import { authorityHubsTwo } from "../content/authority-batch-two.mjs";
import { destinations } from "../content/destinations.mjs";
import { productGuides } from "../content/product-guides.mjs";
import { journalFeatures } from "../content/journal-features.mjs";
import { resourceFeatures } from "../content/resource-features.mjs";
import { publication20260821 } from "../content/publication-2026-08-21.mjs";
import { publication20260822 } from "../content/publication-2026-08-22.mjs";

const allAuthorityHubs = [...authorityHubs, ...authorityHubsTwo];

const root = process.cwd();
const htmlFiles = readdirSync(root).filter((file) => file.endsWith(".html"));
const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const problems = [];
const checkedAssets = new Set();
const seenTitles = new Map();
const seenCanonicals = new Map();
const authorityPages = new Map();
const authoritySlugs = new Set();
for (const hub of allAuthorityHubs) {
  if (authoritySlugs.has(hub.slug)) problems.push(`authority catalog: duplicate slug ${hub.slug}`);
  authoritySlugs.add(hub.slug);
  authorityPages.set(hub.slug, { kind: "hub", hub });
  for (const article of hub.articles) {
    if (authoritySlugs.has(article[0])) problems.push(`authority catalog: duplicate slug ${article[0]}`);
    authoritySlugs.add(article[0]);
    authorityPages.set(article[0], { kind: "article", hub });
  }
}
authorityPages.set("boating-library.html", { kind: "index" });
const existingEditorial = [...destinations, ...productGuides, ...journalFeatures, ...resourceFeatures];
const sourceSlugs = new Set([...authorityPages.keys(), ...existingEditorial.map((page) => page.slug)]);
const sourceTitles = new Set([
  ...[...authorityPages.values()].flatMap((entry) => entry.hub?.title ? [entry.hub.title.toLowerCase()] : []),
  ...allAuthorityHubs.flatMap((hub) => hub.articles.map((article) => article[1].toLowerCase())),
  ...existingEditorial.map((page) => page.title.toLowerCase()),
]);
if (publication20260821.length !== 2) problems.push(`2026-08-21 publication: expected exactly 2 pages; found ${publication20260821.length}`);
for (const page of publication20260821) {
  if (sourceSlugs.has(page.slug)) problems.push(`2026-08-21 publication: duplicate existing slug ${page.slug}`);
  if (sourceTitles.has(page.title.toLowerCase())) problems.push(`2026-08-21 publication: duplicate existing title ${page.title}`);
  sourceSlugs.add(page.slug);
  sourceTitles.add(page.title.toLowerCase());
}
if (publication20260822.length !== 2) problems.push(`2026-08-22 publication: expected exactly 2 pages; found ${publication20260822.length}`);
for (const page of publication20260822) {
  if (sourceSlugs.has(page.slug)) problems.push(`2026-08-22 publication: duplicate existing slug ${page.slug}`);
  if (sourceTitles.has(page.title.toLowerCase())) problems.push(`2026-08-22 publication: duplicate existing title ${page.title}`);
  sourceSlugs.add(page.slug);
  sourceTitles.add(page.title.toLowerCase());
}
const dailyPublications = [...publication20260821, ...publication20260822];
const seenDescriptions = new Map();
const editorialGroups = {
  destinations: {
    files: ["lake-george-guide.html", "thousand-islands-guide.html", "finger-lakes-guide.html", "lake-champlain-guide.html", "lake-winnipesaukee-guide.html", "newport-rhode-island-guide.html", "cape-cod-guide.html", "chesapeake-bay-guide.html", "erie-canal-guide.html"],
    minimumWords: 1200,
    maximumWords: 2500,
  },
  products: {
    files: ["best-chartplotters.html", "best-boat-coolers.html", "best-life-jackets.html"],
    minimumWords: 2000,
    maximumWords: 4000,
  },
  journal: {
    files: ["classic-runabouts.html", "chartplotter-needs.html", "dock-box-essentials.html", "end-of-season-checklist.html", "great-family-boat.html", "waterfront-escape.html", "weather.html", "guide.html"],
    minimumWords: 1500,
    maximumWords: 3000,
  },
};
const editorialRules = new Map(Object.values(editorialGroups).flatMap((group) => group.files.map((file) => [file, group])));
const retiredGeneratedArtwork = [
  "assets/cape-cod.webp",
  "assets/chesapeake-bay.webp",
  "assets/erie-canal.webp",
  "assets/lake-champlain.webp",
  "assets/lake-winnipesaukee.webp",
  "assets/newport-rhode-island.webp",
  "assets/cape-cod.svg",
  "assets/chesapeake-bay.svg",
  "assets/erie-canal.svg",
  "assets/finger-lakes.svg",
  "assets/lake-champlain.svg",
  "assets/lake-george.svg",
  "assets/lake-winnipesaukee.svg",
  "assets/newport-rhode-island.svg",
  "assets/thousand-islands.svg",
];
const retiredAuthorityPassages = [
  "This guide focuses on the decisions that remain useful after a product cycle",
  "The first mistake is allowing arrival pressure to make the decision",
  "Choose the option that still makes sense after adding installation, maintenance, storage, training and failure recovery",
];

function plainText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(html) {
  const text = plainText(html);
  return text ? text.split(" ").length : 0;
}

function localPath(rawValue) {
  const value = rawValue.trim().replaceAll("&quot;", '"').replaceAll("&#39;", "'").replace(/^['"]|['"]$/g, "");
  if (!value || value === "#") return value === "#" ? "#" : null;
  if (/^(?:[a-z]+:|\/\/)/i.test(value)) return null;

  const clean = value.split("#")[0].split("?")[0];
  if (!clean) return null;
  return normalize(clean.replace(/^\//, ""));
}

function hasValidImageSignature(path) {
  const data = readFileSync(path);
  const extension = extname(path).toLowerCase();

  if (extension === ".jpg" || extension === ".jpeg") {
    return data.length > 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  }
  if (extension === ".png") {
    return data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (extension === ".webp") {
    return data.length > 12 && data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP";
  }
  if (extension === ".svg") {
    return data.toString("utf8").includes("<svg");
  }
  return true;
}

for (const htmlFile of htmlFiles) {
  const html = readFileSync(join(root, htmlFile), "utf8");
  const references = [
    ...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi),
    ...html.matchAll(/url\(([^)]+)\)/gi),
  ];

  for (const match of references) {
    const relative = localPath(match[1]);
    if (relative === "#") {
      problems.push(`${htmlFile}: dead placeholder link href="#"`);
      continue;
    }
    if (!relative || relative.startsWith("..")) continue;

    const target = join(root, relative);
    if (!existsSync(target)) {
      problems.push(`${htmlFile}: missing local target ${relative}`);
      continue;
    }

    if (/\.(?:jpe?g|png|webp|svg)$/i.test(relative) && !checkedAssets.has(relative)) {
      checkedAssets.add(relative);
      if (!hasValidImageSignature(target)) {
        problems.push(`${htmlFile}: ${relative} does not contain valid ${extname(relative)} image data`);
      }
    }
  }

  if (/\bundefined\b/i.test(html)) {
    problems.push(`${htmlFile}: contains the literal value "undefined"`);
  }

  for (const retiredImage of retiredGeneratedArtwork) {
    if (html.includes(retiredImage)) problems.push(`${htmlFile}: still references retired generated artwork ${retiredImage}`);
  }

  const externalImage = html.match(/<img\b[^>]*\bsrc=["']https?:\/\//i);
  if (externalImage) problems.push(`${htmlFile}: display image is externally hotlinked`);

  const emptyAlts = [...html.matchAll(/<img\b[^>]*\balt=["']\s*["'][^>]*>/gi)].length;
  const imagesWithoutAlt = [...html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)].length;
  if (emptyAlts || imagesWithoutAlt) {
    problems.push(`${htmlFile}: image alt-text failure (${emptyAlts} empty, ${imagesWithoutAlt} missing)`);
  }

  if (htmlFile !== "thanks.html") {
    if (!/<meta\s+name=["']description["']/i.test(html)) problems.push(`${htmlFile}: missing meta description`);
    if (!/<link\s+rel=["']canonical["']/i.test(html)) problems.push(`${htmlFile}: missing canonical URL`);
    if (!/<meta\s+property=["']og:title["']/i.test(html)) problems.push(`${htmlFile}: missing Open Graph title`);
    if (!/<meta\s+property=["']og:description["']/i.test(html)) problems.push(`${htmlFile}: missing Open Graph description`);
    if (!/<meta\s+property=["']og:url["']/i.test(html)) problems.push(`${htmlFile}: missing Open Graph URL`);
    if ((html.match(/<h1\b/gi) || []).length !== 1) problems.push(`${htmlFile}: must contain exactly one h1`);
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g, " ").trim();
    if (!title) problems.push(`${htmlFile}: missing title element`);
    else if (seenTitles.has(title)) problems.push(`${htmlFile}: duplicates title element from ${seenTitles.get(title)}`);
    else seenTitles.set(title, htmlFile);
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=(["'])(.*?)\1/i)?.[2];
    if (canonical) {
      if (seenCanonicals.has(canonical)) problems.push(`${htmlFile}: duplicates canonical URL from ${seenCanonicals.get(canonical)}`);
      else seenCanonicals.set(canonical, htmlFile);
    }
    const publicUrl = htmlFile === "index.html" ? "https://nauticaldream.com/" : `https://nauticaldream.com/${htmlFile}`;
    if (!sitemap.includes(publicUrl)) problems.push(`${htmlFile}: missing from sitemap.xml`);
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=(["'])(.*?)\1/i);
    const description = descriptionMatch?.[2];
    if (description) {
      if (seenDescriptions.has(description)) problems.push(`${htmlFile}: duplicates meta description from ${seenDescriptions.get(description)}`);
      else seenDescriptions.set(description, htmlFile);
    }
  }

  const authority = authorityPages.get(htmlFile);
  if (authority) {
    const words = wordCount(html);
    const minimum = authority.kind === "article" ? 1700 : authority.kind === "hub" ? 900 : 180;
    const maximum = authority.kind === "article" ? 2600 : authority.kind === "hub" ? 1400 : 2500;
    if (words < minimum) problems.push(`${htmlFile}: ${words} words; authority ${authority.kind} requires at least ${minimum}`);
    if (words > maximum) problems.push(`${htmlFile}: ${words} words; authority ${authority.kind} maximum is ${maximum}`);
    if (!/application\/ld\+json/i.test(html)) problems.push(`${htmlFile}: authority page missing structured data`);
    if (authority.kind === "article") {
      if (!html.includes(`href="${authority.hub.slug}"`)) problems.push(`${htmlFile}: missing backlink to ${authority.hub.slug}`);
      const requiredModules = [
        ["authority-table", "decision table"],
        ["authority-steps", "field procedure"],
        ["warning-list", "failure modes"],
        ["authority-checklist", "field checklist"],
        ["source-box", "primary-source box"],
        ["related-content", "related-content navigation"],
      ];
      for (const [marker, label] of requiredModules) {
        if (!html.includes(marker)) problems.push(`${htmlFile}: missing ${label}`);
      }
      const sectionCount = [...html.matchAll(/<section\s+class="article-section"/g)].length;
      if (sectionCount < 8) problems.push(`${htmlFile}: only ${sectionCount} detailed sections; expected at least 8`);
      const faqCount = [...html.matchAll(/<details>/g)].length;
      if (faqCount < 4) problems.push(`${htmlFile}: only ${faqCount} FAQs; expected at least 4`);
      for (const passage of retiredAuthorityPassages) {
        if (html.includes(passage)) problems.push(`${htmlFile}: still contains retired generic authority copy`);
      }
    }
  }

  const rule = editorialRules.get(htmlFile);
  if (rule) {
    const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || "";
    const words = wordCount(article);
    if (words < rule.minimumWords || words > rule.maximumWords) {
      problems.push(`${htmlFile}: ${words} editorial words; expected ${rule.minimumWords}-${rule.maximumWords}`);
    }

    const inlineImages = [...article.matchAll(/<img\b/gi)].length;
    const requiredInlineImages = Math.max(3, Math.ceil(words / 500) - 1);
    if (inlineImages < requiredInlineImages) {
      problems.push(`${htmlFile}: ${inlineImages} inline images; needs at least ${requiredInlineImages} for ${words} words plus the hero`);
    }

    if (!/<meta\s+property=["']og:image["']/i.test(html)) problems.push(`${htmlFile}: missing Open Graph image`);
    if (!/application\/ld\+json/i.test(html) || !/FAQPage/.test(html)) problems.push(`${htmlFile}: missing Article/FAQ structured data`);
    if (!/class=["']related-content["']/.test(html)) problems.push(`${htmlFile}: missing related-content block`);

    const related = html.match(/<aside\s+class=["']related-content["'][^>]*>([\s\S]*?)<\/aside>/i)?.[1] || "";
    const relatedLinks = [...related.matchAll(/<a\s+href=/gi)].length;
    if (relatedLinks !== 9 || !/Related stories/.test(related) || !/Destinations/.test(related) || !/Buying guides/.test(related)) {
      problems.push(`${htmlFile}: related content must include 3 stories, 3 destinations and 3 buying guides`);
    }

    if (editorialGroups.journal.files.includes(htmlFile) && !/class=["'](?:pull-quote|editor-note)["']/.test(html)) {
      problems.push(`${htmlFile}: Journal feature needs a pull quote or editorial callout`);
    }
  }

  const dailyPage = dailyPublications.find((page) => page.slug === htmlFile);
  if (dailyPage) {
    const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || "";
    const words = wordCount(article);
    if (words < 1600 || words > 3400) problems.push(`${htmlFile}: ${words} publication words; expected 1600-3400`);
    if ((html.match(/<section\s+class="article-section"/g) || []).length < 8) problems.push(`${htmlFile}: publication needs at least 8 detailed sections`);
    if ((html.match(/<details>/g) || []).length < 4) problems.push(`${htmlFile}: publication needs at least 4 FAQs`);
    if (!/application\/ld\+json/i.test(html) || !/FAQPage/.test(html)) problems.push(`${htmlFile}: publication missing Article/FAQ structured data`);
    if (!/<meta\s+name=["']twitter:card["']/i.test(html)) problems.push(`${htmlFile}: missing Twitter card metadata`);
    if (!/class=["']source-box["']/.test(html)) problems.push(`${htmlFile}: publication missing primary-source box`);
    if ((html.match(/static\.cloudflareinsights\.com\/beacon\.min\.js/g) || []).length !== 1) problems.push(`${htmlFile}: publication must contain exactly one Cloudflare analytics beacon`);
    if ((html.match(/lokwod-visitor-beacon\.syracuseappraiser\.workers\.dev\/beacon\.js/g) || []).length !== 1) problems.push(`${htmlFile}: publication must contain exactly one visitor beacon`);
    const related = html.match(/<aside\s+class=["']related-content["'][^>]*>([\s\S]*?)<\/aside>/i)?.[1] || "";
    if ((related.match(/<a\s+href=/gi) || []).length !== 9) problems.push(`${htmlFile}: publication related module must contain exactly 9 links`);
    const internalLinks = [...article.matchAll(/<a\s+[^>]*href=["']([^"']+\.html)["']/gi)].map((match) => match[1]);
    if (new Set(internalLinks).size < 3) problems.push(`${htmlFile}: publication needs at least 3 distinct internal links`);
    const heroPaths = {
      "marine-binoculars-lookout": "assets/editorial/marine-binoculars-lookout.jpg",
      "skaneateles-boat-garages": "assets/editorial/skaneateles-boat-garages.jpg",
      "throwable-flotation-lifebelt": "assets/editorial/throwable-flotation-lifebelt.jpg",
      "oneida-lake-sylvan-beach": "assets/editorial/oneida-lake-sylvan-beach.jpg",
    };
    const heroPath = heroPaths[dailyPage.hero.key];
    if (!heroPath) problems.push(`${htmlFile}: publication hero is not registered in the audit`);
    for (const other of htmlFiles) {
      if (other === htmlFile) continue;
      if (readFileSync(join(root, other), "utf8").includes(heroPath)) problems.push(`${htmlFile}: hero image is reused by ${other}`);
    }
    if (htmlFile === "marine-binoculars-buying-guide.html") {
      const activeLinks = (html.match(/data-affiliate-active="true"/g) || []).length;
      if (activeLinks < 5) problems.push(`${htmlFile}: expected at least 5 active affiliate links; found ${activeLinks}`);
      if (!/As an Amazon Associate/i.test(html)) problems.push(`${htmlFile}: missing Amazon Associate disclosure`);
      for (const match of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) {
        const rel = match[1].match(/\brel="([^"]*)"/i)?.[1] || "";
        if (!/\bsponsored\b/i.test(rel) || !/\bnofollow\b/i.test(rel) || !/\bnoopener\b/i.test(rel)) {
          problems.push(`${htmlFile}: commercial link missing sponsored/nofollow/noopener`);
        }
      }
    }
    if (htmlFile === "boat-throwable-flotation-device-guide.html") {
      const activeLinks = (html.match(/data-affiliate-active="true"/g) || []).length;
      if (activeLinks < 5) problems.push(`${htmlFile}: expected at least 5 active affiliate links; found ${activeLinks}`);
      if (!/As an Amazon Associate/i.test(html)) problems.push(`${htmlFile}: missing Amazon Associate disclosure`);
      for (const match of html.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi)) {
        const rel = match[1].match(/\brel="([^"]*)"/i)?.[1] || "";
        if (!/\bsponsored\b/i.test(rel) || !/\bnofollow\b/i.test(rel) || !/\bnoopener\b/i.test(rel)) {
          problems.push(`${htmlFile}: commercial link missing sponsored/nofollow/noopener`);
        }
      }
    }
  }
}

for (const match of sitemap.matchAll(/<loc>https:\/\/nauticaldream\.com\/(.*?)<\/loc>/g)) {
  const sitemapPath = match[1];
  if (sitemapPath && !existsSync(join(root, sitemapPath))) problems.push(`sitemap.xml: missing target ${sitemapPath}`);
}

if (problems.length) {
  console.error(`Static site audit failed with ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Static site audit passed: ${htmlFiles.length} HTML pages, ${editorialRules.size} long-form editorial thresholds and ${checkedAssets.size} unique image assets checked.`);
