/* ═══════════════════════════════════════════════════════
   BACKEND — Mercado Pago Checkout Pro
   Caio Livio · Biolink de vendas
   ───────────────────────────────────────────────────────
   Rode:  npm install && npm start
   Config: copie .env.example para .env e preencha.

   Endpoints:
     POST /criar-preferencia  → recebe o carrinho, devolve { init_point }
     POST /webhook            → notificação do Mercado Pago (pagamento aprovado)
     GET  /saude              → healthcheck

   ⚠️ SEGURANÇA: os preços NUNCA vêm do navegador.
      O servidor lê data/obras.js e usa o preço de lá.
═══════════════════════════════════════════════════════ */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use(cors({ origin: (process.env.ORIGENS_PERMITIDAS || '*').split(',') }));

const CATALOGO_PATH = path.join(__dirname, '..', 'data', 'obras.js');

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 8000 },
});

/* ── Catálogo: fonte única da verdade é data/obras.js ────
   Evita ter duas listas de preço para manter. */
function carregarCatalogo() {
  const src = fs.readFileSync(CATALOGO_PATH, 'utf8');
  const ctx = vm.createContext({});
  vm.runInContext(`${src}\n;this.__OBRAS = OBRAS;`, ctx);
  return ctx.__OBRAS;
}

/* ── Marca a obra como vendida (peça única) ──
   Reescreve o vendida:false daquela linha em data/obras.js.
   Se o backend não tiver acesso ao arquivo do site, troque
   esta função pela sua fonte de dados (banco, CMS, etc.). */
function marcarVendida(cod) {
  try {
    const src = fs.readFileSync(CATALOGO_PATH, 'utf8');
    const linhas = src.split('\n').map(l =>
      l.includes(`cod: '${cod}'`) ? l.replace('vendida: false', 'vendida: true') : l
    );
    fs.writeFileSync(CATALOGO_PATH, linhas.join('\n'), 'utf8');
    console.log(`[venda] ${cod} marcada como VENDIDA`);
  } catch (e) {
    console.error(`[venda] não consegui marcar ${cod}:`, e.message);
  }
}

/* ═══ CRIAR PREFERÊNCIA ═══════════════════════════════ */
app.post('/criar-preferencia', async (req, res) => {
  try {
    const { items = [], payer = {} } = req.body || {};
    if (!items.length) return res.status(400).json({ erro: 'Carrinho vazio' });

    const catalogo = carregarCatalogo();

    /* Valida cada item contra o catálogo do servidor */
    const itensValidados = [];
    for (const it of items) {
      const obra = catalogo.find(o => o.cod === it.id);
      if (!obra) return res.status(400).json({ erro: `Obra ${it.id} não existe` });
      if (obra.vendida) return res.status(409).json({ erro: `A obra "${obra.titulo}" já foi vendida`, cod: obra.cod });

      itensValidados.push({
        id: obra.cod,
        title: `${obra.titulo} (${obra.cod})`,
        description: `${obra.tecnica} · ${obra.medidas}`,
        picture_url: it.picture_url,
        category_id: 'art',
        quantity: 1,                 // peça única, sempre 1
        unit_price: Number(obra.preco),
        currency_id: 'BRL',
      });
    }

    const url = process.env.URL_SITE || 'https://caiolivio.art';

    const preferencia = await new Preference(mp).create({
      body: {
        items: itensValidados,
        payer: {
          name: payer.name,
          email: payer.email,
        },
        /* Frete grátis para todo o Brasil */
        shipments: { cost: 0, mode: 'not_specified' },
        back_urls: {
          success: `${url}/?pagamento=sucesso`,
          pending: `${url}/?pagamento=pendente`,
          failure: `${url}/?pagamento=falhou`,
        },
        auto_return: 'approved',
        statement_descriptor: 'CAIO LIVIO ARTE',
        external_reference: itensValidados.map(i => i.id).join(','),
        notification_url: process.env.URL_WEBHOOK || undefined,
        metadata: { whatsapp: payer.phone || '', origem: 'biolink' },
      },
    });

    res.json({
      init_point: preferencia.init_point,
      sandbox_init_point: preferencia.sandbox_init_point,
      id: preferencia.id,
    });

  } catch (e) {
    console.error('[preferencia] erro:', e);
    res.status(500).json({ erro: 'Falha ao criar a preferência de pagamento' });
  }
});

/* ═══ WEBHOOK — pagamento aprovado ════════════════════ */
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);   // responde rápido; o MP reenvia se demorar

  try {
    const tipo = req.body?.type || req.query.type;
    const id = req.body?.data?.id || req.query['data.id'];
    if (tipo !== 'payment' || !id) return;

    const pagamento = await new Payment(mp).get({ id });
    if (pagamento.status !== 'approved') return;

    /* Baixa de estoque: cada obra é peça única */
    (pagamento.external_reference || '').split(',').filter(Boolean).forEach(marcarVendida);

    console.log(`[webhook] pagamento ${id} aprovado ·`,
      pagamento.external_reference, '·', pagamento.payer?.email);

    /* TODO (opcional): disparar e-mail/WhatsApp de confirmação para
       o comprador e para a curadoria. */

  } catch (e) {
    console.error('[webhook] erro:', e.message);
  }
});

app.get('/saude', (_, res) => res.json({ ok: true, obras: carregarCatalogo().length }));

const PORTA = process.env.PORTA || 3000;
app.listen(PORTA, () => {
  console.log(`▶ Backend Caio Livio rodando na porta ${PORTA}`);
  if (!process.env.MP_ACCESS_TOKEN) {
    console.warn('⚠️  MP_ACCESS_TOKEN não configurado — veja o .env.example');
  }
});
