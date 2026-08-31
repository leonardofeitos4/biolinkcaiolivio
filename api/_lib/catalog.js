const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { query } = require('./db');

const CATALOGO_PATH = path.join(__dirname, '..', '..', 'data', 'obras.js');

function carregarCatalogo() {
  const src = fs.readFileSync(CATALOGO_PATH, 'utf8');
  const ctx = vm.createContext({});
  vm.runInContext(`${src}\n;this.__OBRAS = OBRAS;`, ctx);
  return ctx.__OBRAS;
}

async function codigosIndisponiveis() {
  const minutos = Number(process.env.RESERVATION_MINUTES || 30);
  const sold = await query(`
    SELECT DISTINCT oi.artwork_code
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status = 'approved'
  `);
  const reserved = await query(`
    SELECT DISTINCT oi.artwork_code
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status IN ('created', 'pending', 'in_process')
      AND o.created_at > now() - ($1::int * interval '1 minute')
  `, [minutos]);
  return {
    sold: sold.rows.map(r => r.artwork_code),
    reserved: reserved.rows.map(r => r.artwork_code),
  };
}

async function validarItens(items) {
  if (!Array.isArray(items) || !items.length) {
    const err = new Error('Carrinho vazio');
    err.status = 400;
    throw err;
  }

  const catalogo = carregarCatalogo();
  const status = await codigosIndisponiveis();
  const indisponiveis = new Set([...status.sold, ...status.reserved]);
  const validados = [];

  for (const item of items) {
    const obra = catalogo.find(o => o.cod === item.id);
    if (!obra) {
      const err = new Error(`Obra ${item.id} nao existe`);
      err.status = 400;
      throw err;
    }
    if (obra.vendida || indisponiveis.has(obra.cod)) {
      const err = new Error(`A obra "${obra.titulo}" ja esta indisponivel`);
      err.status = 409;
      err.cod = obra.cod;
      throw err;
    }
    validados.push({
      id: obra.cod,
      title: `${obra.titulo} (${obra.cod})`,
      description: `${obra.tecnica} - ${obra.medidas}`,
      picture_url: item.picture_url,
      category_id: 'art',
      quantity: 1,
      unit_price: Number(obra.preco),
      currency_id: 'BRL',
      obra,
    });
  }
  return validados;
}

module.exports = { carregarCatalogo, codigosIndisponiveis, validarItens };
