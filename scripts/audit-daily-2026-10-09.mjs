import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publication20261009 as pages } from "../content/publication-2026-10-09.mjs";
const root=process.cwd(), errors=[];
const expected={
 "boat-emergency-line-cutter-rescue-shears-guide.html":{affiliate:3,hub:"gear.html",card:"assets/editorial/boat-emergency-line-cutters-photo-card.webp"},
 "salmon-river-reservoir-family-boating-launch-guide.html":{affiliate:0,hub:"destinations.html",card:"assets/editorial/salmon-river-reservoir-concept-photo-card.webp"},
 "shoulder-season-boat-return-margin-protocol.html":{affiliate:0,hub:"journal.html",card:"assets/editorial/shoulder-season-return-margin-photo-card.webp"}
};
const htmlFiles=readdirSync(root).filter(f=>f.endsWith(".html"));
if(pages.length!==3)errors.push(`expected 3 pages, found ${pages.length}`);
for(const p of pages){
 const path=join(root,p.slug); if(!existsSync(path)){errors.push(`missing ${p.slug}`);continue}
 const h=readFileSync(path,"utf8"),article=h.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]||"";
 const words=article.replace(/<[^>]+>/g," ").replace(/&[^;]+;/g," ").trim().split(/\s+/).length;
 if(words<1450)errors.push(`${p.slug}: ${words} words`);
 if((h.match(/<section class="article-section"/g)||[]).length<12)errors.push(`${p.slug}: fewer than 12 sections`);
 if(!h.includes(`<link rel="canonical" href="https://nauticaldream.com/${p.slug}">`))errors.push(`${p.slug}: canonical`);
 for(const token of ["FAQPage","twitter:card",`assets/editorial/${p.hero.key}.webp`])if(!h.includes(token))errors.push(`${p.slug}: missing ${token}`);
 if(!h.includes('"@type":"Article"')&&!h.includes('"@type":["Article"'))errors.push(`${p.slug}: primary Article schema`);
 if((h.match(/href="[^"]+\.html/g)||[]).length<9)errors.push(`${p.slug}: internal links`);
 for(const m of h.matchAll(/href="((?!https?:\/\/)[^"#?]+\.html)"/g))if(!existsSync(join(root,m[1])))errors.push(`${p.slug}: broken ${m[1]}`);
 const active=(h.match(/data-affiliate-active="true"/g)||[]).length;
 if(active!==expected[p.slug].affiliate)errors.push(`${p.slug}: affiliate ${active}`);
 if(active&&!/As an Amazon Associate/i.test(h))errors.push(`${p.slug}: disclosure`);
 for(const m of h.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/gi))for(const rel of ["sponsored","nofollow","noopener","noreferrer"])if(!m[1].includes(rel))errors.push(`${p.slug}: commercial rel ${rel}`);
 const hub=readFileSync(expected[p.slug].hub,"utf8"); if(!hub.includes(p.slug)||!hub.includes(expected[p.slug].card))errors.push(`${p.slug}: hub discovery`);
}
const attr=JSON.parse(readFileSync("assets/editorial/attribution.json","utf8"));
const keys=["boat-emergency-line-cutters-photo-hero","boat-emergency-line-cutters-photo-card","salmon-river-reservoir-concept-photo-hero","salmon-river-reservoir-concept-photo-card","shoulder-season-return-margin-photo-hero","shoulder-season-return-margin-photo-card"];
const hashes=new Map(); for(const [k,v] of Object.entries(attr)){if(!v?.localPath||!existsSync(v.localPath))continue;const hash=createHash("sha256").update(readFileSync(v.localPath)).digest("hex");hashes.set(hash,[...(hashes.get(hash)||[]),k])}
for(const k of keys){const v=attr[k];if(!v||!existsSync(v.localPath)){errors.push(`missing visual ${k}`);continue}if(v.license!=="Original AI-assisted editorial image")errors.push(`${k}: license`);if(v.width!==(k.endsWith("-card")?1200:1600)||v.height!==900)errors.push(`${k}: dimensions`);const hash=createHash("sha256").update(readFileSync(v.localPath)).digest("hex");if(hashes.get(hash).length!==1)errors.push(`${k}: duplicate bytes`)}
for(const surface of ["index.html","sitemap.xml","feed.xml","llms.txt"])for(const p of pages)if(!readFileSync(surface,"utf8").includes(p.slug))errors.push(`${surface}: missing ${p.slug}`);
for(const [file,slug] of [["person-overboard-recovery.html",pages[0].slug],["boat-tool-kit-guide.html",pages[0].slug],["oneida-lake-family-boating.html",pages[1].slug],["choosing-weekend-boating-destination.html",pages[1].slug],["cold-water-boating.html",pages[2].slug],["float-plan-guide.html",pages[2].slug]])if(!readFileSync(file,"utf8").includes(slug))errors.push(`${file}: reciprocal link`);
const titles=new Map(),canon=new Map();for(const f of htmlFiles){const h=readFileSync(f,"utf8"),t=h.match(/<title>([^<]+)<\/title>/i)?.[1],c=h.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];if(t)titles.set(t,[...(titles.get(t)||[]),f]);if(c)canon.set(c,[...(canon.get(c)||[]),f])}for(const [t,fs] of titles)if(fs.length>1)errors.push(`duplicate title ${t}`);for(const [c,fs] of canon)if(fs.length>1)errors.push(`duplicate canonical ${c}`);
for(const term of ["three-tool decision card","one-hand reach test","no universal recreational-boat line-cutter certification"])if(!readFileSync(pages[0].slug,"utf8").toLowerCase().includes(term))errors.push(`cutter missing ${term}`);
for(const term of ["43.555115","43.529713","43.523268","43.551262","accessible angler platform"])if(!readFileSync(pages[1].slug,"utf8").includes(term))errors.push(`reservoir missing ${term}`);
for(const term of ["earliest of five clocks","usable daylight","least-resourced person","false precision"])if(!readFileSync(pages[2].slug,"utf8").toLowerCase().includes(term))errors.push(`margin missing ${term}`);
if(errors.length){console.error(`Oct 9 audit failed (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log("Daily 2026-10-09 audit passed: 3 substantial pages, 6 unique original editorial images, 3 disclosed affiliate links, 3 decision assets, 6 reciprocal authority links and complete discovery.");
