/* ═══════════════════════════════════
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
  { cod: 'CL-101', titulo: "Maré Alta", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_1ezyp71ezyp71ezy.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-102', titulo: "Sopro", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_6zkyox6zkyox6zky.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-103', titulo: "Vestígio", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_9utyzy9utyzy9uty.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-104', titulo: "Aurora Fria", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_63eyjr63eyjr63ey.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-105', titulo: "Silêncio de Ferro", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_bfz8fgbfz8fgbfz8.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-106', titulo: "Corrente", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_cdea6dcdea6dcdea.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-107', titulo: "Respiro", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_d8987gd8987gd898.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-108', titulo: "Escarpa", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_eh0z0jeh0z0jeh0z.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-109', titulo: "Névoa Dourada", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_fw7auvfw7auvfw7a.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-110', titulo: "Contramaré", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_hcgr9xhcgr9xhcgr.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-111', titulo: "Fenda", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_k78aatk78aatk78a.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-112', titulo: "Origem Branca", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_lo4vuelo4vuelo4v.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-113', titulo: "Pulso", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_mp2vqtmp2vqtmp2v.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-114', titulo: "Salina", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_orxj09orxj09orxj.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-115', titulo: "Rastro", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_puyeapuyeapuyeap.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-116', titulo: "Interlúdio", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_qubxraqubxraqubx.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-117', titulo: "Camada Viva", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_xm1zo0xm1zo0xm1z.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-118', titulo: "Horizonte Suspenso", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_ye9pfmye9pfmye9p.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-119', titulo: "Deriva", tipo: 'solo', cenario: 1, img: "solocenario1/Gemini_Generated_Image_yw47qwyw47qwyw47.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-201', titulo: "Díptico Diálogo", tipo: 'dupla', cenario: 2, img: "cenario2duplaesolo/duplo.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-202', titulo: "Díptico Contraponto", tipo: 'dupla', cenario: 2, img: "cenario2duplaesolo/duplo2.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-203', titulo: "Díptico Dois Rios", tipo: 'dupla', cenario: 2, img: "cenario2duplaesolo/duplo3.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-204', titulo: "Díptico Espelho", tipo: 'dupla', cenario: 2, img: "cenario2duplaesolo/duplo4.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-205', titulo: "Díptico Travessia", tipo: 'dupla', cenario: 2, img: "cenario2duplaesolo/duplo5.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-206', titulo: "Cinza Atlântico", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-207', titulo: "Chuva Vertical", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo1.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-208', titulo: "Muro", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo2.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-209', titulo: "Tempo Seco", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo3.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-210', titulo: "Grafite", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo4.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-211', titulo: "Torre", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo5.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-212', titulo: "Vento Norte", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo6.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-213', titulo: "Marulho", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo7.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-214', titulo: "Página em Branco", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo8.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-215', titulo: "Ruído Suave", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo10.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-216', titulo: "Cal", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo11.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-217', titulo: "Fresta", tipo: 'solo', cenario: 2, img: "cenario2duplaesolo/solo12.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-301', titulo: "Turquesa", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_6t58ec6t58ec6t58.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-302', titulo: "Água Viva", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_9p1lpq9p1lpq9p1l.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-303', titulo: "Recife", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_9qpxp49qpxp49qpx.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-304', titulo: "Coral", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_48t1b248t1b248t1.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-305', titulo: "Brisa", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_82vr7a82vr7a82vr.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-306', titulo: "Enseada", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_c6y0mlc6y0mlc6y0.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-307', titulo: "Ilha", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_d1qpw6d1qpw6d1qp.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-308', titulo: "Maresia", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_dy0u63dy0u63dy0u.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-309', titulo: "Anil", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_fwangvfwangvfwan.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-310', titulo: "Praia Funda", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_jbg03wjbg03wjbg0.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-311', titulo: "Barra", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_l6y4pwl6y4pwl6y4.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-312', titulo: "Onda Mansa", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_qtylojqtylojqtyl.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-313', titulo: "Sal Grosso", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_spz6lsspz6lsspz6.jpg", preco: PRECO_PADRAO, vendida: false },
  { cod: 'CL-314', titulo: "Verão Alto", tipo: 'solo', cenario: 3, img: "cenario3/Gemini_Generated_Image_vdguuhvdguuhvdgu.jpg", preco: PRECO_PADRAO, vendida: false },
];

/* ── Enriquecimento automático (não precisa mexer) ── */
OBRAS.forEach(o => {
  o.medidas = o.medidas || MEDIDAS_PADRAO[o.tipo];
  o.tecnica = o.tecnica || TECNICA_PADRAO;
  o.estoque = o.vendida ? 0 : 1;
});
