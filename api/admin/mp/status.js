const { json, method } = require('../../_lib/http');
const { requireAdmin } = require('../../_lib/auth');
const { status } = require('../../_lib/mp');

module.exports = async (req, res) => {
  if (!method(req, res, ['GET'])) return;
  if (!requireAdmin(req, res)) return;
  try {
    json(res, 200, await status());
  } catch (err) {
    console.error('[admin/mp/status]', err);
    json(res, 500, { erro: err.message || 'Falha ao consultar Mercado Pago' });
  }
};
