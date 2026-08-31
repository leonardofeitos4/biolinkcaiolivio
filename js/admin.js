const state = {
  orders: [],
  selectedId: null,
};

const $ = id => document.getElementById(id);

function brl(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dataBR(v) {
  if (!v) return '-';
  return new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.erro || 'Falha na requisicao');
    err.status = res.status;
    throw err;
  }
  return data;
}

function showLogin() {
  $('login-view').hidden = false;
  $('panel-view').hidden = true;
}

function showPanel() {
  $('login-view').hidden = true;
  $('panel-view').hidden = false;
}

function statusLabel(status) {
  const labels = {
    approved: 'Aprovado',
    pending: 'Pendente',
    in_process: 'Analise',
    created: 'Criado',
    rejected: 'Recusado',
    cancelled: 'Cancelado',
    refunded: 'Reembolso',
    charged_back: 'Contestacao',
  };
  return labels[status] || status || 'Atualizado';
}

function renderMetrics() {
  const total = state.orders.reduce((sum, o) => sum + (o.status === 'approved' ? Number(o.total) : 0), 0);
  const aprovadas = state.orders.filter(o => o.status === 'approved').length;
  const pendentes = state.orders.filter(o => ['created', 'pending', 'in_process'].includes(o.status)).length;
  $('metrics').innerHTML = `
    <div class="metric"><strong>${state.orders.length}</strong><span>Compras</span></div>
    <div class="metric"><strong>${aprovadas}</strong><span>Aprovadas</span></div>
    <div class="metric"><strong>${brl(total)}</strong><span>Receita aprovada</span></div>
  `;
  $('notice').textContent = pendentes ? `${pendentes} compra(s) aguardando pagamento ou confirmacao.` : '';
}

function renderOrders() {
  if (!state.orders.length) {
    $('orders-list').innerHTML = '<div class="empty-detail">Nenhuma compra registrada ainda.</div>';
    $('order-detail').innerHTML = '<div class="empty-detail">Os pedidos criados pelo checkout aparecem aqui.</div>';
    renderMetrics();
    return;
  }

  if (!state.selectedId) state.selectedId = state.orders[0].id;
  $('orders-list').innerHTML = state.orders.map(order => {
    const itemTitle = order.items?.[0]?.title || 'Compra sem obra';
    const extra = order.items?.length > 1 ? ` +${order.items.length - 1}` : '';
    return `
      <button class="order-card ${order.id === state.selectedId ? 'active' : ''}" type="button" data-order="${esc(order.id)}">
        <div>
          <div class="order-title">${esc(itemTitle)}${extra}</div>
          <div class="order-meta">${esc(order.buyer?.name || '-')} · ${dataBR(order.created_at)}</div>
          <div class="order-meta">${brl(order.total)} · Pedido ${esc(order.id.slice(0, 8))}</div>
        </div>
        <span class="status ${esc(order.status)}">${statusLabel(order.status)}</span>
      </button>
    `;
  }).join('');

  document.querySelectorAll('[data-order]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedId = btn.dataset.order;
      renderOrders();
    });
  });
  renderMetrics();
  renderDetail();
}

function renderDetail() {
  const order = state.orders.find(o => o.id === state.selectedId);
  if (!order) return;
  const address = order.address || {};
  const payment = order.payment || {};
  $('order-detail').innerHTML = `
    <section class="detail-section">
      <div class="detail-title">Compra</div>
      <div class="kv"><span>Status</span><strong>${statusLabel(order.status)}</strong></div>
      <div class="kv"><span>Total</span><strong>${brl(order.total)}</strong></div>
      <div class="kv"><span>Pedido</span><strong>${esc(order.id)}</strong></div>
      <div class="kv"><span>Pagamento</span><strong>${esc(order.mp_payment_id || payment.id || '-')}</strong></div>
      <div class="kv"><span>Criado em</span><strong>${dataBR(order.created_at)}</strong></div>
    </section>
    <section class="detail-section">
      <div class="detail-title">Comprador</div>
      <div class="kv"><span>Nome</span><strong>${esc(order.buyer?.name || '-')}</strong></div>
      <div class="kv"><span>E-mail</span><strong>${esc(order.buyer?.email || '-')}</strong></div>
      <div class="kv"><span>WhatsApp</span><strong>${esc(order.buyer?.phone || '-')}</strong></div>
    </section>
    <section class="detail-section">
      <div class="detail-title">Entrega</div>
      <div class="kv"><span>CEP</span><strong>${esc(address.zip_code || '-')}</strong></div>
      <div class="kv"><span>UF</span><strong>${esc(address.state || '-')}</strong></div>
      <div class="kv"><span>Cidade</span><strong>${esc(address.city || '-')}</strong></div>
      <div class="kv"><span>Rua</span><strong>${esc(address.street_name || '-')}</strong></div>
      <div class="kv"><span>Numero</span><strong>${esc(address.street_number || '-')}</strong></div>
    </section>
    <section class="detail-section">
      <div class="detail-title">Obras</div>
      ${(order.items || []).map(item => `
        <div class="item-row">
          <img src="${esc(item.image || '')}" alt="${esc(item.title)}">
          <div><strong>${esc(item.title)}</strong><span>${esc(item.code)} · ${brl(item.price)}</span></div>
        </div>
      `).join('')}
    </section>
  `;
}

async function loadPanel() {
  try {
    const [orders, mp] = await Promise.all([
      api('/api/admin/orders'),
      api('/api/admin/mp/status'),
    ]);
    state.orders = orders.orders || [];
    $('mp-status').textContent = mp.connected
      ? `Conectado via ${mp.source === 'oauth' ? 'OAuth' : 'token do servidor'}${mp.user_id ? ` · ${mp.user_id}` : ''}`
      : 'Conta ainda nao conectada.';
    $('mp-connect-btn').textContent = mp.connected ? 'Reconectar' : 'Conectar';
    showPanel();
    renderOrders();
  } catch (err) {
    if (err.status === 401) showLogin();
    else {
      showPanel();
      $('notice').textContent = err.message;
    }
  }
}

$('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  $('login-error').textContent = '';
  try {
    await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: $('admin-password').value }),
    });
    $('admin-password').value = '';
    await loadPanel();
  } catch (err) {
    $('login-error').textContent = err.message;
  }
});

$('logout-btn').addEventListener('click', async () => {
  await api('/api/admin/logout', { method: 'POST' }).catch(() => {});
  showLogin();
});

$('mp-connect-btn').addEventListener('click', async () => {
  try {
    $('mp-status').textContent = 'Abrindo autorizacao...';
    const data = await api('/api/admin/mp/connect');
    location.href = data.url;
  } catch (err) {
    $('mp-status').textContent = err.message;
  }
});

const params = new URLSearchParams(location.search);
if (params.get('mp') === 'connected') {
  history.replaceState({}, '', '/admin.html');
}

loadPanel();
