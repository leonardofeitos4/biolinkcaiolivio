const crypto = require('node:crypto');
const { json, parseCookies } = require('./http');

const COOKIE = 'cl_admin_session';
const ONE_DAY = 60 * 60 * 24;

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function verifyPassword(password) {
  if (process.env.ADMIN_PASSWORD_HASH) {
    const expected = process.env.ADMIN_PASSWORD_HASH.replace(/^sha256:/, '');
    return safeEqual(hash(password), expected);
  }
  if (process.env.ADMIN_PASSWORD) return safeEqual(password, process.env.ADMIN_PASSWORD);
  throw new Error('ADMIN_PASSWORD ou ADMIN_PASSWORD_HASH nao configurado');
}

function sign(payload) {
  if (!process.env.APP_SECRET) throw new Error('APP_SECRET nao configurado');
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.APP_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifySession(token) {
  if (!token || !process.env.APP_SECRET) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expected = crypto.createHmac('sha256', process.env.APP_SECRET).update(data).digest('base64url');
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function shouldUseSecureCookie(req) {
  if (process.env.COOKIE_SECURE === 'true') return true;
  if (process.env.COOKIE_SECURE === 'false') return false;
  const proto = String(req?.headers?.['x-forwarded-proto'] || '').split(',')[0].trim();
  return proto === 'https' || Boolean(req?.socket?.encrypted);
}

function setSession(req, res) {
  const token = sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) + ONE_DAY });
  const secure = shouldUseSecureCookie(req) ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_DAY}${secure}`);
}

function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function requireAdmin(req, res) {
  const session = verifySession(parseCookies(req.headers.cookie)[COOKIE]);
  if (session) return session;
  json(res, 401, { erro: 'Nao autorizado' });
  return null;
}

module.exports = { verifyPassword, setSession, clearSession, requireAdmin, hash };
