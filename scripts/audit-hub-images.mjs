import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.argv[2] || ".");
const htmlFiles = readdirSync(root).filter((file) => file.toLowerCase().endsWith(".html")).sort();
const imagePattern = /\.(?:jpe?g|png|webp|svg)(?:[?#].*)?$/i;
const failures = [];
let pagesWithImages = 0;
let displayRefs = 0;
let uniqueRefs = 0;

function normalizeImage(value) {
  const raw = String(value || "").trim().replace(/^['"]|['"]$/g, "");
  if (!raw || /^(?:https?:|data:|\/\/)/i.test(raw)) return null;
  const clean = raw.split("#")[0].split("?")[0].replace(/^\.\//, "");
  return imagePattern.test(clean) ? clean : null;
}

for (const file of htmlFiles) {
  const html = readFileSync(resolve(root, file), "utf8");
  // Contextual commerce cards are generated after this audit in the normal
  // publication pipeline. Ignore an already-published module when a generated
  // page is used as the next build's input, so the audit remains idempotent.
  const auditableHtml = html.replace(
    /<section\b[^>]*\bdata-affiliate-module=["']contextual-products["'][^>]*>[\s\S]*?<\/section>/gi,
    ""
  );
  const refs = [];

  for (const match of auditableHtml.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const image = normalizeImage(match[1]);
    if (image) refs.push(image);
  }
  for (const match of auditableHtml.matchAll(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi)) {
    const image = normalizeImage(match[2]);
    if (image) refs.push(image);
  }

  if (!refs.length) continue;
  pagesWithImages += 1;
  displayRefs += refs.length;

  const counts = new Map();
  for (const ref of refs) counts.set(ref, (counts.get(ref) || 0) + 1);
  uniqueRefs += counts.size;
  const repeated = [...counts.entries()].filter(([, count]) => count > 1);

  for (const [ref, count] of repeated) {
    failures.push(`${file}: repeated display image ${ref} appears ${count} times`);
  }
}

console.log(`Site-wide image scan: ${htmlFiles.length} HTML pages, ${pagesWithImages} with display images, ${displayRefs} display references, ${uniqueRefs} unique page-level references.`);

if (failures.length) {
  console.error(`Duplicate image audit failed on ${failures.length} page/image pair(s):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Site-wide duplicate image audit passed: no local display image is reused on the same HTML page.");
