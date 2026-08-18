import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.argv[2] || ".");
const indexPath = resolve(root, "index.html");
const verificationId = "ac9e040f-acde-4f80-bce5-631ee630a0be";
const markerStart = "<!-- Impact Website Verification -->";
const markerEnd = "<!-- End Impact Website Verification -->";
const block = `${markerStart}\n  <meta name="impact-site-verification" value="${verificationId}">\n  ${markerEnd}`;
const markedPattern = /<!--\s*Impact Website Verification\s*-->[\s\S]*?<!--\s*End Impact Website Verification\s*-->/gi;
const standalonePattern = /<meta\b(?=[^>]*\bname=["']impact-site-verification["'])[^>]*>/gi;

const original = readFileSync(indexPath, "utf8");
if (!/<\/head>/i.test(original)) {
  throw new Error("Cannot install Impact verification: index.html is missing </head>.");
}

const cleaned = original
  .replace(markedPattern, "")
  .replace(standalonePattern, "")
  .replace(/\s+<\/head>/i, "\n</head>");
const next = cleaned.replace(/<\/head>/i, `  ${block}\n</head>`);

const nameCount = (next.match(/name=["']impact-site-verification["']/gi) || []).length;
const valueCount = (next.match(new RegExp(`value=["']${verificationId}["']`, "gi")) || []).length;
if (nameCount !== 1 || valueCount !== 1) {
  throw new Error("Impact verification injection failed validation.");
}

if (next !== original) {
  writeFileSync(indexPath, next);
  console.log("Impact website verification added to index.html.");
} else {
  console.log("Impact website verification is already correct.");
}
