import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.argv[2] || ".");
const swaps = [
  ["best-life-jackets.html", "assets/editorial/gear-child-pfd.jpg", "assets/editorial/pfd-fit.svg", "Illustrated personal flotation device fit points for shoulders, chest and waist"],
  ["best-life-jackets.html", "assets/editorial/gear-inflatable-pfd.jpg", "assets/editorial/pfd-inflatable.svg", "Illustrated slim inflatable personal flotation device for adult boating"],
  ["dock-box-essentials.html", "assets/editorial/journal-fenders.jpg", "assets/editorial/dock-gear-layout.svg", "Illustrated dock gear layout with fender, line, boat hook and storage box"],
  ["great-family-boat.html", "assets/editorial/journal-family-pontoon.jpg", "assets/editorial/family-boat-layout.svg", "Illustrated family day boat with shaded seating on calm water"],
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let changed = 0;
for (const [file, oldSrc, newSrc, alt] of swaps) {
  const path = resolve(root, file);
  const asset = resolve(root, newSrc);
  if (!existsSync(path)) throw new Error(`Final image-dedupe page missing: ${file}`);
  if (!existsSync(asset)) throw new Error(`Final image-dedupe asset missing: ${newSrc}`);
  let html = readFileSync(path, "utf8");
  const src = escapeRegex(oldSrc);
  const pattern = new RegExp(`<img\\b([^>]*?)\\bsrc=(["'])${src}\\2([^>]*)>`, "i");
  const match = html.match(pattern);
  if (!match) throw new Error(`${file}: could not find expected duplicate image ${oldSrc}`);
  let attrs = `${match[1]}src=${match[2]}${newSrc}${match[2]}${match[3]}`;
  if (/\balt=(["'])[^"']*\1/i.test(attrs)) attrs = attrs.replace(/\balt=(["'])[^"']*\1/i, `alt="${alt}"`);
  else attrs += ` alt="${alt}"`;
  html = html.replace(pattern, `<img${attrs}>`);
  writeFileSync(path, html);
  changed += 1;
}

console.log(`Final display-image dedupe pass complete: ${changed} collision replacements applied.`);
