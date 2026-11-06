# PRD — EquipIAda

**Visão:** aplicação de entretenimento interativo com assistente de IA real e uma personagem robô chamada IAda, carismática, debochada e preguiçosa. A pergunta vira uma pequena aventura. O usuário deve receber uma resposta útil após enfrentar brincadeiras opcionais.

## Experiência pretendida
1. Site abre com IAda flutuando, olhando o cursor e falando num balão.
2. Usuário escreve sua pergunta na caixa inferior; não existe painel de histórico tradicional.
3. Motor observa tamanho do prompt, tentativas, ações, estado emocional e pegadinhas anteriores.
4. IAda pode exigir mais contexto, depois reclamar do tamanho, roubar o botão, apagar visualmente palavras, simular apagão ou fazer contraperguntas.
5. O usuário insiste, resolve cena ou pula. Após até quatro obstáculos principais (configurável), IAda se rende e responde a **pergunta original**.
6. Expressões mudam de maneira contextual; sessões com o mesmo prompt podem ter jornadas distintas.

## Personalidade inicial sugerida (escala 0..100)
Preguiça 85, sarcasmo 65, dramaticidade 55, curiosidade 40, paciência 45. Esses traços já evoluem na sessão e influenciam a seleção de pegadinhas. Estados visuais: normal, sonolenta, curiosa, sarcástica, irritada; estados adicionais planejados: travessa, assustada, rendida.

## Público e proposta de valor
Pessoas interessadas em interações humorísticas com tecnologia e experiências compartilháveis. O diferencial é integrar IA que responde de verdade, humor contextual, mascote expressivo e consequências físicas na interface. Hipótese de engajamento ainda não validada por testes.

## Requisitos MVP
- Mascote responsivo, palco com balões e última pergunta destacada.
- Diretor de Caos tipado, humorístico, recuperável e com seleção por contexto.
- Atributos da persona atualizados na sessão; evitar repetição de sabotagens.
- Pelo menos quatro pegadinhas completas e resposta de IA via API segura no servidor.
- Garantir resposta, pular, acessibilidade, erro de API e limite de custo.

## Fora do escopo inicial
Clonar ChatGPT, histórico persistente, app móvel nativo, pagamentos, editor para terceiros, várias personalidades selecionáveis, execução livre de código gerado por IA.
