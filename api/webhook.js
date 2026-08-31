const { json, method, body } = require('./_lib/http');
const { query } = require('./_lib/db');
const { getPayment, validateWebhook } = require('./_lib/mp');

function statusPedido(status) {
  if (status === 'approved') return 'approved';
  if (status === 'pending') return 'pending';
  if (status === 'in_process') return 'in_process';
  if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(status)) return status;
  return status || 'updated';
}

module.exports = async (req, res) => {
  if (!method(req, res, ['POST'])) return;

  try {
    req.body = await body(req);
    if (!validateWebhook(req)) return json(res, 401, { erro: 'Assinatura invalida' });

    const tipo = req.body?.type || req.query?.type;
    const id = req.body?.data?.id || req.query?.['data.id'];
    if (tipo !== 'payment' || !id) return json(res, 200, { ok: true, ignored: true });

    const pagamento = await getPayment(id);
    const orderId = pagamento.external_reference || pagamento.metadata?.order_id;
    if (!orderId) return json(res, 200, { ok: true, ignored: true });

    await query(`
      UPDATE orders
      SET status = $2,
          payment = $3::jsonb,
          mp_payment_id = $4,
          updated_at = now()
      WHERE id = $1
    `, [
      orderId,
      statusPedido(pagamento.status),
      JSON.stringify({
        id: pagamento.id,
        status: pagamento.status,
        status_detail: pagamento.status_detail,
        payment_method_id: pagamento.payment_method_id,
        payment_type_id: pagamento.payment_type_id,
        transaction_amount: pagamento.transaction_amount,
        date_approved: pagamento.date_approved,
        date_created: pagamento.date_created,
      }),
      String(pagamento.id),
    ]);
    json(res, 200, { ok: true });
  } catch (err) {
    console.error('[webhook]', err);
    if (!res.headersSent) json(res, 500, { erro: 'Falha ao processar webhook' });
  }
};
