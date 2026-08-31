const { json, method } = require('../_lib/http');
const { clearSession } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (!method(req, res, ['POST'])) return;
  clearSession(res);
  json(res, 200, { ok: true });
};
