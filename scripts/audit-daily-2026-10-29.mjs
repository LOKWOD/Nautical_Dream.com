import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {publication20261029 as pages} from '../content/publication-2026-10-29.mjs';
const read=f=>readFileSync(f,'utf8'),errors=[],bad=s=>errors.push(s);
const keys=['boat-trailer-wheel-chocks-hero','boat-trailer-wheel-chocks-card','lewey-lake-small-boat-hero','lewey-lake-small-boat-card','boat-maintenance-records-hero','boat-maintenance-records-card'];
const hubs=['gear.html','destinations.html','journal.html'];
const pairs=[['boat-trailer-tpms-buying-setup-guide.html',0],['boat-trailer-wheel-bearing-hub-inspection-guide.html',0],['indian-lake-public-boat-launch-family-guide.html',1],['lake-durant-small-boat-family-guide.html',1],['boat-records-and-logbook.html',2],['used-boat-inspection-checklist.html',2]];
if(pages.length!==3||new Set(pages.map(p=>p.slug)).size!==3)bad('exactly three unique source pages required');
const config=JSON.parse(read('affiliate-config.json'));
for(const [i,p] of pages.entries()){
 if(!existsSync(p.slug)){bad('missing '+p.slug);continue;}const h=read(p.slug),a=h.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1]||'';
 const words=a.replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean).length;if(words<1400)bad('thin '+p.slug+' '+words);
 for(const s of [p.title,p.hero.caption,'https://nauticaldream.com/'+p.slug,'"datePublished":"2026-10-29"','"dateModified":"2026-10-29"','BreadcrumbList','FAQPage','data-cf-beacon','data-site="nautical-dream"','property="og:image:alt"','name="twitter:image:alt"'])if(!h.includes(s))bad(p.slug+' missing '+s);
 if(/"@type":"(?:Product|Review)"/.test(h))bad('fake commercial schema '+p.slug);
 const links=[...a.matchAll(/href="(?!https?:|mailto:|#)([^"#]+\.html)/g)].map(m=>m[1]);if(new Set(links).size<9)bad('weak internal cluster '+p.slug);for(const l of links)if(!existsSync(l))bad('internal 404 '+p.slug+' -> '+l);
 const paid=[...h.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>([\s\S]*?)<\/a>/g)];if(paid.length!==(i===0?3:0))bad('paid count '+p.slug+' '+paid.length);
 for(const m of paid){for(const s of ['sponsored','nofollow','noopener','data-affiliate-product=','data-affiliate-active="true"'])if(!m[1].includes(s))bad('paid protection '+s);if(!m[1].includes('tag='+config.amazon.associateTag))bad('unapproved affiliate tag');if(/<img/.test(m[2]))bad('product image not allowed');}
 if(paid.length&&!h.includes('As an Amazon Associate'))bad('missing visible affiliate disclosure');
 for(const f of ['index.html','sitemap.xml','feed.xml','llms.txt','content/editorial-catalog.mjs',hubs[i]])if(!read(f).includes(p.slug))bad('discovery '+f+' -> '+p.slug);
}
const manifest=JSON.parse(read('assets/editorial/attribution.json')),seen=new Map();for(const [k,v] of Object.entries(manifest)){if(!v.localPath||!existsSync(v.localPath))continue;const hash=createHash('sha256').update(readFileSync(v.localPath)).digest('hex');seen.set(hash,[...(seen.get(hash)||[]),k]);}
for(const key of keys){const v=manifest[key];if(!v||!existsSync(v.localPath)){bad('missing asset '+key);continue;}if(v.license!=='Original AI-assisted editorial image'||!v.sourceUrl||!v.query||v.width!==(key.endsWith('-hero')?1600:1200)||v.height!==900)bad('asset record '+key);const hash=createHash('sha256').update(readFileSync(v.localPath)).digest('hex');if(seen.get(hash)?.length!==1)bad('reused asset '+key);if(!read('image-credits.html').includes(v.title))bad('credit page missing '+key);}
for(const [f,i] of pairs)if(!read(f).includes(pages[i].slug))bad('missing reciprocal '+f);
const files=readdirSync('.').filter(f=>f.endsWith('.html')),titles=new Set(),canon=new Set();for(const f of files){const h=read(f),t=h.match(/<title>([^<]*)<\/title>/)?.[1],c=h.match(/rel="canonical" href="([^"]+)"/)?.[1];if(!t||!c)bad('metadata gap '+f);if(titles.has(t))bad('duplicate title '+t);titles.add(t);if(canon.has(c))bad('duplicate canonical '+c);canon.add(c);for(const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))try{JSON.parse(m[1]);}catch{bad('invalid schema '+f);}}
const report=JSON.parse(read('assets/affiliate-link-report.json'));if(report.totals.activeAffiliateLinks<430)bad('affiliate total regressed '+report.totals.activeAffiliateLinks);if(report.totals.activeAffiliateLinks!==report.totals.commercialLinks)bad('inactive commercial link');if(files.length<442)bad('HTML total regressed '+files.length);
if(errors.length){console.error(errors.map(e=>'FAIL '+e).join('\n'));process.exit(1);}console.log('PASS October 29: 3 distinct long-form pages, 6 unique editorial images, 0 product images, 3 protected paid links / '+report.totals.activeAffiliateLinks+' sitewide, full discovery and 6 reciprocal links.');
