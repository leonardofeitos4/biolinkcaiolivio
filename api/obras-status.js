const { json, method } = require('./_lib/http');
const { codigosIndisponiveis } = require('./_lib/catalog');

module.exports = async (req, res) => {
  if (!method(req, res, ['GET'])) return;
  try {
    if (!process.env.DATABASE_URL) return json(res, 200, { sold: [], reserved: [] });
    json(res, 200, await codigosIndisponiveis());
  } catch (err) {
    console.error('[obras-status]', err);
    json(res, 200, { sold: [], reserved: [] });
  }
};
