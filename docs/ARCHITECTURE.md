# Arquitetura técnica e contratos

## Stack real
Next.js App Router, React, TypeScript, GSAP, SVG, CSS e Lucide. Código existente:
- `src/app/page.tsx`: renderiza a cena.
- `src/app/layout.tsx`: layout e metadados.
- `src/app/globals.css`: estilos, estados visuais e keyframes.
- `src/components/Scene.tsx`: entrada da pergunta, controles, UI.
- `src/components/Mascot.tsx`: SVG com olhos, braços, antena e expressões.
- `src/hooks/useMascotScene.ts`: cursor, movimento, timeline GSAP e adaptador das decisões para a cena.
- `src/lib/mascotReducer.ts`: reducer apenas do estado visual do mascote.
- `src/lib/sessionEngine.ts`: reducer da sessão e `chooseNextAction(...)`, ambos puros.
- `src/lib/contextualSpeech.ts`: seleção pura de falas locais por tema amplo, etapa da rodada e traços da sessão.
- `src/lib/wordTheft.ts`: elegibilidade e prévia mascarada, sem modificar a pergunta original.
- `src/app/api/ask/route.ts` e `src/lib/askApi.ts`: resposta via Ollama local ou OpenAI opcional, com validação e limite de desenvolvimento.
- `src/types/mascot.ts` e `src/types/session.ts`: contratos visuais e comportamentais.
- `scripts/checkDemo.mjs`: diagnóstico local da apresentação, com verificação de modelo, aquecimento e página.

## Limites do protótipo
O Diretor de Caos escolhe ações tipadas por contexto e traços, sem repetir uma pegadinha na mesma pergunta. Uma pegadinha ativa exige resolução própria; tentativas repetidas de Enviar não alteram contadores ou traços. A palavra mágica usa um campo separado. O ladrão de palavras mascara somente a apresentação do campo e da última pergunta; dois controles recuperam uma palavra por vez, e o estado e o valor real do campo permanecem intactos. O apagão escurece apenas o palco e exige lanterna e interruptor, ambos botões acessíveis; Pular fica fora da camada escura. As demais ações, exceto o roubo do botão, ainda são encenações simples e não equivalem às 20 pegadinhas completas. A cena pede resposta útil ao backend ao pular ou terminar as pegadinhas. A resposta real depende de Ollama instalado, modelo baixado e `ANSWER_PROVIDER=ollama` no ambiente local. O padrão de `.env.example` continua 4B; esta máquina de desenvolvimento usa 8B em `.env.local` após uma comparação pontual.

## Arquitetura proposta
Implementado: `Scene (UI)` → `useMascotScene (adaptação)` → `sessionReducer + chooseNextAction + contextualSpeech (regras puras)` → `GSAP + Mascot / falas locais`. A escolha cômica não envia a pergunta a outro provedor nem devolve o texto original no balão; usa categorias simples e pode classificar um tema de modo imperfeito.

Implementado: `Scene` → `useMascotScene` → `POST /api/ask` → Ollama local, mantendo a resposta factual fora do balão da personagem. O `AbortController` cancela a espera na UI; o sinal de cancelamento da requisição é combinado com o timeout da consulta ao provedor quando o servidor o recebe. OpenAI permanece como opção paga desativada. Ainda faltam limitador compartilhado e política de implantação para produção.

Tipos de domínio implementados em `src/types/session.ts` (resumo):
```ts
type Trait = 'laziness' | 'sarcasm' | 'drama' | 'curiosity' | 'patience';
type PrankId = 'short-prompt' | 'long-prompt' | 'runaway-button' | 'interrogation' | 'magic-word' | 'word-thief' | 'blackout' | 'dramatic-delay' | 'maintenance';
type ChaosDecision = { kind: 'prank'; prank: PrankId } | { kind: 'answer' } | { kind: 'await-prank'; prank: PrankId };
type SessionState = {
  questionOriginal: string | null;
  attemptCount: number;
  prankCount: number;
  usedPranks: PrankId[];
  activePrank: PrankId | null;
  traits: Record<Trait, number>;
  stage: 'idle' | 'prank' | 'answering' | 'answered';
};
```

## Regras de decisão
1. Elegibilidade atual depende do comprimento da pergunta, movimento reduzido e estágio; desafios específicos de mouse/toque/teclado ficam para expansão.
2. A escolha usa pesos derivados dos traços e recebe `random` injetável para testes; a mesma pegadinha não se repete por pergunta.
3. Se `prankCount >= 4`, o catálogo elegível se esgota ou usuário pula, `kind: 'answer'` é obrigatório.
4. Durante `stage: 'prank'`, `REGISTER_ATTEMPT` não avança a sessão; `RESOLVE_PRANK` libera a próxima tentativa. Pular continua disponível.
5. O modelo só produz a resposta factual; não envia código a executar.
6. Texto original guardado em estado separado do texto de desafio.
7. Timelines GSAP devem ser canceláveis, limpar animações ao desmontar e restaurar foco/posição.

## Segurança e API
Route Handler `POST /api/ask` com validação de entrada, timeout e limite de saída. Ollama fica em `127.0.0.1` no servidor e dispensa chave. A opção OpenAI usa segredo no servidor e `store: false`; `OPENAI_ENABLE_PAID_CALLS` começa desligada. Há limite local em memória; produção é bloqueada até existir armazenamento compartilhado e teto de gasto aplicável. A UI usa a rota, preserva a pergunta original e oferece nova tentativa em caso de falha. Não registrar prompts por padrão. Usar `.env.local`, jamais `NEXT_PUBLIC_` para credenciais.
As instruções da resposta ficam em `src/lib/askApi.ts`: resposta direta, explicação proporcional à pergunta, exemplo consistente e incerteza explícita. A saída em texto simples remove marcações Markdown comuns que modelos pequenos geram; isso melhora a apresentação, mas não verifica fatos automaticamente.

## Testes importantes
- Prompt curto vs longo e elegibilidade.
- Nunca repetição imediata da mesma pegadinha; fallback quando catálogo esgota.
- Pular e atingir limite levam a resposta.
- Texto original não muda após sabotagem.
- Cancelamento/redução de movimento e toque/teclado.
- API indisponível comunica erro sem prender a cena.
