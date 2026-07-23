/* ═══════════════════════════════════
   CORA ENGINE — Motor do Chatbot
   Depende de: config.js, flows.js
═══════════════════════════════════ */

let aiStarted = false;

const BOT_AVATAR = `<span class="mlbl-ava">${CONFIG.botName.charAt(0)}</span>`;

/* Renderiza chips inline abaixo da mensagem */
function showChips(chips, area) {
  const wrap = document.createElement('div');
  wrap.className = 'inline-chips';

  let html = chips.map(c => {
    if (c.wa) return `<a class="qrb qrb-wa" href="${waLink(c.wa)}" target="_blank" rel="noopener">${c.l}</a>`;
    return `<button class="qrb" onclick="runFlow('${c.f}','${c.l.replace(/'/g, "\\'")}')">${c.l}</button>`;
  }).join('');

  if (!chips.some(c => c.f === 'inicio')) {
    html += `<button class="qrb qrb-back" onclick="runFlow('inicio','↩ Menu principal')">↩ Início</button>`;
  }

  wrap.innerHTML = html;
  area.appendChild(wrap);
  area.scrollTop = area.scrollHeight;
}

/* Desativa todos os chips anteriores quando usuário escolhe uma opção */
function disableChips() {
  document.querySelectorAll('.inline-chips').forEach(el => {
    el.style.opacity = '.35';
    el.style.pointerEvents = 'none';
  });
}

/* Navega para um flow, exibindo a mensagem do usuário e a resposta da Cora */
function runFlow(id, label) {
  const f = flows[id];
  if (!f) return;
  disableChips();
  if (label) userMsg(label);
  botMsg(f.msg, f.chips);
}

/* Mensagem de boas vindas ao abrir o chat */
function startChat() {
  setTimeout(() => botMsg(
    `Olá! Me chamo <strong>${CONFIG.botName}</strong>, a curadoria digital de <strong>Caio Livio</strong>. 😊<br><br>Pra te ajudar melhor — o que você está buscando hoje?`,
    flows.inicio.chips
  ), 450);
}

/* Renderiza mensagem da Cora com indicador de digitação */
function botMsg(html, chips) {
  const a = document.getElementById('chat-area');

  const td = document.createElement('div');
  td.className = 'typing-dot';
  td.innerHTML = `${BOT_AVATAR}<span></span><span></span><span></span>`;
  a.appendChild(td);
  a.scrollTop = a.scrollHeight;

  const delay = CONFIG.typingDelayMin + Math.random() * CONFIG.typingDelayRandom;

  setTimeout(() => {
    td.remove();

    const lbl = document.createElement('div');
    lbl.className = 'mlbl';
    lbl.innerHTML = `${BOT_AVATAR}${CONFIG.botName} · ${CONFIG.botRole}`;
    a.appendChild(lbl);

    const msg = document.createElement('div');
    msg.className = 'msg bot';
    msg.innerHTML = html;
    a.appendChild(msg);

    if (chips !== undefined) showChips(chips, a);
    a.scrollTop = a.scrollHeight;
  }, delay);
}

/* Renderiza mensagem do usuário */
function userMsg(t) {
  const a = document.getElementById('chat-area');
  const lbl = document.createElement('div');
  lbl.className = 'mlbl u';
  lbl.textContent = 'Você';
  const msg = document.createElement('div');
  msg.className = 'msg user';
  msg.textContent = t;
  a.appendChild(lbl);
  a.appendChild(msg);
  a.scrollTop = a.scrollHeight;
}
