import {readFile,writeFile,readdir,mkdir,rm,cp} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {head,header,footer,cta,faq,programCards,form,modals,icon,programs} from './fragments.js';
const root=resolve(import.meta.dirname,'..');
const output=resolve(root,'dist');
await rm(output,{recursive:true,force:true});
await mkdir(resolve(output,'server'),{recursive:true});
await mkdir(resolve(output,'.openai'),{recursive:true});
const assets={};
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.ttf':'font/ttf'};
async function walk(dir,prefix='') {for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);const name=prefix+'/'+entry.name;if(entry.isDirectory()){await walk(path,name);continue;}const ext=extname(name);let bytes=await readFile(path);if(ext==='.html'){let html=bytes.toString();const page=html.match(/data-page="([^"]+)"/)[1];const replacements={HEAD:head,HEADER:header(page),FOOTER:footer,CTA:cta,FAQ:faq,PROGRAM_CARDS:programCards,ENQUIRY_FORM:form('admission'),MODALS:modals};for(const [key,value]of Object.entries(replacements)) html=html.replaceAll(`<!--${key}-->`,value);html=html.replace(/<!--ICON:(\w+)-->/g,(_,name)=>icon(name));if(/<!--[A-Z_]+-->/.test(html)) throw Error('Unresolved HTML fragment in '+name);bytes=Buffer.from(html);}if(name==='/app.js')bytes=Buffer.from(bytes.toString().replace('/*__PROGRAM_DATA__*/[]',JSON.stringify(programs)));assets[name]={type:types[ext]||'application/octet-stream',body:bytes.toString('base64')};}}
await walk(resolve(root,'public'));
const worker=await readFile(resolve(root,'worker/index.js'),'utf8');
await writeFile(resolve(output,'server/index.js'),worker.replace('/*__ASSET_MAP__*/{}',JSON.stringify(assets)));
await cp(resolve(root,'.openai/hosting.json'),resolve(output,'.openai/hosting.json'));
await cp(resolve(root,'drizzle'),resolve(output,'.openai/drizzle'),{recursive:true});
console.log(`Built ${Object.keys(assets).length} embedded assets, Worker backend and database migrations.`);
