import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {publication20261019 as pages} from '../content/publication-2026-10-19.mjs';
const errors=[],bad=s=>errors.push(s),read=f=>readFileSync(f,'utf8');
const keys=['marine-compass-fit-hero','marine-compass-fit-card','oswego-maritime-shore-day-hero','oswego-maritime-shore-day-card','algal-bloom-boat-plan-hero','algal-bloom-boat-plan-card'];
const hubs=['gear.html','destinations.html','journal.html'],cards=[keys[1],keys[3],keys[5]];
const pairs=[['marine-navigation.html',0],['marine-electronics-explained.html',0],['oswego-harbor-family-boating.html',1],['rainy-weekend-boating-plan.html',1],['canandaigua-lake-family-boating.html',2],['skaneateles-lake-family-boating.html',2]];
if(pages.length!==3)bad('Exactly three sources');
for(const [i,p] of pages.entries()){
 if(!existsSync(p.slug)){bad('missing '+p.slug);continue;}
 const h=read(p.slug),article=h.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]||'';
 const words=article.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean).length;
 if(words<1100)bad(p.slug+' substantive words '+words);
 for(const s of [p.title,p.hero.caption,'https://nauticaldream.com/'+p.slug,'"datePublished":"2026-10-19"','"dateModified":"2026-10-19"','"Article"','BreadcrumbList','FAQPage','Plan with current information','data-cf-beacon','data-site="nautical-dream"','property="og:image:alt"','name="twitter:image:alt"','Nautical Dream Editorial Desk'])if(!h.includes(s))bad(p.slug+' missing '+s);
 if(/"@type":"(?:Product|Review)"/.test(h))bad('fake commercial schema '+p.slug);
 const links=[...article.matchAll(/href="(?!https?:|mailto:|#)([^"#]+\.html)/g)].map(m=>m[1]);if(new Set(links).size<9)bad('internal paths '+p.slug);
 const paid=[...h.matchAll(/<a\b([^>]*data-commercial-link="true"[^>]*)>/g)];if(paid.length!==(i===0?3:0))bad('paid count '+p.slug);
 for(const m of paid){for(const s of ['sponsored','nofollow','noopener','noreferrer','data-affiliate-product=','data-affiliate-active="true"'])if(!m[1].includes(s))bad('paid protection '+p.slug+' '+s);if(!/href="https:\/\/(?:www\.)?amazon\.com\/s\?[^\"]*tag=/.test(m[1]))bad('tagged category destination '+p.slug);}
 if(paid.length&&!h.includes('As an Amazon Associate'))bad('missing disclosure');
 if(paid.some(m=>/<img/i.test(h.slice(m.index,m.index+1000).split('</a>')[0])))bad('unverified product image');
 if(!read(hubs[i]).includes(p.slug)||!read(hubs[i]).includes(cards[i]))bad('hub association '+p.slug);
 for(const f of ['index.html','sitemap.xml','feed.xml','llms.txt','content/editorial-catalog.mjs'])if(!read(f).includes(p.slug))bad(f+' discovery '+p.slug);
}
const attr=JSON.parse(read('assets/editorial/attribution.json')),hashes=new Map();for(const [key,v] of Object.entries(attr)){if(!v.localPath||!existsSync(v.localPath))continue;const hash=createHash('sha256').update(readFileSync(v.localPath)).digest('hex');hashes.set(hash,[...(hashes.get(hash)||[]),key]);}
for(const key of keys){const v=attr[key];if(!v||!existsSync(v.localPath)){bad('missing credited image '+key);continue;}if(v.license!=='Original AI-assisted editorial image'||v.width!==(key.endsWith('-hero')?1600:1200)||v.height!==900)bad('image provenance/dimensions '+key);const hash=createHash('sha256').update(readFileSync(v.localPath)).digest('hex');if(hashes.get(hash)?.length!==1)bad('duplicate image bytes '+key);}
for(const [f,i] of pairs)if(!read(f).includes(pages[i].slug))bad('reciprocal '+f);
const home=read('index.html');if(!home.includes('New practical guides · October 19, 2026')||!home.includes('data-recent-library="2026-10-19"'))bad('homepage current discovery');
const titles=new Set(),urls=new Set();const files=readdirSync('.').filter(f=>f.endsWith('.html'));for(const f of files){const h=read(f),t=h.match(/<title>([^<]*)<\/title>/)?.[1],u=h.match(/rel="canonical" href="([^"]+)"/)?.[1];if(titles.has(t))bad('duplicate title '+t);titles.add(t);if(urls.has(u))bad('duplicate canonical '+u);urls.add(u);for(const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))try{JSON.parse(m[1]);}catch{bad('schema JSON '+f);}}
const report=JSON.parse(read('assets/affiliate-link-report.json'));if(report.totals.activeAffiliateLinks!==398)bad('expected preserved 395 + 3 new paid links');
if(files.length!==412)bad('expected 412 HTML pages');
if(errors.length){console.error(errors.map(e=>'FAIL '+e).join('\n'));process.exit(1);}
console.log('PASS October 19: 3 substantial distinct sources/pages, 6 unique credited editorial images, 0 product images, 3 protected paid links / 398 active sitewide, six reciprocal links and full discovery.');
