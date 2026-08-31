/* ═══════════════════════════════════
   APP — Lógica principal
   Navegação, contadores, cursor,
   neural canvas.

   ⚠️ A navegação vem PRIMEIRO e os enfeites
   (canvas/cursor) ficam isolados em try/catch:
   se algo decorativo falhar, a loja continua
   funcionando normalmente.
═══════════════════════════════════ */

/* ══════════════════════════════════════
   NAVEGAÇÃO SPA (pilha de páginas)
   A loja precisa de mais de um nível:
   loja → obra → carrinho.
══════════════════════════════════════ */
let pgStack = [];
let historicoOk = true;   // false quando pushState não é permitido (file://)

function go(id) {
  const el = document.getElementById(id);
  if (!el) { console.warn('[nav] página inexistente:', id); return; }
  try {
    history.pushState({ pg: id, depth: pgStack.length + 1 }, '', location.href);
  } catch (e) {
    /* Abrir o index.html direto do disco (file://) bloqueia o pushState.
       Nesse caso a navegação segue sem histórico do navegador. */
    historicoOk = false;
  }
  pushPg(id);
}

function pushPg(id) {
  const anterior = pgStack[pgStack.length - 1];
  if (anterior) document.getElementById(anterior).classList.remove('active');
  pgStack.push(id);
  const el = document.getElementById(id);
  el.classList.add('active');
  el.scrollTop = 0;
  document.getElementById('home').classList.add('behind');
  document.getElementById('home-fabs').style.cssText = 'opacity:0;pointer-events:none';
  if (id === 'page-chat' && typeof startChat === 'function' && !aiStarted) {
    startChat(); aiStarted = true;
  }
}

/* Desempilha n páginas de uma vez */
function popPg(n) {
  n = n || 1;
  while (n-- > 0 && pgStack.length) {
    document.getElementById(pgStack.pop()).classList.remove('active');
  }
  const topo = pgStack[pgStack.length - 1];
  if (topo) {
    document.getElementById(topo).classList.add('active');
  } else {
    document.getElementById('home').classList.remove('behind');
    document.getElementById('home-fabs').style.cssText = '';
  }
}

/* Volta n páginas — usa o histórico quando disponível */
function voltarPaginas(n) {
  if (n <= 0) return;
  if (historicoOk) history.go(-n);
  else popPg(n);
}

function back() { voltarPaginas(1); }

/* O navegador dispara UM único popstate mesmo em history.go(-2).
   Por isso a pilha é sincronizada pela profundidade guardada no
   state, e não pela contagem de eventos. */
addEventListener('popstate', e => {
  const alvo = (e.state && e.state.depth) || 0;
  if (pgStack.length > alvo) popPg(pgStack.length - alvo);
  else if (alvo === pgStack.length + 1 && e.state && e.state.pg) pushPg(e.state.pg);
});

/* ══════════════════════════════════════
   CONTADORES ANIMADOS
══════════════════════════════════════ */
function iniciarContadores() {
  const alvo = document.querySelector('.stats');
  if (!alvo) return;
  const animar = () => document.querySelectorAll('[data-t]').forEach(el => {
    let c = 0; const t = +el.dataset.t, s = Math.ceil(t / 55);
    const ti = setInterval(() => {
      c = Math.min(c + s, t); el.textContent = c;
      if (c >= t) clearInterval(ti);
    }, 24);
  });
  if (!('IntersectionObserver' in window)) return animar();
  new IntersectionObserver(es => { if (es[0].isIntersecting) animar(); }, { threshold: .3 }).observe(alvo);
}

/* ══════════════════════════════════════
   RIPPLE NOS LINK CARDS
══════════════════════════════════════ */
function iniciarRipple() {
  document.querySelectorAll('.lcard').forEach(c => {
    c.addEventListener('pointerdown', function (e) {
      const r = this.getBoundingClientRect(), d = document.createElement('div');
      d.className = 'ripple';
      const sz = r.width * 2;
      d.style.cssText = `left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;width:${sz}px;height:${sz}px;margin:-${sz / 2}px`;
      this.appendChild(d);
      setTimeout(() => d.remove(), 500);
    });
  });
}

/* ══════════════════════════════════════
   CURSOR PERSONALIZADO (decorativo)
══════════════════════════════════════ */
function iniciarCursor() {
  const cur = document.getElementById('cur'), ring = document.getElementById('cur-r');
  if (!cur || !ring) return;
  let rx = 0, ry = 0;
  addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
    rx += (e.clientX - rx) * .13; ry += (e.clientY - ry) * .13;
  });
  (function sr() { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(sr); })();
}

/* ══════════════════════════════════════
   NEURAL CANVAS (decorativo)
══════════════════════════════════════ */
function iniciarCanvas() {
  const cv = document.getElementById('nc');
  const cx = cv && cv.getContext && cv.getContext('2d');
  if (!cx) return;

  let W, H, nodes = [], mx = -999, my = -999;
  const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };

  class N {
    constructor() {
      this.x = Math.random() * innerWidth;
      this.y = Math.random() * innerHeight;
      this.vx = (Math.random() - .5) * .3;
      this.vy = (Math.random() - .5) * .3;
      this.r = Math.random() * 1.8 + .6;
      this.ph = Math.random() * Math.PI * 2;
      this.ps = .012 + Math.random() * .022;
      this.act = Math.random() > .75;
    }
    upd() {
      this.ph += this.ps;
      const dx = mx - this.x, dy = my - this.y, d = Math.hypot(dx, dy);
      if (d < 100) { this.vx += dx * .0002; this.vy += dy * .0002; }
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      const p = (Math.sin(this.ph) + 1) / 2;
      const a = this.act ? .45 + p * .3 : .1 + p * .12;
      const s = this.r * (this.act ? 1 + p * .4 : 1);
      cx.beginPath(); cx.arc(this.x, this.y, s, 0, Math.PI * 2);
      cx.fillStyle = this.act ? `rgba(201,161,92,${a})` : `rgba(120,100,70,${a * .7})`; cx.fill();
      if (this.act && p > .68) {
        cx.beginPath(); cx.arc(this.x, this.y, s * 3, 0, Math.PI * 2);
        cx.fillStyle = `rgba(201,161,92,${(p - .68) * .1})`; cx.fill();
      }
    }
  }

  function drawC() {
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < 130) {
        const a = (1 - d / 130) * .18, ac = nodes[i].act || nodes[j].act;
        cx.beginPath(); cx.moveTo(nodes[i].x, nodes[i].y); cx.lineTo(nodes[j].x, nodes[j].y);
        cx.strokeStyle = ac ? `rgba(201,161,92,${a})` : `rgba(120,100,70,${a * .5})`;
        cx.lineWidth = ac ? .8 : .35; cx.stroke();
      }
    }
  }

  function anim() {
    cx.clearRect(0, 0, W, H);
    drawC();
    nodes.forEach(n => { n.upd(); n.draw(); });
    requestAnimationFrame(anim);
  }

  resize();
  addEventListener('resize', resize);
  for (let i = 0; i < 40; i++) nodes.push(new N());
  anim();
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  setInterval(() => {
    const n = nodes[Math.floor(Math.random() * nodes.length)];
    n.act = true;
    setTimeout(() => n.act = false, 2e3 + Math.random() * 3e3);
  }, 1200);
}

/* ── Boot: enfeites não podem derrubar a loja ── */
iniciarContadores();
iniciarRipple();
try { iniciarCursor(); } catch (e) { console.warn('[cursor]', e); }
try { iniciarCanvas(); } catch (e) { console.warn('[canvas]', e); }
