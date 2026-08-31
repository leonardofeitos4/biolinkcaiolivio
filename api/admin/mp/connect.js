const { json, method, randomToken } = require('../../_lib/http');
const { requireAdmin } = require('../../_lib/auth');
const { query } = require('../../_lib/db');

module.exports = async (req, res) => {
  if (!method(req, res, ['GET'])) return;
  if (!requireAdmin(req, res)) return;

  try {
    if (!process.env.MP_CLIENT_ID || !process.env.MP_REDIRECT_URI) {
      return json(res, 500, { erro: 'MP_CLIENT_ID ou MP_REDIRECT_URI nao configurado' });
    }

    const state = randomToken(24);
    await query(`
      INSERT INTO mp_oauth_states (state, expires_at)
      VALUES ($1, now() + interval '10 minutes')
    `, [state]);

    const url = new URL('https://auth.mercadopago.com/authorization');
    url.searchParams.set('client_id', process.env.MP_CLIENT_ID);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('platform_id', 'mp');
    url.searchParams.set('state', state);
    url.searchParams.set('redirect_uri', process.env.MP_REDIRECT_URI);

    json(res, 200, { url: url.toString() });
  } catch (err) {
    console.error('[admin/mp/connect]', err);
    json(res, 500, { erro: 'Falha ao iniciar conexao Mercado Pago' });
  }
};
