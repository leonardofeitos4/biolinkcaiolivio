const { query } = require('../../_lib/db');
const { requestOAuth, saveToken } = require('../../_lib/mp');

module.exports = async (req, res) => {
  try {
    const { code, state, error } = req.query || {};
    const target = new URL('/admin.html', process.env.URL_SITE || `https://${req.headers.host}`);
    if (error) {
      target.searchParams.set('mp', 'erro');
      target.searchParams.set('motivo', String(error).slice(0, 80));
      res.writeHead(302, { Location: target.toString() });
      return res.end();
    }
    if (!code || !state) {
      target.searchParams.set('mp', 'erro');
      target.searchParams.set('motivo', 'callback-incompleto');
      res.writeHead(302, { Location: target.toString() });
      return res.end();
    }

    const stateResult = await query(`
      SELECT state FROM mp_oauth_states
      WHERE state = $1 AND used_at IS NULL AND expires_at > now()
    `, [state]);
    if (!stateResult.rows.length) {
      target.searchParams.set('mp', 'erro');
      target.searchParams.set('motivo', 'state-invalido');
      res.writeHead(302, { Location: target.toString() });
      return res.end();
    }

    const token = await requestOAuth({
      client_id: process.env.MP_CLIENT_ID,
      client_secret: process.env.MP_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.MP_REDIRECT_URI,
    });
    await saveToken(token);
    await query('UPDATE mp_oauth_states SET used_at = now() WHERE state = $1', [state]);

    target.searchParams.set('mp', 'connected');
    res.writeHead(302, { Location: target.toString() });
    res.end();
  } catch (err) {
    console.error('[admin/mp/callback]', err);
    const target = new URL('/admin.html', process.env.URL_SITE || `https://${req.headers.host}`);
    target.searchParams.set('mp', 'erro');
    target.searchParams.set('motivo', 'oauth');
    res.writeHead(302, { Location: target.toString() });
    res.end();
  }
};
