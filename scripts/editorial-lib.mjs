import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const imageManifest = JSON.parse(readFileSync(join(root, "assets", "editorial", "attribution.json"), "utf8"));

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

function imageData(image) {
  if (!image) return null;
  const stored = image.src ? {} : imageManifest[image.key] || {};
  return {
    src: image.src || stored.localPath,
    alt: image.alt,
    caption: image.caption,
    sourceUrl: image.sourceUrl || stored.sourceUrl,
    creator: image.creator || stored.creator,
    license: image.license || stored.license,
  };
}

function figure(image) {
  const data = imageData(image);
  if (!data?.src) return "";
  const credit = data.sourceUrl
    ? ` <span class="photo-credit">Photo: <a href="${esc(data.sourceUrl)}" target="_blank" rel="noopener">${esc(data.creator || "source")}</a>${data.license ? ` · ${esc(data.license)}` : ""}</span>`
    : "";
  return `<figure class="article-figure"><img src="${esc(data.src)}" alt="${esc(data.alt)}" loading="lazy" decoding="async"><figcaption>${esc(data.caption || data.alt)}${credit}</figcaption></figure>`;
}

function relatedColumn(title, items) {
  return `<section><h3>${esc(title)}</h3><ul>${items.map(([href, label]) => `<li><a href="${esc(href)}">${esc(label)}</a></li>`).join("")}</ul></section>`;
}

function relatedBlock(related) {
  return `<aside class="related-content" aria-labelledby="related-heading"><h2 id="related-heading">Keep exploring</h2><p>The best trips happen when route, equipment and seamanship are planned together.</p><div class="related-grid">${relatedColumn("Related stories", related.journal)}${relatedColumn("Destinations", related.destinations)}${relatedColumn("Buying guides", related.guides)}</div></aside>`;
}

function faqMarkup(faqs = []) {
  if (!faqs.length) return "";
  return `<section class="faq-section"><h2>Frequently asked questions</h2>${faqs.map(({ question, answer }) => `<details><summary>${esc(question)}</summary><p>${answer}</p></details>`).join("")}</section>`;
}

function schemaMarkup(page, hero) {
  const schemaType = page.schemaType === "TravelGuide"
    ? ["Article", "TravelGuide"]
    : page.schemaType === "HowTo"
      ? ["Article", "HowTo"]
      : page.schemaType || "Article";
  const article = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: page.title,
    description: page.description,
    image: hero?.src ? `https://nauticaldream.com/${hero.src}` : undefined,
    datePublished: page.datePublished || "2026-08-05",
    dateModified: page.dateModified || "2026-08-05",
    author: { "@type": "Organization", name: "Nautical Dream Editorial Desk" },
    publisher: { "@type": "Organization", name: "Nautical Dream", url: "https://nauticaldream.com/" },
    mainEntityOfPage: `https://nauticaldream.com/${page.slug}`,
  };
  const schemas = [article];
  if (page.faqs?.length) schemas.push({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() },
    })),
  });
  return schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join("");
}

function header() {
  return `<header class="site-header"><div class="shell nav"><a class="brand" href="index.html">NAUTICAL <span>DREAM</span></a><nav class="links" aria-label="Primary navigation"><a href="destinations.html">Destinations</a><a href="gear.html">Gear</a><a href="weather.html">Weather</a><a href="journal.html">Journal</a><a href="about.html">About</a></nav></div></header>`;
}

function footer() {
  return `<footer class="footer"><div class="shell footer-row"><div><div class="brand">NAUTICAL <span>DREAM</span></div><p>Premium inspiration, practical planning and trusted recommendations for life on the water.</p></div><div class="legal">© 2026 Nautical Dream · <a href="privacy.html">Privacy &amp; Disclosure</a> · <a href="image-credits.html">Image Credits</a></div></div></footer>`;
}

export function renderPage(page) {
  const hero = imageData(page.hero);
  const modifiedDate = page.dateModified || "2026-08-05";
  const displayDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${modifiedDate}T00:00:00Z`));
  const sectionHtml = page.sections.map((section, index) => {
    const heading = `<h2>${section.heading}</h2>`;
    const pullQuote = section.pullQuote ? `<blockquote class="pull-quote">${section.pullQuote}</blockquote>` : "";
    const callout = section.callout ? `<aside class="editor-note" aria-label="${esc(section.callout.title)}"><strong>${esc(section.callout.title)}</strong>${section.callout.body}</aside>` : "";
    const media = section.image ? figure(section.image) : "";
    return `<section class="article-section" id="section-${index + 1}">${heading}${section.body}${pullQuote}${callout}${media}</section>`;
  }).join("");
  const facts = page.facts?.length
    ? `<div class="fact-grid">${page.facts.map(([label, value]) => `<div class="fact"><strong>${esc(label)}</strong>${value}</div>`).join("")}</div>`
    : "";
  const heroStyle = hero?.src ? ` style="--hero:url('${esc(hero.src)}')"` : "";
  const disclosure = page.disclosure ? `<p class="disclosure"><strong>Editorial disclosure:</strong> ${page.disclosure}</p>` : "";
  const sources = page.sources?.length
    ? `<aside class="source-box" aria-label="Primary sources"><h2>Plan with current information</h2><p>Schedules, rules, prices and operating seasons change. Confirm the details that affect your trip directly with these primary sources:</p><ul>${page.sources.map(([label, url]) => `<li><a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a></li>`).join("")}</ul></aside>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(page.seoTitle || `${page.title} | Nautical Dream`)}</title>
  <meta name="description" content="${esc(page.description)}">
  <link rel="canonical" href="https://nauticaldream.com/${esc(page.slug)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Nautical Dream">
  <meta property="og:title" content="${esc(page.ogTitle || page.title)}">
  <meta property="og:description" content="${esc(page.ogDescription || page.description)}">
  <meta property="og:url" content="https://nauticaldream.com/${esc(page.slug)}">
  ${hero?.src ? `<meta property="og:image" content="https://nauticaldream.com/${esc(hero.src)}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.ogTitle || page.title)}">
  <meta name="twitter:description" content="${esc(page.ogDescription || page.description)}">
  ${hero?.src ? `<meta name="twitter:image" content="https://nauticaldream.com/${esc(hero.src)}">` : ""}
  <link rel="stylesheet" href="styles.css">
  ${schemaMarkup(page, hero)}
</head>
<body>
${header()}
<main>
  <section class="article-hero"${heroStyle}><div class="shell"><div class="eyebrow">${esc(page.eyebrow)}</div><h1>${esc(page.title)}</h1><p>${esc(page.dek)}</p></div></section>
  <section class="section"><article class="shell article">
${disclosure}
    <div class="article-meta"><span>By Nautical Dream Editorial Desk</span><span>Updated ${esc(displayDate)}</span><span>${esc(page.readTime || "12 minute read")}</span></div>
    <p class="lede">${page.lede}</p>
${facts}
${sectionHtml}
${faqMarkup(page.faqs)}
${sources}
${relatedBlock(page.related)}
    <a class="back-link" href="${esc(page.backHref)}">← ${esc(page.backLabel)}</a>
  </article></section>
</main>
${footer()}
</body>
</html>\n`;
}
