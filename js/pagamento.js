/* ═══════════════════════════════════════════════════════
   PAGAMENTO — Mercado Pago (Checkout Pro)
   ───────────────────────────────────────────────────────
   👉 DEV: é AQUI que você pluga o Mercado Pago.
      Só precisa preencher PAGAMENTO.endpoint abaixo.

   O front já faz tudo:
     1. monta o carrinho
     2. coleta dados do comprador e endereco de entrega
     3. envia POST JSON para PAGAMENTO.endpoint
     4. espera { init_point: "https://..." } de volta
     5. redireciona o comprador para o Checkout Pro

   Formato do POST enviado pelo site:
   {
     "items": [
       { "id":"CL-101", "title":"Maré Alta (CL-101)",
         "quantity":1, "unit_price":3000, "currency_id":"BRL",
         "picture_url":"https://.../solocenario1/xxx.jpg" }
     ],
     "payer":   { "name":"...", "email":"...", "phone":"5581..." },
     "shipping":{ "gratis":true, "custo":0 },
     "total":   3000,
     "origem":  "biolink-caiolivio"
   }

   Resposta esperada do backend (HTTP 200):
   { "init_point": "https://www.mercadopago.com.br/checkout/..." }

   Exemplo de backend pronto: ver pasta /backend-mercadopago
═══════════════════════════════════════════════════════ */

const PAGAMENTO = {

  /* ⚠️ PREENCHER: URL do backend que cria a preferência no Mercado Pago.
     Enquanto estiver vazio, o site cai automaticamente no pedido
     via WhatsApp — nada quebra para o cliente final.
     Ex.: 'https://api.caiolivio.art/criar-preferencia'                */
  endpoint: '/api/criar-preferencia',

  moeda: 'BRL',

  /* Frete grátis para todo o Brasil */
  frete: {
    gratis: true,
    custo: 0,
    texto: 'Frete grátis para todo o Brasil',
  },

  /* Parcelamento exibido na vitrine (informativo).
     O parcelamento real é definido no painel do Mercado Pago. */
  parcelas: 12,

  /* Mensagem do fallback WhatsApp (usado enquanto endpoint estiver vazio) */
  whatsapp: CONFIG.WA,
};

/* ── Formatação de moeda ── */
function brl(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* Valor de cada parcela, para o selo "12x de R$ ..." */
function parcelaDe(v) {
  return brl(v / PAGAMENTO.parcelas);
}

function apenasDigitos(v) {
  return String(v || '').replace(/\D/g, '');
}

function telefoneMercadoPago(v) {
  const raw = apenasDigitos(v);
  const local = raw.startsWith('55') ? raw.slice(2) : raw;
  return {
    raw,
    area_code: local.slice(0, 2),
    number: local.slice(2),
  };
}

/* ── Monta o payload no formato que o Mercado Pago espera ── */
function montarPedido(itens, comprador) {
  const base = location.href.split('#')[0].replace(/\/[^/]*$/, '/');
  const telefone = telefoneMercadoPago(comprador.fone);
  const endereco = comprador.endereco || {};
  return {
    items: itens.map(o => ({
      id: o.cod,
      title: `${o.titulo} (${o.cod})`,
      description: `${o.tecnica} · ${o.medidas} · Obra original com certificado de autenticidade`,
      quantity: 1,
      unit_price: o.preco,
      currency_id: PAGAMENTO.moeda,
      picture_url: base + o.img,
    })),
    payer: {
      name: comprador.nome,
      email: comprador.email,
      phone: telefone,
      address: {
        zip_code: endereco.cep,
        state: endereco.estado,
        city: endereco.cidade,
        street_name: endereco.rua,
        street_number: endereco.numero,
      },
    },
    shipping: {
      gratis: PAGAMENTO.frete.gratis,
      custo: PAGAMENTO.frete.custo,
      receiver_address: {
        zip_code: endereco.cep,
        state_name: endereco.estado,
        city_name: endereco.cidade,
        street_name: endereco.rua,
        street_number: endereco.numero,
        country_name: 'Brasil',
      },
    },
    total: itens.reduce((s, o) => s + o.preco, 0) + PAGAMENTO.frete.custo,
    origem: 'biolink-caiolivio',
  };
}

/* ── Fallback: pedido via WhatsApp (enquanto o MP não está configurado) ── */
function pedidoWhatsApp(itens, comprador) {
  const linhas = itens.map(o => `• ${o.titulo} (${o.cod}) — ${brl(o.preco)}`).join('\n');
  const total = itens.reduce((s, o) => s + o.preco, 0);
  const e = comprador.endereco || {};
  const msg =
    `Olá! Vim pelo biolink e quero finalizar a compra:\n\n` +
    `${linhas}\n\n` +
    `Total: ${brl(total)}\n` +
    `Frete: grátis para todo o Brasil\n\n` +
    `Nome: ${comprador.nome || '-'}\n` +
    `E-mail: ${comprador.email || '-'}\n` +
    `WhatsApp: ${comprador.fone || '-'}\n\n` +
    `Entrega:\n` +
    `CEP: ${e.cep || '-'}\n` +
    `Estado: ${e.estado || '-'}\n` +
    `Cidade: ${e.cidade || '-'}\n` +
    `Rua: ${e.rua || '-'}\n` +
    `Numero: ${e.numero || '-'}`;
  return waLink(msg);
}

/* ═══════════════════════════════════════════════════════
   FINALIZAR COMPRA
   Chamado pelo botão "Finalizar compra" do carrinho.
═══════════════════════════════════════════════════════ */
async function finalizarCompra(itens, comprador, onStatus) {
  const status = onStatus || (() => {});

  if (!itens.length) return;

  /* Mercado Pago ainda não configurado → WhatsApp */
  if (!PAGAMENTO.endpoint) {
    console.warn(
      '[pagamento] PAGAMENTO.endpoint vazio em js/pagamento.js — ' +
      'usando fallback WhatsApp. Configure o backend do Mercado Pago.'
    );
    status('wa');
    window.open(pedidoWhatsApp(itens, comprador), '_blank', 'noopener');
    return;
  }

  status('carregando');

  try {
    const r = await fetch(PAGAMENTO.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(montarPedido(itens, comprador)),
    });

    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    const data = await r.json();
    const url = data.init_point || data.sandbox_init_point;
    if (!url) throw new Error('Resposta sem init_point');

    status('redirecionando');
    location.href = url;

  } catch (e) {
    console.error('[pagamento] falha ao criar preferência:', e);
    status('erro');
    /* Não deixa o cliente na mão: oferece o WhatsApp */
    window.open(pedidoWhatsApp(itens, comprador), '_blank', 'noopener');
  }
}
