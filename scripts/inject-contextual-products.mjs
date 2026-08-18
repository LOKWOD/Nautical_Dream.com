import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { contextualProductModules } from "../content/contextual-product-modules.mjs";

const root = resolve(process.argv[2] || ".");
const start = "<!-- Nautical Dream Contextual Products -->";
const end = "<!-- End Nautical Dream Contextual Products -->";
const oldBlock = /<!--\s*Nautical Dream Contextual Products\s*-->[\s\S]*?<!--\s*End Nautical Dream Contextual Products\s*-->/gi;

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function render(module) {
  const cards = module.products.map((product) => `
      <article class="product-shelf-card">
        <span class="product-shelf-category">${esc(product.category)}</span>
        <h3>${esc(product.name)}</h3>
        <p>${esc(product.why)}</p>
        <a class="buy-button product-link" href="${esc(product.url)}" target="_blank" rel="noopener" data-affiliate-product="${esc(product.name)}">Check current price</a>
      </article>`).join("");

  return `${start}
<section class="contextual-products" data-affiliate-module="contextual-products" aria-label="Recommended products for this article">
  <div class="product-shelf-head">
    <span>Useful gear for this job</span>
    <h2>${esc(module.title)}</h2>
    <p>${esc(module.intro)}</p>
  </div>
  <div class="product-shelf-grid">${cards}
  </div>
  <p class="product-shelf-note">Choose products by the exact boat, engine, battery, trailer and surface specifications. Manufacturer instructions take priority over a general recommendation.</p>
</section>
${end}`;
}

function inject(html, block, file) {
  const candidates = [
    /<section\s+class=["']faq-section["']/i,
    /<div\s+id=["']faq["']/i,
    /<aside\s+class=["']source-box["']/i,
    /<aside\s+class=["']related-content["']/i,
    /<\/article>/i,
  ];
  for (const pattern of candidates) {
    if (pattern.test(html)) return html.replace(pattern, (match) => `${block}\n${match}`);
  }
  throw new Error(`${file}: no safe insertion point for contextual products`);
}

let pages = 0;
let products = 0;
for (const [file, module] of Object.entries(contextualProductModules)) {
  const path = resolve(root, file);
  if (!existsSync(path)) throw new Error(`Contextual product target is missing: ${file}`);
  if (!module?.title || !module?.intro || !Array.isArray(module.products) || module.products.length < 3) {
    throw new Error(`${file}: contextual product module needs a title, intro and at least 3 products`);
  }
  for (const product of module.products) {
    if (!product?.name || !product?.url || !product?.why || !product?.category) throw new Error(`${file}: incomplete product entry`);
    const parsed = new URL(product.url);
    if (parsed.protocol !== "https:") throw new Error(`${file}: product URL must use HTTPS: ${product.url}`);
  }

  const original = readFileSync(path, "utf8");
  const clean = original.replace(oldBlock, "").replace(/\n{3,}/g, "\n\n");
  const block = render(module);
  const working = inject(clean, block, file);
  const renderedCount = (working.match(/data-affiliate-product=/g) || []).length;
  if (renderedCount < module.products.length) throw new Error(`${file}: product module rendering verification failed`);
  writeFileSync(path, working);
  pages += 1;
  products += module.products.length;
}

console.log(`Contextual product injection complete: ${pages} pages, ${products} product recommendations.`);
