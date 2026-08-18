import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.argv[2] || ".");
const hubFiles = ["destinations.html", "gear.html", "fall-boating-destinations.html"];
const imagePattern = /\.(?:jpe?g|png|webp|svg)(?:[?#].*)?$/i;
const failures = [];

function normalizeImage(value) {
  const raw = String(value || "").trim().replace(/^['"]|['"]$/g, "");
  if (!raw || /^(?:https?:|data:|\/\/)/i.test(raw)) return null;
  const clean = raw.split("#")[0].split("?")[0].replace(/^\.\//, "");
  return imagePattern.test(clean) ? clean : null;
}

for (const file of hubFiles) {
  const path = resolve(root, file);
  if (!existsSync(path)) {
    failures.push(`${file}: flagship hub is missing`);
    continue;
  }

  const html = readFileSync(path, "utf8");
  const refs = [];

  for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const image = normalizeImage(match[1]);
    if (image) refs.push(image);
  }
  for (const match of html.matchAll(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi)) {
    const image = normalizeImage(match[2]);
    if (image) refs.push(image);
  }

  const counts = new Map();
  for (const ref of refs) counts.set(ref, (counts.get(ref) || 0) + 1);
  const repeated = [...counts.entries()].filter(([, count]) => count > 1);

  for (const [ref, count] of repeated) {
    failures.push(`${file}: repeated display image ${ref} appears ${count} times`);
  }

  console.log(`${file}: ${refs.length} display image references, ${counts.size} unique.`);
}

if (failures.length) {
  console.error("Flagship hub image audit failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Flagship hub image audit passed: no repeated display images.");
