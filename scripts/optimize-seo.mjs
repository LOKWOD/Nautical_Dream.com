import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { authorityHubs } from "../content/authority-batch.mjs";
import { authorityHubsTwo } from "../content/authority-batch-two.mjs";

const root = resolve(process.argv[2] || ".");
const origin = "https://nauticaldream.com";
const today = "2026-09-04";
const allAuthorityHubs = [...authorityHubs, ...authorityHubsTwo];
const articleParent = new Map();
const hubFiles = new Set();
for (const hub of allAuthorityHubs) {
  hubFiles.add(hub.slug);
  for (const article of hub.articles) articleParent.set(article[0], { file: hub.slug, label: hub.label });
}

const titleOverrides = {
  "anchoring.html": "Boat Anchoring Guide | Nautical Dream",
  "boat-buying.html": "Boat Buying Guide for New Owners | Nautical Dream",
  "boat-covers.html": "Boat Cover Selection and Care | Nautical Dream",
  "boat-ramps.html": "Boat Ramp Launching Guide | Nautical Dream",
  "boat-storage.html": "Boat Storage Planning Guide | Nautical Dream",
  "contact.html": "Contact the Nautical Dream Editorial Team",
  "docking.html": "Boat Docking Techniques and Guides | Nautical Dream",
  "marinas.html": "Marina Selection and Planning Guide | Nautical Dream",
  "boat-maintenance-schedule.html": "Recreational Boat Maintenance Schedule | Nautical Dream",
  "installing-boat-accessories.html": "Installing Boat Accessories Without Leaks | Nautical Dream",
  "lake-george-boat-launches.html": "Lake George Boat Launch Planning | Nautical Dream",
  "lake-george-navigation-hazards.html": "Lake George Navigation Hazards | Nautical Dream",
  "marina-contract-questions.html": "Questions Before Signing a Marina Contract | Nautical Dream",
  "sterndrive-bellows-inspection.html": "Sterndrive Bellows Inspection Guide | Nautical Dream",
  "thousand-islands-current-navigation.html": "Thousand Islands Current and Navigation | Nautical Dream",
  "vhf-distress-call-practice.html": "VHF Distress-Call Practice Guide | Nautical Dream",
};

const decode = (value = "") => String(value)
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");
const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");
const xml = (value = "") => esc(value).replaceAll("'", "&apos;");
const strip = (value = "") => decode(String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"))?.[2] || "");
const canonicalFor = (file) => file === "index.html" ? `${origin}/` : `${origin}/${file}`;
const localAsset = (url) => {
  if (!url) return null;
  let value = decode(url).split(/[?#]/)[0];
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.origin !== origin) return null;
      value = parsed.pathname;
    } catch { return null; }
  }
  if (/^(?:data:|\/\/|[a-z]+:)/i.test(value)) return null;
  return normalize(value.replace(/^\//, ""));
};
const dateFromText = (html) => {
  const raw = html.match(/Updated\s+([A-Z][a-z]+\s+\d{1,2},\s+20\d{2})/i)?.[1];
  if (!raw) return null;
  const date = new Date(`${raw} 12:00:00 UTC`);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString().slice(0, 10);
};

function imageDimensions(path) {
  if (!existsSync(path)) return null;
  const extension = extname(path).toLowerCase();
  const data = readFileSync(path);
  if (extension === ".png" && data.length >= 24) return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  if ([".jpg", ".jpeg"].includes(extension)) {
    let offset = 2;
    while (offset + 9 < data.length) {
      if (data[offset] !== 0xff) { offset += 1; continue; }
      const marker = data[offset + 1];
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
        return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) };
      }
      if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
      const length = data.readUInt16BE(offset + 2);
      if (!length) break;
      offset += 2 + length;
    }
  }
  if (extension === ".webp" && data.length >= 30 && data.subarray(0, 4).toString() === "RIFF") {
    const kind = data.subarray(12, 16).toString();
    if (kind === "VP8X") return { width: 1 + data.readUIntLE(24, 3), height: 1 + data.readUIntLE(27, 3) };
    if (kind === "VP8 " && data.length >= 30) return { width: data.readUInt16LE(26) & 0x3fff, height: data.readUInt16LE(28) & 0x3fff };
    if (kind === "VP8L" && data.length >= 25) {
      const b1 = data[21], b2 = data[22], b3 = data[23], b4 = data[24];
      return { width: 1 + (b1 | ((b2 & 0x3f) << 8)), height: 1 + ((b2 >> 6) | (b3 << 2) | ((b4 & 0x0f) << 10)) };
    }
  }
  if (extension === ".svg") {
    const source = data.toString("utf8").slice(0, 4096);
    const svg = source.match(/<svg\b[^>]*>/i)?.[0] || "";
    const width = Number.parseFloat(attr(svg, "width"));
    const height = Number.parseFloat(attr(svg, "height"));
    if (width > 0 && height > 0) return { width: Math.round(width), height: Math.round(height) };
    const viewBox = attr(svg, "viewBox").trim().split(/[ ,]+/).map(Number);
    if (viewBox.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) return { width: Math.round(viewBox[2]), height: Math.round(viewBox[3]) };
  }
  return null;
}

function optimizeDescription(value) {
  let description = decode(value).replace(/\s+/g, " ").trim();
  if (description.length < 110) description += " Practical checks, failure points and current-source guidance help recreational boaters make a safer decision.";
  if (description.length > 165) {
    const clipped = description.slice(0, 161);
    description = `${clipped.slice(0, Math.max(clipped.lastIndexOf(" "), 145)).replace(/[,:;\s]+$/, "")}.`;
  }
  return description;
}

function upsertMeta(html, keyType, key, content) {
  const pattern = new RegExp(`<meta\\b[^>]*\\b${keyType}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i");
  const tag = `<meta ${keyType}="${key}" content="${esc(content)}">`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `${tag}</head>`);
}

function upsertLink(html, rel, attributes) {
  const pattern = new RegExp(`<link\\b[^>]*\\brel=["']${rel}["'][^>]*>`, "i");
  const tag = `<link rel="${rel}" ${attributes}>`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `${tag}</head>`);
}

function existingSitemapDates() {
  const map = new Map();
  const path = join(root, "sitemap.xml");
  if (!existsSync(path)) return map;
  const sitemap = readFileSync(path, "utf8");
  for (const match of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const location = match[1].match(/<loc>(.*?)<\/loc>/)?.[1];
    const modified = match[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
    if (location && modified) map.set(decode(location), modified);
  }
  return map;
}

function editorialTeamPage() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nautical Dream Editorial Team and Standards</title>
<meta name="description" content="Meet the Nautical Dream editorial desk and learn how boating guides are researched, sourced, reviewed, corrected and kept commercially independent.">
<link rel="canonical" href="${origin}/editorial-team.html"><link rel="stylesheet" href="styles.css">
<meta property="og:type" content="profile"><meta property="og:site_name" content="Nautical Dream"><meta property="og:title" content="Nautical Dream Editorial Team and Standards"><meta property="og:description" content="How Nautical Dream researches, verifies, reviews and corrects practical boating guidance."><meta property="og:url" content="${origin}/editorial-team.html"><meta property="og:image" content="${origin}/assets/editorial/lake-george-cruise.jpg">
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Organization","@id":`${origin}/editorial-team.html#desk`,name:"Nautical Dream Editorial Desk",url:`${origin}/editorial-team.html`,parentOrganization:{"@type":"Organization","@id":`${origin}/#organization`,name:"Nautical Dream",url:`${origin}/`},email:"info@nauticaldream.com"})}</script></head>
<body><header class="site-header"><div class="shell nav"><a class="brand" href="index.html">NAUTICAL <span>DREAM</span></a><nav class="links" aria-label="Primary navigation"><a href="destinations.html">Destinations</a><a href="gear.html">Gear</a><a href="weather.html">Weather</a><a href="journal.html">Journal</a><a href="about.html">About</a></nav></div></header><main>
<section class="article-hero" style="--hero:url('assets/editorial/lake-george-cruise.jpg')"><div class="shell"><div class="eyebrow">Reader trust</div><h1>Nautical Dream Editorial Desk</h1><p>The research, sourcing and review standards behind our boating guidance.</p></div></section>
<section class="section"><article class="shell article"><p class="lede">Nautical Dream publishes decision-oriented boating guidance for recreational boaters, families and owners. The editorial desk is an organizational byline: it identifies work produced and maintained under the standards below, without inventing personal credentials or pretending that general guidance replaces a qualified local professional.</p>
<section class="article-section"><h2>How a guide is built</h2><p>Each guide begins with a real decision: whether a destination fits the boat and crew, which equipment solves a defined onboard job, or how to prepare for a maneuver, maintenance task or emergency. Research starts with current primary sources such as the U.S. Coast Guard, NOAA, the National Weather Service, state agencies, facility operators and manufacturer documentation.</p><p>Editors separate durable operating principles from details that can change. Regulations, launch status, prices, navigation notices, weather and product specifications are dated or linked to the current source. Destination articles distinguish verified facts from planning recommendations, and buying guides evaluate system fit, installation, maintenance and failure behavior rather than treating a commission rate as evidence of quality.</p></section>
<section class="article-section"><h2>Safety review and limitations</h2><p>Safety-related material is checked for conservative sequencing: protect people first, stabilize the boat, communicate early and preserve a simple fallback. Articles point readers to official regulations and manuals because vessel configuration, local rules and conditions on the day can change the correct action.</p><p>Nautical Dream does not claim that an editorial article substitutes for hands-on instruction, a current chart, manufacturer service information, a marine surveyor, a qualified technician or the judgment of the vessel's captain. When the evidence is incomplete, our standard is to simplify the plan rather than fill the gap with confidence.</p></section>
<section class="article-section"><h2>Commercial independence</h2><p>Some equipment guides contain clearly marked affiliate links. A purchase may produce a commission at no additional cost to the reader, but paid access, supplied products and commission rates do not determine conclusions. Commercial links use sponsored and nofollow attributes, and destination recommendations are not converted into undisclosed advertisements.</p></section>
<section class="article-section"><h2>Images, corrections and updates</h2><p>Photography is stored locally and credited on the <a href="image-credits.html">image credits page</a>. Licensed and public-domain sources are recorded so imagery can be audited. Generated diagrams may explain a system, but they are not presented as documentary photographs of a real product or destination.</p><p>Readers can report an outdated operating detail, incorrect specification, broken source or safety concern through the <a href="contact.html">contact page</a>. Material safety corrections receive priority. Seasonal access, price and schedule details are rechecked during scheduled updates, and significant revisions receive a new modification date.</p></section>
<aside class="editor-note"><strong>Need to verify something?</strong><p>Include the article URL, the disputed detail and the current primary source. That gives the editorial desk enough information to reproduce the check and correct the record.</p></aside>
<aside class="related-content"><h2>Editorial resources</h2><p>Review the complete policy, source library and latest reporting.</p><div class="related-grid"><section><h3>Standards</h3><ul><li><a href="privacy.html">Privacy, disclosures and corrections</a></li><li><a href="about.html">About Nautical Dream</a></li><li><a href="contact.html">Contact the desk</a></li></ul></section><section><h3>Research</h3><ul><li><a href="boating-library.html">Boating resource library</a></li><li><a href="image-credits.html">Image credits</a></li><li><a href="weather.html">Marine weather desk</a></li></ul></section><section><h3>Latest work</h3><ul><li><a href="journal.html">Journal</a></li><li><a href="destinations.html">Destinations</a></li><li><a href="gear.html">Gear guides</a></li></ul></section></div></aside></article></section></main>
<footer class="footer"><div class="shell footer-row"><div><div class="brand">NAUTICAL <span>DREAM</span></div><p>Practical planning and trusted recommendations for life on the water.</p></div><div class="legal">© 2026 Nautical Dream · <a href="privacy.html">Privacy &amp; Disclosure</a> · <a href="contact.html">Contact</a></div></div></footer></body></html>\n`;
}

writeFileSync(join(root, "editorial-team.html"), editorialTeamPage());

const sitemapDates = existingSitemapDates();
const indexLinkSets = new Map();
for (const [file, label] of [["destinations.html","Destinations"],["gear.html","Gear"],["journal.html","Journal"]]) {
  const html = existsSync(join(root, file)) ? readFileSync(join(root, file), "utf8") : "";
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
  const links = new Set([...main.matchAll(/href=["']([^"']+\.html)["']/gi)].map((match) => normalize(match[1])));
  indexLinkSets.set(label, links);
}

function breadcrumbFor(file, title) {
  if (file === "index.html") return [];
  const parent = articleParent.get(file);
  if (parent) return [{ label: "Home", file: "index.html" }, { label: parent.label, file: parent.file }, { label: title }];
  if (hubFiles.has(file)) return [{ label: "Home", file: "index.html" }, { label: "Boating Library", file: "boating-library.html" }, { label: title }];
  for (const [label, links] of indexLinkSets) if (links.has(file)) return [{ label: "Home", file: "index.html" }, { label, file: `${label.toLowerCase()}.html` }, { label: title }];
  return [{ label: "Home", file: "index.html" }, { label: title }];
}

function addOrphanIndex() {
  const libraryPath = join(root, "boating-library.html");
  if (!existsSync(libraryPath)) return;
  let library = readFileSync(libraryPath, "utf8").replace(/<section\b[^>]*data-seo-orphan-index[^>]*>[\s\S]*?<\/section>/i, "");
  writeFileSync(libraryPath, library);
  const files = readdirSync(root).filter((file) => file.endsWith(".html"));
  const inbound = new Map(files.map((file) => [file, 0]));
  for (const source of files) {
    const html = readFileSync(join(root, source), "utf8");
    for (const match of html.matchAll(/href=["']([^"']+\.html)(?:[?#][^"']*)?["']/gi)) {
      const target = normalize(join(dirname(source), match[1]));
      if (inbound.has(target) && target !== source) inbound.set(target, inbound.get(target) + 1);
    }
  }
  const ignored = new Set(["index.html", "thanks.html", "editorial-team.html"]);
  const orphans = [...inbound].filter(([file, count]) => count === 0 && !ignored.has(file)).map(([file]) => file).sort();
  if (!orphans.length) return;
  const cards = orphans.map((file) => {
    const html = readFileSync(join(root, file), "utf8");
    const title = strip(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || file);
    const description = attr(html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] || "", "content");
    return `<article class="hub-card"><span>MORE PRACTICAL GUIDANCE</span><h3><a href="${file}">${esc(title)}</a></h3><p>${esc(description)}</p><a class="text-link" href="${file}">Read the guide →</a></article>`;
  }).join("");
  const section = `<section class="section" data-seo-orphan-index><div class="shell"><div class="section-head"><div><div class="eyebrow" style="color:var(--blue)">More from the desk</div><h2>Practical guides worth finding.</h2></div><p>Additional checklists and field guides connected to the complete boating library.</p></div><div class="hub-grid">${cards}</div></div></section>`;
  library = readFileSync(libraryPath, "utf8").replace("</main>", `${section}</main>`);
  writeFileSync(libraryPath, library);
}

addOrphanIndex();

const imageCache = new Map();
const pageRecords = [];
const missingImageDimensions = [];
const files = readdirSync(root).filter((file) => file.endsWith(".html")).sort();

for (const file of files) {
  const path = join(root, file);
  let html = readFileSync(path, "utf8");
  const canonical = canonicalFor(file);
  const h1 = strip(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "Nautical Dream");
  html = html.replaceAll(
    "Schedules, rules, prices and operating seasons change. Confirm the details that affect your trip directly with these primary sources:",
    `For ${esc(h1)}, schedules, rules, prices and operating seasons can change. Confirm the details that affect this trip directly with the primary sources below:`,
  );
  const currentTitle = strip(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || h1);
  const title = titleOverrides[file] || currentTitle;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);

  const descriptionTag = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] || "";
  const description = optimizeDescription(attr(descriptionTag, "content") || h1);
  html = upsertMeta(html, "name", "description", description);
  html = upsertMeta(html, "property", "og:site_name", "Nautical Dream");
  html = upsertMeta(html, "property", "og:title", title.replace(/\s+\|\s+Nautical Dream$/, ""));
  html = upsertMeta(html, "property", "og:description", description);
  html = upsertMeta(html, "property", "og:url", canonical);

  let imageUrl = attr(html.match(/<meta\b[^>]*property=["']og:image["'][^>]*>/i)?.[0] || "", "content");
  if (!imageUrl) {
    const hero = html.match(/--hero\s*:\s*url\(\s*(["']?)([^)'"\s]+)\1\s*\)/i)?.[2];
    const firstImage = attr(html.match(/<img\b[^>]*>/i)?.[0] || "", "src");
    const selected = localAsset(hero || firstImage) || "assets/boldt-castle-heart-island.jpg";
    imageUrl = `${origin}/${selected}`;
  }
  html = upsertMeta(html, "property", "og:image", imageUrl);
  html = upsertMeta(html, "name", "twitter:card", "summary_large_image");
  html = upsertMeta(html, "name", "twitter:title", title.replace(/\s+\|\s+Nautical Dream$/, ""));
  html = upsertMeta(html, "name", "twitter:description", description);
  html = upsertMeta(html, "name", "twitter:image", imageUrl);
  html = upsertLink(html, "alternate", `type="application/rss+xml" title="Nautical Dream RSS" href="feed.xml"`);
  html = upsertLink(html, "manifest", `href="site.webmanifest"`);

  const imagePath = localAsset(imageUrl);
  const socialDimensions = imagePath ? (imageCache.get(imagePath) || imageDimensions(join(root, imagePath))) : null;
  if (imagePath && socialDimensions) imageCache.set(imagePath, socialDimensions);
  if (socialDimensions) {
    html = upsertMeta(html, "property", "og:image:width", String(socialDimensions.width));
    html = upsertMeta(html, "property", "og:image:height", String(socialDimensions.height));
  }

  const modified = dateFromText(html) || sitemapDates.get(canonical) || (file === "editorial-team.html" ? today : "2026-08-05");
  let breadcrumbSeen = false;
  const crumbs = breadcrumbFor(file, h1);
  html = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (whole, source) => {
    try {
      const data = JSON.parse(source);
      const types = Array.isArray(data["@type"]) ? data["@type"] : [data["@type"]];
      if (types.includes("BreadcrumbList")) {
        breadcrumbSeen = true;
        if (!crumbs.length) return "";
        data.itemListElement = crumbs.map((crumb, index) => ({"@type":"ListItem",position:index + 1,name:crumb.label,...(crumb.file ? {item:canonicalFor(crumb.file)} : {})}));
      }
      if (types.some((type) => ["Article","NewsArticle","BlogPosting","TechArticle"].includes(type))) {
        data.headline = h1;
        data.description = description;
        data.image = imageUrl;
        data.datePublished ||= modified;
        data.dateModified = modified;
        data.author = {"@type":"Organization","@id":`${origin}/editorial-team.html#desk`,name:"Nautical Dream Editorial Desk",url:`${origin}/editorial-team.html`};
        data.publisher = {"@type":"Organization","@id":`${origin}/#organization`,name:"Nautical Dream",url:`${origin}/`};
        data.mainEntityOfPage = {"@type":"WebPage","@id":canonical};
        data.url = canonical;
        data.inLanguage = "en-US";
      }
      if (types.includes("WebSite")) {
        data["@id"] = `${origin}/#website`;
        data.publisher = {"@id":`${origin}/#organization`};
        data.inLanguage = "en-US";
      }
      return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
    } catch { return whole; }
  });
  if (crumbs.length && !breadcrumbSeen) {
    const data = {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:crumbs.map((crumb,index)=>({"@type":"ListItem",position:index+1,name:crumb.label,...(crumb.file?{item:canonicalFor(crumb.file)}:{})}))};
    html = html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(data)}</script></head>`);
  }

  html = html.replace(/<nav\b[^>]*class=["'][^"']*\bseo-breadcrumbs\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/gi, "");
  if (crumbs.length) {
    const visible = `<nav class="seo-breadcrumbs shell" aria-label="Breadcrumb">${crumbs.map((crumb,index)=>crumb.file ? `<a href="${crumb.file}">${esc(crumb.label)}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${esc(crumb.label)}</span>`).join("")}</nav>`;
    html = html.replace(/<main(\b[^>]*)>/i, (match) => `${match}${visible}`);
  }
  html = html.replace(/By\s+Nautical Dream Editorial Desk/g, `By <a href="editorial-team.html" rel="author">Nautical Dream Editorial Desk</a>`);

  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const source = localAsset(attr(tag, "src"));
    if (!source) return tag;
    let dimensions = imageCache.get(source);
    if (!dimensions) {
      dimensions = imageDimensions(join(root, source));
      if (dimensions) imageCache.set(source, dimensions);
    }
    if (!dimensions) { missingImageDimensions.push(`${file}: ${source}`); return tag; }
    let next = tag;
    if (!/\bwidth\s*=/i.test(next)) next = next.replace(/>$/, ` width="${dimensions.width}">`);
    if (!/\bheight\s*=/i.test(next)) next = next.replace(/>$/, ` height="${dimensions.height}">`);
    if (!/\bdecoding\s*=/i.test(next)) next = next.replace(/>$/, ` decoding="async">`);
    return next;
  });

  html = html.replaceAll("#667781", "#596b75").replaceAll("#77858c", "#5c6e78").replaceAll("#74838b", "#5c6e78");
  writeFileSync(path, html);
  pageRecords.push({ file, canonical, title, h1, description, imageUrl, modified, noindex: /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html), article: /"@type"\s*:\s*(?:"(?:Article|NewsArticle|BlogPosting|TechArticle)"|\[[^\]]*"Article")/.test(html) });
}

let css = readFileSync(join(root, "styles.css"), "utf8");
css = css.replaceAll("#667781", "#596b75").replaceAll("#77858c", "#5c6e78").replaceAll("#74838b", "#5c6e78");
const seoCss = `.seo-breadcrumbs{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding-top:16px;padding-bottom:16px;font-size:14px;line-height:1.5;color:#5c6e78}.seo-breadcrumbs a{color:#0e6f91;text-decoration:underline;text-underline-offset:3px}.seo-breadcrumbs [aria-current="page"]{font-weight:700;color:#455963}.article-meta a{color:#0e6f91;text-decoration:underline;text-underline-offset:3px}`;
if (!css.includes(".seo-breadcrumbs{")) css += `\n${seoCss}\n`;
writeFileSync(join(root, "styles.css"), css);

if (missingImageDimensions.length) throw new Error(`Could not determine image dimensions:\n${missingImageDimensions.join("\n")}`);

const indexable = pageRecords.filter((page) => !page.noindex);
const priorityFor = (page) => page.file === "index.html" ? "1.0" : ["destinations.html","gear.html","journal.html","weather.html","boating-library.html"].includes(page.file) ? "0.9" : page.article ? "0.8" : "0.6";
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((page)=>`  <url><loc>${xml(page.canonical)}</loc><lastmod>${page.modified}</lastmod><changefreq>${page.file === "index.html" ? "weekly" : "monthly"}</changefreq><priority>${priorityFor(page)}</priority></url>`).join("\n")}\n</urlset>\n`;
writeFileSync(join(root, "sitemap.xml"), sitemap);

const latest = indexable.filter((page) => page.article).sort((a,b)=>b.modified.localeCompare(a.modified) || a.title.localeCompare(b.title)).slice(0, 30);
const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Nautical Dream</title><link>${origin}/</link><description>Practical boating destinations, gear guidance and field-tested planning.</description><language>en-us</language><lastBuildDate>${new Date(`${today}T16:00:00Z`).toUTCString()}</lastBuildDate>${latest.map((page)=>`<item><title>${xml(page.h1)}</title><link>${xml(page.canonical)}</link><guid isPermaLink="true">${xml(page.canonical)}</guid><pubDate>${new Date(`${page.modified}T12:00:00Z`).toUTCString()}</pubDate><description>${xml(page.description)}</description></item>`).join("")}</channel></rss>\n`;
writeFileSync(join(root, "feed.xml"), feed);

const llms = `# Nautical Dream\n\n> Practical, independently edited boating guidance for destinations, ownership, safety, maintenance and marine equipment.\n\n## Main sections\n\n- [Home](${origin}/): Latest destination, gear and editorial guidance.\n- [Boating library](${origin}/boating-library.html): Complete topic and field-guide index.\n- [Destinations](${origin}/destinations.html): Northeast and coastal boating destinations.\n- [Gear](${origin}/gear.html): Equipment and buying guidance.\n- [Journal](${origin}/journal.html): Long-form reporting and seasonal planning.\n- [Editorial standards](${origin}/editorial-team.html): Research, sourcing and corrections.\n\n## Complete index\n\n${indexable.filter((page)=>!["index.html","boating-library.html","destinations.html","gear.html","journal.html"].includes(page.file)).map((page)=>`- [${page.h1}](${page.canonical}): ${page.description}`).join("\n")}\n`;
writeFileSync(join(root, "llms.txt"), llms);
writeFileSync(join(root, "humans.txt"), `Nautical Dream\nEditorial: Nautical Dream Editorial Desk\nStandards: ${origin}/editorial-team.html\nCorrections: info@nauticaldream.com\nLast updated: ${today}\n`);
writeFileSync(join(root, "site.webmanifest"), JSON.stringify({name:"Nautical Dream",short_name:"Nautical Dream",description:"Practical boating destinations, gear guidance and field planning.",start_url:"/",display:"standalone",background_color:"#f8fafb",theme_color:"#061722",lang:"en-US"}, null, 2) + "\n");

console.log(`SEO optimization complete: ${files.length} HTML pages, ${indexable.length} indexable URLs, ${imageCache.size} measured image assets and ${latest.length} RSS items.`);
