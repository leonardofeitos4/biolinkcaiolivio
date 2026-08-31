const { json, method, body } = require('../_lib/http');
const { verifyPassword, setSession } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (!method(req, res, ['POST'])) return;
  try {
    const data = await body(req);
    if (!verifyPassword(data.password || '')) {
      console.warn('[admin/login] senha invalida');
      return json(res, 401, { erro: 'Senha invalida' });
    }
    const token = setSession(req, res);
    console.info('[admin/login] login aprovado');
    json(res, 200, { ok: true, token });
  } catch (err) {
    console.error('[admin/login]', err);
    json(res, 500, { erro: err.message || 'Falha no login' });
  }
};
