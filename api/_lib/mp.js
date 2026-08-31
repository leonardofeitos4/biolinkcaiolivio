const crypto = require('node:crypto');
const { MercadoPagoConfig, Preference, Payment, WebhookSignatureValidator, InvalidWebhookSignatureError } = require('mercadopago');
const { query } = require('./db');
const { encrypt, decrypt } = require('./crypto');

async function saveToken(data) {
  const expiresIn = Number(data.expires_in || 0);
  const expiresAt = expiresIn ? new Date(Date.now() + (expiresIn - 300) * 1000) : null;
  await query(`
    INSERT INTO mp_tokens (
      id, access_token, refresh_token, token_type, scope, user_id, public_key, live_mode, expires_at, updated_at
    )
    VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, now())
    ON CONFLICT (id) DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = COALESCE(EXCLUDED.refresh_token, mp_tokens.refresh_token),
      token_type = EXCLUDED.token_type,
      scope = EXCLUDED.scope,
      user_id = EXCLUDED.user_id,
      public_key = EXCLUDED.public_key,
      live_mode = EXCLUDED.live_mode,
      expires_at = EXCLUDED.expires_at,
      updated_at = now()
  `, [
    encrypt(data.access_token),
    encrypt(data.refresh_token),
    data.token_type || null,
    data.scope || null,
    data.user_id ? String(data.user_id) : null,
    data.public_key || null,
    typeof data.live_mode === 'boolean' ? data.live_mode : null,
    expiresAt,
  ]);
}

async function tokenRow() {
  const result = await query('SELECT * FROM mp_tokens WHERE id = 1');
  return result.rows[0] || null;
}

async function requestOAuth(body) {
  const response = await fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.message || data.error_description || 'Falha no OAuth Mercado Pago');
    err.status = response.status;
    err.details = data;
    throw err;
  }
  return data;
}

async function refreshToken(row) {
  if (!row.refresh_token) return null;
  const data = await requestOAuth({
    client_id: process.env.MP_CLIENT_ID,
    client_secret: process.env.MP_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: decrypt(row.refresh_token),
  });
  await saveToken(data);
  return data.access_token;
}

async function accessToken() {
  const row = await tokenRow();
  if (row) {
    const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
    if (expiresAt && expiresAt < Date.now() + 5 * 60 * 1000 && process.env.MP_CLIENT_ID && process.env.MP_CLIENT_SECRET) {
      const refreshed = await refreshToken(row);
      if (refreshed) return refreshed;
    }
    return decrypt(row.access_token);
  }
  return process.env.MP_ACCESS_TOKEN || '';
}

async function mpClient() {
  const token = await accessToken();
  if (!token) {
    const err = new Error('Conta Mercado Pago nao conectada');
    err.status = 503;
    throw err;
  }
  return new MercadoPagoConfig({ accessToken: token, options: { timeout: 8000 } });
}

async function createPreference(body) {
  const client = await mpClient();
  return new Preference(client).create({ body });
}

async function getPayment(id) {
  const client = await mpClient();
  return new Payment(client).get({ id });
}

function validateWebhook(req) {
  if (!process.env.MP_WEBHOOK_SECRET) return true;
  const dataId = String(req.query?.['data.id'] || req.body?.data?.id || '').toLowerCase();
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];

  if (!xSignature) return false;

  if (!WebhookSignatureValidator?.validate) {
    const parts = Object.fromEntries(String(xSignature).split(',').map(part => {
      const [key, value] = part.split('=');
      return [key?.trim(), value?.trim()];
    }));
    if (!parts.ts || !parts.v1) return false;
    const manifest = `${dataId ? `id:${dataId};` : ''}${xRequestId ? `request-id:${xRequestId};` : ''}ts:${parts.ts};`;
    const expected = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET).update(manifest).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(parts.v1);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret: process.env.MP_WEBHOOK_SECRET,
    });
    return true;
  } catch (err) {
    if (!InvalidWebhookSignatureError || err instanceof InvalidWebhookSignatureError) return false;
    return false;
  }
}

async function status() {
  const row = await tokenRow();
  return {
    connected: Boolean(row || process.env.MP_ACCESS_TOKEN),
    source: row ? 'oauth' : (process.env.MP_ACCESS_TOKEN ? 'env' : 'none'),
    user_id: row?.user_id || null,
    live_mode: typeof row?.live_mode === 'boolean' ? row.live_mode : null,
    expires_at: row?.expires_at || null,
    updated_at: row?.updated_at || null,
  };
}

module.exports = { saveToken, requestOAuth, createPreference, getPayment, validateWebhook, status };
