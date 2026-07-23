# Caio Livio — Biolink

Página estilo "link na bio" (SPA mobile-first, sem build), na mesma identidade dourado/escuro do site oficial da galeria, com a assistente de IA **Cora**. Pasta 100% autocontida — pode ser movida para outro repositório sem ajustes (não referencia nada fora de `biolink/`).

## Estrutura
- `index.html` — home + subpáginas (Quem Sou, Acervo & Séries, Colecionadores, Chat)
- `css/main.css` — variáveis de cor, canvas neural, cursor, sistema de páginas
- `css/home.css` — layout da home (avatar, cards de link, carrossel de séries, seletor de objetivos, depoimentos)
- `css/pages.css` — subpáginas (Quem Sou, Acervo & Séries, Colecionadores)
- `css/chat.css` — página de chat da Cora
- `js/app.js` — canvas animado, cursor customizado, navegação SPA, contadores, tabs
- `chatbot/config.js` — número de WhatsApp, nome/papel da assistente, delays
- `chatbot/flows.js` — árvore de conversa da Cora (edite/adicione fluxos aqui)
- `chatbot/engine.js` — motor do chat (não precisa mexer)
- `data/smap.js` — textos do seletor "O que você está buscando?"
- `data/testimonials.js` — depoimentos (mesmos 3 do site oficial)
- `assets/images/` — fotos reais (já incluídas, veja abaixo)

## Como trocar o WhatsApp
1. `chatbot/config.js` → `CONFIG.WA`
2. Todos os links `https://wa.me/5581999999999...` espalhados pelo `index.html` e `data/smap.js` — troque o número em todos (use busca e substituição do editor).

## Fotos em `assets/images/`
- `caio-perfil.jpg` — foto de perfil (avatar circular do topo)
- `obra-destaque.jpg` — obra em destaque no card da home (recorte da Obra 001 do acervo)
- `caio-quemsou.jpg` — miniatura usada no card "Quem sou"
- `caio-sobre.jpg` — foto maior usada dentro da subpágina "Quem Sou"

Para trocar, basta substituir os arquivos mantendo os mesmos nomes.

## Sobre a Cora (assistente de IA)
É um chatbot baseado em árvore de decisão (sem IA generativa) com fluxo de conversa pensado para arte/galeria: decorar espaço, presente, colecionar, séries específicas e agendamento com o curador. Toda conversa termina levando para o WhatsApp da curadoria. Para editar as perguntas/respostas, edite `chatbot/flows.js`.

## Sobre "disponível / vendida"
Como no site principal, este biolink **não** menciona status de disponibilidade de obras — não há inventário/controle no momento.

## O que foi removido de propósito
Não há promessa de "simulador de ambientes" automático (enviar foto do espaço e receber uma simulação) — essa era uma ideia inicial descartada por não ser um serviço real oferecido. Curadoria personalizada continua disponível via WhatsApp.

## Rodar localmente
Abra `index.html` no navegador, ou sirva a pasta com um servidor estático (ex.: `npx serve .`).
