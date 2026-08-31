/* ═══════════════════════════════════════════════════════
   GERADOR DO CATÁLOGO
   ───────────────────────────────────────────────────────
   Regera data/obras.js lendo as pastas de cenários.

   USE QUANDO adicionar ou apagar fotos das pastas:
       node tools/gerar-catalogo.js

   ⚠️ ATENÇÃO: isto REESCREVE data/obras.js do zero.
      Preços individuais e obras marcadas como vendidas
      são PRESERVADOS pelo código (casados pelo nome do
      arquivo da imagem). Títulos editados à mão também.
═══════════════════════════════════════════════════════ */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SAIDA = path.join(ROOT, 'data', 'obras.js');

const natSort = (a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' });

const ls = (dir, filtro = () => true) => {
  const d = path.join(ROOT, dir);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .filter(filtro)
    .sort(natSort)
    .map(f => `${dir}/${f}`);
};

/* ── Preserva o que já foi editado à mão ── */
function catalogoAtual() {
  const vazio = { mapa: new Map(), precoPadrao: null };
  if (!fs.existsSync(SAIDA)) return vazio;
  try {
    const ctx = vm.createContext({});
    vm.runInContext(
      `${fs.readFileSync(SAIDA, 'utf8')}\n;this.__O = OBRAS; this.__P = PRECO_PADRAO;`, ctx);
    return { mapa: new Map(ctx.__O.map(o => [o.img, o])), precoPadrao: ctx.__P };
  } catch (e) {
    console.warn('Não consegui ler o catálogo atual, gerando do zero:', e.message);
    return vazio;
  }
}

const c1 = ls('solocenario1');
const c2duplo = ls('cenario2duplaesolo', f => /^duplo/i.test(f));
const c2solo = ls('cenario2duplaesolo', f => /^solo/i.test(f));
const c3 = ls('cenario3');

const T1 = ['Maré Alta', 'Sopro', 'Vestígio', 'Aurora Fria', 'Silêncio de Ferro',
  'Corrente', 'Respiro', 'Escarpa', 'Névoa Dourada', 'Contramaré',
  'Fenda', 'Origem Branca', 'Pulso', 'Salina', 'Rastro',
  'Interlúdio', 'Camada Viva', 'Horizonte Suspenso', 'Deriva', 'Quartzo'];

const T2D = ['Díptico Diálogo', 'Díptico Contraponto', 'Díptico Dois Rios',
  'Díptico Espelho', 'Díptico Travessia'];

const T2S = ['Cinza Atlântico', 'Chuva Vertical', 'Muro', 'Tempo Seco', 'Grafite',
  'Torre', 'Vento Norte', 'Marulho', 'Página em Branco', 'Ruído Suave',
  'Cal', 'Fresta', 'Sombra Longa'];

const T3 = ['Turquesa', 'Água Viva', 'Recife', 'Coral', 'Brisa', 'Enseada',
  'Ilha', 'Maresia', 'Anil', 'Praia Funda', 'Barra', 'Onda Mansa',
  'Sal Grosso', 'Verão Alto'];

const grupos = [
  { imgs: c1, titulos: T1, prefixo: 'CL-1', cenario: 1, tipo: 'solo' },
  { imgs: c2duplo, titulos: T2D, prefixo: 'CL-2', cenario: 2, tipo: 'dupla' },
  { imgs: c2solo, titulos: T2S, prefixo: 'CL-2', cenario: 2, tipo: 'solo', offset: c2duplo.length },
  { imgs: c3, titulos: T3, prefixo: 'CL-3', cenario: 3, tipo: 'solo' },
];

const { mapa: antigo, precoPadrao } = catalogoAtual();
const linhas = [];
let preservadas = 0;

for (const g of grupos) {
  g.imgs.forEach((img, i) => {
    const n = String((g.offset || 0) + i + 1).padStart(2, '0');
    const cod = `${g.prefixo}${n}`;
    const anterior = antigo.get(img);
    if (anterior) preservadas++;

    const titulo = anterior?.titulo || g.titulos[i] || `Sem título ${n}`;
    /* Só grava o número quando o preço foi editado obra a obra —
       caso contrário mantém a referência a PRECO_PADRAO. */
    const preco = anterior && anterior.preco !== precoPadrao ? anterior.preco : null;
    const vendida = anterior?.vendida ? 'true' : 'false';

    linhas.push(
      `  { cod: '${cod}', titulo: ${JSON.stringify(titulo)}, tipo: '${g.tipo}', cenario: ${g.cenario}, ` +
      `img: ${JSON.stringify(img)}, preco: ${preco ?? 'PRECO_PADRAO'}, vendida: ${vendida} },`
    );
  });
}

const arquivo = `/* ═══════════════════════════════════
   CATÁLOGO DE OBRAS À VENDA
   ───────────────────────────────────
   COMO EDITAR (para o Caio / equipe):

   • preco    → valor em reais, sem ponto e sem vírgula.
                Ex.: 3000 = R$ 3.000,00 · 4500 = R$ 4.500,00
   • vendida  → true quando a obra for vendida.
                Ela continua no site com o selo "VENDIDA"
                e o botão de compra é desativado.
   • titulo   → nome da obra exibido na loja.
   • medidas  → medidas reais da tela (ver MEDIDAS_PADRAO abaixo).

   Cada obra é PEÇA ÚNICA: 1 unidade em estoque.
   Frete grátis para todo o Brasil (ver js/pagamento.js).

   Adicionou ou apagou fotos das pastas de cenário?
   Rode:  node tools/gerar-catalogo.js
═══════════════════════════════════ */

/* Preço aplicado a todas as obras enquanto a tabela final não sai.
   Troque aqui para mudar tudo de uma vez, ou edite obra a obra abaixo. */
const PRECO_PADRAO = 3000;

const MEDIDAS_PADRAO = {
  solo:  'Medidas sob consulta',
  dupla: 'Díptico · 2 telas · medidas sob consulta',
};

const TECNICA_PADRAO = 'Acrílica e óleo sobre tela';

const CENARIOS = {
  1: { nome: 'Cenário I',   sub: 'Obras individuais' },
  2: { nome: 'Cenário II',  sub: 'Duplas e individuais' },
  3: { nome: 'Cenário III', sub: 'Obras individuais' },
};

const OBRAS = [
${linhas.join('\n')}
];

/* ── Enriquecimento automático (não precisa mexer) ── */
OBRAS.forEach(o => {
  o.medidas = o.medidas || MEDIDAS_PADRAO[o.tipo];
  o.tecnica = o.tecnica || TECNICA_PADRAO;
  o.estoque = o.vendida ? 0 : 1;
});
`;

fs.writeFileSync(SAIDA, arquivo, 'utf8');

console.log(`✓ data/obras.js regenerado — ${linhas.length} obras`);
console.log(`  Cenário I: ${c1.length} · Cenário II: ${c2duplo.length} duplas + ${c2solo.length} solos · Cenário III: ${c3.length}`);
console.log(`  ${preservadas} obras mantiveram título/preço/status anteriores`);
