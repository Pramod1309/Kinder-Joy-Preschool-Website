import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import worker from '../dist/server/index.js';
const db=new DatabaseSync(':memory:');
for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())db.exec(await readFile('drizzle/'+file,'utf8'));
const DB={prepare(sql){const statement=db.prepare(sql);return {bind(...args){return {async first(){return statement.get(...args)||null;},async all(){return {results:statement.all(...args)};},async run(){const result=statement.run(...args);return {meta:{changes:Number(result.changes)}};}};},async all(){return {results:statement.all()};}};}};
const env={DB,ADMIN_EMAILS:'owner@example.test'};
const origin='https://example.test';
const auth={'oai-authenticated-user-id':'test-owner','oai-authenticated-user-email':'owner@example.test'};
function request(path,method='GET',body,headers={}){return new Request(origin+path,{method,headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:typeof body==='string'?body:JSON.stringify(body)}:{})});}
const routes=['/','/our-story','/programs','/admissions','/privacy','/admin'];
const refs=new Set();
for(const route of routes){const response=await worker.fetch(request(route),env);assert.equal(response.status,200,route);const html=await response.text();assert.ok(html.includes('<title>'));assert.ok(!html.includes('<!--HEAD-->'));for(const match of html.matchAll(/(?:src|href)="(\/[^"#]*)/g)){if(!match[1].startsWith('//'))refs.add(match[1].split('#')[0]);}const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate IDs at '+route);}
for(const path of refs){const response=await worker.fetch(request(path),env);assert.equal(response.status,200,'Broken internal link or asset: '+path);}
assert.equal((await worker.fetch(request('/missing'),env)).status,404);
assert.equal((await worker.fetch(request('/api/admin/enquiries'),env)).status,401);
assert.equal((await worker.fetch(request('/api/admin/enquiries','GET',null,{'oai-authenticated-user-id':'visitor','oai-authenticated-user-email':'visitor@example.test'}),env)).status,403);
const data={name:'Test Parent',email:'parent@example.test',phone:'+91 9876543210',program:'nursery',visitDate:'',message:'Is a visit available?',consent:true,website:'',requestId:crypto.randomUUID()};
let response=await worker.fetch(request('/api/enquiries','POST',data),env);assert.equal(response.status,201);assert.ok((await response.json()).reference.startsWith('KJ-'));
response=await worker.fetch(request('/api/enquiries','POST',data),env);assert.equal(response.status,200);assert.equal((await response.json()).duplicate,true);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM enquiries').get().n,1);
for(const delta of [{consent:false},{email:'invalid'},{phone:'123'},{program:'fake'},{visitDate:'2026-02-30'},{message:'x'.repeat(1501)},{website:'bot'}])assert.equal((await worker.fetch(request('/api/enquiries','POST',{...data,requestId:crypto.randomUUID(),...delta}),env)).status,400,JSON.stringify(delta).slice(0,50));
assert.equal((await worker.fetch(request('/api/enquiries','POST',data,{Origin:'https://wrong.test'}),env)).status,403);
assert.equal((await worker.fetch(request('/api/enquiries','POST','{bad'),env)).status,400);
response=await worker.fetch(request('/api/admin/enquiries','GET',null,auth),env);assert.equal(response.status,200);assert.equal((await response.json()).enquiries.length,1);
response=await worker.fetch(request('/api/admin/enquiries','PATCH',{id:data.requestId,status:'contacted'},auth),env);assert.equal(response.status,200);assert.equal(db.prepare('SELECT status FROM enquiries').get().status,'contacted');
assert.equal((await worker.fetch(request('/api/admin/enquiries','PATCH',{id:data.requestId,status:'closed'}),env)).status,401);
assert.equal((await worker.fetch(request('/api/enquiries','POST',{...data,requestId:crypto.randomUUID()}),{})).status,503);
for(let i=0;i<4;i++)assert.equal((await worker.fetch(request('/api/enquiries','POST',{...data,requestId:crypto.randomUUID()}),env)).status,201);
assert.equal((await worker.fetch(request('/api/enquiries','POST',{...data,requestId:crypto.randomUUID()}),env)).status,429);
console.log('PASS: 6 page routes, '+refs.size+' internal links/assets, persisted enquiries, input validation, idempotency, origin protection, rate limits, staff authorization and status updates.');
db.close();
