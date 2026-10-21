import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {publication20261021 as pages} from '../content/publication-2026-10-21.mjs';
const read=f=>readFileSync(f,'utf8'),errors=[],bad=s=>errors.push(s);
const keys=['boat-washdown-hose-nozzle-hero','boat-washdown-hose-nozzle-card','lake-bonaparte-plan-hero','lake-bonaparte-plan-card','ny-boating-certificate-hero','ny-boating-certificate-card'];
const hubs=['gear.html','destinations.html','journal.html'];
const pairs=[['saltwater-rinse-routine.html',0],['boat-cleaning-brush-soft-medium-stiff-guide.html',0],['black-lake-family-boating.html',1],['salmon-river-reservoir-family-boating-launch-guide.html',1],['letting-someone-else-operate-your-boat-handoff-guide.html',2],['new-york-boat-registration-documents-guide.html',2]];
if(pages.length!==3||new Set(pages.map(p=>p.slug)).size!==3)bad('Exactly three unique sources');
const config=JSON.parse(read('affiliate-config.json'));
for(const [i,p] of pages.entries()){
 if(!existsSync(p.slug)){bad('missing '+p.slug);continue;}
 const h=read(p.slug),a=h.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1]||'';
 const words=a.replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean).length;if(words<1100)bad('thin '+p.slug+' '+words);
 for(const s of [p.title,p.hero.caption,'https://nauticaldream.com/'+p.slug,'"datePublished":"2026-10-21"','"dateModified":"2026-10-21"','"Article"','BreadcrumbList','FAQPage','Plan with current information','data-cf-beacon','data-site="nautical-dream"','property="og:image:alt"','name="twitter:image:alt"'])if(!h.includes(s))bad(p.slug+' missing '+s);
 if(/"@type":"(?:Product|Review)"/.test(h))bad('fake review schema');
 const links=[...a.matchAll(/href="(?!https?:|mailto:|#)([^"#]+\.html)/g)].map(m=>m[1]);if(new Set(links).size<9)bad('internal cluster '+p.slug);for(const l of links)if(!existsSync(l))bad('internal 404 '+l);
 const paid=[...h.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>([\s\S]*?)<\/a>/g)];if(paid.length!==(i===0?3:0))bad('paid count '+p.slug+' '+paid.length);
 for(const m of paid){for(const s of ['sponsored','nofollow','noopener','data-affiliate-product=','data-affiliate-active="true"'])if(!m[1].includes(s))bad('paid protection '+s);if(!m[1].includes('tag='+config.amazon.associateTag))bad('approved tag not injected');if(/<img/.test(m[2]))bad('product imagery not allowed');if(!/(hose|nozzle)/i.test(m[2]))bad('nondescriptive anchor');}
 if(paid.length&&!h.includes('As an Amazon Associate'))bad('disclosure');
 if(!read(hubs[i]).includes(p.slug)||!read(hubs[i]).includes(keys[i*2+1]))bad('hub association');
 for(const f of ['index.html','sitemap.xml','feed.xml','llms.txt','content/editorial-catalog.mjs'])if(!read(f).includes(p.slug))bad('discovery '+f);
}
const manifest=JSON.parse(read('assets/editorial/attribution.json')),hashes=new Map();for(const [key,v] of Object.entries(manifest)){if(!v.localPath||!existsSync(v.localPath))continue;const hash=createHash('sha256').update(readFileSync(v.localPath)).digest('hex');hashes.set(hash,[...(hashes.get(hash)||[]),key]);}
for(const key of keys){const v=manifest[key];if(!v||!existsSync(v.localPath)){bad('missing asset '+key);continue;}if(v.license!=='Original AI-assisted editorial image'||!v.query||v.width!==(key.endsWith('-hero')?1600:1200)||v.height!==900)bad('source/license/dimensions '+key);const hash=createHash('sha256').update(readFileSync(v.localPath)).digest('hex');if(hashes.get(hash)?.length!==1)bad('reused image '+key);}
for(const [f,i] of pairs)if(!read(f).includes(pages[i].slug))bad('reciprocal '+f);
const home=read('index.html');if((home.match(/data-recent-library="([^"]+)"/)?.[1]||'')<'2026-10-21')bad('stale homepage');
const files=readdirSync('.').filter(f=>f.endsWith('.html')),titles=new Set(),urls=new Set();for(const f of files){const h=read(f),title=h.match(/<title>([^<]*)<\/title>/)?.[1],u=h.match(/rel="canonical" href="([^"]+)"/)?.[1];if(titles.has(title))bad('duplicate title '+title);titles.add(title);if(urls.has(u))bad('duplicate canonical '+u);urls.add(u);for(const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))try{JSON.parse(m[1]);}catch{bad('schema '+f);}}
const report=JSON.parse(read('assets/affiliate-link-report.json'));if(report.totals.activeAffiliateLinks<403)bad('lost baseline 400 + 3 paid links');if(files.length<418)bad('lost baseline 415 + 3 pages');
if(errors.length){console.error(errors.map(e=>'FAIL '+e).join('\n'));process.exit(1);}
console.log(`PASS October 21: 3 substantial distinct pages, 6 unique original editorial images, 0 product images, 3 protected paid links / ${report.totals.activeAffiliateLinks} sitewide; six reciprocal links and full discovery.`);
