const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 4000);
const knowledge = [
  { terms: ['data', 'privacy', 'personal'], answer: 'Personal data rights typically include lawful processing, purpose limitation, access, correction, and deletion subject to applicable law.' },
  { terms: ['penalty', 'fine', 'violation'], answer: 'A safe portfolio demo cannot provide a verified penalty calculation. Consult the official text and a qualified legal professional.' },
  { terms: ['consumer', 'refund', 'purchase'], answer: 'Consumer remedies generally depend on the contract, reason for return, and applicable Jordanian consumer rules.' }
];

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function answer(question) {
  const text = String(question || '').toLowerCase();
  const match = knowledge.find(item => item.terms.some(term => text.includes(term)));
  return match?.answer || 'This synthetic assistant has no verified legal answer for that question. For legal guidance, consult a qualified professional.';
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'POST' && req.url === '/api/chat') {
    try {
      const body = await readJson(req);
      res.end(JSON.stringify({ answer: answer(body.question), sources: [], disclaimer: 'Synthetic portfolio demo; not legal advice.' }));
    } catch (error) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  if (req.method === 'GET' && req.url === '/api/health') {
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.setHeader('Content-Type', 'text/html');
    res.end(fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8'));
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not found' }));
});

if (require.main === module) server.listen(port, () => console.log(`Legal assistant demo: http://localhost:${port}`));
module.exports = { server, answer };
