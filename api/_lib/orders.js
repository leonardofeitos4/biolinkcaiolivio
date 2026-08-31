const { query } = require('./db');

function reservationMinutes() {
  const minutes = Number(process.env.RESERVATION_MINUTES || 30);
  return Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 30;
}

async function cancelExpiredCreatedOrders() {
  const minutes = reservationMinutes();
  const result = await query(`
    UPDATE orders
    SET status = 'cancelled',
        payment = COALESCE(payment, '{}'::jsonb) || jsonb_build_object(
          'auto_cancelled', true,
          'auto_cancelled_reason', 'checkout_expired',
          'auto_cancelled_after_minutes', $1,
          'auto_cancelled_at', now()
        ),
        updated_at = now()
    WHERE status = 'created'
      AND created_at <= now() - ($1::int * interval '1 minute')
    RETURNING id
  `, [minutes]);

  if (result.rowCount) {
    console.info('[orders/cleanup] pedidos expirados cancelados', {
      count: result.rowCount,
      minutes,
      ids: result.rows.map(row => row.id),
    });
  }

  return { cancelled: result.rowCount, minutes };
}

module.exports = { cancelExpiredCreatedOrders, reservationMinutes };
