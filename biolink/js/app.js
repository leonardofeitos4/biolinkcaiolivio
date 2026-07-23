/* ═══════════════════════════════════
   APP — Lógica principal
   Neural canvas, cursor, navegação,
   ripple, contadores, tabs.
═══════════════════════════════════ */

/* ── Neural Canvas ── */
const cv = document.getElementById('nc'), cx = cv.getContext('2d');
let W, H, nodes = [], mx = -999, my = -999;

function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }

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

function anim() { cx.clearRect(0, 0, W, H); drawC(); nodes.forEach(n => { n.upd(); n.draw(); }); requestAnimationFrame(anim); }

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

/* ── Cursor personalizado ── */
const cur = document.getElementById('cur'), ring = document.getElementById('cur-r');
let rx = 0, ry = 0;
addEventListener('mousemove', e => {
  cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
  rx += (e.clientX - rx) * .13; ry += (e.clientY - ry) * .13;
});
(function sr() { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(sr); })();

/* ── Navegação SPA ── */
let cur_pg = null;

addEventListener('popstate', () => {
  if (cur_pg) { document.getElementById(cur_pg).classList.remove('active'); cur_pg = null; }
  document.getElementById('home').classList.remove('behind');
  document.getElementById('home-fabs').style.cssText = '';
});

function go(id) {
  history.pushState({ p: id }, '', location.href);
  if (cur_pg) document.getElementById(cur_pg).classList.remove('active');
  cur_pg = id;
  document.getElementById(id).classList.add('active');
  document.getElementById('home').classList.add('behind');
  document.getElementById('home-fabs').style.cssText = 'opacity:0;pointer-events:none';
  if (id === 'page-chat' && !aiStarted) { startChat(); aiStarted = true; }
}

function back() { history.back(); }

/* ── Ripple nos link cards ── */
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

/* ── Contadores animados ── */
new IntersectionObserver(es => {
  if (es[0].isIntersecting) {
    document.querySelectorAll('[data-t]').forEach(el => {
      let c = 0, t = +el.dataset.t, s = Math.ceil(t / 55);
      const ti = setInterval(() => { c = Math.min(c + s, t); el.textContent = c; if (c >= t) clearInterval(ti); }, 24);
    });
  }
}, { threshold: .3 }).observe(document.querySelector('.stats'));

/* ── Tabs (Acervo & Séries) ── */
function ctab(btn, pane) {
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.cat-pane').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById(pane).classList.add('on');
  document.getElementById('page-acervo').scrollTo({ top: 0, behavior: 'smooth' });
}
