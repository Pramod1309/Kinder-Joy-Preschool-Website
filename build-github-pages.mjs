import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {extname, resolve} from 'node:path';

const root = import.meta.dirname;
const source = resolve(root, 'frontend');
const output = resolve(root, 'docs');

const htmlPages = new Set([
  '',
  'index',
  'our-story',
  'programs',
  'admissions',
  'privacy',
  'admin',
]);

function rewriteRootPath(path) {
  const [pathname, hash = ''] = path.split('#');
  const suffix = hash ? `#${hash}` : '';
  const clean = pathname.replace(/^\/+/, '');

  if (clean === '') return `index.html${suffix}`;
  if (clean.endsWith('.html')) return `${clean}${suffix}`;
  if (htmlPages.has(clean)) return `${clean || 'index'}.html${suffix}`;

  return `${clean}${suffix}`;
}

async function rewriteFile(path) {
  const ext = extname(path);
  let text = await readFile(path, 'utf8');

  if (ext === '.html') {
    text = text
      .replace(/\b(href|src)="\/([^"#?]*)(#[^"]*)?"/g, (_, attr, pathname, hash = '') => {
        return `${attr}="${rewriteRootPath(`/${pathname}${hash}`)}"`;
      })
      .replace(/\b(href|src)='\/([^'#?]*)(#[^']*)?'/g, (_, attr, pathname, hash = '') => {
        return `${attr}='${rewriteRootPath(`/${pathname}${hash}`)}'`;
      });
  }

  if (ext === '.css') {
    text = text.replace(/url\(['"]?\/assets\//g, "url('assets/");
  }

  if (ext === '.js') {
    text = text
      .replaceAll("fetch('/api/", "fetch('api/")
      .replaceAll('fetch("/api/', 'fetch("api/')
      .replaceAll("link.href='/signin-with-chatgpt?return_to=%2Fadmin';", "link.href='admin.html';");
  }

  await writeFile(path, text);
}

async function walk(dir) {
  const entries = await import('node:fs/promises').then(({readdir}) => readdir(dir, {withFileTypes: true}));
  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (['.html', '.css', '.js'].includes(extname(path))) await rewriteFile(path);
  }
}

await rm(output, {recursive: true, force: true});
await mkdir(output, {recursive: true});
await cp(source, output, {recursive: true});
await writeFile(resolve(output, '.nojekyll'), '');
await walk(output);

console.log('GitHub Pages export ready in docs/. Set Pages source to main /docs.');
