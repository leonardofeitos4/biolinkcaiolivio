/* ═══════════════════════════════════
   DATA — Depoimentos
   Mesmos depoimentos usados no site
   oficial da galeria (site/js/main.js).
   Para adicionar: inclua um novo
   objeto no array tdata.
═══════════════════════════════════ */
const tdata = [
  { s: '★★★★★', t: '"Adquiri duas obras da série Horizonte para o meu escritório. A <strong>profundidade emocional</strong> das peças transformou o ambiente."', a: 'Marcos Andrade, Empresário · São Paulo' },
  { s: '★★★★★', t: '"Como arquiteta, fico exigente com o que recomendo. As telas de Caio têm uma <strong>versatilidade estética extraordinária</strong>."', a: 'Carla Mendes, Arquiteta de Interiores · Recife' },
  { s: '★★★★★', t: '"Sou colecionadora há vinte anos — a série Essência é um dos trabalhos <strong>mais consistentes</strong> que encontrei na cena nordestina."', a: 'Ana Cláudia Ferreira, Colecionadora · Fortaleza' },
];

function renderTestimonials() {
  const tt = document.getElementById('tt');
  if (!tt) return;
  [...tdata, ...tdata].forEach(t => {
    tt.innerHTML += `<div class="tc"><div class="tc-stars">${t.s}</div><div class="tc-txt">${t.t}</div><div class="tc-author">${t.a}</div></div>`;
  });
}

renderTestimonials();
