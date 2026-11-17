# EquipIAda — Protótipo animado da IAda

Um protótipo **executável** do mascote expressivo e flutuante da EquipIAda. O projeto é feito em **Next.js 16 + React 19 + TypeScript + GSAP**, com mascote **SVG vetorial próprio** (não uma imagem estática).

## Problema e proposta

O EquipIAda explora uma experiência de entretenimento com IA: uma personagem transforma uma pergunta em uma pequena sequência humorística e depois entrega uma resposta útil. A proposta de inovação é combinar personagem animada, decisões comportamentais limitadas, desafios reversíveis e modelo local. A hipótese de que isso é divertido ainda precisa ser validada com colegas. O projeto não substitui verificação factual: o modelo pode errar.

O banco SQLite salva avaliações voluntárias da utilidade da resposta e da diversão, sem armazenar perguntas ou respostas. Assim, existe integração real entre interface, API e banco, mantendo a interface principal sem histórico de conversa.

Equipe informada: Fernando Medeiros de Araújo, Enzo Coutinho Teixeira Britto de Queiroz, Hugo Medeiros Lobo Maia e João Victor de França. Critérios acadêmicos, evidências e pendências: [matriz A3](docs/A3_COMPLIANCE.md). Requisitos: [RF/RNF e aceite](docs/REQUIREMENTS.md). Testes: [guia de execução](docs/TESTING.md).

## Preparar a partir do GitHub

Requer Git, **Node.js 22.13+ com npm** e Ollama. O notebook da apresentação foi validado em 11/11 com Node 26.13.0 e npm 11.20.0; a validação de 09/11 usou Node 24.22.1. Google Chrome é necessário para os testes de navegador. A opção paga está desativada.

No PowerShell, depois de instalar as ferramentas:

```powershell
git clone https://github.com/Hugolobo22/EquipIAda.git
cd EquipIAda
npm ci
Copy-Item .env.example .env.local
```

Edite `.env.local` para usar o modelo de exemplo:

```dotenv
ANSWER_PROVIDER=ollama
OLLAMA_MODEL=qwen3:4b-instruct
EQUIPIADA_DATABASE_PATH=data/equipiada.sqlite
OPENAI_ENABLE_PAID_CALLS=false
```

Prepare o modelo e a estrutura do banco e inicie:

```powershell
ollama pull qwen3:4b-instruct
npm run db:init
npm run local
```

Abra **http://127.0.0.1:3000**. Mantenha o terminal aberto. O iniciador confere o modelo e inicia Ollama se necessário. Em Linux/macOS, substitua `Copy-Item` por `cp`; use `npm run local`. Esses sistemas ainda não foram testados na avaliação atual.

O banco é criado vazio pela migração versionada em `database/migrations/001_feedback.sql`. Não há usuário, senha, credencial de teste ou banco de outro computador a copiar. `db:init` pode ser repetido e não apaga avaliações. Arquivos SQLite e `.env.local` são ignorados pelo Git. [Modelo e operação do banco](docs/DATABASE.md).

Teste principal: faça uma pergunta, resolva ou pule os desafios, aguarde a resposta, selecione as duas notas em **Valeu a insistência?** e clique em **Salvar avaliação**. Execute `npm run db:init` novamente para consultar a contagem persistida. Essa avaliação é opcional e uma falha ao salvá-la não remove a resposta.

Esta versão inclui a adequação A3, a migração SQLite, os testes automatizados e as evidências do ensaio no notebook. O teste em outra máquina seguindo apenas este README permanece pendente; testes isolados no mesmo computador não substituem essa exigência da A3.

Na revisão de 17/11, Next.js e `eslint-config-next` foram atualizados para 16.4.5, versão com [correções de segurança oficiais](https://github.com/vercel/next.js/releases/tag/v16.4.5). Passaram 38 testes de regras/banco, 15 casos de navegador com respostas simuladas, tipos, lint e build. O cenário opcional com Ollama real não foi repetido nessa revisão; a execução completa de 11/11 está preservada. A auditoria das dependências de execução ficou sem alertas; permanecem 15 nas ferramentas de desenvolvimento. [Evidências e limitações da revisão](reports/pre-publication-validation-2026-11-17.json).

## Referência visual

O arquivo `docs/referencia-visual-IAda.png` registra o conceito de identidade visual aprovado na conversa. O SVG implementado é simplificado, com camadas animáveis e degradês, para facilitar a prototipação.

## Como executar

Requisitos: Node.js 22.13+ e npm. Para respostas locais, instale também o [Ollama](https://ollama.com/download/windows) e um modelo como `qwen3:4b-instruct` ou `qwen3:8b`.

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

Para o uso local nesta máquina, abra **`Iniciar EquipIAda.cmd`** na pasta do projeto e acesse **http://127.0.0.1:3000**. Mantenha a janela aberta; Ctrl+C encerra a aplicação. O iniciador confere o modelo instalado, inicia Ollama se necessário e abre o servidor apenas no endereço local. Ele também pode ser executado com `npm run local`. Dependências, configuração e modelo precisam estar preparados antes; o iniciador não faz downloads automáticos.

No notebook preparado em 11/11, o Node está instalado em `C:\Program Files\nodejs`, o Ollama portátil 0.40.16 está em `%LOCALAPPDATA%\EquipIAda\ollama`, e `.env.local` usa `qwen3:8b`. O iniciador encontra o Ollama sem depender de ele estar no PATH. Esses programas e a configuração ficam fora do repositório. Em outra máquina, instale Node.js e Ollama, execute `npm ci`, baixe o modelo e configure `.env.local` conforme as instruções abaixo. O escopo atual é funcionamento local. [Resultado do ensaio neste notebook](reports/notebook-readiness-2026-11-11.json).

Para ativar respostas locais, execute `ollama pull qwen3:4b-instruct`, copie `.env.example` para `.env.local` e defina `ANSWER_PROVIDER=ollama`. Reinicie `npm run dev` depois de alterar o ambiente. O Ollama precisa estar em execução no computador da apresentação. Não é necessária chave de API nem há cobrança por chamada; o download e a inferência usam disco, memória e processamento locais. Se o modelo não estiver disponível, a cena mostra erro recuperável e permite tentar novamente. O modelo de 4B ocupa cerca de 2,5 GB; `qwen3:1.7b` é uma alternativa menor. Nesta máquina de desenvolvimento, `qwen3:8b` já estava instalado e produziu resposta mais precisa na pergunta comparada; `.env.local` foi ajustado para ele. O 8B ocupa cerca de 5,2 GB e pode exigir mais memória e tempo. Para outra máquina, execute `ollama pull qwen3:8b` e defina `OLLAMA_MODEL=qwen3:8b` se houver recursos suficientes. Essa comparação não garante acerto em outras perguntas.

No Windows, se `ollama` ainda não for reconhecido após a instalação, abra um novo terminal ou use `& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" pull qwen3:4b-instruct` no PowerShell.

Para conferir tipos e build:

```bash
npm run typecheck
npm run lint
npm run build
```

Para testar regras, validação e integração com SQLite temporário real, use `npm run test` com Node.js 22.13+.

Com Google Chrome instalado, `npm run test:browser` executa cenários de interface com respostas simuladas e integração real com um banco SQLite de teste, sem exigir geração pelo Ollama. Para incluir a rodada real no Windows/PowerShell: `$env:EQUIPIADA_REAL_MODEL='true'; npm run test:browser`. O modelo precisa estar disponível nessa execução. Os testes iniciam seu próprio servidor em `127.0.0.1:3100`, saída `.next-test` e banco separado. Não é necessário encerrar a aplicação da porta 3000.

Para avaliar respostas locais com 23 perguntas sintéticas, execute `node --experimental-strip-types scripts/evaluateAnswers.mjs qwen3:8b all nova-rodada` com Ollama ativo. O resultado fica em `reports/answer-evaluation-qwen3-8b-nova-rodada.json`; use outro nome para preservar a rodada anterior. As verificações automáticas apenas apontam casos para revisão; elas não certificam a veracidade das respostas. O roteiro e a rubrica estão em `docs/ANSWER_EVALUATION.md`.

Antes da apresentação, mantenha o iniciador local aberto e execute `npm run demo:check` em outro terminal. O comando confirma provedor e modelo locais, aquece o modelo, verifica a página e recebe uma resposta sintética pela própria rota `/api/ask`. O aquecimento mantém o modelo carregado por até dez minutos; a verificação da rota consome uma consulta do limite local. Veja o [roteiro de apresentação](docs/DEMO_RUNBOOK.md) para falhas e teste com colegas.

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
| Ritmo da rodada | Duas cenas para perguntas de até 80 caracteres; três nas demais; quatro apenas com texto acima de 400 caracteres e drama alto. O limite é fixado no início |
| Continuação automática | Resolver um desafio dá 1,2 s para a fala de conclusão e avança sozinho; Pular e Reiniciar cancelam essa continuação |
| Manutenção | Dois ajustes independentes, com indicadores de estado e foco progressivo |
| Carregamento dramático | Dois empurrões carregam uma barra de coragem fictícia; o progresso da resposta real fica separado |
| Gestos temporários | Acenos e poses duram cerca de 1,2 s; o gesto de pegar acompanha o roubo completo do botão |
| Mobile | Estilos responsivos; viewport de 320 e 390 px revisado no navegador. Toque físico ainda não testado |
| Avaliação persistida | Notas opcionais e cenas relacionadas são salvas em SQLite; consulta agregada permanece após reiniciar, sem texto da conversa |

**Importante:** as falas cômicas são locais e escolhidas entre textos predefinidos; a classificação simples do tema pode não reconhecer toda pergunta. Ela não copia a pergunta para o balão nem faz outra chamada ao modelo. Ao pular as pegadinhas ou chegar ao limite, a interface chama `/api/ask` com a pergunta original. Com `ANSWER_PROVIDER=ollama`, a resposta útil é produzida pelo modelo no próprio computador. Sem provedor configurado, a interface informa que a resposta está indisponível.

## Provedores e limites

`src/app/api/ask/route.ts` valida JSON e tamanho da pergunta, limita saída e tempo de chamada. O provedor local usa apenas `127.0.0.1:11434` no servidor Next.js e tem um limite de 20 consultas por hora por origem durante o desenvolvimento. A instrução de resposta pede objetividade, exemplos consistentes e incerteza explícita; marcações Markdown residuais são removidas para exibição como texto simples. O modelo ainda pode errar fatos. O limite é apenas em memória; por isso a rota bloqueia uso no build de produção.

A opção OpenAI permanece no backend, desativada por padrão. A interface e o diagnóstico enviam `localOnly: true`; o servidor recusa essas consultas se o provedor não for Ollama, antes de qualquer chamada paga. A opção paga exige chave exclusivamente no servidor, modelo, limite de requisições e ativação explícita de `OPENAI_ENABLE_PAID_CALLS=true`. Nenhuma chave deve ser adicionada ao repositório. Não há registro de prompts por padrão.

`/api/feedback` valida um contrato fechado de notas e cenas, limita o corpo a 2 KB e faz gravações transacionais no SQLite. Notas reais só são inseridas após confirmação no formulário. O limite local de gravações é 60 por hora por origem. O uso é local e não inclui autenticação ou serviço público multiusuário.

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

As pegadinhas usam ações acessíveis por teclado e toque. Prompt curto, textão e interrogatório ainda usam confirmação simples. Roubo do botão, ladrão de palavras, apagão, manutenção e carregamento dramático têm ações ou efeitos próprios. Cada bolso do ladrão recupera uma palavra, com foco progressivo; a máscara nunca substitui o valor do campo nem a pergunta enviada ao modelo. Resolver um desafio avança automaticamente após uma breve fala. Enviar não avança uma pegadinha ativa. O limite por pergunta varia entre duas e quatro cenas; Pular encerra a encenação a qualquer momento.

## Fluxo da resposta útil

1. `session.questionOriginal` é a única fonte da pergunta enviada ao servidor.
2. O Diretor de Caos escolhe até quatro pegadinhas; cada uma precisa de sua ação própria. **Pular pegadinha** encerra a encenação a qualquer momento.
3. A rota consulta Ollama local ou, se explicitamente configurada, OpenAI. A resposta factual aparece separada do balão da personagem.
4. Durante a consulta, a cena mostra que o modelo local pode levar cerca de um minuto e oferece **Cancelar resposta**. O cancelamento interrompe a espera no navegador, preserva a pergunta original e oferece **Tentar novamente**.
5. Falhas e cancelamento mantêm a pergunta original e o campo bloqueado; **Tentar novamente** consulta a mesma pergunta sem repetir desafios. **Reiniciar pergunta** libera uma nova rodada e devolve foco ao campo. A sessão só fica respondida após receber uma resposta válida. O limite de consultas tem mensagem própria.

## Acessibilidade e limitações

- A ação de pular permite sair da encenação a qualquer momento.
- Em `prefers-reduced-motion`, animações CSS são minimizadas; os tweens principais são reduzidos ou evitados.
- Em telas touch, os olhos ficam em posição neutra; as demais animações funcionam por toque.
- O roubo do botão é um efeito visual com retorno automático, não altera o texto original.
- O modelo local ainda pode errar fatos e não consulta fontes. Para a apresentação, ensaie perguntas conhecidas e confira as respostas antes.
- Este SVG é uma interpretação vetorial simplificada do conceito aprovado. Para uma identidade final de maior fidelidade, pode ser substituído por um arquivo Rive, mantendo a mesma API de estados e gestos.


## Continuação com Codex

Leia `AGENTS.md` e o guia `docs/CODEX_START.md`. Visão, catálogo de pegadinhas, arquitetura e roadmap: `docs/PRODUCT.md`, `docs/PRANKS.md`, `docs/ARCHITECTURE.md` e `docs/ROADMAP.md`.
