import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=f=>readFileSync(f,'utf8');
const pages=readdirSync('.').filter(f=>f.endsWith('.html')).sort().map(slug=>{const h=read(slug);return {slug,title:h.match(/<title>(.*?)<\/title>/s)?.[1],heading:h.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1],description:h.match(/name="description" content="([^"]*)"/)?.[1],keywords:h.match(/name="keywords" content="([^"]*)"/)?.[1]||'',angles:[...h.matchAll(/<h2[^>]*>(.*?)<\/h2>/gs)].map(m=>m[1].replace(/<[^>]+>/g,'')),images:[...h.matchAll(/<img\b[^>]*>/g)].map(m=>({src:m[0].match(/src="([^"]*)"/)?.[1],alt:m[0].match(/alt="([^"]*)"/)?.[1]})),backgroundImages:[...h.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)].map(m=>m[1]),commercialCategories:[...h.matchAll(/data-affiliate-product="([^"]*)"/g)].map(m=>m[1])};});
const manifest=JSON.parse(read('assets/editorial/attribution.json'));
const images=Object.fromEntries(Object.entries(manifest).map(([k,v])=>[k,{...v,sha256:createHash('sha256').update(readFileSync(v.localPath)).digest('hex')} ]));
writeFileSync('reports/inventory-2026-10-22.json',JSON.stringify({date:'2026-10-22',stage:'post-publication',pageCount:pages.length,pages,images},null,2)+'\n');
console.log('Inventoried '+pages.length+' HTML pages and '+Object.keys(images).length+' credited assets.');
