/* Pedido de compra via WhatsApp */

const PAGAMENTO = {
  moeda: 'BRL',
  frete: {
    gratis: true,
    custo: 0,
    texto: 'Frete gratis para todo o Brasil',
  },
  whatsapp: CONFIG.WA,
};

function brl(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pedidoWhatsApp(itens, comprador) {
  const linhas = itens.map(o => `- ${o.titulo} (${o.cod}) - ${brl(o.preco)}`).join('\n');
  const total = itens.reduce((s, o) => s + Number(o.preco || 0), 0);
  const e = comprador.endereco || {};
  const msg =
    `Ola! Vim pelo biolink e quero finalizar a compra:\n\n` +
    `${linhas}\n\n` +
    `Total: ${brl(total)}\n` +
    `Frete: gratis para todo o Brasil\n\n` +
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

function finalizarCompra(itens, comprador, onStatus) {
  const status = onStatus || (() => {});
  if (!itens.length) return;

  const url = pedidoWhatsApp(itens, comprador);
  status('wa');
  const janela = window.open(url, '_blank', 'noopener');
  if (!janela) location.href = url;
}
