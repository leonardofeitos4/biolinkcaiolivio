const crypto = require('node:crypto');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function method(req, res, allowed) {
  if (allowed.includes(req.method)) return true;
  res.setHeader('Allow', allowed.join(', '));
  json(res, 405, { erro: 'Metodo nao permitido' });
  return false;
}

async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function parseCookies(header) {
  return String(header || '')
    .split(';')
    .map(v => v.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const i = part.indexOf('=');
      if (i > -1) acc[part.slice(0, i)] = decodeURIComponent(part.slice(i + 1));
      return acc;
    }, {});
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

module.exports = { json, method, body, parseCookies, randomToken };
