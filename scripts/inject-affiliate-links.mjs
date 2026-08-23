import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const root = resolve(process.argv[2] || ".");
const configPath = resolve(root, process.env.AFFILIATE_CONFIG || "affiliate-config.json");
const skipDirectories = new Set([".git", "node_modules", ".wrangler", "_site"]);
const trackingScript = "assets/js/affiliate-tracking.js";
const disclosureStart = "<!-- Nautical Dream Affiliate Program Disclosure -->";
const disclosureEnd = "<!-- End Nautical Dream Affiliate Program Disclosure -->";
const disclosurePattern = /[ \t]*\r?\n?<!--\s*Nautical Dream Affiliate Program Disclosure\s*-->[\s\S]*?<!--\s*End Nautical Dream Affiliate Program Disclosure\s*-->[ \t]*\r?\n?/gi;
const trackingPattern = /\s*<script\b[^>]*\bsrc=["'](?:\.\/)?assets\/js\/affiliate-tracking\.js["'][^>]*>\s*<\/script>\s*/gi;

if (!existsSync(configPath)) {
  throw new Error(`Affiliate configuration not found: ${relative(root, configPath)}`);
}
if (!existsSync(resolve(root, trackingScript))) {
  throw new Error(`Affiliate tracking script not found: ${trackingScript}`);
}

const config = JSON.parse(readFileSync(configPath, "utf8"));
const amazon = config.amazon || {};
const associateTag = String(process.env.AMAZON_ASSOCIATE_TAG || amazon.associateTag || "").trim();
const amazonDomain = String(amazon.domain || "www.amazon.com").trim().toLowerCase();
const amazonEnabled = amazon.enabled !== false && Boolean(associateTag);
const eligibility = config.eligibility || {};
const filePatterns = (eligibility.filePatterns || ["^best-.*\\.html$", ".*-guide\\.html$"]).map(
  (pattern) => new RegExp(pattern, "i"),
);
const linkClasses = new Set(
  (eligibility.linkClasses || ["buy-button", "product-link", "affiliate-link"]).map((value) =>
    String(value).trim(),
  ),
);
const linkTextPattern = new RegExp(
  eligibility.linkTextPattern || "buy|shop|price|models?|packages?|product|check|view|find|see",
  "i",
);
const defaultLabel = String(config.defaults?.affiliateButtonLabel || "Check current price").trim();
const useAmazonFallback = config.defaults?.amazonSearchWhenNoDirectLink !== false;
const reportPath = resolve(root, config.reportPath || "assets/affiliate-link-report.json");
const overrides = Array.isArray(config.overrides) ? config.overrides : [];
const overrideByKey = new Map();
const overrideByUrl = new Map();

if (associateTag && !/^[A-Za-z0-9_-]{2,64}$/.test(associateTag)) {
  throw new Error("amazon.associateTag contains unsupported characters.");
}
if (!/^(?:www\.)?amazon\.[a-z.]+$/i.test(amazonDomain)) {
  throw new Error("amazon.domain must be an Amazon retail hostname, such as www.amazon.com.");
}

for (const item of overrides) {
  if (!item || typeof item !== "object") continue;
  if (item.key) overrideByKey.set(String(item.key), item);
  if (item.matchUrl) overrideByUrl.set(String(item.matchUrl), item);
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function decodeBasicEntities(value) {
  let decoded = String(value);
  for (let pass = 0; pass < 32; pass += 1) {
    const next = decoded
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
}

function plainText(value) {
  return decodeBasicEntities(String(value).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return plainText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "product";
}

function getAttribute(attributes, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i");
  return attributes.match(pattern)?.[2] ?? "";
}

function setAttribute(attributes, name, value) {
  const rendered = `${name}="${escapeAttribute(value)}"`;
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i");
  if (pattern.test(attributes)) return attributes.replace(pattern, rendered);
  return `${attributes.trimEnd()} ${rendered}`;
}

function addRelTokens(attributes, tokens) {
  const current = getAttribute(attributes, "rel");
  const values = new Set(current.split(/\s+/).filter(Boolean).map((value) => value.toLowerCase()));
  for (const token of tokens) values.add(token);
  return setAttribute(attributes, "rel", [...values].join(" "));
}

function nearestHeading(html, offset, linkText) {
  const windowStart = Math.max(0, offset - 5000);
  const preceding = html.slice(windowStart, offset);
  const matches = [...preceding.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const heading = matches.length ? plainText(matches.at(-1)[2]) : "";
  if (heading && !/^(where to buy|recommended products?|shop|buy now|quick links?)$/i.test(heading)) {
    return heading;
  }
  return linkText || "Recommended boating product";
}

function isEligiblePage(fileName) {
  return filePatterns.some((pattern) => pattern.test(fileName));
}

function isCommercialAnchor(attributes, innerHtml) {
  const href = getAttribute(attributes, "href");
  if (!/^https?:\/\//i.test(href)) return false;
  const classNames = new Set(getAttribute(attributes, "class").split(/\s+/).filter(Boolean));
  const hasEligibleClass = [...classNames].some((name) => linkClasses.has(name));
  if (!hasEligibleClass) return false;
  return linkTextPattern.test(plainText(innerHtml));
}

function makeAmazonSearchUrl(product) {
  const url = new URL(`https://${amazonDomain}/s`);
  url.searchParams.set("k", product);
  url.searchParams.set("tag", associateTag);
  return url.toString();
}

function normalizeDestination(value, label) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} is not a valid absolute URL.`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS.`);
  }
  return url.toString();
}

const report = {
  generatedAt: new Date().toISOString(),
  amazonConfigured: amazonEnabled,
  amazonAssociateTag: associateTag || null,
  totals: {
    eligiblePages: 0,
    commercialLinks: 0,
    activeAffiliateLinks: 0,
    directAffiliateLinks: 0,
    amazonAffiliateLinks: 0,
    fallbackLinks: 0,
    changedPages: 0,
  },
  links: [],
};

function processHtml(path) {
  const fileName = basename(path);
  if (!isEligiblePage(fileName)) return;

  const original = readFileSync(path, "utf8");
  report.totals.eligiblePages += 1;
  let working = original.replace(disclosurePattern, "").replace(trackingPattern, "\n");
  const keyCounts = new Map();
  let pageCommercialLinks = 0;
  let pageActiveLinks = 0;

  working = working.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (full, attributes, innerHtml, offset) => {
    if (!isCommercialAnchor(attributes, innerHtml)) return full;

    pageCommercialLinks += 1;
    report.totals.commercialLinks += 1;

    const visibleText = plainText(innerHtml);
    const currentHref = getAttribute(attributes, "href");
    // Stored HTML attributes are escaped. Decode before writing the value back
    // so repeated generation does not turn `&amp;` into `&amp;amp;`.
    const originalHref = decodeBasicEntities(
      getAttribute(attributes, "data-original-destination") || currentHref,
    );
    const product = decodeBasicEntities(
      getAttribute(attributes, "data-affiliate-product") || nearestHeading(working, offset, visibleText),
    );
    const keyBase = `${fileName}::${slugify(product)}`;
    const duplicateCount = (keyCounts.get(keyBase) || 0) + 1;
    keyCounts.set(keyBase, duplicateCount);
    const generatedKey = duplicateCount === 1 ? keyBase : `${keyBase}--${duplicateCount}`;
    const key = getAttribute(attributes, "data-affiliate-key") || generatedKey;
    const override = overrideByKey.get(key) || overrideByUrl.get(originalHref) || null;
    const overrideUrl = normalizeDestination(override?.url, `Affiliate override ${key}`);

    let active = false;
    let retailer = "Manufacturer";
    let destination = originalHref;
    let label = visibleText;
    let source = "fallback";

    if (overrideUrl) {
      active = true;
      destination = overrideUrl;
      retailer = String(override.retailer || new URL(overrideUrl).hostname).trim();
      label = String(override.label || defaultLabel).trim();
      source = "direct";
      report.totals.directAffiliateLinks += 1;
    } else if (amazonEnabled && useAmazonFallback) {
      active = true;
      destination = makeAmazonSearchUrl(product);
      retailer = "Amazon";
      label = defaultLabel;
      source = "amazon-search";
      report.totals.amazonAffiliateLinks += 1;
    } else {
      report.totals.fallbackLinks += 1;
    }

    if (active) {
      pageActiveLinks += 1;
      report.totals.activeAffiliateLinks += 1;
    }

    let nextAttributes = attributes;
    nextAttributes = setAttribute(nextAttributes, "href", destination);
    nextAttributes = setAttribute(nextAttributes, "target", "_blank");
    nextAttributes = setAttribute(nextAttributes, "data-commercial-link", "true");
    nextAttributes = setAttribute(nextAttributes, "data-affiliate-active", String(active));
    nextAttributes = setAttribute(nextAttributes, "data-affiliate-key", key);
    nextAttributes = setAttribute(nextAttributes, "data-affiliate-product", product);
    nextAttributes = setAttribute(nextAttributes, "data-affiliate-retailer", retailer);
    nextAttributes = setAttribute(nextAttributes, "data-original-destination", originalHref);
    nextAttributes = setAttribute(
      nextAttributes,
      "aria-label",
      active ? `${label} for ${product} at ${retailer}` : `${visibleText} for ${product}`,
    );
    nextAttributes = addRelTokens(nextAttributes, active
      ? ["sponsored", "nofollow", "noopener", "noreferrer"]
      : ["noopener", "noreferrer"]);

    report.links.push({
      page: fileName,
      key,
      product,
      visibleText,
      originalUrl: originalHref,
      destinationUrl: destination,
      retailer,
      active,
      source,
    });

    return `<a${nextAttributes}>${active ? escapeAttribute(label) : innerHtml}</a>`;
  });

  if (pageCommercialLinks === 0) return;

  const disclosureParts = [
    "<strong>Affiliate disclosure:</strong> Nautical Dream may earn a commission from qualifying purchases made through marked retail links, at no additional cost to you. Recommendations remain editorially independent.",
  ];
  if (report.links.some((link) => link.page === fileName && link.active && link.retailer === "Amazon")) {
    disclosureParts.push("As an Amazon Associate I earn from qualifying purchases.");
  }
  const disclosureBlock = `${disclosureStart}\n<p class="disclosure affiliate-program-disclosure">${disclosureParts.join(" ")}</p>\n${disclosureEnd}\n`;

  if (pageActiveLinks > 0) {
    const firstDisclosure = /<p\b[^>]*\bclass=["'][^"']*\bdisclosure\b[^"']*["'][^>]*>[\s\S]*?<\/p>/i;
    if (firstDisclosure.test(working)) {
      working = working.replace(firstDisclosure, (match) => `${match}\n${disclosureBlock}`);
    } else if (/<main\b[^>]*>/i.test(working)) {
      working = working.replace(/<main\b[^>]*>/i, (match) => `${match}\n${disclosureBlock}`);
    } else {
      throw new Error(`Cannot place affiliate disclosure in ${relative(root, path)}.`);
    }
  }

  if (!/<\/body>/i.test(working)) {
    throw new Error(`Cannot install affiliate tracking in ${relative(root, path)}: missing </body>.`);
  }
  const trackingTag = `<script src="${trackingScript}" defer></script>`;
  const visitorBeaconMarker = /<!--\s*LOKWOD Website Visitor Beacon\s*-->/i;
  if (visitorBeaconMarker.test(working)) {
    // Keep affiliate tracking ahead of the visitor beacon. The beacon is
    // intentionally the final integration before </body> so later injectors
    // cannot silently remove or strand it.
    working = working.replace(visitorBeaconMarker, `${trackingTag}\n$&`);
  } else {
    working = working.replace(/<\/body>/i, `${trackingTag}\n</body>`);
  }

  const activeCountInHtml = (working.match(/data-affiliate-active="true"/g) || []).length;
  if (activeCountInHtml !== pageActiveLinks) {
    throw new Error(`Affiliate link verification failed for ${relative(root, path)}.`);
  }
  if ((working.match(/affiliate-tracking\.js/g) || []).length !== 1) {
    throw new Error(`Affiliate tracking script verification failed for ${relative(root, path)}.`);
  }

  // Removal/reinsertion must not accumulate blank lines on every daily build.
  working = working.replace(/\n{3,}/g, "\n\n");

  if (working !== original) {
    writeFileSync(path, working);
    report.totals.changedPages += 1;
  }
}

function walk(directory) {
  for (const name of readdirSync(directory)) {
    if (skipDirectories.has(name)) continue;
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (name.toLowerCase().endsWith(".html")) processHtml(path);
  }
}

walk(root);
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

if (report.totals.eligiblePages === 0) {
  throw new Error("No eligible buyer-guide HTML files were found.");
}
if (associateTag && report.totals.activeAffiliateLinks === 0) {
  throw new Error("An Amazon Associates tag is configured, but no eligible commercial links were converted.");
}

console.log(
  [
    "Affiliate link injection complete:",
    `${report.totals.eligiblePages} eligible pages,`,
    `${report.totals.commercialLinks} commercial links,`,
    `${report.totals.activeAffiliateLinks} active affiliate links,`,
    `${report.totals.fallbackLinks} safe manufacturer fallbacks.`,
  ].join(" "),
);
if (!associateTag) {
  console.log("Amazon Associates tag is blank; no Amazon commission links were published.");
}
