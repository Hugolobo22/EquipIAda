# Arquitetura técnica e contratos

## Stack real
Next.js App Router, React, TypeScript, GSAP, SVG, CSS e Lucide. Código existente:
- `src/app/page.tsx`: renderiza a cena.
- `src/app/layout.tsx`: layout e metadados.
- `src/app/globals.css`: estilos, estados visuais e keyframes.
- `src/components/Scene.tsx`: entrada da pergunta, controles, UI.
- `src/components/Mascot.tsx`: SVG com olhos, braços, antena e expressões.
- `src/components/PrankTasks.tsx`: interações locais da manutenção e da barra de coragem; não altera a pergunta nem consulta modelos.
- `src/hooks/useMascotScene.ts`: cursor, movimento, timeline GSAP e adaptador das decisões para a cena.
- `src/lib/mascotReducer.ts`: reducer apenas do estado visual do mascote.
- `src/lib/sessionEngine.ts`: reducer da sessão e `chooseNextAction(...)`, ambos puros.
- `src/lib/contextualSpeech.ts`: seleção pura de falas locais por tema amplo, etapa da rodada e traços da sessão.
- `src/lib/wordTheft.ts`: elegibilidade e prévia mascarada, sem modificar a pergunta original.
- `src/app/api/ask/route.ts` e `src/lib/askApi.ts`: resposta via Ollama local ou OpenAI opcional, com validação e limite de desenvolvimento.
- `src/types/mascot.ts` e `src/types/session.ts`: contratos visuais e comportamentais.
- `scripts/checkDemo.mjs`: diagnóstico local da apresentação, com verificação de modelo, aquecimento e página.
- `scripts/startLocal.mjs` e `Iniciar EquipIAda.cmd`: iniciador local com verificação do modelo, início do Ollama quando necessário e Next.js em `127.0.0.1:3000`.
- `src/components/FeedbackPanel.tsx` → `src/app/api/feedback/route.ts` → `src/server/feedbackRepository.ts`: avaliação voluntária persistida em SQLite. Contrato fechado em `src/lib/feedback.ts`, migração em `database/migrations/001_feedback.sql` e operação em `scripts/database.mjs`.

## Limites do protótipo
O Diretor de Caos escolhe ações tipadas por contexto e traços, sem repetir uma pegadinha na mesma pergunta. Uma pegadinha ativa exige resolução própria; tentativas repetidas de Enviar não alteram contadores ou traços. A palavra mágica usa um campo separado. O ladrão mascara somente a apresentação e devolve duas palavras progressivamente, sem mudar o valor real do campo. O apagão exige lanterna e interruptor acessíveis; Pular fica fora da camada escura. A manutenção tem dois ajustes independentes; a barra de coragem usa duas ações e é identificada como fictícia. Prompt curto, textão e interrogatório mantêm confirmações simples. O catálogo completo de 20 pegadinhas não está implementado. A cena pede resposta útil ao backend ao pular ou terminar as cenas. Ollama, modelo e `ANSWER_PROVIDER=ollama` são necessários; `.env.example` sugere 4B e esta máquina usa `qwen3:8b`.

## Arquitetura proposta
Implementado: `Scene (UI)` → `useMascotScene (adaptação)` → `sessionReducer + chooseNextAction + contextualSpeech (regras puras)` → `GSAP + Mascot / falas locais`. A escolha cômica não envia a pergunta a outro provedor nem devolve o texto original no balão; usa categorias simples e pode classificar um tema de modo imperfeito.

Implementado: `Scene` → `useMascotScene` → `POST /api/ask` → Ollama local, mantendo a resposta factual fora do balão da personagem. O `AbortController` cancela a espera na UI; o sinal de cancelamento da requisição é combinado com o timeout da consulta ao provedor quando o servidor o recebe. Interface e diagnóstico enviam `localOnly: true`, recusado pelo backend se o provedor não for Ollama. OpenAI permanece como opção paga desativada. Publicação está fora do escopo atual; o bloqueio de produção permanece.

O estado da sessão controla espera, sucesso, falha e cancelamento. `REQUEST_ANSWER` inicia a consulta; `ANSWER` só é aplicado depois de receber texto válido; `ANSWER_ERROR` e `CANCEL_ANSWER` preservam a rodada. `isQuestionLocked` mantém a pergunta somente leitura inclusive entre pegadinhas e após falha ou cancelamento. Só sucesso ou `RESET_QUESTION` liberam edição. A identidade do `AbortController` impede que uma resposta antiga substitua uma rodada reiniciada.

Tipos de domínio implementados em `src/types/session.ts` (resumo):
```ts
type Trait = 'laziness' | 'sarcasm' | 'drama' | 'curiosity' | 'patience';
type PrankId = 'short-prompt' | 'long-prompt' | 'runaway-button' | 'interrogation' | 'magic-word' | 'word-thief' | 'blackout' | 'dramatic-delay' | 'maintenance';
type ChaosDecision = { kind: 'prank'; prank: PrankId } | { kind: 'answer' } | { kind: 'await-prank'; prank: PrankId };
type SessionState = {
  questionOriginal: string | null;
  attemptCount: number;
  prankCount: number;
  prankBudget: number;
  roundCount: number;
  usedPranks: PrankId[];
  activePrank: PrankId | null;
  traits: Record<Trait, number>;
  stage: 'idle' | 'prank' | 'answering' | 'answered' | 'answer-error' | 'answer-cancelled';
};
```

## Regras de decisão
1. Elegibilidade atual depende do comprimento da pergunta, movimento reduzido e estágio; desafios específicos de mouse/toque/teclado ficam para expansão.
2. A escolha usa pesos derivados dos traços e recebe `random` injetável para testes; a mesma pegadinha não se repete por pergunta.
3. `START_QUESTION` fixa `prankBudget`: duas cenas até 80 caracteres; três normalmente; quatro para texto acima de 400 caracteres com drama inicial de pelo menos 80. Mudanças dos traços durante a rodada não alteram esse orçamento. A resposta é obrigatória ao atingir esse limite, esgotar o catálogo ou pular.
4. Durante `stage: 'prank'`, `REGISTER_ATTEMPT` não avança a sessão. `RESOLVE_PRANK` inicia uma pausa de 1,2 s no adaptador; depois `advanceRound` escolhe a continuação uma única vez. Enviar fica desabilitado durante a pausa. Pular, Reiniciar e desmontar cancelam o timer.
5. O modelo só produz a resposta factual; não envia código a executar.
6. Texto original guardado em estado separado do texto de desafio.
7. Timelines GSAP devem ser canceláveis, limpar animações ao desmontar e restaurar foco/posição. Ator e botão usam `transform: translate(...)` como âncora para que o GSAP preserve os percentuais ao restaurar `x` e `y`; trocar pela propriedade CSS individual `translate` deslocava os elementos após o reset.
8. `roundCount` é apenas um contador em memória para variar falas e reiniciar desafios, sem guardar histórico de perguntas. `speechRevision` permite reapresentar uma fala repetida. Gestos retornam a `idle` após 1,2 s; o roubo mantém `grab` durante sua timeline. O passeio e os controles de humor aguardam o término da rodada para não sobrepor instruções.

## Segurança e API
Route Handler `POST /api/ask` com validação de entrada, timeout e limite de saída. Ollama fica em `127.0.0.1` no servidor e dispensa chave. A opção OpenAI usa segredo no servidor e `store: false`; `OPENAI_ENABLE_PAID_CALLS` começa desligada. Há limite local em memória; produção é bloqueada até existir armazenamento compartilhado e teto de gasto aplicável. A UI usa a rota, preserva a pergunta original e oferece nova tentativa em caso de falha. Não registrar prompts por padrão. Usar `.env.local`, jamais `NEXT_PUBLIC_` para credenciais.
As instruções da resposta ficam em `src/lib/askApi.ts`: resposta direta, explicação proporcional à pergunta, exemplo consistente e incerteza explícita. A saída em texto simples remove marcações Markdown comuns que modelos pequenos geram; isso melhora a apresentação, mas não verifica fatos automaticamente.

## Persistência local para A3

O módulo `node:sqlite` exige Node ≥22.13; o projeto foi validado com Node 24.22.1. A classe `FeedbackRepository` encapsula a conexão síncrona, migração versionada, transações e SQL parametrizado. A interface não importa esse módulo de servidor.

`feedback` possui uma linha por avaliação, identificada por UUID; `feedback_prank` guarda zero a quatro cenas relacionadas por chave estrangeira, na ordem da rodada. Reenvios com o mesmo UUID atualizam notas e cenas sem duplicação. Campos livres e textos de conversa são rejeitados pelo contrato. A primeira leitura pode criar o arquivo vazio, mas não insere registros automaticamente.

Os testes de navegador usam porta 3100, `.next-test` e banco de teste separado; os testes de integração usam arquivos temporários reais. A aplicação da porta 3000 mantém seu próprio banco. [Modelo e decisões](DATABASE.md), [requisitos](REQUIREMENTS.md) e [testes](TESTING.md).

## Testes importantes
- Prompt curto vs longo e elegibilidade.
- Nunca repetição imediata da mesma pegadinha; fallback quando catálogo esgota.
- Pular e atingir limite levam a resposta.
- Texto original não muda após sabotagem.
- Cancelamento/redução de movimento e toque/teclado.
- API indisponível comunica erro sem prender a cena.
