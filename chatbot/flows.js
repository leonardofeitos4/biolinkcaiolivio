/* ═══════════════════════════════════
   FLOWS — Cora, Curadoria Digital

   Estrutura de cada flow:
   {
     msg: string (HTML permitido),
     chips: [
       { l: 'Label', f: 'flow_id' }      → navega para outro flow
       { l: 'Label', wa: 'mensagem' }    → abre WhatsApp
       { l: 'Label', acao: 'irParaLoja()' } → executa ação no site
     ]
   }

   Para adicionar novos fluxos:
   1. Crie uma nova entrada no objeto flows
   2. Referencie com { f: 'novo_flow' } em qualquer chip
═══════════════════════════════════ */

const CHIP_LOJA = { l: '🛒 Ver obras à venda', acao: 'irParaLoja()' };

const flows = {

  /* ── MENU PRINCIPAL ── */
  inicio: {
    msg: `Pra te ajudar melhor, me conta — o que você está buscando hoje? 😊`,
    chips: [
      CHIP_LOJA,
      { l: '🏠 Decorar um espaço', f: 'decorar' },
      { l: '🎁 Um presente especial', f: 'presente' },
      { l: '🖼️ Começar a colecionar', f: 'colecionar' },
      { l: '💳 Como funciona a compra', f: 'compra' },
      { l: '📅 Falar com o curador', f: 'agendar' },
    ]
  },

  /* ── COMO FUNCIONA A COMPRA ── */
  compra: {
    msg: `É bem simples! 💳<br><br>
      • Cada obra é <strong>peça única</strong> — só existe uma unidade de cada.<br>
      • Você escolhe na loja e paga online por <strong>Pix, cartão em até 12x ou boleto</strong>.<br>
      • <strong>Frete grátis</strong> para todo o Brasil, com embalagem própria para arte.<br>
      • Toda obra chega com <strong>certificado de autenticidade</strong> assinado pelo Caio.`,
    chips: [
      CHIP_LOJA,
      { l: '📦 E o prazo de entrega?', f: 'entrega' },
      { l: '💬 Falar com o curador', wa: 'Vim pelo biolink e tenho uma dúvida sobre a compra de uma obra.' },
    ]
  },

  entrega: {
    msg: `Assim que o pagamento é confirmado, a obra é embalada com material próprio para transporte de arte e segue para o endereço que você informar. 📦<br><br>O curador acompanha o envio com você pelo WhatsApp do começo ao fim — e o <strong>frete é por nossa conta, para todo o Brasil</strong>.`,
    chips: [
      CHIP_LOJA,
      { l: '💬 Falar com o curador', wa: 'Vim pelo biolink e quero saber o prazo de entrega para a minha cidade.' },
    ]
  },

  /* ── DECORAR ── */
  decorar: {
    msg: `Uma obra certa transforma completamente um ambiente. 🖼️<br><br>Onde você quer aplicar a peça?`,
    chips: [
      { l: '🏡 Residência', f: 'decorar_residencia' },
      { l: '🏢 Escritório / espaço corporativo', f: 'decorar_escritorio' },
      CHIP_LOJA,
    ]
  },
  decorar_residencia: {
    msg: `Perfeito! Para residências, o Caio costuma indicar peças de acordo com a luz, a paleta e o clima do ambiente. 🏡<br><br>Na loja você vê cada obra <strong>já aplicada em um ambiente real</strong> — fica fácil imaginar na sua parede.`,
    chips: [
      CHIP_LOJA,
      { l: '💬 Quero ajuda para escolher', wa: 'Vim pelo biolink e quero indicações de obras para decorar minha residência.' },
    ]
  },
  decorar_escritorio: {
    msg: `Ótima escolha — obras de Caio Livio já estão em escritórios, clínicas e recepções por todo o Brasil. 🏢<br><br>As <strong>duplas (dípticos)</strong> costumam funcionar muito bem em recepções e salas de reunião.`,
    chips: [
      CHIP_LOJA,
      { l: '💬 Curadoria corporativa', wa: 'Vim pelo biolink e quero curadoria de obras para um espaço corporativo.' },
    ]
  },

  /* ── PRESENTE ── */
  presente: {
    msg: `Uma obra original é um presente que dura a vida toda. 🎁<br><br>Todas as peças saem com certificado de autenticidade e frete grátis — você pode enviar direto para o endereço de quem vai receber.`,
    chips: [
      CHIP_LOJA,
      { l: '💬 Quero uma sugestão', wa: 'Vim pelo biolink e quero uma sugestão de obra para dar de presente.' },
      { l: '↩ Outros objetivos', f: 'inicio' },
    ]
  },

  /* ── COLECIONAR ── */
  colecionar: {
    msg: `Começar (ou expandir) uma coleção é sempre um passo especial. 🖼️<br><br>Como você se descreveria hoje?`,
    chips: [
      { l: '🌱 Estou começando agora', f: 'colecionar_inicio' },
      { l: '📚 Já coleciono arte', f: 'colecionar_experiente' },
      CHIP_LOJA,
    ]
  },
  colecionar_inicio: {
    msg: `Que ótimo! 🌱 Todas as obras da loja são <strong>peças únicas originais</strong>, com certificado de autenticidade — um começo sólido para qualquer coleção.<br><br>E se bater dúvida em qualquer momento, o curador responde no WhatsApp.`,
    chips: [
      CHIP_LOJA,
      { l: '💳 Como funciona a compra', f: 'compra' },
      { l: '💬 Falar com o curador', wa: 'Vim pelo biolink, estou começando a colecionar arte e quero saber mais.' },
    ]
  },
  colecionar_experiente: {
    msg: `Que bom ter você por aqui! 📚 O acervo disponível reúne obras solo e dípticos, cada uma em edição única e assinada.<br><br>Vale dar uma olhada nas duplas — costumam ser as primeiras a sair.`,
    chips: [
      CHIP_LOJA,
      { l: '💬 Falar com o curador', wa: 'Vim pelo biolink, já coleciono arte e quero conhecer o acervo disponível do Caio Livio.' },
    ]
  },

  /* ── AGENDAR / FALAR COM O CURADOR ── */
  agendar: {
    msg: `A curadoria do Caio Livio atende colecionadores, arquitetos e empresas — para residências, escritórios e espaços comerciais de alto padrão. 😊<br><br>Posso te encaminhar direto para o WhatsApp?`,
    chips: [
      { l: '✅ Sim, quero falar agora', wa: 'Vim pelo biolink e gostaria de falar com o curador sobre as obras de Caio Livio.' },
      CHIP_LOJA,
    ]
  },

};
