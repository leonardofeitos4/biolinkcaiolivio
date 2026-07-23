/* ═══════════════════════════════════
   CHATBOT CONFIG
   Altere aqui para mudar número WA,
   nome da assistente e delays.
═══════════════════════════════════ */
const CONFIG = {
  WA: '5581999999999',
  botName: 'Cora',
  botRole: 'Curadoria Digital · Caio Livio',
  typingDelayMin: 2800,
  typingDelayRandom: 400,
};

function waLink(msg) {
  return `https://wa.me/${CONFIG.WA}?text=${encodeURIComponent(msg)}`;
}
