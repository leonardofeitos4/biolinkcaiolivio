const crypto = require('node:crypto');
const { json, method, body } = require('./_lib/http');
const { query } = require('./_lib/db');
const { validarItens } = require('./_lib/catalog');
const { createPreference } = require('./_lib/mp');

function limpaTexto(v, max = 120) {
  return String(v || '').trim().slice(0, max);
}

function normalizarTelefone(v) {
  const n = String(v || '').replace(/\D/g, '');
  const local = n.startsWith('55') ? n.slice(2) : n;
  return {
    raw: n,
    area_code: local.slice(0, 2),
    number: local.slice(2),
  };
}

function validarComprador(payer = {}, shipping = {}) {
  const address = payer.address || shipping.receiver_address || {};
  const telefone = normalizarTelefone(payer.phone?.raw || payer.phone || '');
  const comprador = {
    name: limpaTexto(payer.name),
    email: limpaTexto(payer.email, 160).toLowerCase(),
    phone: telefone.raw,
  };
  const endereco = {
    state: limpaTexto(address.state || address.state_name || address.uf, 2).toUpperCase(),
    city: limpaTexto(address.city || address.city_name, 100),
    zip_code: limpaTexto(address.zip_code || address.cep, 12),
    street_name: limpaTexto(address.street_name || address.rua, 160),
    street_number: limpaTexto(address.street_number || address.numero, 20),
    country: 'Brasil',
  };

  if (!comprador.name || !comprador.email || !comprador.phone) {
    const err = new Error('Preencha nome, e-mail e WhatsApp');
    err.status = 400;
    throw err;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(comprador.email)) {
    const err = new Error('E-mail invalido');
    err.status = 400;
    throw err;
  }
  if (telefone.raw.length < 10 || telefone.raw.length > 13) {
    const err = new Error('WhatsApp invalido');
    err.status = 400;
    throw err;
  }
  if (!/^[A-Z]{2}$/.test(endereco.state) || !endereco.city || !/^\d{5}-?\d{3}$/.test(endereco.zip_code) || !endereco.street_name || !endereco.street_number) {
    const err = new Error('Endereco de entrega incompleto');
    err.status = 400;
    throw err;
  }
  return { comprador, endereco, telefone };
}

module.exports = async (req, res) => {
  if (!method(req, res, ['POST'])) return;

  let orderId;
  try {
    const payload = await body(req);
    const itens = await validarItens(payload.items);
    const { comprador, endereco, telefone } = validarComprador(payload.payer, payload.shipping);
    orderId = crypto.randomUUID();
    const total = itens.reduce((sum, item) => sum + Number(item.unit_price), 0);
    const urlSite = process.env.URL_SITE || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
    const webhookUrl = process.env.URL_WEBHOOK || `${urlSite.replace(/\/$/, '')}/api/webhook`;

    await query(`
      INSERT INTO orders (id, status, total, buyer, address, shipping)
      VALUES ($1, 'created', $2, $3::jsonb, $4::jsonb, $5::jsonb)
    `, [
      orderId,
      total,
      JSON.stringify(comprador),
      JSON.stringify(endereco),
      JSON.stringify({ gratis: true, custo: 0, texto: 'Frete gratis para todo o Brasil' }),
    ]);

    for (const item of itens) {
      await query(`
        INSERT INTO order_items (order_id, artwork_code, title, price, image, quantity)
        VALUES ($1, $2, $3, $4, $5, 1)
      `, [orderId, item.id, item.obra.titulo, item.unit_price, item.obra.img]);
    }

    const preferencia = await createPreference({
      items: itens.map(({ obra, ...item }) => item),
      payer: {
        name: comprador.name,
        email: comprador.email,
        phone: {
          area_code: telefone.area_code,
          number: telefone.number,
        },
        address: {
          zip_code: endereco.zip_code,
          street_name: endereco.street_name,
          street_number: Number(endereco.street_number) || endereco.street_number,
        },
      },
      shipments: {
        cost: 0,
        free_shipping: true,
        mode: 'not_specified',
        receiver_address: {
          zip_code: endereco.zip_code,
          street_name: endereco.street_name,
          street_number: Number(endereco.street_number) || endereco.street_number,
          city_name: endereco.city,
          state_name: endereco.state,
          country_name: 'Brasil',
        },
      },
      back_urls: {
        success: `${urlSite}/?pagamento=sucesso&pedido=${orderId}`,
        pending: `${urlSite}/?pagamento=pendente&pedido=${orderId}`,
        failure: `${urlSite}/?pagamento=falhou&pedido=${orderId}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'CAIO LIVIO ARTE',
      external_reference: orderId,
      notification_url: webhookUrl,
      metadata: {
        origem: 'biolink-caiolivio',
        order_id: orderId,
        whatsapp: comprador.phone,
        endereco,
      },
    });

    await query(`
      UPDATE orders
      SET preference_id = $2, init_point = $3, sandbox_init_point = $4, updated_at = now()
      WHERE id = $1
    `, [orderId, preferencia.id, preferencia.init_point, preferencia.sandbox_init_point]);

    json(res, 200, {
      init_point: preferencia.init_point,
      sandbox_init_point: preferencia.sandbox_init_point,
      id: preferencia.id,
      order_id: orderId,
    });
  } catch (err) {
    console.error('[criar-preferencia]', err);
    if (orderId) {
      await query('UPDATE orders SET status = $2, updated_at = now() WHERE id = $1', [orderId, 'failed']).catch(() => {});
    }
    json(res, err.status || 500, { erro: err.message || 'Falha ao criar preferencia' });
  }
};
