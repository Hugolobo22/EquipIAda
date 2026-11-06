# EquipIAda — Protótipo animado da IAda

Um protótipo **executável** do mascote expressivo e flutuante da EquipIAda. O projeto é feito em **Next.js 16 + React 19 + TypeScript + GSAP**, com mascote **SVG vetorial próprio** (não uma imagem estática).

## Referência visual

O arquivo `docs/referencia-visual-IAda.png` registra o conceito de identidade visual aprovado na conversa. O SVG implementado é simplificado, com camadas animáveis e degradês, para facilitar a prototipação.

## Como executar

Requisitos: Node.js 20.9+ e npm. Para respostas locais, instale também o [Ollama](https://ollama.com/download/windows) e um modelo como `qwen3:4b-instruct` ou `qwen3:8b`.

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

Para ativar respostas locais, execute `ollama pull qwen3:4b-instruct`, copie `.env.example` para `.env.local` e defina `ANSWER_PROVIDER=ollama`. Reinicie `npm run dev` depois de alterar o ambiente. O Ollama precisa estar em execução no computador da apresentação. Não é necessária chave de API nem há cobrança por chamada; o download e a inferência usam disco, memória e processamento locais. Se o modelo não estiver disponível, a cena mostra erro recuperável e permite tentar novamente. O modelo de 4B ocupa cerca de 2,5 GB; `qwen3:1.7b` é uma alternativa menor. Nesta máquina de desenvolvimento, `qwen3:8b` já estava instalado e produziu resposta mais precisa na pergunta comparada; `.env.local` foi ajustado para ele. O 8B ocupa cerca de 5,2 GB e pode exigir mais memória e tempo. Para outra máquina, execute `ollama pull qwen3:8b` e defina `OLLAMA_MODEL=qwen3:8b` se houver recursos suficientes. Essa comparação não garante acerto em outras perguntas.

No Windows, se `ollama` ainda não for reconhecido após a instalação, abra um novo terminal ou use `& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" pull qwen3:4b-instruct` no PowerShell.

Para conferir tipos e build:

```bash
npm run typecheck
npm run lint
npm run build
```

Para testar as regras de sessão, use `npm run test` com Node.js 22.6+ (o protótipo web continua exigindo Node.js 20.9+).

Para avaliar respostas locais com 15 perguntas sintéticas, execute `node --experimental-strip-types scripts/evaluateAnswers.mjs qwen3:8b` com Ollama ativo. O resultado completo fica em `reports/answer-evaluation-qwen3-8b.json`. As verificações automáticas apenas apontam casos para revisão; elas não certificam a veracidade das respostas. O roteiro e a rubrica estão em `docs/ANSWER_EVALUATION.md`.

Antes da apresentação, mantenha `npm run dev` aberto e execute `npm run demo:check` em outro terminal. O comando confirma provedor e modelo locais, aquece o modelo com uma pergunta sintética por até dez minutos e verifica a página. Veja o [roteiro de apresentação](docs/DEMO_RUNBOOK.md) para falhas e teste com colegas.

## O que funciona

| Recurso | Implementação |
|---|---|
| Olhos seguem cursor | `onPointerMove` atualiza variáveis CSS sem renderizar o React a cada pixel |
| Flutuação, piscadas | Keyframes CSS isolados por partes do SVG |
| Cinco expressões | Normal, curiosa, sarcástica, irritada e sonolenta |
| Balões de fala | Textos reativos ligados ao estado do mascote |
| Braços e gestos | SVG em camadas; aceno, apontar, pegar e shrug |
| Passear pela página | GSAP reposiciona o ator no palco, com passeios automáticos |
| Roubo do botão | Timeline GSAP desloca o mascote até o botão, depois os dois se movimentam juntos |
| Liberar/ignorar | Controle "Pular pegadinha" sempre acessível |
| Tecla Enter rebelde | Enter quebra linha; Ctrl/⌘ + Enter tenta enviar |
| Diretor de Caos | Função pura escolhe ações por comprimento da pergunta, traços e preferência de movimento; evita repetição e limita a quatro pegadinhas |
| Pegadinha ativa | Enviar fica indisponível até a ação da cena ser resolvida; cliques repetidos não contam novas tentativas |
| Palavra mágica | Após insistência, IAda pode pedir “por favor” em um campo separado, preservando a pergunta |
| Ladrão de palavras | Duas palavras somem apenas da prévia visual; cada bolso devolve uma palavra, e Pular ou Reiniciar restauram a apresentação |
| Apagão + lanterna | Escurece o palco; acender a lanterna revela o interruptor. Teclado, toque e Pular funcionam sem depender do cursor |
| Pergunta original | Cópia exata no primeiro envio; campo fica somente leitura durante a rodada e é liberado após encerrar ou reiniciar |
| Traços da sessão | Preguiça, sarcasmo, drama, curiosidade e paciência evoluem com tentativas, pegadinhas e pular |
| Falas contextuais | Frases locais reagem a tema amplo da pergunta, pular, número de pegadinhas e curiosidade; a resposta factual continua separada |
| Mobile | Estilos responsivos; viewport de 320 e 390 px revisado no navegador. Toque físico ainda não testado |

**Importante:** as falas cômicas são locais e escolhidas entre textos predefinidos; a classificação simples do tema pode não reconhecer toda pergunta. Ela não copia a pergunta para o balão nem faz outra chamada ao modelo. Ao pular as pegadinhas ou chegar ao limite, a interface chama `/api/ask` com a pergunta original. Com `ANSWER_PROVIDER=ollama`, a resposta útil é produzida pelo modelo no próprio computador. Sem provedor configurado, a interface informa que a resposta está indisponível.

## Provedores e limites

`src/app/api/ask/route.ts` valida JSON e tamanho da pergunta, limita saída e tempo de chamada. O provedor local usa apenas `127.0.0.1:11434` no servidor Next.js e tem um limite de 20 consultas por hora por origem durante o desenvolvimento. A instrução de resposta pede objetividade, exemplos consistentes e incerteza explícita; marcações Markdown residuais são removidas para exibição como texto simples. O modelo ainda pode errar fatos. O limite é apenas em memória; por isso a rota bloqueia uso no build de produção.

A opção OpenAI permanece no código, desativada por padrão. Exige chave exclusivamente no servidor, modelo, limite de requisições e ativação explícita de `OPENAI_ENABLE_PAID_CALLS=true`; não é necessária para a apresentação local. Nenhuma chave deve ser adicionada ao repositório. Não há registro de prompts por padrão.

## Estrutura

```text
src/
  app/
    page.tsx                 # Página principal
    layout.tsx               # Metadados e tipografia
    globals.css              # Layout, personagem, keyframes, responsividade
    api/ask/route.ts         # Rota de resposta local Ollama ou OpenAI opcional
  components/
    Mascot.tsx               # SVG editável (corpo, olhos, braços, rosto)
    Scene.tsx                # Palco, campo de pergunta, controles e UX
  hooks/
    useMascotScene.ts        # Diretor de cena, pointer tracking, GSAP
  lib/
    askApi.ts                # Validação e utilitários da rota
    mascotReducer.ts         # Estado visual do mascote
    sessionEngine.ts         # Sessão e Diretor de Caos puros
    contextualSpeech.ts      # Escolha local das falas cômicas contextuais
    wordTheft.ts             # Elegibilidade e máscara visual pura
  types/
    mascot.ts                # Tipos, eventos e emoções
    session.ts               # Tipos da pergunta, traços e ações
tests/
  askApi.test.mjs            # Validação e limite local da rota
  sessionEngine.test.mjs     # Regras de sessão e decisão
  contextualSpeech.test.mjs  # Contexto das falas e preservação da pergunta
  wordTheft.test.mjs         # Máscara reversível e preservação do original
```

## Contrato de estado

`MascotEmotion` possui `neutral`, `curious`, `sarcastic`, `annoyed`, `sleepy`.

`MascotGesture` possui `idle`, `wave`, `point`, `grab`, `shrug`.

O `mascotReducer` recebe eventos visuais como `SPEAK`, `SET_EMOTION` e `SET_GESTURE`. `sessionReducer` preserva a pergunta original, atualiza os traços e conta pegadinhas. `chooseNextAction` decide sem conhecer React ou GSAP. `useMascotScene` liga as decisões às falas e à animação atual.

As pegadinhas usam ações acessíveis por teclado e toque. Algumas ainda têm apenas fala e um botão de resolução; o roubo do botão, o ladrão de palavras e o apagão têm efeitos visuais próprios. No Ladrão de palavras, cada um dos dois bolsos recupera uma palavra e o foco passa à próxima ação. A máscara é calculada da pergunta original para exibição e nunca substitui o valor do campo nem o texto enviado ao modelo. Enviar não avança uma pegadinha ativa. O limite de quatro vale por pergunta; pular e atingir o limite encerram a encenação e solicitam a resposta útil ao provedor configurado.

## Fluxo da resposta útil

1. `session.questionOriginal` é a única fonte da pergunta enviada ao servidor.
2. O Diretor de Caos escolhe até quatro pegadinhas; cada uma precisa de sua ação própria. **Pular pegadinha** encerra a encenação a qualquer momento.
3. A rota consulta Ollama local ou, se explicitamente configurada, OpenAI. A resposta factual aparece separada do balão da personagem.
4. Durante a consulta, a cena mostra que o modelo local pode levar cerca de um minuto e oferece **Cancelar resposta**. O cancelamento interrompe a espera no navegador, preserva a pergunta original e oferece **Tentar novamente**.
5. Falhas mantêm a pergunta original e oferecem **Tentar novamente**; **Reiniciar pergunta** libera uma nova rodada.

## Acessibilidade e limitações

- A ação de pular permite sair da encenação a qualquer momento.
- Em `prefers-reduced-motion`, animações CSS são minimizadas; os tweens principais são reduzidos ou evitados.
- Em telas touch, os olhos ficam em posição neutra; as demais animações funcionam por toque.
- O roubo do botão é um efeito visual com retorno automático, não altera o texto original.
- O modelo local ainda pode errar fatos e não consulta fontes. Para a apresentação, ensaie perguntas conhecidas e confira as respostas antes.
- Este SVG é uma interpretação vetorial simplificada do conceito aprovado. Para uma identidade final de maior fidelidade, pode ser substituído por um arquivo Rive, mantendo a mesma API de estados e gestos.


## Continuação com Codex

Leia `AGENTS.md` e o guia `docs/CODEX_START.md`. Visão, catálogo de pegadinhas, arquitetura e roadmap: `docs/PRODUCT.md`, `docs/PRANKS.md`, `docs/ARCHITECTURE.md` e `docs/ROADMAP.md`.
