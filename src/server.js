import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectRetailer } from './analysis/retailers.js';
import { extractProductData } from './analysis/extractors.js';
import { buildAnalysis } from './analysis/scoring.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'web');

const userStore = new Map();

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body));
}

async function serveFile(res, relativeFile) {
  const filePath = path.join(webDir, relativeFile === '/' ? 'index.html' : relativeFile);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json'
    };
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    });
    res.end();
    return;
  }

  if (req.url === '/api/auth/signup' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body.email || !body.password) return json(res, 400, { error: 'Missing credentials.' });
    userStore.set(body.email, { ...body, plan: 'free', history: [], tracked: [], saved: [], stats: { moneySaved: 0, avoided: 0, deals: 0 } });
    return json(res, 200, { ok: true, user: { email: body.email, plan: 'free' } });
  }

  if (req.url === '/api/auth/login' && req.method === 'POST') {
    const body = await readBody(req);
    const user = userStore.get(body.email);
    if (!user || user.password !== body.password) return json(res, 401, { error: 'Invalid login.' });
    return json(res, 200, { ok: true, user: { email: user.email, plan: user.plan } });
  }

  if (req.url === '/api/analyze-link' && req.method === 'POST') {
    const body = await readBody(req);
    const detection = detectRetailer(body.url);

    if (!detection.retailer) {
      return json(res, 400, {
        supported: false,
        message: detection.reason || 'This retailer is not supported yet.'
      });
    }

    if (!detection.supported) {
      return json(res, 400, {
        supported: false,
        message: detection.reason
      });
    }

    try {
      const extraction = await extractProductData(body.url);
      const analysis = buildAnalysis(extraction.data);

      return json(res, 200, {
        supported: true,
        retailer: detection.retailer.name,
        product: extraction.data,
        limitedData: extraction.limitedData,
        missingFields: extraction.missingFields,
        analysis,
        feedback: {
          question: 'Was this helpful?',
          options: ['👍', '👎']
        }
      });
    } catch (error) {
      return json(res, 502, {
        supported: true,
        retailer: detection.retailer.name,
        message: 'We could not extract product details from this link right now. Please retry shortly.',
        details: error.message
      });
    }
  }

  const route = req.url === '/' ? '/index.html' : req.url;
  return serveFile(res, route);
});

const port = Number(process.env.PORT || 8787);
server.listen(port, () => {
  console.log(`BuyWise running on http://localhost:${port}`);
});
