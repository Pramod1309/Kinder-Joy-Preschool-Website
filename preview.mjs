import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,extname,isAbsolute,relative,resolve} from 'node:path';

const base = resolve(dirname(fileURLToPath(import.meta.url)), 'frontend');
const port = Number(process.env.PORT || 8080);

const routes = {
  '/': 'index.html',
  '/our-story': 'our-story.html',
  '/programs': 'programs.html',
  '/admissions': 'admissions.html',
  '/privacy': 'privacy.html',
  '/admin': 'admin.html',
};

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
};

createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;

    if (path.startsWith('/api/')) {
      res.writeHead(503, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        error: 'This local preview shows the design. Use the deployed website for saved enquiries and the staff inbox.',
      }));
      return;
    }

    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }

    const file = resolve(base, routes[path] || `.${path}`);
    const rel = relative(base, file);

    if (rel.startsWith('..') || isAbsolute(rel)) {
      res.writeHead(403);
      res.end();
      return;
    }

    const bytes = await readFile(file);
    res.writeHead(200, {'Content-Type': mime[extname(file)] || 'application/octet-stream'});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch {
    res.writeHead(404);
    res.end('Page not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Open http://localhost:${port} - design preview only. Press Ctrl+C to stop.`);
});
