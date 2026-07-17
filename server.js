/* Tiny static server for the CarthaBot site — gzip for text assets,
   long cache for immutable libs/fonts/models. Port 9106. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, 'public');
const PORT = process.env.PORT || 9106;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.glb': 'model/gltf-binary',
  '.wasm': 'application/wasm',
  '.json': 'application/json'
};
const GZIP = new Set(['.html', '.css', '.js', '.svg', '.json', '.glb', '.wasm']);
const LONG_CACHE = ['/lib/', '/fonts/', '/assets/'];

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }

  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    const ext = path.extname(file).toLowerCase();
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': LONG_CACHE.some(p => urlPath.startsWith(p))
        ? 'public, max-age=31536000, immutable'
        : 'no-cache'
    };
    const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    if (acceptsGzip && GZIP.has(ext) && data.length > 1024) {
      zlib.gzip(data, { level: 6 }, (e, zipped) => {
        if (e) { res.writeHead(200, headers); return res.end(data); }
        headers['Content-Encoding'] = 'gzip';
        res.writeHead(200, headers);
        res.end(zipped);
      });
    } else {
      res.writeHead(200, headers);
      res.end(data);
    }
  });
}).listen(PORT, () => console.log(`CarthaBot site → http://localhost:${PORT}`));
