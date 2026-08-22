import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { publication20260822 } from "../content/publication-2026-08-22.mjs";
import { renderPage } from "./editorial-lib.mjs";

const root = process.cwd();

if (publication20260822.length !== 2) {
  throw new Error(`The 2026-08-22 publication must contain exactly two pages; found ${publication20260822.length}.`);
}

const slugs = new Set();
const titles = new Set();
for (const page of publication20260822) {
  if (slugs.has(page.slug)) throw new Error(`Duplicate publication slug: ${page.slug}`);
  if (titles.has(page.title)) throw new Error(`Duplicate publication title: ${page.title}`);
  slugs.add(page.slug);
  titles.add(page.title);
  writeFileSync(join(root, page.slug), renderPage(page));
  console.log(`built ${page.slug}`);
}

console.log("Built exactly two pages for the 2026-08-22 publication.");
