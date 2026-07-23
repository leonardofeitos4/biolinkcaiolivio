/* ═══════════════════════════════════
   FLOWS — Cora, Curadoria Digital

   Estrutura de cada flow:
   {
     msg: string (HTML permitido),
     chips: [
       { l: 'Label', f: 'flow_id' }    → navega para outro flow
       { l: 'Label', wa: 'mensagem' }  → abre WhatsApp
     ]
   }

   Para adicionar novos fluxos:
   1. Crie uma nova entrada no objeto flows
   2. Referencie com { f: 'novo_flow' } em qualquer chip
═══════════════════════════════════ */

const flows = {

  /* ── MENU PRINCIPAL ── */
  inicio: {
    msg: `Pra te ajudar melhor, me conta — o que você está buscando hoje? 😊`,
    chips: [
      { l: '🏠 Decorar um espaço', f: 'decorar' },
      { l: '🎁 Um presente especial', f: 'presente' },
      { l: '🖼️ Começar a colecionar', f: 'colecionar' },
      { l: '🎨 Ver as séries', f: 'series' },
      { l: '📅 Falar com o curador', f: 'agendar' },
    ]
  },

  /* ── DECORAR ── */
  decorar: {
    msg: `Uma obra certa transforma completamente um ambiente. 🖼️<br><br>Onde você quer aplicar a peça?`,
    chips: [
      { l: '🏡 Residência', f: 'decorar_residencia' },
      { l: '🏢 Escritório / espaço corporativo', f: 'decorar_escritorio' },
      { l: '🖼️ Ver as séries', f: 'series' },
    ]
  },
  decorar_residencia: {
    msg: `Perfeito! Para residências, o Caio costuma indicar peças de acordo com a luz, a paleta e o clima do ambiente. 🏡<br><br>A curadoria pode te ajudar a escolher a peça certa para o seu espaço.`,
    chips: [
      { l: '💬 Falar com o curador', wa: 'Vim pelo biolink e quero indicações de obras para decorar minha residência.' },
      { l: '🖼️ Ver as séries', f: 'series' },
    ]
  },
  decorar_escritorio: {
    msg: `Ótima escolha — obras de Caio Livio já estão em escritórios, clínicas e recepções por todo o Brasil. 🏢<br><br>A curadoria pode sugerir peças em escala pensadas especificamente para espaços corporativos e de recepção.`,
    chips: [
      { l: '💬 Falar com o curador', wa: 'Vim pelo biolink e quero curadoria de obras para um espaço corporativo.' },
      { l: '🖼️ Ver as séries', f: 'series' },
    ]
  },

  /* ── PRESENTE ── */
  presente: {
    msg: `Uma obra original é um presente que dura a vida toda. 🎁<br><br>A curadoria pode te ajudar a escolher a peça certa com base no gosto da pessoa e no espaço onde ela vai ficar.`,
    chips: [
      { l: '💬 Quero uma sugestão', wa: 'Vim pelo biolink e quero uma sugestão de obra para dar de presente.' },
      { l: '🖼️ Ver as séries', f: 'series' },
      { l: '↩ Outros objetivos', f: 'inicio' },
    ]
  },

  /* ── COLECIONAR ── */
  colecionar: {
    msg: `Começar (ou expandir) uma coleção é sempre um passo especial. 🖼️<br><br>Como você se descreveria hoje?`,
    chips: [
      { l: '🌱 Estou começando agora', f: 'colecionar_inicio' },
      { l: '📚 Já coleciono arte', f: 'colecionar_experiente' },
      { l: '💬 Falar com o curador', wa: 'Vim pelo biolink e quero começar a colecionar obras de Caio Livio.' },
    ]
  },
  colecionar_inicio: {
    msg: `Que ótimo! 🌱 A curadoria explica cada série, o processo de aquisição e o certificado de autenticidade — sem pressa, no seu ritmo.<br><br>Quer conhecer as séries antes de conversar com o curador?`,
    chips: [
      { l: '🖼️ Ver as séries', f: 'series' },
      { l: '💬 Falar com o curador', wa: 'Vim pelo biolink, estou começando a colecionar arte e quero saber mais.' },
    ]
  },
  colecionar_experiente: {
    msg: `Que bom ter você por aqui! 📚 Colecionadores experientes costumam se interessar por peças de séries específicas ou por obras de anos determinados do acervo.<br><br>Quer ver as séries disponíveis para conversa?`,
    chips: [
      { l: '🖼️ Ver as séries', f: 'series' },
      { l: '💬 Falar com o curador', wa: 'Vim pelo biolink, já coleciono arte e quero conhecer o acervo do Caio Livio.' },
    ]
  },

  /* ── SÉRIES ── */
  series: {
    msg: `O acervo do Caio está organizado em cinco séries exclusivas. Qual delas te chamou atenção? 🎨`,
    chips: [
      { l: 'Essência', f: 'serie_essencia' },
      { l: 'Movimento', f: 'serie_movimento' },
      { l: 'Horizonte', f: 'serie_horizonte' },
      { l: 'Conexões', f: 'serie_conexoes' },
      { l: 'Origem', f: 'serie_origem' },
    ]
  },
  serie_essencia: {
    msg: `<strong>Essência</strong> — exploração emocional. Uma série que investiga camadas de memória e afeto, com uma paleta terrosa e gestual. 🔥`,
    chips: [
      { l: '💬 Tenho interesse na Essência', wa: 'Vim pelo biolink e tenho interesse em obras da série Essência.' },
      { l: '↩ Outras séries', f: 'series' },
    ]
  },
  serie_movimento: {
    msg: `<strong>Movimento</strong> — dinamismo e energia. Pinceladas fluidas e paleta em tons de azul profundo que transmitem ritmo e tensão. 🌊`,
    chips: [
      { l: '💬 Tenho interesse na Movimento', wa: 'Vim pelo biolink e tenho interesse em obras da série Movimento.' },
      { l: '↩ Outras séries', f: 'series' },
    ]
  },
  serie_horizonte: {
    msg: `<strong>Horizonte</strong> — paisagens abstratas. Camadas verdes e horizontais que remetem à natureza e à amplitude. 🌿`,
    chips: [
      { l: '💬 Tenho interesse na Horizonte', wa: 'Vim pelo biolink e tenho interesse em obras da série Horizonte.' },
      { l: '↩ Outras séries', f: 'series' },
    ]
  },
  serie_conexoes: {
    msg: `<strong>Conexões</strong> — relações humanas. Tons dourados e composições que dialogam entre si, pensadas para ambientes de convivência. ✨`,
    chips: [
      { l: '💬 Tenho interesse na Conexões', wa: 'Vim pelo biolink e tenho interesse em obras da série Conexões.' },
      { l: '↩ Outras séries', f: 'series' },
    ]
  },
  serie_origem: {
    msg: `<strong>Origem</strong> — raízes culturais brasileiras. A série mais recente do artista, com tons de vinho e roxo profundo. 🇧🇷`,
    chips: [
      { l: '💬 Tenho interesse na Origem', wa: 'Vim pelo biolink e tenho interesse em obras da série Origem.' },
      { l: '↩ Outras séries', f: 'series' },
    ]
  },

  /* ── AGENDAR / FALAR COM O CURADOR ── */
  agendar: {
    msg: `A curadoria do Caio Livio atende colecionadores, arquitetos e empresas — para residências, escritórios e espaços comerciais de alto padrão. 😊<br><br>Posso te encaminhar direto para o WhatsApp?`,
    chips: [
      { l: '✅ Sim, quero falar agora', wa: 'Vim pelo biolink e gostaria de falar com o curador sobre as obras de Caio Livio.' },
      { l: '🖼️ Ver as séries primeiro', f: 'series' },
    ]
  },

};
