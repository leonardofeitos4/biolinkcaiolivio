/* ═══════════════════════════════════
   DATA — Seletor de Objetivos (Home)
   Para adicionar: nova entrada no
   objeto smap + botão no HTML.
═══════════════════════════════════ */
const smap = {
  decorar: {
    r: '🏠 Decorar uma Residência',
    d: 'Uma obra certa transforma completamente um ambiente. A curadoria indica peças de acordo com a <strong>luz, a paleta e o clima</strong> do seu espaço.<br><br><a href="https://wa.me/5581999999999?text=Vim%20pelo%20biolink%20e%20quero%20indica%C3%A7%C3%B5es%20de%20obras%20para%20decorar%20minha%20resid%C3%AAncia." target="_blank">→ Quero indicações</a>'
  },
  corporativo: {
    r: '🏢 Espaço Corporativo',
    d: 'Obras de Caio Livio já estão em escritórios, clínicas e recepções por todo o Brasil. A curadoria sugere peças em <strong>escala pensada para espaços comerciais</strong> de alto padrão.<br><br><a href="https://wa.me/5581999999999?text=Vim%20pelo%20biolink%20e%20quero%20curadoria%20de%20obras%20para%20um%20espa%C3%A7o%20corporativo." target="_blank">→ Falar sobre curadoria corporativa</a>'
  },
  presente: {
    r: '🎁 Presente Especial',
    d: 'Uma obra original é um presente que dura a vida toda. A curadoria ajuda a <strong>escolher a peça certa</strong> com base no gosto de quem vai recebê-la e no espaço onde ela vai ficar.<br><br><a href="https://wa.me/5581999999999?text=Vim%20pelo%20biolink%20e%20quero%20uma%20sugest%C3%A3o%20de%20obra%20para%20dar%20de%20presente." target="_blank">→ Quero uma sugestão</a>'
  },
  colecionar: {
    r: '🖼️ Começar a Colecionar',
    d: 'Começar (ou expandir) uma coleção é sempre especial. A curadoria explica cada uma das <strong>cinco séries exclusivas</strong>, o processo de aquisição e o certificado de autenticidade — no seu ritmo.<br><br><a href="https://wa.me/5581999999999?text=Vim%20pelo%20biolink%20e%20quero%20come%C3%A7ar%20a%20colecionar%20obras%20de%20Caio%20Livio." target="_blank">→ Conhecer o acervo</a>'
  },
  encomenda: {
    r: '🎨 Obra Sob Encomenda',
    d: 'Caio também desenvolve <strong>peças personalizadas</strong>, alinhadas à paleta e às dimensões do seu projeto — ideais para arquitetos e decoradores com um espaço específico em mente.<br><br><a href="https://wa.me/5581999999999?text=Vim%20pelo%20biolink%20e%20quero%20saber%20mais%20sobre%20obras%20sob%20encomenda." target="_blank">→ Falar sobre encomenda</a>'
  },
  conhecer: {
    r: '📖 Conhecer o Artista',
    d: 'Caio Livio é artista plástico radicado em Recife, com <strong>mais de 15 anos de trajetória</strong> em pintura abstrata contemporânea e presença em coleções por todo o Brasil.<br><br><a href="https://wa.me/5581999999999?text=Vim%20pelo%20biolink%20e%20quero%20conhecer%20mais%20sobre%20a%20trajet%C3%B3ria%20de%20Caio%20Livio." target="_blank">→ Saber mais sobre o artista</a>'
  },
  investir: {
    r: '💰 Investir em Arte',
    d: 'Peças originais com <strong>certificado de autenticidade</strong> e curadoria consistente são um dos ativos mais duradouros de uma coleção. A curadoria explica o processo com transparência.<br><br><a href="https://wa.me/5581999999999?text=Vim%20pelo%20biolink%20e%20quero%20entender%20melhor%20como%20funciona%20investir%20em%20obras%20de%20Caio%20Livio." target="_blank">→ Entender o processo</a>'
  },
};

function sym(btn, k) {
  document.querySelectorAll('.sc').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const el = document.getElementById('sr');
  const d = smap[k];
  el.innerHTML = `<strong>${d.r}</strong><br><br>${d.d}`;
  el.classList.add('show');
}
