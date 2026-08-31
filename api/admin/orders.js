const { json, method } = require('../_lib/http');
const { requireAdmin } = require('../_lib/auth');
const { query } = require('../_lib/db');
const { cancelExpiredCreatedOrders } = require('../_lib/orders');

module.exports = async (req, res) => {
  if (!method(req, res, ['GET'])) return;
  if (!requireAdmin(req, res)) return;

  try {
    await cancelExpiredCreatedOrders();
    const result = await query(`
      SELECT
        o.id,
        o.preference_id,
        o.status,
        o.total,
        o.currency,
        o.buyer,
        o.address,
        o.shipping,
        o.payment,
        o.mp_payment_id,
        o.created_at,
        o.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'code', oi.artwork_code,
              'title', oi.title,
              'price', oi.price,
              'image', oi.image,
              'quantity', oi.quantity
            )
            ORDER BY oi.artwork_code
          ) FILTER (WHERE oi.artwork_code IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `);
    json(res, 200, { orders: result.rows });
  } catch (err) {
    console.error('[admin/orders]', err.message, err.stack);
    json(res, 500, { erro: err.message || 'Falha ao listar compras' });
  }
};
