/* ═══════════════════════════════════════════════════════
   LOJA — vitrine, ficha da obra e carrinho
   Depende de: data/obras.js, js/pagamento.js, chatbot/config.js
   ═══════════════════════════════════════════════════════
   Cada obra é PEÇA ÚNICA (1 unidade). O carrinho nunca
   aceita a mesma obra duas vezes.
═══════════════════════════════════════════════════════ */

const CARRINHO_KEY = 'cl_carrinho_v1';
const COMPRADOR_KEY = 'cl_comprador_v1';

let carrinho = [];          // array de códigos (ex.: ['CL-101'])
let filtroAtual = 'todas';

const obraPor = cod => OBRAS.find(o => o.cod === cod);
const itensCarrinho = () => carrinho.map(obraPor).filter(Boolean);
const totalCarrinho = () => itensCarrinho().reduce((s, o) => s + o.preco, 0);

/* ── Persistência ── */
function salvarCarrinho() {
  try { localStorage.setItem(CARRINHO_KEY, JSON.stringify(carrinho)); } catch (e) {}
}
function carregarCarrinho() {
  try {
    const s = JSON.parse(localStorage.getItem(CARRINHO_KEY) || '[]');
    /* descarta códigos inválidos ou obras já vendidas */
    carrinho = s.filter(c => { const o = obraPor(c); return o && !o.vendida; });
  } catch (e) { carrinho = []; }
}

/* ═══ VITRINE DA HOME ═══════════════════════════════ */
function renderVitrine() {
  const el = document.getElementById('vitrine');
  if (!el) return;
  const destaques = OBRAS.filter(o => !o.vendida).slice(0, 12);
  el.innerHTML = destaques.map(o => `
    <div class="vcard" onclick="abrirObra('${o.cod}')">
      <div class="vcard-img">
        <img src="${o.img}" alt="${o.titulo} — obra de Caio Livio" loading="lazy">
        <span class="vcard-tipo">${o.tipo === 'dupla' ? 'Dupla' : 'Solo'}</span>
      </div>
      <div class="vcard-foot">
        <div class="vcard-ttl">${o.titulo}</div>
        <div class="vcard-preco">${brl(o.preco)}</div>
        <button class="vcard-btn" onclick="event.stopPropagation();addCarrinho('${o.cod}')">Comprar</button>
      </div>
    </div>`).join('');
}

/* ═══ GRADE DA LOJA ═════════════════════════════════ */
function renderLoja() {
  const el = document.getElementById('loja-grid');
  if (!el) return;

  const lista = OBRAS.filter(o =>
    filtroAtual === 'todas' ? true :
    filtroAtual === 'solo' || filtroAtual === 'dupla' ? o.tipo === filtroAtual :
    o.cenario === +filtroAtual
  );

  document.getElementById('loja-count').textContent =
    `${lista.filter(o => !o.vendida).length} obras disponíveis`;

  el.innerHTML = lista.map(o => {
    const noCarrinho = carrinho.includes(o.cod);
    return `
    <div class="pcard ${o.vendida ? 'vendida' : ''}" onclick="abrirObra('${o.cod}')">
      <div class="pcard-img">
        <img src="${o.img}" alt="${o.titulo} — obra de Caio Livio" loading="lazy">
        <span class="pcard-tipo">${o.tipo === 'dupla' ? 'Dupla' : 'Solo'}</span>
        ${o.vendida ? '<span class="pcard-sold">Vendida</span>' : ''}
      </div>
      <div class="pcard-body">
        <div class="pcard-ttl">${o.titulo}</div>
        <div class="pcard-cod">${o.cod} · ${o.tecnica}</div>
        <div class="pcard-preco">${brl(o.preco)}</div>
        <div class="pcard-parc">${PAGAMENTO.parcelas}x de ${parcelaDe(o.preco)}</div>
        ${o.vendida
          ? `<button class="pcard-btn off" disabled>Obra vendida</button>`
          : `<button class="pcard-btn ${noCarrinho ? 'in' : ''}"
               onclick="event.stopPropagation();${noCarrinho ? 'abrirCarrinho()' : `addCarrinho('${o.cod}')`}">
               ${noCarrinho ? '✓ No carrinho' : 'Adicionar'}
             </button>`}
      </div>
    </div>`;
  }).join('');
}

function filtroLoja(btn, valor) {
  document.querySelectorAll('#loja-filtros .ctab').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  filtroAtual = valor;
  renderLoja();
  const pg = document.getElementById('page-loja');
  if (pg.scrollTo) pg.scrollTo({ top: 0, behavior: 'smooth' });
  else pg.scrollTop = 0;
}

/* ═══ FICHA DA OBRA ═════════════════════════════════ */
function abrirObra(cod) {
  const o = obraPor(cod);
  if (!o) return;
  const noCarrinho = carrinho.includes(o.cod);

  document.getElementById('obra-conteudo').innerHTML = `
    <div class="ob-img">
      <img src="${o.img}" alt="${o.titulo} — obra de Caio Livio">
      ${o.vendida ? '<span class="pcard-sold">Vendida</span>' : ''}
    </div>
    <div class="ob-tags">
      <span class="exp-b">${o.tipo === 'dupla' ? 'Dupla · Díptico' : 'Obra solo'}</span>
      <span class="exp-b">Peça única</span>
      <span class="exp-b">${CENARIOS[o.cenario].nome}</span>
    </div>
    <div class="ob-ttl">${o.titulo}</div>
    <div class="ob-cod">Código ${o.cod}</div>

    <div class="ob-specs">
      <div class="ob-spec"><span>Técnica</span><strong>${o.tecnica}</strong></div>
      <div class="ob-spec"><span>Medidas</span><strong>${o.medidas}</strong></div>
      <div class="ob-spec"><span>Estoque</span><strong>${o.vendida ? 'Vendida' : '1 unidade — peça única'}</strong></div>
      <div class="ob-spec"><span>Entrega</span><strong>${PAGAMENTO.frete.texto}</strong></div>
    </div>

    <div class="ob-preco-box">
      <div class="ob-preco">${brl(o.preco)}</div>
      <div class="ob-parc">em até ${PAGAMENTO.parcelas}x de ${parcelaDe(o.preco)} no cartão</div>
      <div class="ob-frete">✓ ${PAGAMENTO.frete.texto}</div>
    </div>

    <p class="cat-desc">Obra original assinada por Caio Livio, acompanhada de
    <strong>certificado de autenticidade</strong>. Peça única — uma vez vendida,
    sai do acervo disponível. Embalagem própria para transporte de arte.</p>

    ${o.vendida
      ? `<button class="cta-btn" disabled style="opacity:.4;cursor:not-allowed">Obra já vendida</button>`
      : `<button class="cta-btn" onclick="comprarAgora('${o.cod}')">Comprar agora · ${brl(o.preco)}</button>
         <button class="cta-alt" onclick="${noCarrinho ? 'abrirCarrinho()' : `addCarrinho('${o.cod}',true)`}">
           ${noCarrinho ? '✓ Já está no carrinho — ver carrinho' : 'Adicionar ao carrinho'}
         </button>`}

    <a class="cta-wa" href="${waLink(`Vim pelo biolink e quero saber mais sobre a obra ${o.titulo} (${o.cod}).`)}"
       target="_blank" rel="noopener">💬 Tirar uma dúvida sobre esta obra</a>
  `;
  go('page-obra');
}

/* ═══ CARRINHO ══════════════════════════════════════ */
function addCarrinho(cod, silencioso) {
  const o = obraPor(cod);
  if (!o || o.vendida) return;
  if (!carrinho.includes(cod)) {
    carrinho.push(cod);
    salvarCarrinho();
    if (!silencioso) toast(`${o.titulo} adicionada ao carrinho`);
  }
  atualizarUI();
}

function removerCarrinho(cod) {
  carrinho = carrinho.filter(c => c !== cod);
  salvarCarrinho();
  atualizarUI();
}

function comprarAgora(cod) {
  addCarrinho(cod, true);
  abrirCarrinho();
}

function abrirCarrinho() {
  renderCarrinho();
  if (pgStack[pgStack.length - 1] !== 'page-carrinho') go('page-carrinho');
}

function renderCarrinho() {
  const el = document.getElementById('carrinho-conteudo');
  if (!el) return;
  const itens = itensCarrinho();

  if (!itens.length) {
    el.innerHTML = `
      <div class="cart-vazio">
        <div class="cart-vazio-ico">🛒</div>
        <div class="cart-vazio-t">Seu carrinho está vazio</div>
        <div class="cart-vazio-s">Escolha uma obra na loja para começar.</div>
        <button class="cta-btn" onclick="irParaLoja()">Ver obras disponíveis</button>
      </div>`;
    return;
  }

  const total = totalCarrinho();
  const c = comprador();

  el.innerHTML = `
    <div class="cart-itens">
      ${itens.map(o => `
        <div class="cart-item">
          <div class="cart-thumb"><img src="${o.img}" alt="${o.titulo}"></div>
          <div class="cart-info">
            <div class="cart-nm">${o.titulo}</div>
            <div class="cart-cod">${o.cod} · ${o.tipo === 'dupla' ? 'Dupla' : 'Solo'} · peça única</div>
            <div class="cart-pr">${brl(o.preco)}</div>
          </div>
          <button class="cart-del" onclick="removerCarrinho('${o.cod}')" aria-label="Remover">✕</button>
        </div>`).join('')}
    </div>

    <div class="cart-resumo">
      <div class="cart-linha"><span>Subtotal (${itens.length} ${itens.length > 1 ? 'obras' : 'obra'})</span><span>${brl(total)}</span></div>
      <div class="cart-linha"><span>Frete</span><span class="cart-gratis">Grátis</span></div>
      <div class="cart-linha cart-total"><span>Total</span><span>${brl(total)}</span></div>
      <div class="cart-parc">em até ${PAGAMENTO.parcelas}x de ${parcelaDe(total)} no cartão</div>
    </div>

    <div class="cart-form">
      <div class="cart-form-t">Dados para a entrega e o certificado</div>
      <input id="cp-nome"  class="cart-inp" type="text"  placeholder="Nome completo"        value="${c.nome || ''}"  autocomplete="name">
      <input id="cp-email" class="cart-inp" type="email" placeholder="E-mail"               value="${c.email || ''}" autocomplete="email">
      <input id="cp-fone"  class="cart-inp" type="tel"   placeholder="WhatsApp com DDD"     value="${c.fone || ''}"  autocomplete="tel">
      <div class="cart-erro" id="cart-erro"></div>
    </div>

    <button class="cta-btn" id="btn-checkout" onclick="checkout()">🔒 Finalizar compra · ${brl(total)}</button>
    <div class="cart-selo">Pagamento processado pelo Mercado Pago · Pix, cartão ou boleto</div>
    <button class="cta-alt" onclick="irParaLoja()">Continuar escolhendo obras</button>
  `;
}

function irParaLoja() {
  const i = pgStack.lastIndexOf('page-loja');
  if (i >= 0) {
    /* A loja já está na pilha: volta até ela em vez de empilhar de novo. */
    if (i < pgStack.length - 1) voltarPaginas(pgStack.length - 1 - i);
    return;
  }
  renderLoja();
  go('page-loja');
}

/* ── Dados do comprador ──
   Prioriza o que já está digitado na tela para não perder o texto
   quando o carrinho é re-renderizado (ex.: ao remover uma obra). */
function comprador() {
  let salvo = {};
  try { salvo = JSON.parse(localStorage.getItem(COMPRADOR_KEY) || '{}'); } catch (e) {}
  const v = id => (document.getElementById(id) || {}).value;
  return {
    nome: v('cp-nome') || salvo.nome || '',
    email: v('cp-email') || salvo.email || '',
    fone: v('cp-fone') || salvo.fone || '',
  };
}
function salvarComprador(c) {
  try { localStorage.setItem(COMPRADOR_KEY, JSON.stringify(c)); } catch (e) {}
}

/* ── Checkout ── */
function checkout() {
  const c = {
    nome: document.getElementById('cp-nome').value.trim(),
    email: document.getElementById('cp-email').value.trim(),
    fone: document.getElementById('cp-fone').value.trim(),
  };
  const erro = document.getElementById('cart-erro');

  if (!c.nome || !c.email || !c.fone) {
    erro.textContent = 'Preencha nome, e-mail e WhatsApp para continuar.';
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) {
    erro.textContent = 'Confira o e-mail digitado.';
    return;
  }
  erro.textContent = '';
  salvarComprador(c);

  const btn = document.getElementById('btn-checkout');
  finalizarCompra(itensCarrinho(), c, st => {
    if (st === 'carregando') { btn.disabled = true; btn.textContent = 'Abrindo pagamento…'; }
    if (st === 'redirecionando') btn.textContent = 'Redirecionando…';
    if (st === 'wa') { btn.textContent = 'Enviando pedido no WhatsApp…'; setTimeout(() => renderCarrinho(), 1500); }
    if (st === 'erro') {
      btn.disabled = false;
      btn.textContent = 'Tentar novamente';
      erro.textContent = 'Não foi possível abrir o pagamento agora. Abrimos o WhatsApp da curadoria para você concluir.';
    }
  });
}

/* ═══ UI GLOBAL ═════════════════════════════════════ */
function atualizarUI() {
  const n = carrinho.length;
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = n;
    el.style.display = n ? 'flex' : 'none';
  });
  renderLoja();
  renderCarrinho();
}

let toastT;
function toast(txt) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.innerHTML = `<span>🛒</span>${txt}`;
  el.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('on'), 2600);
}

/* ── Boot ──
   Mantém os números da home em sincronia com o catálogo:
   basta adicionar/remover obras em data/obras.js. */
function sincronizarContadores() {
  const disponiveis = OBRAS.filter(o => !o.vendida).length;
  const stat = document.querySelector('.stat .sn[data-t]');
  if (stat) stat.dataset.t = disponiveis;
  document.querySelectorAll('[data-obras-total]').forEach(el => {
    el.textContent = el.dataset.obrasTotal.replace('{n}', disponiveis);
  });
}

carregarCarrinho();
sincronizarContadores();
renderVitrine();
renderLoja();
atualizarUI();
