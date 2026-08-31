/* ═══════════════════════════════════
   DATA — Seletor de Objetivos (Home)
   Para adicionar: nova entrada no
   objeto smap + botão no HTML.

   d  → texto da resposta (HTML)
   wa → mensagem que abre no WhatsApp
   loja → true mostra o botão "Ver obras à venda"
═══════════════════════════════════ */
const smap = {
  decorar: {
    r: '🏠 Decorar uma Residência',
    d: 'Uma obra certa transforma completamente um ambiente. Na loja, cada peça aparece <strong>já aplicada em um ambiente real</strong> — fica fácil imaginar na sua parede.',
    wa: 'Vim pelo biolink e quero indicações de obras para decorar minha residência.',
    loja: true,
  },
  corporativo: {
    r: '🏢 Espaço Corporativo',
    d: 'Obras de Caio Livio já estão em escritórios, clínicas e recepções por todo o Brasil. As <strong>duplas (dípticos)</strong> funcionam especialmente bem em recepções e salas de reunião.',
    wa: 'Vim pelo biolink e quero curadoria de obras para um espaço corporativo.',
    loja: true,
  },
  presente: {
    r: '🎁 Presente Especial',
    d: 'Uma obra original é um presente que dura a vida toda. Com <strong>frete grátis</strong>, você pode enviar direto para o endereço de quem vai receber.',
    wa: 'Vim pelo biolink e quero uma sugestão de obra para dar de presente.',
    loja: true,
  },
  colecionar: {
    r: '🖼️ Começar a Colecionar',
    d: 'Todas as obras à venda são <strong>peças únicas originais</strong>, assinadas e com certificado de autenticidade. Uma vez vendida, a peça sai do acervo disponível.',
    wa: 'Vim pelo biolink e quero começar a colecionar obras de Caio Livio.',
    loja: true,
  },
  encomenda: {
    r: '🎨 Obra Sob Encomenda',
    d: 'Caio também desenvolve <strong>peças personalizadas</strong>, alinhadas à paleta e às dimensões do seu projeto — ideais para arquitetos e decoradores com um espaço específico em mente. Encomendas são orçadas caso a caso pela curadoria.',
    wa: 'Vim pelo biolink e quero saber mais sobre obras sob encomenda.',
    loja: false,
  },
  conhecer: {
    r: '📖 Conhecer o Artista',
    d: 'Caio Livio é artista plástico radicado em Recife, com <strong>mais de 15 anos de trajetória</strong>. Já expôs na Fenearte, na CasaCor e em mostras internacionais em Roma, no Vaticano e em Paris.',
    wa: 'Vim pelo biolink e quero conhecer mais sobre a trajetória de Caio Livio.',
    loja: false,
  },
  investir: {
    r: '💰 Investir em Arte',
    d: 'Peças originais com <strong>certificado de autenticidade</strong> e curadoria consistente são um dos ativos mais duradouros de uma coleção. Cada obra do acervo é única — não há reimpressão nem reprodução.',
    wa: 'Vim pelo biolink e quero entender melhor como funciona investir em obras de Caio Livio.',
    loja: true,
  },
};

function sym(btn, k) {
  document.querySelectorAll('.sc').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const el = document.getElementById('sr');
  const d = smap[k];
  el.innerHTML =
    `<strong>${d.r}</strong><br><br>${d.d}<br><br>` +
    (d.loja ? `<a class="sr-cta" onclick="irParaLoja()">🛒 Ver obras à venda</a>` : '') +
    `<a class="sr-cta sr-cta-wa" href="${waLink(d.wa)}" target="_blank" rel="noopener">💬 Falar com o curador</a>`;
  el.classList.add('show');
}
